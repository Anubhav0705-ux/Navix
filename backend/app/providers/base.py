from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from app.schemas.places import PlaceSearchResponse
from app.schemas.providers import ProviderHealth


class ProviderError(Exception):
    """Base exception for all external provider errors."""
    def __init__(self, message: str, provider: str, status_code: Optional[int] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.status_code = status_code
        self.details = details or {}


class ProviderAuthError(ProviderError):
    """Authentication or authorization failure with provider (401/403)."""
    pass


class ProviderRateLimitError(ProviderError):
    """Provider rate limit or quota exceeded (429)."""
    pass


class ProviderUnavailableError(ProviderError):
    """Provider server failure, network outage, or 5xx."""
    pass


class ProviderTimeoutError(ProviderError):
    """Provider request timed out."""
    pass


class ProviderMalformedResponseError(ProviderError):
    """Provider returned invalid or unparseable JSON."""
    pass


class ExternalPlaceProvider(ABC):
    """Abstract interface for external place/POI/city search providers."""
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def search_places(
        self,
        query: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 10
    ) -> PlaceSearchResponse:
        """Search places by query string with optional geographic proximity context."""
        pass

    @abstractmethod
    def check_health(self) -> ProviderHealth:
        """Perform a safe health check without exposing credentials."""
        pass


class TransitDiscoveryProvider(ABC):
    """Abstract interface for external public transit discovery providers."""
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def check_health(self) -> ProviderHealth:
        pass


class FlightProvider(ABC):
    """Abstract interface for flight search & offer providers."""
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def check_health(self) -> ProviderHealth:
        pass


class HotelProvider(ABC):
    """Abstract interface for hotel & lodging providers."""
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def check_health(self) -> ProviderHealth:
        pass
