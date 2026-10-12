import requests
from typing import Optional, Dict, Any
from datetime import datetime
from app.schemas.providers import ProviderHealth, ProviderHealthStatus
from app.providers.base import (
    TransitDiscoveryProvider,
    ProviderAuthError,
    ProviderRateLimitError,
    ProviderUnavailableError,
    ProviderTimeoutError
)


class TransitlandProvider(TransitDiscoveryProvider):
    """
    Transitland REST API v2 client foundation for feed and transit network discovery.
    Base URL: https://transit.land/api/v2/rest
    Authentication: apikey header
    """
    BASE_URL = "https://transit.land/api/v2/rest"
    TIMEOUT_SECONDS = 5.0

    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key

    @property
    def provider_name(self) -> str:
        return "TRANSITLAND"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.strip())

    def _get_headers(self) -> Dict[str, str]:
        if not self._api_key:
            raise ProviderAuthError(
                message="Transitland API key is missing or not configured.",
                provider=self.provider_name
            )
        return {
            "apikey": self._api_key.strip(),
            "Accept": "application/json"
        }

    def fetch_sample_operators(self, limit: int = 1) -> Dict[str, Any]:
        """Fetch a small bounded operators query to verify connectivity and API key."""
        if not self.is_configured:
            raise ProviderAuthError(
                message="TRANSITLAND_API_KEY is not configured.",
                provider=self.provider_name
            )

        url = f"{self.BASE_URL}/operators"
        params = {"limit": min(max(1, limit), 5)}
        headers = self._get_headers()

        try:
            resp = requests.get(url, headers=headers, params=params, timeout=self.TIMEOUT_SECONDS)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code in (401, 403):
                raise ProviderAuthError(
                    message=f"Transitland authentication failed (HTTP {resp.status_code}). Check TRANSITLAND_API_KEY.",
                    provider=self.provider_name,
                    status_code=resp.status_code
                )
            if resp.status_code == 429:
                raise ProviderRateLimitError(
                    message="Transitland rate limit exceeded (HTTP 429).",
                    provider=self.provider_name,
                    status_code=429
                )
            raise ProviderUnavailableError(
                message=f"Transitland returned unexpected HTTP status {resp.status_code}.",
                provider=self.provider_name,
                status_code=resp.status_code
            )
        except requests.Timeout:
            raise ProviderTimeoutError(
                message="Transitland request timed out.",
                provider=self.provider_name
            )
        except requests.RequestException as e:
            raise ProviderUnavailableError(
                message=f"Transitland network request failed: {e}",
                provider=self.provider_name
            )

    def check_health(self) -> ProviderHealth:
        if not self.is_configured:
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.MISSING_CREDENTIALS,
                environment="DEVELOPMENT",
                public_consumer_enabled=False,
                message="TRANSITLAND_API_KEY is not configured.",
                last_checked_at=datetime.utcnow()
            )

        try:
            data = self.fetch_sample_operators(limit=1)
            op_count = len(data.get("operators", [])) if isinstance(data, dict) else 0
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.READY,
                environment="PRODUCTION",
                public_consumer_enabled=False,  # Discovery only; routing engine not replaced in Phase 10
                message=f"Transitland API v2 connected successfully ({op_count} operator sample verified).",
                details={"api_base": self.BASE_URL},
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
                message=f"Transitland health check failed: {e}",
                last_checked_at=datetime.utcnow()
            )
