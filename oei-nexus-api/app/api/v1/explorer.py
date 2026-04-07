"""Global Project Explorer endpoint — returns geo data for the map."""
from typing import List

import structlog
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.project_repo import ProjectRepository
from app.schemas.project import ProjectSummary

router = APIRouter(prefix="/explorer", tags=["explorer"])
logger = structlog.get_logger(__name__)


@router.get("/map", response_model=List[ProjectSummary])
async def map_projects(db: AsyncSession = Depends(get_db)):
    """All active geo-tagged projects for the world map."""
    repo = ProjectRepository(db)
    projects = await repo.list_for_map()
    logger.debug("map_projects_fetched", count=len(projects))
    return projects
