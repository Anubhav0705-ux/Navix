from fastapi import APIRouter
from app.api.v1.dev import dev_router
from app.api.v1.routes import routes_router
from app.api.v1.trips import trips_router
from app.api.v1.auth import auth_router
from app.api.v1.saved_trips import saved_trips_router
from app.api.v1.admin import admin_router
from app.api.v1.locations import locations_router
from app.api.v1.transport import router as transport_router
from app.api.v1.places import places_router
from app.api.v1.trip_setup import trip_setup_router
from app.api.v1.destinations import destinations_router
from app.api.v1.stories import stories_router
from app.api.v1.media import media_router
from app.api.v1.analytics import analytics_router

api_v1_router = APIRouter(prefix="/v1")
api_v1_router.include_router(dev_router)
api_v1_router.include_router(routes_router)
api_v1_router.include_router(trips_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(saved_trips_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(locations_router)
api_v1_router.include_router(transport_router)
api_v1_router.include_router(places_router)
api_v1_router.include_router(trip_setup_router)
api_v1_router.include_router(destinations_router)
api_v1_router.include_router(stories_router)
api_v1_router.include_router(media_router)
api_v1_router.include_router(analytics_router)


@api_v1_router.get("/status")
def get_v1_status():
    """Placeholder status endpoint for API v1."""
    return {"version": "v1", "status": "active"}
