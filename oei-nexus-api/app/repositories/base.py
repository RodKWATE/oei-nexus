"""
Generic async repository providing CRUD + pagination.
All domain repositories inherit from this.
"""
import uuid
from typing import Any, Dict, Generic, List, Optional, Sequence, Type, TypeVar

import structlog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base
from app.core.exceptions import NotFoundError

ModelT = TypeVar("ModelT", bound=Base)

logger = structlog.get_logger(__name__)


class BaseRepository(Generic[ModelT]):
    def __init__(self, model: Type[ModelT], session: AsyncSession) -> None:
        self.model = model
        self.session = session

    async def get(self, id: Any) -> Optional[ModelT]:
        return await self.session.get(self.model, id)

    async def get_or_404(self, id: uuid.UUID) -> ModelT:
        obj = await self.get(id)
        if obj is None:
            raise NotFoundError(
                f"{self.model.__name__} not found",
                model=self.model.__name__,
                id=str(id),
            )
        return obj

    async def list(
        self,
        *,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[Dict[str, Any]] = None,
    ) -> Sequence[ModelT]:
        stmt = select(self.model)
        if filters:
            for key, value in filters.items():
                if value is not None:
                    stmt = stmt.where(getattr(self.model, key) == value)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        stmt = select(func.count()).select_from(self.model)
        if filters:
            for key, value in filters.items():
                if value is not None:
                    stmt = stmt.where(getattr(self.model, key) == value)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def create(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        logger.debug("db_create", model=self.model.__name__)
        return obj

    async def update(self, obj: ModelT, data: Dict[str, Any]) -> ModelT:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.session.flush()
        await self.session.refresh(obj)
        logger.debug("db_update", model=self.model.__name__)
        return obj

    async def delete(self, obj: ModelT) -> None:
        await self.session.delete(obj)
        await self.session.flush()
        logger.debug("db_delete", model=self.model.__name__)
