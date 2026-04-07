"""Project repository — slug lookup + geo/filter queries."""
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Project, session)

    async def get_by_slug(self, slug: str) -> Optional[Project]:
        stmt = select(Project).where(Project.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_assessments(self, project_id) -> Optional[Project]:
        stmt = (
            select(Project)
            .options(selectinload(Project.assessments))
            .where(Project.id == project_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_map(self) -> Sequence[Project]:
        """Return active projects that have geolocation for the explorer map."""
        stmt = (
            select(Project)
            .where(Project.status == "active")
            .where(Project.latitude.isnot(None))
            .where(Project.longitude.isnot(None))
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
