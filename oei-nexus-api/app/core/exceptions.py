"""
Domain exception hierarchy + FastAPI exception handlers.

Rule: services raise domain exceptions; the HTTP layer converts them.
This keeps services free of any FastAPI/HTTP coupling.
"""
from __future__ import annotations

import structlog
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = structlog.get_logger(__name__)


# ── Domain Exceptions ─────────────────────────────────────────────────────────

class OEIBaseError(Exception):
    """Root of all OEI domain errors."""
    http_status: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_message: str = "An unexpected error occurred"

    def __init__(self, message: str | None = None, **context):
        self.message = message or self.default_message
        self.context = context
        super().__init__(self.message)


class NotFoundError(OEIBaseError):
    http_status = status.HTTP_404_NOT_FOUND
    default_message = "Resource not found"


class ConflictError(OEIBaseError):
    http_status = status.HTTP_409_CONFLICT
    default_message = "Resource already exists"


class AuthenticationError(OEIBaseError):
    http_status = status.HTTP_401_UNAUTHORIZED
    default_message = "Invalid credentials"


class AuthorizationError(OEIBaseError):
    http_status = status.HTTP_403_FORBIDDEN
    default_message = "Insufficient permissions"


class ValidationError(OEIBaseError):
    http_status = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_message = "Validation failed"


class OEIScoringError(OEIBaseError):
    http_status = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_message = "OEI scoring failed"


# ── Specific domain errors (self-documenting at call sites) ───────────────────

class ProjectNotFoundError(NotFoundError):
    default_message = "Project not found"


class AssessmentNotFoundError(NotFoundError):
    default_message = "Assessment not found"


class UserNotFoundError(NotFoundError):
    default_message = "User not found"


class EmailAlreadyExistsError(ConflictError):
    default_message = "Email already registered"


class SlugAlreadyExistsError(ConflictError):
    default_message = "Slug already taken"


class InvalidCredentialsError(AuthenticationError):
    default_message = "Invalid email or password"


class InactiveAccountError(AuthorizationError):
    default_message = "Account is disabled"


class InvalidTokenError(AuthenticationError):
    default_message = "Invalid or expired token"


# ── Exception Handlers ────────────────────────────────────────────────────────

def _error_body(status_code: int, message: str, detail: object = None) -> dict:
    body = {"error": {"code": status_code, "message": message}}
    if detail is not None:
        body["error"]["detail"] = detail
    return body


async def oei_domain_exception_handler(request: Request, exc: OEIBaseError) -> JSONResponse:
    log = logger.bind(
        path=request.url.path,
        method=request.method,
        error=exc.__class__.__name__,
        message=exc.message,
        **exc.context,
    )
    if exc.http_status >= 500:
        log.error("domain_error")
    else:
        log.warning("domain_error")

    return JSONResponse(
        status_code=exc.http_status,
        content=_error_body(exc.http_status, exc.message),
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    logger.warning(
        "http_exception",
        path=request.url.path,
        method=request.method,
        status_code=exc.status_code,
        detail=exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(exc.status_code, str(exc.detail)),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    logger.warning(
        "validation_error",
        path=request.url.path,
        method=request.method,
        error_count=len(errors),
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=_error_body(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Request validation failed",
            detail=[
                {"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]}
                for e in errors
            ],
        ),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        "unhandled_exception",
        path=request.url.path,
        method=request.method,
        error=repr(exc),
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_body(500, "Internal server error"),
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(OEIBaseError, oei_domain_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
