"""
OEI Nexus API — FastAPI application factory.
"""
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.lifespan import lifespan
from app.core.middleware import LoggingMiddleware, RequestIDMiddleware

logger = structlog.get_logger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
    )

    # ── Middleware (outermost first) ───────────────────────────────────────────
    # Note: starlette processes middleware in reverse registration order
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ────────────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(v1_router, prefix=settings.API_V1_PREFIX)

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["ops"], include_in_schema=False)
    async def health():
        from app.core.database import async_engine

        db_ok = False
        try:
            async with async_engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            db_ok = True
        except Exception:
            pass

        status_str = "ok" if db_ok else "degraded"
        return JSONResponse(
            status_code=200 if db_ok else 503,
            content={
                "status": status_str,
                "version": settings.APP_VERSION,
                "environment": settings.ENVIRONMENT,
                "database": "ok" if db_ok else "unreachable",
            },
        )

    return app


app = create_app()
