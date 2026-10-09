import logging
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

from app.core.rate_limiter import rate_limiter, POLICIES, extract_client_ip

logger = logging.getLogger("navix.middleware.ratelimit")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI HTTP Middleware for distributed rate limiting and abuse prevention.
    Applies endpoint-specific policies, headers, and fail-open/fail-closed controls.
    """
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path

        # Resolve policy based on endpoint path
        policy_name = "default"
        if path.startswith("/api/v1/auth"):
            policy_name = "auth"
        elif path.startswith("/api/v1/routes"):
            policy_name = "routes"
        elif path.startswith("/api/v1/trips"):
            policy_name = "trips"
        elif path.startswith("/api/v1/locations"):
            policy_name = "locations"
        elif not path.startswith("/api/"):
            # Exclude docs, health, static files from rate limiting
            return await call_next(request)

        policy = POLICIES.get(policy_name, POLICIES["default"])

        # Check rate limit status
        allowed, remaining, retry_after, limit = await rate_limiter.check_rate_limit(
            request=request,
            policy_name=policy_name
        )

        if not allowed:
            headers = {
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0"
            }
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded for endpoint category '{policy_name}'. Try again in {retry_after} seconds.",
                    "retry_after": retry_after
                },
                headers=headers
            )

        # Proceed to route handler
        response = await call_next(request)

        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response
