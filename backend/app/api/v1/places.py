import logging
from typing import Optional
from fastapi import APIRouter, Request, Query, HTTPException, status
from app.schemas.places import PlaceSearchResponse
from app.schemas.providers import ProviderSummaryResponse
from app.services.places_search_service import places_search_service
from app.providers.registry import provider_registry
from app.providers.base import (
    ProviderAuthError,
    ProviderRateLimitError,
    ProviderUnavailableError,
    ProviderTimeoutError,
    ProviderError
)
from app.core.rate_limiter import enforce_rate_limit

logger = logging.getLogger("navix.places_api")

places_router = APIRouter(prefix="/places", tags=["Places Discovery"])


@places_router.get("/search", response_model=PlaceSearchResponse)
async def search_places(
    request: Request,
    q: str = Query(..., min_length=1, max_length=100, description="City, landmark, or destination search query"),
    lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Optional proximity latitude"),
    lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Optional proximity longitude"),
    limit: int = Query(10, ge=1, le=20, description="Maximum results to return")
):
    """
    Real External Place Search Endpoint.
    Searches places and destinations using Foursquare Places API with Redis caching.
    Per NAVIX Truth-in-Data:
    - Never falls back to seed/test fixtures.
    - If provider is unavailable, returns a truthful unavailable error state.
    """
    # 1. Enforce Per-Client Rate Limiting
    await enforce_rate_limit(request, "places")

    # 2. Query Authoritative Service
    try:
        return places_search_service.search_places(
            query=q,
            lat=lat,
            lon=lon,
            limit=limit
        )
    except ProviderRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "PROVIDER_RATE_LIMITED",
                "message": "Location search is temporarily rate limited. Please try again shortly."
            }
        )
    except ProviderAuthError as e:
        logger.error(f"External places provider authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "LOCATION_SEARCH_UNAVAILABLE",
                "message": "Location search is temporarily unavailable."
            }
        )
    except (ProviderUnavailableError, ProviderTimeoutError, ProviderError) as e:
        logger.error(f"External places provider error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "LOCATION_SEARCH_UNAVAILABLE",
                "message": "Location search is temporarily unavailable."
            }
        )
    except Exception as e:
        logger.exception(f"Unexpected error in places search: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "LOCATION_SEARCH_UNAVAILABLE",
                "message": "Location search is temporarily unavailable."
            }
        )


@places_router.get("/health", response_model=ProviderSummaryResponse)
def get_provider_health():
    """
    Internal Provider Health & Status Endpoint.
    Returns status and environment classification of all external providers.
    Never exposes API keys, tokens, or credentials.
    """
    summary = provider_registry.get_health_summary()
    return ProviderSummaryResponse(providers=summary)
