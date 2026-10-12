import time
import requests
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.places import PlaceSearchResultItem, PlaceSearchResponse
from app.schemas.providers import ProviderHealth, ProviderHealthStatus
from app.providers.base import (
    ExternalPlaceProvider,
    ProviderError,
    ProviderAuthError,
    ProviderRateLimitError,
    ProviderUnavailableError,
    ProviderTimeoutError,
    ProviderMalformedResponseError
)


class FoursquarePlaceProvider(ExternalPlaceProvider):
    """
    Authoritative place search integration for Foursquare Places API.
    API Version: 2025-06-17
    Base URL: https://places-api.foursquare.com/places/search
    """
    SEARCH_URL = "https://places-api.foursquare.com/places/search"
    API_VERSION = "2025-06-17"
    TIMEOUT_SECONDS = 5.0
    MAX_RETRIES = 2

    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key

    @property
    def provider_name(self) -> str:
        return "FOURSQUARE"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.strip())

    def _get_headers(self) -> Dict[str, str]:
        if not self._api_key:
            raise ProviderAuthError(
                message="Foursquare API key is missing or not configured.",
                provider=self.provider_name
            )
        return {
            "Authorization": f"Bearer {self._api_key.strip()}",
            "X-Places-Api-Version": self.API_VERSION,
            "Accept": "application/json"
        }

    def search_places(
        self,
        query: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 10
    ) -> PlaceSearchResponse:
        trimmed = query.strip()
        if not trimmed:
            return PlaceSearchResponse(
                query=query,
                total_matches=0,
                results=[],
                provider=self.provider_name
            )

        if not self.is_configured:
            raise ProviderAuthError(
                message="FOURSQUARE_API_KEY environment variable is not configured.",
                provider=self.provider_name
            )

        params: Dict[str, Any] = {
            "query": trimmed,
            "limit": min(max(1, limit), 20)
        }

        if lat is not None and lon is not None:
            params["ll"] = f"{lat},{lon}"
        else:
            # Default proximity context to India for national travel scope
            params["near"] = "India"

        headers = self._get_headers()
        response = self._execute_with_retry(self.SEARCH_URL, headers, params)

        try:
            payload = response.json()
        except Exception as e:
            raise ProviderMalformedResponseError(
                message=f"Failed to parse Foursquare response as JSON: {e}",
                provider=self.provider_name
            )

        raw_results = payload.get("results", []) if isinstance(payload, dict) else []
        normalized_items: List[PlaceSearchResultItem] = []

        for item in raw_results:
            if not isinstance(item, dict):
                continue

            fsq_id = item.get("fsq_place_id") or item.get("fsq_id") or item.get("id")
            name = item.get("name")
            if not fsq_id or not name:
                continue

            # Extract coordinates: top-level latitude/longitude or nested geocodes
            latitude: Optional[float] = None
            longitude: Optional[float] = None

            if "latitude" in item and "longitude" in item and item["latitude"] is not None and item["longitude"] is not None:
                try:
                    latitude = float(item["latitude"])
                    longitude = float(item["longitude"])
                except (ValueError, TypeError):
                    pass

            if latitude is None or longitude is None:
                geocodes = item.get("geocodes", {})
                main_geo = geocodes.get("main") if isinstance(geocodes, dict) else None
                if not main_geo and isinstance(geocodes, dict):
                    main_geo = geocodes.get("roof")
                if main_geo:
                    try:
                        latitude = float(main_geo.get("latitude"))
                        longitude = float(main_geo.get("longitude"))
                    except (ValueError, TypeError):
                        pass

            if latitude is None or longitude is None:
                continue

            # Validate coordinate bounds
            if not (-90.0 <= latitude <= 90.0 and -180.0 <= longitude <= 180.0):
                continue

            location = item.get("location", {}) if isinstance(item.get("location"), dict) else {}
            formatted_address = location.get("formatted_address")
            locality = location.get("locality")
            region = location.get("region")
            country = location.get("country") or "India"

            # Categories
            categories: List[str] = []
            for cat in item.get("categories", []):
                if isinstance(cat, dict) and cat.get("name"):
                    categories.append(str(cat.get("name")))

            timezone = item.get("timezone")

            normalized_items.append(
                PlaceSearchResultItem(
                    provider=self.provider_name,
                    provider_place_id=str(fsq_id),
                    display_name=str(name),
                    formatted_address=str(formatted_address) if formatted_address else None,
                    locality=str(locality) if locality else None,
                    region=str(region) if region else None,
                    country=str(country) if country else None,
                    latitude=latitude,
                    longitude=longitude,
                    categories=categories,
                    timezone=str(timezone) if timezone else None,
                    data_state="REAL_PROVIDER_DATA"
                )
            )

        return PlaceSearchResponse(
            query=trimmed,
            total_matches=len(normalized_items),
            results=normalized_items,
            provider=self.provider_name
        )

    def _execute_with_retry(self, url: str, headers: Dict[str, str], params: Dict[str, Any]) -> requests.Response:
        attempts = 0
        last_error: Optional[Exception] = None

        while attempts <= self.MAX_RETRIES:
            attempts += 1
            try:
                resp = requests.get(
                    url,
                    headers=headers,
                    params=params,
                    timeout=self.TIMEOUT_SECONDS
                )

                if resp.status_code == 200:
                    return resp

                if resp.status_code in (401, 403):
                    raise ProviderAuthError(
                        message=f"Foursquare authentication failed (HTTP {resp.status_code}). Verify FOURSQUARE_API_KEY.",
                        provider=self.provider_name,
                        status_code=resp.status_code
                    )

                if resp.status_code == 429:
                    raise ProviderRateLimitError(
                        message="Foursquare API quota or rate limit exceeded (HTTP 429).",
                        provider=self.provider_name,
                        status_code=429
                    )

                if resp.status_code == 400:
                    raise ProviderError(
                        message=f"Foursquare bad request (HTTP 400): {resp.text[:200]}",
                        provider=self.provider_name,
                        status_code=400
                    )

                if 500 <= resp.status_code < 600:
                    # Retry on server error
                    if attempts <= self.MAX_RETRIES:
                        time.sleep(0.3 * attempts)
                        continue
                    raise ProviderUnavailableError(
                        message=f"Foursquare service temporarily unavailable (HTTP {resp.status_code}).",
                        provider=self.provider_name,
                        status_code=resp.status_code
                    )

                # Other HTTP errors
                raise ProviderError(
                    message=f"Foursquare returned unexpected HTTP status {resp.status_code}.",
                    provider=self.provider_name,
                    status_code=resp.status_code
                )

            except requests.Timeout as e:
                last_error = e
                if attempts <= self.MAX_RETRIES:
                    time.sleep(0.3 * attempts)
                    continue
                raise ProviderTimeoutError(
                    message="Foursquare request timed out.",
                    provider=self.provider_name
                )
            except requests.RequestException as e:
                last_error = e
                if attempts <= self.MAX_RETRIES:
                    time.sleep(0.3 * attempts)
                    continue
                raise ProviderUnavailableError(
                    message=f"Foursquare network request failed: {e}",
                    provider=self.provider_name
                )

        raise ProviderUnavailableError(
            message=f"Foursquare failed after {self.MAX_RETRIES} retries: {last_error}",
            provider=self.provider_name
        )

    def check_health(self) -> ProviderHealth:
        if not self.is_configured:
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.MISSING_CREDENTIALS,
                environment="DEVELOPMENT",
                public_consumer_enabled=False,
                message="FOURSQUARE_API_KEY is not set.",
                last_checked_at=datetime.utcnow()
            )

        try:
            # Perform lightweight bounded check
            res = self.search_places("Delhi", limit=1)
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.READY,
                environment="PRODUCTION",
                public_consumer_enabled=True,
                message=f"Foursquare Places API connected successfully ({len(res.results)} places found).",
                details={"api_version": self.API_VERSION},
                last_checked_at=datetime.utcnow()
            )
        except ProviderAuthError as e:
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.UNAUTHORIZED,
                environment="DEVELOPMENT",
                public_consumer_enabled=False,
                message=str(e),
                last_checked_at=datetime.utcnow()
            )
        except ProviderRateLimitError as e:
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.RATE_LIMITED,
                environment="PRODUCTION",
                public_consumer_enabled=False,
                message=str(e),
                last_checked_at=datetime.utcnow()
            )
        except Exception as e:
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.UNAVAILABLE,
                environment="PRODUCTION",
                public_consumer_enabled=False,
                message=f"Foursquare health check failed: {e}",
                last_checked_at=datetime.utcnow()
            )
