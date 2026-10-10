import re
import uuid
import time
import logging
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

from app.core.logging import request_id_ctx, mask_sensitive_data
from app.core.metrics import metrics
from app.core.config import settings

logger = logging.getLogger("navix.middleware.observability")

# Request ID validation: max 64 chars, alphanumeric + hyphens/underscores
REQUEST_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]{1,64}$")


def get_or_create_request_id(incoming_id: str) -> str:
    """Validates incoming X-Request-ID header or generates a secure UUID4 hex request ID."""
    if incoming_id and isinstance(incoming_id, str):
        clean_id = incoming_id.strip()
        if REQUEST_ID_REGEX.match(clean_id):
            return clean_id

    return f"req_{uuid.uuid4().hex[:16]}"


class ObservabilityMiddleware(BaseHTTPMiddleware):
    """
    HTTP Middleware for request tracing, correlation ID injection, latency measurement,
    metric collection, and lifecycle logging.
    """
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        incoming_id = request.headers.get("X-Request-ID", "")
        req_id = get_or_create_request_id(incoming_id)

        # Bind request_id to contextvar for request-scoped logging
        token = request_id_ctx.set(req_id)

        start_time = time.perf_counter()
        metrics.increment_in_flight()

        status_code = 500
        response = None

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as exc:
            metrics.record_error(500)
            logger.error(f"Unhandled exception during HTTP request: {mask_sensitive_data(str(exc))}", exc_info=True)

            detail_msg = str(exc) if (settings.is_development or settings.is_testing) else "An unexpected internal server error occurred."
            response = JSONResponse(
                status_code=500,
                content={
                    "detail": detail_msg,
                    "request_id": req_id
                }
            )
        finally:
            duration_seconds = time.perf_counter() - start_time
            duration_ms = round(duration_seconds * 1000.0, 2)
            metrics.decrement_in_flight()

            metrics.record_request(
                method=request.method,
                path=request.url.path,
                status_code=status_code,
                duration_seconds=duration_seconds
            )

            # Log HTTP request lifecycle
            logger.info(
                f"HTTP {request.method} {request.url.path} -> {status_code} ({duration_ms}ms)",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": status_code,
                    "duration_ms": duration_ms
                }
            )

            # Attach X-Request-ID header to response
            response.headers["X-Request-ID"] = req_id

            # Reset ContextVar
            request_id_ctx.reset(token)

        return response
