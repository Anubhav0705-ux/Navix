from fastapi import APIRouter
from app.api.v1.dev import dev_router

api_v1_router = APIRouter(prefix="/v1")
api_v1_router.include_router(dev_router)


@api_v1_router.get("/status")
def get_v1_status():
    """Placeholder status endpoint for API v1."""
    return {"version": "v1", "status": "active"}
