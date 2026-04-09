#!/usr/bin/env bash
# =============================================================================
# Build and push all Docker images to Artifact Registry.
# Run from the repo root:   ./infrastructure/scripts/build-push.sh
# =============================================================================
set -euo pipefail

# Change to the repository root directory to ensure paths resolve correctly
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

PROJECT_ID="${PROJECT_ID:-cloudnativedemo1}"
REGION="${REGION:-us-central1}"
AR_REPO="oei-nexus"
TAG="${TAG:-latest}"

REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}"

log() { echo "[build-push] $*"; }

log "Submitting API and Worker builds to Google Cloud Build..."
cat <<EOF > /tmp/cloudbuild-api.yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-f', 'Dockerfile.cloudrun', '-t', '${REGISTRY}/api:${TAG}', '.']
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-f', 'Dockerfile.worker', '-t', '${REGISTRY}/worker:${TAG}', '.']
images:
- '${REGISTRY}/api:${TAG}'
- '${REGISTRY}/worker:${TAG}'
EOF

gcloud builds submit oei-nexus-api \
  --region="${REGION}" \
  --config=/tmp/cloudbuild-api.yaml

log "Submitting Frontend build to Google Cloud Build..."
gcloud builds submit oei-nexus-react \
  --region="${REGION}" \
  --tag="${REGISTRY}/frontend:${TAG}"

echo ""
echo "Images pushed:"
echo "  ${REGISTRY}/api:${TAG}"
echo "  ${REGISTRY}/worker:${TAG}"
echo "  ${REGISTRY}/frontend:${TAG}"
