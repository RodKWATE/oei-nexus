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
PROJECT_ID="cloudnativedemo1"          # Your GCP project ID
REGION="us-central1"
DB_INSTANCE="oei-postgres"
DB_NAME="oei_nexus"
DB_USER="oei"
REDIS_INSTANCE="oei-redis"
AR_REPO="oei-nexus"

# Secret values — change before running in production!
DB_PASSWORD="$(openssl rand -base64 24)"
SECRET_KEY="$(openssl rand -hex 32)"
ADMIN_EMAIL="admin@oeinexus.org"
ADMIN_PASSWORD="$(openssl rand -base64 16)"

# ─── Colors ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${BLUE}[provision]${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }

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
success "APIs enabled"

# ─── 3. Artifact Registry repo ───────────────────────────────────────────────
log "Creating Artifact Registry repository..."
gcloud artifacts repositories create "$AR_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="OEI Nexus Docker images" 2>/dev/null || true
success "Artifact Registry: $REGION-docker.pkg.dev/$PROJECT_ID/$AR_REPO"

# ─── 4. VPC ─────────────────────────────────────────────────────────────────
log "Setting up VPC network for Cloud Run → Cloud SQL/Redis..."
gcloud compute networks create oei-vpc --subnet-mode=auto 2>/dev/null || true
success "VPC network: oei-vpc"

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
success "Cloud SQL: $CLOUD_SQL_CONNECTION"

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
success "Redis: $REDIS_IP:6379"

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
success "Secrets stored in Secret Manager"

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
    --role="$ROLE" \
    --condition=None --quiet
done
success "Service account: $SA_EMAIL"

# ─── 9. Cloud Run Jobs — Alembic migrations ──────────────────────────────────
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/api:latest"

if ! gcloud artifacts docker images describe "$IMAGE" >/dev/null 2>&1; then
  echo -e "\n❌ ERROR: Docker image not found in Artifact Registry."
  echo "Please build and push your images first by running:"
  echo "  export PROJECT_ID=\"$PROJECT_ID\""
  echo "  ./infrastructure/scripts/build-push.sh"
  exit 1
fi

log "Creating Cloud Run Job for database migrations..."

gcloud run jobs create oei-migrate \
  --image="$IMAGE" \
  --region="$REGION" \
  --service-account="$SA_EMAIL" \
  --network=oei-vpc \
  --subnet=oei-vpc \
  --vpc-egress=private-ranges-only \
  --set-cloudsql-instances="$CLOUD_SQL_CONNECTION" \
  --command="alembic" \
  --args="upgrade,head" \
  --set-secrets="DATABASE_URL=oei-db-url:latest,DATABASE_URL_SYNC=oei-db-url-sync:latest" \
  --max-retries=1 2>/dev/null || true
success "Migration job: oei-migrate"

# ─── 10. Deploy API ──────────────────────────────────────────────────────────
log "Deploying API to Cloud Run..."
gcloud run deploy oei-api \
  --image="$IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA_EMAIL" \
  --network=oei-vpc \
  --subnet=oei-vpc \
  --vpc-egress=private-ranges-only \
  --clear-vpc-connector \
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
success "API deployed: $API_URL"

# ─── 11. Deploy Worker ────────────────────────────────────────────────────────
log "Deploying Celery Worker to Cloud Run..."
WORKER_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/worker:latest"

gcloud run deploy oei-worker \
  --image="$WORKER_IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA_EMAIL" \
  --network=oei-vpc \
  --subnet=oei-vpc \
  --vpc-egress=private-ranges-only \
  --clear-vpc-connector \
  --set-cloudsql-instances="$CLOUD_SQL_CONNECTION" \
  --min-instances=1 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1 \
  --no-cpu-throttling \
  --command="sh" \
  --args="-c","python3 -m http.server \${PORT:-8080} & exec celery -A oei_nexus.worker worker --loglevel=info" \
  --no-allow-unauthenticated \
  --set-secrets="\
DATABASE_URL=oei-db-url:latest,\
DATABASE_URL_SYNC=oei-db-url-sync:latest,\
REDIS_URL=oei-redis-url:latest" \
  --set-env-vars="ENVIRONMENT=production"
success "Worker deployed"

# ─── 12. Deploy Frontend ──────────────────────────────────────────────────────
log "Deploying Frontend to Cloud Run..."
FRONTEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/frontend:latest"

gcloud run deploy oei-frontend \
  --image="$FRONTEND_IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --min-instances=0 \
  --max-instances=10 \
  --memory=1Gi \
  --cpu=1 \
  --allow-unauthenticated \
  --port=80 \
  --command="/bin/sh" \
  --args="-c","sed -i -e 's/[\$]PORT/'\"\${PORT}\"'/g' -e 's/__PORT__/'\"\${PORT}\"'/g' /etc/nginx/conf.d/default.conf 2>/dev/null || true; exec nginx -g 'daemon off;'" \
  --set-env-vars="HOST=0.0.0.0,CI=true,API_URL=${API_URL},VITE_API_URL=${API_URL},REACT_APP_API_URL=${API_URL}" || {
    echo -e "\n❌ Frontend deployment failed! Fetching the crash logs to see why...\n"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=oei-frontend AND severity>=DEFAULT" \
      --project="$PROJECT_ID" --limit=30 --format="table(textPayload, jsonPayload.message)"
    exit 1
  }

FRONTEND_URL=$(gcloud run services describe oei-frontend --region="$REGION" --format="value(status.url)")
success "Frontend deployed: $FRONTEND_URL"

# ─── 14. Seed database ────────────────────────────────────────────────────────
step "Running database seed..."
gcloud run jobs create oei-seed \
  --image="${REGISTRY}/api:latest" \
  --region="$REGION" \
  --service-account="$SA_EMAIL" \
  --vpc-connector="$VPC_CONNECTOR" \
  --set-cloudsql-instances="$CLOUD_SQL_CONN" \
  --command="python" \
  --args="scripts/seed.py" \
  --set-secrets="\
DATABASE_URL=oei-db-url:latest,\
FIRST_SUPERUSER_EMAIL=oei-admin-email:latest,\
FIRST_SUPERUSER_PASSWORD=oei-admin-password:latest" \
  --set-env-vars="ENVIRONMENT=production" \
  --max-retries=1 \
  --quiet 2>/dev/null || warn "Seed job already exists"

gcloud run jobs execute oei-seed --region="$REGION" --wait
ok "Database seeded"

# ─── 15. Cloud Build trigger (GitHub → auto-deploy) ──────────────────────────
step "Creating Cloud Build trigger (GitHub push → deploy)..."
warn "You need to connect GitHub first in the console — see guide below."
warn "Then run this command to create the trigger:"
echo ""
echo "  gcloud builds triggers create github \\"
echo "    --repo-name=$GITHUB_REPO \\"
echo "    --repo-owner=$GITHUB_OWNER \\"
echo "    --branch-pattern='^main$' \\"
echo "    --build-config=infrastructure/cloudbuild.yaml \\"
echo "    --name=oei-deploy-main \\"
echo "    --region=global"
echo ""

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GRN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GRN}  OEI Nexus — Provisioning complete!${NC}"
echo -e "${GRN}═══════════════════════════════════════════════════════${NC}"
echo -e "  Frontend  : ${YLW}$FRONTEND_URL${NC}"
echo -e "  API       : ${YLW}$API_URL${NC}"
echo -e "  API Docs  : ${YLW}$API_URL/docs${NC}  ← désactivé en production"
echo ""
echo -e "  Admin     : ${YLW}$ADMIN_EMAIL${NC}"
echo -e "  Password  : voir Secret Manager → ${YLW}oei-admin-password${NC}"
echo ""
echo -e "${RED}  ⚠ SAUVEGARDE ces infos — elles ne seront plus affichées:${NC}"
echo "    DB_PASSWORD  = $DB_PASSWORD"
echo "    SECRET_KEY   = $SECRET_KEY"
echo "    ADMIN_PASS   = $ADMIN_PASSWORD"
echo -e "${GRN}═══════════════════════════════════════════════════════${NC}"
