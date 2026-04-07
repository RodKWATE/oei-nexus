"""
Async SQLAlchemy engine and session factory.

- Uses asyncpg driver for PostgreSQL (async).
- Provides get_db() dependency for FastAPI injection.
- Separate sync engine exposed for Alembic migrations.
"""
from typing import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, MappedColumn
from sqlalchemy.pool import NullPool

from app.core.config import settings


# ── Async engine (FastAPI runtime) ───────────────────────────────────────────
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,
)

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# ── Sync engine (Alembic only) ────────────────────────────────────────────────
sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)


# ── Base declarative class ────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency ────────────────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async DB session; roll back on exception."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
