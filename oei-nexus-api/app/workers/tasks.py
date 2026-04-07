"""
Celery background tasks.

Worker startup:
  celery -A app.workers.tasks worker --loglevel=info
"""
import asyncio

import structlog
from celery import Celery
from celery.utils.log import get_task_logger

from app.core.config import settings

celery_app = Celery(
    "oei_nexus",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,  # Fair dispatch for long-running tasks
    task_acks_late=True,           # Acknowledge only after completion
)

logger = structlog.get_logger(__name__)
task_logger = get_task_logger(__name__)


@celery_app.task(name="tasks.recalculate_project_score", bind=True, max_retries=3)
def recalculate_project_score(self, project_id: str) -> dict:
    """
    Re-runs the OEI scoring engine against the latest published assessment
    and syncs the result to the Project cache fields.
    """

    async def _run() -> dict:
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload

        from app.core.database import AsyncSessionLocal
        from app.models.assessment import OeiAssessment
        from app.models.project import Project
        from app.services.oei_scoring import OEIScoringError, compute_oei_score

        async with AsyncSessionLocal() as db:
            stmt = (
                select(OeiAssessment)
                .options(selectinload(OeiAssessment.dimension_scores))
                .where(OeiAssessment.project_id == project_id)
                .where(OeiAssessment.is_published.is_(True))
                .order_by(OeiAssessment.created_at.desc())
                .limit(1)
            )
            result = await db.execute(stmt)
            assessment = result.scalar_one_or_none()

            if not assessment:
                logger.warning("recalculate_no_assessment", project_id=project_id)
                return {"status": "skipped", "reason": "no published assessment"}

            try:
                dim_map = {ds.dimension: ds.raw_score for ds in assessment.dimension_scores}
                scored = compute_oei_score(dim_map)
            except OEIScoringError as exc:
                logger.error("recalculate_scoring_failed", project_id=project_id, error=str(exc))
                return {"status": "error", "reason": str(exc)}

            project = await db.get(Project, project_id)
            if project:
                project.oei_score = scored.total_score
                project.oei_level = scored.level
                await db.commit()
                logger.info(
                    "recalculate_done",
                    project_id=project_id,
                    score=scored.total_score,
                    level=scored.level,
                )

            return {"status": "ok", "score": scored.total_score, "level": scored.level}

    try:
        return asyncio.run(_run())
    except Exception as exc:
        logger.error("recalculate_task_failed", project_id=project_id, error=repr(exc))
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="tasks.export_project_report", bind=True, max_retries=2)
def export_project_report(self, project_id: str, format: str = "pdf") -> dict:
    """
    Placeholder for async report generation (PDF / Excel).
    Returns a download URL once the file is written to object storage.
    TODO: integrate with WeasyPrint / openpyxl + S3/MinIO
    """
    logger.info("export_report_queued", project_id=project_id, format=format)
    return {"status": "pending", "format": format, "project_id": project_id}
