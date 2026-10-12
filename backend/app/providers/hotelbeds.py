import time
import hashlib
import requests
from typing import Optional, Dict, Any
from datetime import datetime
from app.schemas.providers import ProviderHealth, ProviderHealthStatus
from app.providers.base import (
    HotelProvider,
    ProviderAuthError,
    ProviderUnavailableError
)


class HotelbedsProvider(HotelProvider):
    """
    Hotelbeds Lodging API Client Foundation.
    Per NAVIX Data Provenance Rules:
    - Current access is EVALUATION / TEST environment (https://api.test.hotelbeds.com).
    - Evaluation quota is strictly conserved; status checks are cached.
    - public_consumer_enabled = False.
    - Authentication signature: SHA256(API_KEY + SECRET + UNIX_TIMESTAMP)
    """
    TIMEOUT_SECONDS = 5.0
    HEALTH_CACHE_TTL_SECONDS = 3600  # Cache health checks for 1 hour to prevent quota waste

    def __init__(
        self,
        api_key: Optional[str] = None,
        secret: Optional[str] = None,
        base_url: str = "https://api.test.hotelbeds.com"
    ):
        self._api_key = api_key
        self._secret = secret
        self._base_url = base_url.rstrip("/")
        self._cached_health: Optional[ProviderHealth] = None
        self._last_health_check_time: float = 0.0

    @property
    def provider_name(self) -> str:
        return "HOTELBEDS"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.strip() and self._secret and self._secret.strip())

    def _generate_signature(self) -> str:
        if not self._api_key or not self._secret:
            raise ProviderAuthError(
                message="Hotelbeds credentials (API key or secret) missing.",
                provider=self.provider_name
            )
        timestamp = str(int(time.time()))
        raw = self._api_key.strip() + self._secret.strip() + timestamp
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def _get_headers(self) -> Dict[str, str]:
        signature = self._generate_signature()
        return {
            "Api-key": self._api_key.strip(),
            "X-Signature": signature,
            "Accept": "application/json"
        }

    def check_health(self, force: bool = False) -> ProviderHealth:
        now = time.time()
        # Return cached health check if within TTL to protect evaluation quota
        if not force and self._cached_health and (now - self._last_health_check_time < self.HEALTH_CACHE_TTL_SECONDS):
            return self._cached_health

        if not self.is_configured:
            health = ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.MISSING_CREDENTIALS,
                environment="EVALUATION",
                public_consumer_enabled=False,
                message="HOTELBEDS_API_KEY or HOTELBEDS_SECRET is not configured.",
                last_checked_at=datetime.utcnow()
            )
            self._cached_health = health
            self._last_health_check_time = now
            return health

        url = f"{self._base_url}/hotel-api/1.0/status"
        try:
            resp = requests.get(url, headers=self._get_headers(), timeout=self.TIMEOUT_SECONDS)
            if resp.status_code == 200:
                health = ProviderHealth(
                    provider=self.provider_name,
                    status=ProviderHealthStatus.EVALUATION,
                    environment="EVALUATION",
                    public_consumer_enabled=False,
                    message="Hotelbeds evaluation API connected successfully (status endpoint OK).",
                    details={"base_url": self._base_url, "environment": "TEST/EVALUATION"},
                    last_checked_at=datetime.utcnow()
                )
            elif resp.status_code in (401, 403):
                health = ProviderHealth(
                    provider=self.provider_name,
                    status=ProviderHealthStatus.UNAUTHORIZED,
                    environment="EVALUATION",
                    public_consumer_enabled=False,
                    message=f"Hotelbeds authentication rejected (HTTP {resp.status_code}). Check API key and secret.",
                    last_checked_at=datetime.utcnow()
                )
            else:
                health = ProviderHealth(
                    provider=self.provider_name,
                    status=ProviderHealthStatus.UNAVAILABLE,
                    environment="EVALUATION",
                    public_consumer_enabled=False,
                    message=f"Hotelbeds status endpoint returned HTTP {resp.status_code}.",
                    last_checked_at=datetime.utcnow()
                )
        except Exception as e:
            health = ProviderHealth(
                provider=self.provider_name,
                status=ProviderHealthStatus.UNAVAILABLE,
                environment="EVALUATION",
                public_consumer_enabled=False,
                message=f"Hotelbeds connectivity error: {e}",
                last_checked_at=datetime.utcnow()
            )

        self._cached_health = health
        self._last_health_check_time = now
        return health
