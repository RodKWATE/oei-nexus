#!/usr/bin/env bash
# =============================================================================
# Build and push all Docker images to Artifact Registry.
# Run from the repo root:   ./infrastructure/scripts/build-push.sh
# =============================================================================
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-oei-nexus-prod}"
REGION="${REGION:-us-central1}"
AR_REPO="oei-nexus"
TAG="${TAG:-latest}"

REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}"

log() { echo "[build-push] $*"; }

# Authenticate Docker with Artifact Registry
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

log "Building API image..."
docker build \
  -f oei-nexus-api/Dockerfile.cloudrun \
  -t "${REGISTRY}/api:${TAG}" \
  oei-nexus-api

log "Building Worker image..."
docker build \
  -f oei-nexus-api/Dockerfile.worker \
  -t "${REGISTRY}/worker:${TAG}" \
  oei-nexus-api

log "Building Frontend image..."
docker build \
  -t "${REGISTRY}/frontend:${TAG}" \
  oei-nexus-react

log "Pushing images..."
docker push "${REGISTRY}/api:${TAG}"
docker push "${REGISTRY}/worker:${TAG}"
docker push "${REGISTRY}/frontend:${TAG}"

echo ""
echo "Images pushed:"
echo "  ${REGISTRY}/api:${TAG}"
echo "  ${REGISTRY}/worker:${TAG}"
echo "  ${REGISTRY}/frontend:${TAG}"
