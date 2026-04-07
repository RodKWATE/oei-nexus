"""
Custom ASGI middleware:
  - RequestIDMiddleware  — injects a unique request-id into every request/response
  - LoggingMiddleware   — structured access log with timing
"""
import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = structlog.get_logger(__name__)

REQUEST_ID_HEADER = "X-Request-ID"


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Attach a unique request ID to each request.
    If the client sends X-Request-ID we honour it; otherwise generate one.
    The ID is echoed back in the response header and bound to all log entries
    within the request lifecycle via structlog context vars.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get(REQUEST_ID_HEADER) or str(uuid.uuid4())
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Log every HTTP request with method, path, status code, and wall-clock duration.
    Skips the /health endpoint to avoid noise.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path == "/health":
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            client=request.client.host if request.client else None,
        )
        return response
