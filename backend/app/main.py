from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_v1_router
from app.database.session import verify_database_connection

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

# Mount API Routers
app.include_router(api_v1_router, prefix="/api")


@app.get("/health", tags=["System"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "ok",
        "service": "navix-api"
    }


@app.get("/health/db", tags=["System"])
def db_health_check():
    """Read-only database connectivity health check."""
    return verify_database_connection()
