import json
import logging
import unicodedata
from typing import Optional, Dict, Any
from app.core.metrics import metrics
from app.core.redis import redis_manager
from app.providers.registry import provider_registry
from app.providers.base import (
    ProviderError,
    ProviderAuthError,
    ProviderRateLimitError,
    ProviderUnavailableError,
    ProviderTimeoutError
)
from app.schemas.places import PlaceSearchResponse, PlaceSearchResultItem

logger = logging.getLogger("navix.places")


class PlacesSearchService:
    """
    Service coordinating real external place discovery with Redis caching and rate limiting.
    Strictly adheres to NAVIX Truth-in-Data:
    - Never silently falls back to seed/test fixtures on provider failure.
    - Caches successful provider results with short TTL (300s).
    - Fails open on Redis infrastructure failure without degrading user experience.
    """
    CACHE_TTL_SECONDS = 300  # 5 minutes
    CACHE_KEY_PREFIX = "navix:places:foursquare"

    def __init__(self):
        self.provider = provider_registry.foursquare

    def normalize_query(self, query: str) -> str:
        """Normalizes user query to NFC lowercase stripped representation."""
        if not query:
            return ""
        norm = unicodedata.normalize("NFC", query.strip().lower())
        # Remove excessive whitespace
        return " ".join(norm.split())

    def _build_cache_key(self, query: str, lat: Optional[float], lon: Optional[float], limit: int) -> str:
        coord_part = f"{lat:.4f}_{lon:.4f}" if lat is not None and lon is not None else "national"
        return f"{self.CACHE_KEY_PREFIX}:{query}:{coord_part}:{limit}"

    def search_places(
        self,
        query: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 10
    ) -> PlaceSearchResponse:
        clean_q = self.normalize_query(query)
        if not clean_q or len(clean_q) < 2:
            return PlaceSearchResponse(
                query=query,
                total_matches=0,
                results=[],
                provider=self.provider.provider_name,
                cached=False
            )

        # 1. Attempt Redis cache read
        cache_key = self._build_cache_key(clean_q, lat, lon, limit)
        redis_client = redis_manager.get_sync_client()

        if redis_client is not None:
            try:
                cached_data = redis_client.get(cache_key)
                if cached_data:
                    parsed = json.loads(cached_data)
                    metrics.record_place_search_cache_hit()
                    metrics.record_provider_request(self.provider.provider_name, "search", "CACHE_HIT")
                    return PlaceSearchResponse(
                        query=clean_q,
                        total_matches=len(parsed.get("results", [])),
                        results=[PlaceSearchResultItem(**item) for item in parsed.get("results", [])],
                        provider=self.provider.provider_name,
                        cached=True
                    )
            except Exception as e:
                logger.warning(f"Places cache read failed for key '{cache_key}': {e}")

        # 2. Query Authoritative External Provider
        try:
            response = self.provider.search_places(
                query=clean_q,
                lat=lat,
                lon=lon,
                limit=limit
            )
            metrics.record_provider_request(self.provider.provider_name, "search", "SUCCESS")
        except ProviderAuthError as e:
            metrics.record_provider_request(self.provider.provider_name, "search", "AUTH_ERROR")
            logger.error(f"Foursquare authentication failure: {e}")
            raise
        except ProviderRateLimitError as e:
            metrics.record_provider_request(self.provider.provider_name, "search", "RATE_LIMITED")
            logger.warning(f"Foursquare rate limit reached: {e}")
            raise
        except (ProviderUnavailableError, ProviderTimeoutError) as e:
            metrics.record_provider_request(self.provider.provider_name, "search", "UNAVAILABLE")
            logger.error(f"Foursquare provider unavailable: {e}")
            raise
        except Exception as e:
            metrics.record_provider_request(self.provider.provider_name, "search", "ERROR")
            logger.error(f"Foursquare unexpected error: {e}")
            raise

        # 3. Store valid results in Redis cache
        if redis_client is not None and response.results:
            try:
                cache_payload = {
                    "query": clean_q,
                    "results": [item.model_dump() for item in response.results]
                }
                redis_client.set(cache_key, json.dumps(cache_payload), ex=self.CACHE_TTL_SECONDS)
            except Exception as e:
                logger.warning(f"Places cache write failed for key '{cache_key}': {e}")

        return response


# Singleton service
places_search_service = PlacesSearchService()
