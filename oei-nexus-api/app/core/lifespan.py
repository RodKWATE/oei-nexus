"""
Application lifespan — replaces deprecated @app.on_event handlers.
Handles startup validation and graceful shutdown.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import settings
from app.core.database import async_engine
from app.core.logging import configure_logging

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # ── Startup ───────────────────────────────────────────────────────────────
    configure_logging()

    logger.info(
        "startup",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        debug=settings.DEBUG,
    )

    # Verify database connectivity
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("database_connected")
    except Exception as exc:
        logger.error("database_connection_failed", error=repr(exc))
        # Don't block startup — DB might still be initialising in Docker
        # but log loudly so operators notice

    # Sentry integration (optional — only when DSN is configured)
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
            from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                environment=settings.ENVIRONMENT,
                release=f"{settings.APP_NAME}@{settings.APP_VERSION}",
                integrations=[FastApiIntegration(), SqlalchemyIntegration()],
                traces_sample_rate=0.1,
            )
            logger.info("sentry_initialized")
        except ImportError:
            logger.warning("sentry_sdk_not_installed", hint="pip install sentry-sdk[fastapi]")

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("shutdown", app=settings.APP_NAME)
    await async_engine.dispose()
