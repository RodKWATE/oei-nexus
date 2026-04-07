#!/usr/bin/env bash
# =============================================================================
# OEI Nexus — GCP Cloud Run provisioning script
#
# Run once to create all infrastructure. Re-running is safe (most commands
# are idempotent). Requires: gcloud CLI authenticated + billing enabled.
#
# Usage:
#   chmod +x provision.sh
#   ./provision.sh
# =============================================================================
set -euo pipefail

# ─── Configuration — edit these ──────────────────────────────────────────────
PROJECT_ID="oei-nexus-prod"          # Your GCP project ID
REGION="us-central1"
DB_INSTANCE="oei-postgres"
DB_NAME="oei_nexus"
DB_USER="oei"
REDIS_INSTANCE="oei-redis"
VPC_CONNECTOR="oei-connector"
AR_REPO="oei-nexus"

# Secret values — change before running in production!
DB_PASSWORD="$(openssl rand -base64 24)"
SECRET_KEY="$(openssl rand -hex 32)"
ADMIN_EMAIL="admin@oeinexus.org"
ADMIN_PASSWORD="$(openssl rand -base64 16)"

# ─── Colors ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${BLUE}[provision]${NC} $*"; }
done() { echo -e "${GREEN}✓${NC} $*"; }

# ─── 1. Set project ───────────────────────────────────────────────────────────
log "Setting project to $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

# ─── 2. Enable APIs ──────────────────────────────────────────────────────────
log "Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  vpcaccess.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  servicenetworking.googleapis.com
done "APIs enabled"

# ─── 3. Artifact Registry repo ───────────────────────────────────────────────
log "Creating Artifact Registry repository..."
gcloud artifacts repositories create "$AR_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="OEI Nexus Docker images" 2>/dev/null || true
done "Artifact Registry: $REGION-docker.pkg.dev/$PROJECT_ID/$AR_REPO"

# ─── 4. VPC + Serverless VPC Connector ──────────────────────────────────────
log "Setting up VPC connector for Cloud Run → Cloud SQL/Redis..."
gcloud compute networks create oei-vpc --subnet-mode=auto 2>/dev/null || true

gcloud compute networks vpc-access connectors create "$VPC_CONNECTOR" \
  --region="$REGION" \
  --network=oei-vpc \
  --range=10.8.0.0/28 \
  --min-instances=2 \
  --max-instances=10 2>/dev/null || true
done "VPC connector: $VPC_CONNECTOR"

# ─── 5. Cloud SQL — PostgreSQL 16 ────────────────────────────────────────────
log "Creating Cloud SQL instance (PostgreSQL 16) — this takes ~5 minutes..."
gcloud sql instances create "$DB_INSTANCE" \
  --database-version=POSTGRES_16 \
  --tier=db-g1-small \
  --region="$REGION" \
  --network=oei-vpc \
  --no-assign-ip \
  --storage-auto-increase \
  --storage-size=20GB \
  --backup-start-time=03:00 \
  --retained-backups-count=7 2>/dev/null || true

gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE" 2>/dev/null || true
gcloud sql users create "$DB_USER" --instance="$DB_INSTANCE" --password="$DB_PASSWORD" 2>/dev/null || true

CLOUD_SQL_CONNECTION="$PROJECT_ID:$REGION:$DB_INSTANCE"
done "Cloud SQL: $CLOUD_SQL_CONNECTION"

# ─── 6. Memorystore — Redis 7 ────────────────────────────────────────────────
log "Creating Memorystore Redis instance..."
gcloud redis instances create "$REDIS_INSTANCE" \
  --size=1 \
  --region="$REGION" \
  --network=oei-vpc \
  --redis-version=redis_7_0 \
  --tier=basic 2>/dev/null || true

REDIS_IP=$(gcloud redis instances describe "$REDIS_INSTANCE" \
  --region="$REGION" --format="value(host)")
done "Redis: $REDIS_IP:6379"

# ─── 7. Secret Manager — store all secrets ───────────────────────────────────
log "Storing secrets in Secret Manager..."

store_secret() {
  local name="$1" value="$2"
  echo -n "$value" | gcloud secrets create "$name" \
    --data-file=- 2>/dev/null || \
  echo -n "$value" | gcloud secrets versions add "$name" --data-file=-
}

# Cloud SQL connection string uses Unix socket in Cloud Run
DB_URL_ASYNC="postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONNECTION}"
DB_URL_SYNC="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONNECTION}"
REDIS_URL="redis://${REDIS_IP}:6379/0"

store_secret "oei-secret-key"          "$SECRET_KEY"
store_secret "oei-db-url"              "$DB_URL_ASYNC"
store_secret "oei-db-url-sync"         "$DB_URL_SYNC"
store_secret "oei-redis-url"           "$REDIS_URL"
store_secret "oei-admin-email"         "$ADMIN_EMAIL"
store_secret "oei-admin-password"      "$ADMIN_PASSWORD"
done "Secrets stored in Secret Manager"

# ─── 8. Service account for Cloud Run ────────────────────────────────────────
log "Creating Cloud Run service account..."
SA_EMAIL="oei-cloudrun@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud iam service-accounts create oei-cloudrun \
  --display-name="OEI Nexus Cloud Run SA" 2>/dev/null || true

# Grant required roles
for ROLE in \
  roles/cloudsql.client \
  roles/secretmanager.secretAccessor \
  roles/redis.editor; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" --quiet
done
done "Service account: $SA_EMAIL"

# ─── 9. Cloud Run Jobs — Alembic migrations ──────────────────────────────────
log "Creating Cloud Run Job for database migrations..."
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/api:latest"

gcloud run jobs create oei-migrate \
  --image="$IMAGE" \
  --region="$REGION" \
  --service-account="$SA_EMAIL" \
  --vpc-connector="$VPC_CONNECTOR" \
  --set-cloudsql-instances="$CLOUD_SQL_CONNECTION" \
  --command="alembic" \
  --args="upgrade,head" \
  --set-secrets="DATABASE_URL=oei-db-url:latest,DATABASE_URL_SYNC=oei-db-url-sync:latest" \
  --max-retries=1 2>/dev/null || true
done "Migration job: oei-migrate"

# ─── 10. Deploy API ──────────────────────────────────────────────────────────
log "Deploying API to Cloud Run..."
gcloud run deploy oei-api \
  --image="$IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA_EMAIL" \
  --vpc-connector="$VPC_CONNECTOR" \
  --set-cloudsql-instances="$CLOUD_SQL_CONNECTION" \
  --min-instances=1 \
  --max-instances=10 \
  --memory=1Gi \
  --cpu=2 \
  --concurrency=80 \
  --timeout=60 \
  --no-allow-unauthenticated \
  --set-secrets="\
SECRET_KEY=oei-secret-key:latest,\
DATABASE_URL=oei-db-url:latest,\
DATABASE_URL_SYNC=oei-db-url-sync:latest,\
REDIS_URL=oei-redis-url:latest,\
FIRST_SUPERUSER_EMAIL=oei-admin-email:latest,\
FIRST_SUPERUSER_PASSWORD=oei-admin-password:latest" \
  --set-env-vars="ENVIRONMENT=production,LOG_LEVEL=INFO"

API_URL=$(gcloud run services describe oei-api --region="$REGION" --format="value(status.url)")
done "API deployed: $API_URL"

# ─── 11. Deploy Worker ────────────────────────────────────────────────────────
log "Deploying Celery Worker to Cloud Run..."
WORKER_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/worker:latest"

gcloud run deploy oei-worker \
  --image="$WORKER_IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA_EMAIL" \
  --vpc-connector="$VPC_CONNECTOR" \
  --set-cloudsql-instances="$CLOUD_SQL_CONNECTION" \
  --min-instances=1 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1 \
  --cpu-always-allocated \
  --no-allow-unauthenticated \
  --set-secrets="\
DATABASE_URL=oei-db-url:latest,\
DATABASE_URL_SYNC=oei-db-url-sync:latest,\
REDIS_URL=oei-redis-url:latest" \
  --set-env-vars="ENVIRONMENT=production"
done "Worker deployed"

# ─── 12. Deploy Frontend ──────────────────────────────────────────────────────
log "Deploying Frontend to Cloud Run..."
FRONTEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/frontend:latest"

gcloud run deploy oei-frontend \
  --image="$FRONTEND_IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --min-instances=0 \
  --max-instances=10 \
  --memory=256Mi \
  --cpu=1 \
  --allow-unauthenticated

FRONTEND_URL=$(gcloud run services describe oei-frontend --region="$REGION" --format="value(status.url)")
done "Frontend deployed: $FRONTEND_URL"

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
echo "  OEI Nexus — Deployment complete"
echo "═══════════════════════════════════════════════"
echo "  Frontend :  $FRONTEND_URL"
echo "  API      :  $API_URL"
echo "  API Docs :  (production: docs disabled)"
echo ""
echo "  Admin credentials stored in Secret Manager:"
echo "    Email    : $ADMIN_EMAIL"
echo "    Password : (see Secret Manager → oei-admin-password)"
echo ""
echo "  Next: configure a custom domain in Cloud Run console"
echo "         and update ALLOWED_ORIGINS in the API."
echo "═══════════════════════════════════════════════"
