import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.places import PlaceSearchResponse, PlaceSearchResultItem
from app.providers.base import (
    ProviderAuthError,
    ProviderRateLimitError,
    ProviderUnavailableError,
    ProviderTimeoutError
)
from app.core.redis import redis_manager
from app.services.places_search_service import places_search_service


client = TestClient(app)


MOCK_MANALI_ITEM = PlaceSearchResultItem(
    provider="FOURSQUARE",
    provider_place_id="fsq_manali_001",
    display_name="Manali",
    formatted_address="Manali, Kullu, Himachal Pradesh, India",
    locality="Manali",
    region="Himachal Pradesh",
    country="IN",
    latitude=32.2396,
    longitude=77.1887,
    categories=["Town", "Hill Station"],
    data_state="REAL_PROVIDER_DATA"
)


class TestPlacesSearchAPI:
    def test_search_places_success(self):
        with patch.object(places_search_service.provider, "search_places") as mock_search:
            mock_search.return_value = PlaceSearchResponse(
                query="Manali",
                total_matches=1,
                results=[MOCK_MANALI_ITEM],
                provider="FOURSQUARE"
            )

            # Clear cache for this query to ensure clean test
            try:
                r = redis_manager.get_sync_client()
                if r:
                    r.delete("navix:places:foursquare:manali:global")
            except Exception:
                pass

            response = client.get("/api/v1/places/search?q=Manali")
            assert response.status_code == 200
            data = response.json()

            assert data["query"].lower() == "manali"
            assert data["total_matches"] == 1
            assert data["provider"] == "FOURSQUARE"
            assert len(data["results"]) == 1
            item = data["results"][0]
            assert item["display_name"] == "Manali"
            assert item["provider_place_id"] == "fsq_manali_001"
            assert item["latitude"] == 32.2396
            assert item["longitude"] == 77.1887
            assert item["country"] == "IN"
            assert item["data_state"] == "REAL_PROVIDER_DATA"

    def test_search_places_empty_query(self):
        response = client.get("/api/v1/places/search?q=   ")
        assert response.status_code == 200
        data = response.json()
        assert data["total_matches"] == 0
        assert len(data["results"]) == 0

    def test_search_places_unicode_query(self):
        with patch.object(places_search_service.provider, "search_places") as mock_search:
            mock_search.return_value = PlaceSearchResponse(
                query="मनाली",
                total_matches=1,
                results=[MOCK_MANALI_ITEM],
                provider="FOURSQUARE"
            )
            response = client.get("/api/v1/places/search?q=मनाली")
            assert response.status_code == 200
            data = response.json()
            assert data["total_matches"] == 1

    def test_search_places_cache_hit(self):
        mock_redis = MagicMock()
        cache_store = {}
        mock_redis.get.side_effect = lambda k: cache_store.get(k)
        mock_redis.set.side_effect = lambda k, v, ex=None: cache_store.update({k: v})

        with patch.object(redis_manager, "get_sync_client", return_value=mock_redis):
            with patch.object(places_search_service.provider, "search_places") as mock_search:
                mock_search.return_value = PlaceSearchResponse(
                    query="CacheTestCity",
                    total_matches=1,
                    results=[MOCK_MANALI_ITEM],
                    provider="FOURSQUARE"
                )

                # First call -> cache miss
                resp1 = client.get("/api/v1/places/search?q=CacheTestCity")
                assert resp1.status_code == 200
                assert resp1.json()["cached"] is False

                # Second call -> cache hit
                resp2 = client.get("/api/v1/places/search?q=CacheTestCity")
                assert resp2.status_code == 200
                data2 = resp2.json()
                assert data2["cached"] is True
                # Foursquare provider search_places should only be invoked once
                assert mock_search.call_count == 1

    def test_provider_auth_error_returns_503(self):
        with patch.object(places_search_service.provider, "search_places") as mock_search:
            mock_search.side_effect = ProviderAuthError(
                message="Invalid API Key", provider="FOURSQUARE", status_code=401
            )
            # Ensure not cached
            try:
                r = redis_manager.get_sync_client()
                if r:
                    r.delete("navix:places:foursquare:authfailquery:global")
            except Exception:
                pass

            response = client.get("/api/v1/places/search?q=AuthFailQuery")
            assert response.status_code == 503
            err = response.json()
            assert "temporarily unavailable" in str(err["detail"]).lower()

    def test_provider_rate_limit_error_returns_429(self):
        with patch.object(places_search_service.provider, "search_places") as mock_search:
            mock_search.side_effect = ProviderRateLimitError(
                message="Rate limit reached", provider="FOURSQUARE", status_code=429
            )
            try:
                r = redis_manager.get_sync_client()
                if r:
                    r.delete("navix:places:foursquare:ratelimitquery:global")
            except Exception:
                pass

            response = client.get("/api/v1/places/search?q=RateLimitQuery")
            assert response.status_code == 429
            err = response.json()
            assert "rate limit" in str(err["detail"]).lower()

    def test_provider_unavailable_never_falls_back_to_seed_data(self):
        """CRITICAL: Rule 23 - If provider is unavailable, NEVER silently fallback to seed data."""
        with patch.object(places_search_service.provider, "search_places") as mock_search:
            mock_search.side_effect = ProviderUnavailableError(
                message="Foursquare 503 Service Unavailable", provider="FOURSQUARE", status_code=503
            )
            try:
                r = redis_manager.get_sync_client()
                if r:
                    r.delete("navix:places:foursquare:sangli:global")
            except Exception:
                pass

            # Sangli is in Phase 8 seed database, but consumer search MUST return 503 and NOT seed data!
            response = client.get("/api/v1/places/search?q=Sangli")
            assert response.status_code == 503
            err = response.json()
            assert "temporarily unavailable" in str(err["detail"]).lower()
            # Must NOT return 200 with seeded results
            assert response.status_code != 200

    def test_provider_timeout_returns_503(self):
        with patch.object(places_search_service.provider, "search_places") as mock_search:
            mock_search.side_effect = ProviderTimeoutError(
                message="Request timed out", provider="FOURSQUARE"
            )
            try:
                r = redis_manager.get_sync_client()
                if r:
                    r.delete("navix:places:foursquare:timeoutquery:global")
            except Exception:
                pass

            response = client.get("/api/v1/places/search?q=TimeoutQuery")
            assert response.status_code == 503
            err = response.json()
            assert "temporarily unavailable" in str(err["detail"]).lower()

    def test_places_health_endpoint(self):
        response = client.get("/api/v1/places/health")
        assert response.status_code == 200
        data = response.json()
        assert "timestamp" in data
        assert "providers" in data
        providers = data["providers"]
        assert "FOURSQUARE" in providers
        assert "TRANSITLAND" in providers
        assert "DUFFEL" in providers
        assert "HOTELBEDS" in providers

        # Verify no secrets or sensitive keys are leaked in health output
        for p_name, p_info in providers.items():
            assert "api_key" not in p_info
            assert "secret" not in p_info
            assert "token" not in p_info
            assert "key" not in p_info
