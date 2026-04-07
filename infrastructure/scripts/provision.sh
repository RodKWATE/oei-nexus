#!/usr/bin/env bash
# =============================================================================
# OEI Nexus — GCP Infrastructure provisioning
#
# Run ONCE before the first deployment.
# Safe to re-run (idempotent — skips already-created resources).
#
# Prerequisites:
#   1. gcloud CLI installed: https://cloud.google.com/sdk/docs/install
#   2. Authenticated:  gcloud auth login
#   3. Billing enabled on the project
#
# Usage:
#   bash infrastructure/scripts/provision.sh
# =============================================================================
set -euo pipefail

# ─── EDIT THESE ──────────────────────────────────────────────────────────────
PROJECT_ID="oei-nexus-prod"       # Your GCP project ID
REGION="us-central1"
GITHUB_OWNER="RodKWATE"           # Your GitHub username
GITHUB_REPO="oei-nexus"          # GitHub repository name
# ─────────────────────────────────────────────────────────────────────────────

# Auto-generated secrets (printed at the end — save them!)
DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=')"
SECRET_KEY="$(openssl rand -hex 32)"
ADMIN_PASSWORD="$(openssl rand -base64 16 | tr -d '/+=')"
ADMIN_EMAIL="admin@oeinexus.org"

DB_INSTANCE="oei-postgres"
DB_NAME="oei_nexus"
DB_USER="oei"
REDIS_INSTANCE="oei-redis"
VPC_NAME="oei-vpc"
VPC_CONNECTOR="oei-connector"
AR_REPO="oei-nexus"
SA_NAME="oei-cloudrun"

GRN='\033[0;32m'; BLU='\033[0;34m'; YLW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step()  { echo -e "\n${BLU}▶ $*${NC}"; }
ok()    { echo -e "${GRN}  ✓ $*${NC}"; }
warn()  { echo -e "${YLW}  ⚠ $*${NC}"; }

# ─── 1. Project ───────────────────────────────────────────────────────────────
step "Setting project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

# ─── 2. Enable APIs ──────────────────────────────────────────────────────────
step "Enabling GCP APIs (takes ~1 min)..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  vpcaccess.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  servicenetworking.googleapis.com \
  iam.googleapis.com \
  --quiet
ok "APIs enabled"

# ─── 3. Artifact Registry ────────────────────────────────────────────────────
step "Creating Artifact Registry..."
gcloud artifacts repositories create "$AR_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="OEI Nexus Docker images" 2>/dev/null \
  && ok "Created: $REGION-docker.pkg.dev/$PROJECT_ID/$AR_REPO" \
  || warn "Already exists — skipping"

# ─── 4. VPC ──────────────────────────────────────────────────────────────────
step "Creating VPC..."
gcloud compute networks create "$VPC_NAME" --subnet-mode=auto 2>/dev/null \
  && ok "VPC created: $VPC_NAME" \
  || warn "VPC already exists"

step "Enabling private services access (needed for Cloud SQL)..."
gcloud compute addresses create google-managed-services-"$VPC_NAME" \
  --global --purpose=VPC_PEERING --prefix-length=16 \
  --network="$VPC_NAME" 2>/dev/null || warn "Address already exists"

gcloud services vpc-peerings connect \
  --service=servicenetworking.googleapis.com \
  --ranges=google-managed-services-"$VPC_NAME" \
  --network="$VPC_NAME" 2>/dev/null || warn "VPC peering already configured"

step "Creating Serverless VPC Connector..."
gcloud compute networks vpc-access connectors create "$VPC_CONNECTOR" \
  --region="$REGION" \
  --network="$VPC_NAME" \
  --range="10.8.0.0/28" \
  --min-instances=2 \
  --max-instances=10 2>/dev/null \
  && ok "VPC Connector: $VPC_CONNECTOR" \
  || warn "VPC Connector already exists"

# ─── 5. Cloud SQL ─────────────────────────────────────────────────────────────
step "Creating Cloud SQL PostgreSQL 16 instance (~5 min)..."
gcloud sql instances create "$DB_INSTANCE" \
  --database-version=POSTGRES_16 \
  --tier=db-g1-small \
  --region="$REGION" \
  --network="$VPC_NAME" \
  --no-assign-ip \
  --storage-auto-increase \
  --storage-size=20GB \
  --backup-start-time=03:00 \
  --retained-backups-count=7 \
  --quiet 2>/dev/null \
  && ok "Cloud SQL instance created" \
  || warn "Cloud SQL instance already exists"

gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE" 2>/dev/null \
  && ok "Database created: $DB_NAME" || warn "Database already exists"

gcloud sql users create "$DB_USER" \
  --instance="$DB_INSTANCE" \
  --password="$DB_PASSWORD" 2>/dev/null \
  && ok "DB user created: $DB_USER" || warn "DB user already exists"

CLOUD_SQL_CONN="${PROJECT_ID}:${REGION}:${DB_INSTANCE}"
ok "Cloud SQL connection: $CLOUD_SQL_CONN"

# ─── 6. Redis ────────────────────────────────────────────────────────────────
step "Creating Memorystore Redis 7..."
gcloud redis instances create "$REDIS_INSTANCE" \
  --size=1 \
  --region="$REGION" \
  --network="$VPC_NAME" \
  --redis-version=redis_7_0 \
  --tier=basic \
  --quiet 2>/dev/null \
  && ok "Redis instance created" \
  || warn "Redis instance already exists"

REDIS_IP=$(gcloud redis instances describe "$REDIS_INSTANCE" \
  --region="$REGION" --format="value(host)")
ok "Redis IP: $REDIS_IP"

# ─── 7. Secrets ──────────────────────────────────────────────────────────────
step "Storing secrets in Secret Manager..."

DB_URL_ASYNC="postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONN}"
DB_URL_SYNC="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONN}"
REDIS_URL="redis://${REDIS_IP}:6379/0"

store_secret() {
  local name="$1" value="$2"
  if gcloud secrets describe "$name" &>/dev/null; then
    echo -n "$value" | gcloud secrets versions add "$name" --data-file=- --quiet
    warn "Secret $name updated"
  else
    echo -n "$value" | gcloud secrets create "$name" --data-file=- --quiet
    ok "Secret $name created"
  fi
}

store_secret "oei-secret-key"       "$SECRET_KEY"
store_secret "oei-db-url"           "$DB_URL_ASYNC"
store_secret "oei-db-url-sync"      "$DB_URL_SYNC"
store_secret "oei-redis-url"        "$REDIS_URL"
store_secret "oei-admin-email"      "$ADMIN_EMAIL"
store_secret "oei-admin-password"   "$ADMIN_PASSWORD"

# ─── 8. Service Account ───────────────────────────────────────────────────────
step "Creating Cloud Run Service Account..."
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create "$SA_NAME" \
  --display-name="OEI Nexus Cloud Run SA" 2>/dev/null \
  && ok "Service account: $SA_EMAIL" || warn "Already exists"

for ROLE in \
  roles/cloudsql.client \
  roles/secretmanager.secretAccessor \
  roles/run.invoker; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" --quiet
done
ok "IAM roles granted"

# Grant Cloud Build SA permission to deploy Cloud Run + manage jobs
CB_SA="${PROJECT_ID}@cloudbuild.gserviceaccount.com"
for ROLE in \
  roles/run.admin \
  roles/iam.serviceAccountUser \
  roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$CB_SA" \
    --role="$ROLE" --quiet
done
ok "Cloud Build SA permissions granted"

# ─── 9. First Docker build & push ────────────────────────────────────────────
step "Authenticating Docker with Artifact Registry..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}"

step "Building and pushing images (first time)..."
docker build -f oei-nexus-api/Dockerfile.cloudrun  -t "${REGISTRY}/api:latest"      oei-nexus-api
docker build -f oei-nexus-api/Dockerfile.worker    -t "${REGISTRY}/worker:latest"   oei-nexus-api
docker build                                        -t "${REGISTRY}/frontend:latest" oei-nexus-react

docker push "${REGISTRY}/api:latest"
docker push "${REGISTRY}/worker:latest"
docker push "${REGISTRY}/frontend:latest"
ok "Images pushed to Artifact Registry"

# ─── 10. Cloud Run Jobs — Alembic migrations ─────────────────────────────────
step "Creating Cloud Run Job for Alembic migrations..."
gcloud run jobs create oei-migrate \
  --image="${REGISTRY}/api:latest" \
  --region="$REGION" \
  --service-account="$SA_EMAIL" \
  --vpc-connector="$VPC_CONNECTOR" \
  --set-cloudsql-instances="$CLOUD_SQL_CONN" \
  --command="alembic" \
  --args="upgrade,head" \
  --set-secrets="DATABASE_URL_SYNC=oei-db-url-sync:latest" \
  --set-env-vars="ENVIRONMENT=production" \
  --max-retries=1 \
  --quiet 2>/dev/null \
  && ok "Migration job created" || warn "Migration job already exists — updating image"

gcloud run jobs update oei-migrate \
  --image="${REGISTRY}/api:latest" \
  --region="$REGION" --quiet 2>/dev/null || true

step "Running initial migrations..."
gcloud run jobs execute oei-migrate --region="$REGION" --wait
ok "Database migrated"

# ─── 11. Deploy API ───────────────────────────────────────────────────────────
step "Deploying API to Cloud Run..."
gcloud run deploy oei-api \
  --image="${REGISTRY}/api:latest" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA_EMAIL" \
  --vpc-connector="$VPC_CONNECTOR" \
  --set-cloudsql-instances="$CLOUD_SQL_CONN" \
  --min-instances=1 \
  --max-instances=10 \
  --memory=1Gi \
  --cpu=2 \
  --concurrency=80 \
  --timeout=60 \
  --allow-unauthenticated \
  --set-secrets="\
SECRET_KEY=oei-secret-key:latest,\
DATABASE_URL=oei-db-url:latest,\
DATABASE_URL_SYNC=oei-db-url-sync:latest,\
REDIS_URL=oei-redis-url:latest,\
FIRST_SUPERUSER_EMAIL=oei-admin-email:latest,\
FIRST_SUPERUSER_PASSWORD=oei-admin-password:latest" \
  --set-env-vars="ENVIRONMENT=production,LOG_LEVEL=INFO" \
  --quiet

API_URL=$(gcloud run services describe oei-api --region="$REGION" --format="value(status.url)")
ok "API deployed: $API_URL"

# ─── 12. Deploy Worker ────────────────────────────────────────────────────────
step "Deploying Celery Worker..."
gcloud run deploy oei-worker \
  --image="${REGISTRY}/worker:latest" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA_EMAIL" \
  --vpc-connector="$VPC_CONNECTOR" \
  --set-cloudsql-instances="$CLOUD_SQL_CONN" \
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
  --set-env-vars="ENVIRONMENT=production" \
  --quiet
ok "Worker deployed"

# ─── 13. Deploy Frontend ──────────────────────────────────────────────────────
step "Deploying Frontend..."
gcloud run deploy oei-frontend \
  --image="${REGISTRY}/frontend:latest" \
  --region="$REGION" \
  --platform=managed \
  --min-instances=0 \
  --max-instances=10 \
  --memory=256Mi \
  --cpu=1 \
  --allow-unauthenticated \
  --quiet

FRONTEND_URL=$(gcloud run services describe oei-frontend --region="$REGION" --format="value(status.url)")
ok "Frontend deployed: $FRONTEND_URL"

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
