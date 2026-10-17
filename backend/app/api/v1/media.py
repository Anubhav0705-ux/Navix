"""
FastAPI Media Resolution Endpoint for NAVIX Authentic Media Pipeline.
Provides real internet photo fetching via Wikimedia Commons & Unsplash API.
"""
from typing import Optional
from fastapi import APIRouter, Query, status

from app.schemas.media import MediaResolveResponse
from app.services.media_service import media_service

media_router = APIRouter(prefix="/media", tags=["Media"])


@media_router.get(
    "/resolve",
    response_model=MediaResolveResponse,
    status_code=status.HTTP_200_OK,
    summary="Resolve authentic entity-specific travel photograph"
)
def resolve_media(
    entity_type: str = Query(..., description="Entity type (attraction, food, hotel, destination, story)"),
    name: str = Query(..., description="Name of the place, dish, hotel, or destination"),
    destination: Optional[str] = Query(None, description="City or region name"),
    state: Optional[str] = Query(None, description="State name"),
    category: Optional[str] = Query(None, description="Category or cuisine"),
    orientation: Optional[str] = Query("landscape", description="Orientation (landscape, portrait, squarish)")
) -> MediaResolveResponse:
    """
    Deterministically resolves an authentic, location-accurate photograph.
    First checks persistent cache, then queries Wikimedia Commons (exact landmarks),
    then Unsplash API, and falls back to curated representative photography.
    Never exposes API secrets to browser JS.
    """
    result = media_service.resolve(
        entity_type=entity_type,
        name=name,
        destination=destination,
        state=state,
        category=category,
        orientation=orientation or "landscape"
    )
    return MediaResolveResponse(**result)
