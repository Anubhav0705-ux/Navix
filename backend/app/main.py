import logging
from datetime import datetime, timezone
from fastapi import FastAPI, Request, Response, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import configure_logging, request_id_ctx, mask_sensitive_data
from app.core.metrics import metrics
from app.api.v1.router import api_v1_router
from app.database.session import verify_database_connection
from app.core.redis import verify_redis_connection, redis_manager
from app.middleware.observability import ObservabilityMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

# Initialize centralized logging
configure_logging()
logger = logging.getLogger("navix.main")

app = FastAPI(
    title="NAVIX API",
    description="Backend API for NAVIX Algorithmic Budget-First Route Planner",
    version="0.1.0"
)

# CORS Middleware Configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Observability Middleware (Request Tracing, Latency, Metrics)
app.add_middleware(ObservabilityMiddleware)

# Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)

# Mount API Routers
app.include_router(api_v1_router, prefix="/api")


# Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    req_id = request_id_ctx.get("-")
    headers = exc.headers or {}
    headers["X-Request-ID"] = req_id

    content = {"detail": exc.detail, "request_id": req_id}
    return JSONResponse(status_code=exc.status_code, content=content, headers=headers)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = request_id_ctx.get("-")
    content = {
        "detail": "Input validation error",
        "errors": exc.errors(),
        "request_id": req_id
    }
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=content, headers={"X-Request-ID": req_id})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = request_id_ctx.get("-")
    metrics.record_error(500)
    logger.error(f"Unhandled server error: {mask_sensitive_data(str(exc))}", exc_info=True)

    detail_msg = str(exc) if (settings.is_development or settings.is_testing) else "An unexpected internal server error occurred."
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": detail_msg, "request_id": req_id},
        headers={"X-Request-ID": req_id}
    )


# System Observability & Health Endpoints
@app.get("/health", tags=["System"])
def health_check():
    """
    Liveness Check Endpoint.
    Indicates FastAPI process is alive and responding.
    Does NOT fail if external dependencies (PostgreSQL / Redis) are temporarily degraded.
    """
    return {
        "status": "healthy",
        "service": "navix-api",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.1.0"
    }


@app.get("/ready", tags=["System"])
async def readiness_check(response: Response):
    """
    Readiness Check Endpoint.
    Verifies critical dependencies required to safely process user traffic.
    Returns 200 OK when ready, or 503 Service Unavailable when a required dependency is offline.
    """
    db_health = verify_database_connection()
    redis_health = await verify_redis_connection(include_diagnostics=False)

    db_ok = db_health.get("connected", False)
    redis_status = redis_health.get("status", "unhealthy")

    is_ready = db_ok

    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if is_ready else "not_ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {
            "database": "healthy" if db_ok else "unhealthy",
            "redis": redis_status
        }
    }


@app.get("/health/db", tags=["System"])
def db_health_check(response: Response):
    """Read-only database connectivity health check."""
    health = verify_database_connection()
    if not health.get("connected"):
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return health


@app.get("/health/redis", tags=["System"])
async def redis_health_check(response: Response):
    """Read-only Redis connectivity health check (minimal, non-sensitive)."""
    res = await verify_redis_connection(include_diagnostics=False)
    if res.get("status") != "healthy":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return res


@app.get("/metrics", tags=["System"])
def get_metrics():
    """Prometheus Exposition Format Metrics Endpoint."""
    return Response(
        content=metrics.generate_prometheus_metrics(),
        media_type="text/plain; version=0.0.4"
    )


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up application connections on shutdown."""
    await redis_manager.close()
