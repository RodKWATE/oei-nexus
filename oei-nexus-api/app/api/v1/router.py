"""V1 API router — aggregates all sub-routers."""
from fastapi import APIRouter

from app.api.v1 import assessments, auth, explorer, metrics, projects

router = APIRouter()

router.include_router(auth.router)
router.include_router(projects.router)
router.include_router(assessments.router)
router.include_router(metrics.router)
router.include_router(explorer.router)
