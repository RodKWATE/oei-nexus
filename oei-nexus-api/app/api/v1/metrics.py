"""Impact metrics endpoints."""
import uuid
from typing import List

import structlog
from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.metric import ImpactMetric
from app.models.project import Project
from app.models.user import User
from app.repositories.base import BaseRepository
from app.schemas.metric import MetricAggregate, MetricCreate, MetricRead

router = APIRouter(prefix="/metrics", tags=["metrics"])
logger = structlog.get_logger(__name__)


@router.post("", response_model=MetricRead, status_code=status.HTTP_201_CREATED)
async def add_metric(
    data: MetricCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    metric = ImpactMetric(**data.model_dump())
    db.add(metric)
    await db.flush()
    await db.refresh(metric)
    logger.info("metric_added", metric_key=data.metric_key, project_id=str(data.project_id))
    return metric


@router.get("/project/{project_id}", response_model=List[MetricRead])
async def list_project_metrics(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = BaseRepository(ImpactMetric, db)
    return await repo.list(filters={"project_id": project_id})


@router.get("/aggregate", response_model=MetricAggregate)
async def get_aggregate(db: AsyncSession = Depends(get_db)):
    """Global KPI totals for the Live Impact Dashboard."""

    # Aggregate per-metric-key sums from ImpactMetric
    metrics_stmt = select(
        ImpactMetric.metric_key,
        func.coalesce(func.sum(ImpactMetric.value), 0).label("total"),
    ).group_by(ImpactMetric.metric_key)

    metrics_result = await db.execute(metrics_stmt)
    metric_totals: dict[str, float] = {row.metric_key: row.total for row in metrics_result}

    # Aggregate project-level counts and investment separately
    projects_stmt = select(
        func.count(Project.id).label("projects_count"),
        func.count(Project.country.distinct()).label("countries_count"),
        func.coalesce(func.sum(Project.investment_usd), 0).label("total_investment"),
    )
    proj_row = (await db.execute(projects_stmt)).one()

    agg = MetricAggregate(
        total_co2_avoided_tonnes=metric_totals.get("co2_avoided_tonnes", 0),
        total_households_connected=int(metric_totals.get("households_connected", 0)),
        total_jobs_created=int(metric_totals.get("jobs_created", 0)),
        total_investment_usd=proj_row.total_investment,
        projects_count=proj_row.projects_count,
        countries_count=proj_row.countries_count,
    )
    logger.debug("aggregate_computed", **agg.model_dump())
    return agg
