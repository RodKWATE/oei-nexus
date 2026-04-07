"""Project CRUD endpoints."""
import uuid
from typing import List

import structlog
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.project_repo import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project_service import create_project, update_project

router = APIRouter(prefix="/projects", tags=["projects"])
logger = structlog.get_logger(__name__)


@router.get("", response_model=List[ProjectRead])
async def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    country: str | None = None,
    project_type: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    repo = ProjectRepository(db)
    filters = {
        "country": country,
        "project_type": project_type,
        "status": status_filter,
    }
    projects = await repo.list(skip=skip, limit=limit, filters=filters)
    logger.debug("projects_listed", count=len(projects), skip=skip, limit=limit)
    return projects


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    return await create_project(data, user, db)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ProjectRepository(db)
    return await repo.get_or_404(project_id)


@router.patch("/{project_id}", response_model=ProjectRead)
async def patch_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    return await update_project(project_id, data, db)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    repo = ProjectRepository(db)
    project = await repo.get_or_404(project_id)
    await repo.delete(project)
    logger.info("project_deleted", project_id=str(project_id))
