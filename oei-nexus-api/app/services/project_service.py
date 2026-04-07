"""Project service — create/update with OEI score sync.

Raises domain exceptions only — no FastAPI/HTTP imports.
"""
import uuid

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ProjectNotFoundError, SlugAlreadyExistsError
from app.models.assessment import OeiAssessment, OeiDimensionScore
from app.models.project import Project
from app.models.user import User
from app.repositories.assessment_repo import AssessmentRepository
from app.repositories.project_repo import ProjectRepository
from app.schemas.assessment import AssessmentCreate
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.oei_scoring import compute_oei_score

logger = structlog.get_logger(__name__)


async def create_project(data: ProjectCreate, user: User, db: AsyncSession) -> Project:
    repo = ProjectRepository(db)
    if await repo.get_by_slug(data.slug):
        logger.warning("project_slug_conflict", slug=data.slug)
        raise SlugAlreadyExistsError(slug=data.slug)

    project = Project(**data.model_dump(), created_by_id=user.id)
    project = await repo.create(project)
    logger.info(
        "project_created",
        project_id=str(project.id),
        slug=project.slug,
        created_by=str(user.id),
    )
    return project


async def update_project(
    project_id: uuid.UUID, data: ProjectUpdate, db: AsyncSession
) -> Project:
    repo = ProjectRepository(db)
    project = await repo.get(project_id)
    if not project:
        raise ProjectNotFoundError(project_id=str(project_id))

    project = await repo.update(project, data.model_dump(exclude_none=True))
    logger.info("project_updated", project_id=str(project_id))
    return project


async def run_assessment(
    data: AssessmentCreate, user: User, db: AsyncSession
) -> OeiAssessment:
    """Score a project and persist the assessment + dimension scores."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get(data.project_id)
    if not project:
        raise ProjectNotFoundError(project_id=str(data.project_id))

    dimension_map = {d.dimension: d.raw_score for d in data.dimensions}
    result = compute_oei_score(dimension_map)  # raises OEIScoringError if invalid

    assessment = OeiAssessment(
        project_id=project.id,
        assessed_by_id=user.id,
        total_score=result.total_score,
        level=result.level,
        score_version=result.score_version,
        notes=data.notes,
        is_published=True,
    )
    db.add(assessment)
    await db.flush()

    for dr in result.dimension_results:
        db.add(OeiDimensionScore(
            assessment_id=assessment.id,
            dimension=dr.dimension,
            raw_score=dr.raw_score,
            weight=dr.weight,
            weighted_score=dr.weighted_score,
        ))

    # Sync denormalized score onto project
    project.oei_score = result.total_score
    project.oei_level = result.level
    db.add(project)

    await db.flush()
    await db.refresh(assessment)

    logger.info(
        "assessment_created",
        assessment_id=str(assessment.id),
        project_id=str(project.id),
        score=result.total_score,
        level=result.level,
        assessed_by=str(user.id),
    )
    return assessment
