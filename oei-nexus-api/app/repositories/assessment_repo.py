"""Assessment repository."""
import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.assessment import OeiAssessment
from app.repositories.base import BaseRepository


class AssessmentRepository(BaseRepository[OeiAssessment]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(OeiAssessment, session)

    async def get_with_dimensions(self, assessment_id: uuid.UUID) -> Optional[OeiAssessment]:
        stmt = (
            select(OeiAssessment)
            .options(selectinload(OeiAssessment.dimension_scores))
            .where(OeiAssessment.id == assessment_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_project(self, project_id: uuid.UUID) -> Sequence[OeiAssessment]:
        stmt = (
            select(OeiAssessment)
            .options(selectinload(OeiAssessment.dimension_scores))
            .where(OeiAssessment.project_id == project_id)
            .order_by(OeiAssessment.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_latest_for_project(self, project_id: uuid.UUID) -> Optional[OeiAssessment]:
        stmt = (
            select(OeiAssessment)
            .options(selectinload(OeiAssessment.dimension_scores))
            .where(OeiAssessment.project_id == project_id)
            .where(OeiAssessment.is_published.is_(True))
            .order_by(OeiAssessment.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
