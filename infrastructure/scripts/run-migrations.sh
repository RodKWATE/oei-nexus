#!/usr/bin/env bash
# Execute Alembic migrations via the Cloud Run Job
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-oei-nexus-prod}"
REGION="${REGION:-us-central1}"

echo "[migrate] Running Alembic migrations..."
gcloud run jobs execute oei-migrate \
  --region="$REGION" \
  --wait

echo "[migrate] Done."
