import requests
from typing import Optional, Dict, Any
from datetime import datetime
from app.schemas.providers import ProviderHealth, ProviderHealthStatus
from app.providers.base import (
    FlightProvider,
    ProviderAuthError,
    ProviderUnavailableError,
    ProviderTimeoutError
)


class DuffelFlightProvider(FlightProvider):
    """
    Duffel Flights API Client Foundation.
    Per NAVIX Data Provenance Rules:
    - Current credentials are in TEST MODE.
    - Offers/data must be classified as SANDBOX_PROVIDER_DATA.
    - MUST NOT appear in public consumer results as real flights.
    - public_consumer_enabled = False.
    """
    BASE_URL = "https://api.duffel.com"
    API_VERSION = "v2"
    TIMEOUT_SECONDS = 5.0

    def __init__(self, access_token: Optional[str] = None):
        self._access_token = access_token

    @property
    def provider_name(self) -> str:
        return "DUFFEL"

    @property
    def is_configured(self) -> bool:
        return bool(self._access_token and self._access_token.strip())

    def _get_headers(self) -> Dict[str, str]:
        if not self._access_token:
            raise ProviderAuthError(
                message="Duffel access token is missing or not configured.",
                provider=self.provider_name
            )
        return {
            "Authorization": f"Bearer {self._access_token.strip()}",
            "Duffel-Version": self.API_VERSION,
            "Accept": "application/json"
        }

    def check_health(self) -> ProviderHealth:
        if not self.is_configured:
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.MISSING_CREDENTIALS,
                environment="TEST",
                public_consumer_enabled=False,
                message="DUFFEL_ACCESS_TOKEN is not configured.",
                last_checked_at=datetime.utcnow()
            )

        try:
            # Safe lightweight airlines endpoint check
            url = f"{self.BASE_URL}/air/airlines"
            resp = requests.get(
                url,
                headers=self._get_headers(),
                params={"limit": 1},
                timeout=self.TIMEOUT_SECONDS
            )

            if resp.status_code == 200:
                return ProviderHealth(
                    provider=self.provider_name,
                    status=ProviderHealthStatus.SANDBOX_ONLY,
                    environment="TEST",
                    public_consumer_enabled=False,
                    message="Duffel Flights API connected in TEST mode (SANDBOX_ONLY). Public consumer display disabled.",
                    details={"api_version": self.API_VERSION, "data_class": "SANDBOX_PROVIDER_DATA"},
                    last_checked_at=datetime.utcnow()
                )
            if resp.status_code in (401, 403):
                return ProviderHealth(
                    provider=self.provider_name,
                    status=ProviderHealthStatus.UNAUTHORIZED,
                    environment="TEST",
                    public_consumer_enabled=False,
                    message=f"Duffel authentication rejected (HTTP {resp.status_code}). Check DUFFEL_ACCESS_TOKEN.",
                    last_checked_at=datetime.utcnow()
                )
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.UNAVAILABLE,
                environment="TEST",
                public_consumer_enabled=False,
                message=f"Duffel returned HTTP {resp.status_code}.",
                last_checked_at=datetime.utcnow()
            )
        except requests.Timeout:
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.UNAVAILABLE,
                environment="TEST",
                public_consumer_enabled=False,
                message="Duffel request timed out.",
                last_checked_at=datetime.utcnow()
            )
        except Exception as e:
            return ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.UNAVAILABLE,
                environment="TEST",
                public_consumer_enabled=False,
                message=f"Duffel connection error: {e}",
                last_checked_at=datetime.utcnow()
            )
