"""OEI Assessment endpoints."""
import uuid
from typing import List

import structlog
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.core.exceptions import AssessmentNotFoundError
from app.models.user import User
from app.repositories.assessment_repo import AssessmentRepository
from app.schemas.assessment import AssessmentCreate, AssessmentRead
from app.services.project_service import run_assessment

router = APIRouter(prefix="/assessments", tags=["assessments"])
logger = structlog.get_logger(__name__)


@router.post("", response_model=AssessmentRead, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    data: AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    return await run_assessment(data, user, db)


@router.get("/project/{project_id}", response_model=List[AssessmentRead])
async def list_project_assessments(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = AssessmentRepository(db)
    assessments = await repo.list_for_project(project_id)
    logger.debug("assessments_listed", project_id=str(project_id), count=len(assessments))
    return assessments


@router.get("/{assessment_id}", response_model=AssessmentRead)
async def get_assessment(
    assessment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = AssessmentRepository(db)
    assessment = await repo.get_with_dimensions(assessment_id)
    if not assessment:
        raise AssessmentNotFoundError(assessment_id=str(assessment_id))
    return assessment
