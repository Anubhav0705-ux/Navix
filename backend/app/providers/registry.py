from typing import Dict, Optional
from app.core.config import settings
from app.schemas.providers import ProviderHealth
from app.providers.foursquare import FoursquarePlaceProvider
from app.providers.transitland import TransitlandProvider
from app.providers.duffel import DuffelFlightProvider
from app.providers.hotelbeds import HotelbedsProvider


class ProviderRegistry:
    """
    Central registry and lifecycle manager for external data providers.
    Enforces secret isolation and standardized health monitoring.
    """
    def __init__(self):
        self._foursquare = FoursquarePlaceProvider(api_key=settings.FOURSQUARE_API_KEY)
        self._transitland = TransitlandProvider(api_key=settings.TRANSITLAND_API_KEY)
        self._duffel = DuffelFlightProvider(access_token=settings.DUFFEL_ACCESS_TOKEN)
        self._hotelbeds = HotelbedsProvider(
            api_key=settings.HOTELBEDS_API_KEY,
            secret=settings.HOTELBEDS_SECRET,
            base_url=settings.HOTELBEDS_BASE_URL
        )

    @property
    def foursquare(self) -> FoursquarePlaceProvider:
        return self._foursquare

    @foursquare.setter
    def foursquare(self, provider: FoursquarePlaceProvider):
        self._foursquare = provider

    @property
    def transitland(self) -> TransitlandProvider:
        return self._transitland

    @transitland.setter
    def transitland(self, provider: TransitlandProvider):
        self._transitland = provider

    @property
    def duffel(self) -> DuffelFlightProvider:
        return self._duffel

    @duffel.setter
    def duffel(self, provider: DuffelFlightProvider):
        self._duffel = provider

    @property
    def hotelbeds(self) -> HotelbedsProvider:
        return self._hotelbeds

    @hotelbeds.setter
    def hotelbeds(self, provider: HotelbedsProvider):
        self._hotelbeds = provider

    def get_health_summary(self) -> Dict[str, ProviderHealth]:
        return {
            "FOURSQUARE": self._foursquare.check_health(),
            "TRANSITLAND": self._transitland.check_health(),
            "DUFFEL": self._duffel.check_health(),
            "HOTELBEDS": self._hotelbeds.check_health(),
        }


# Singleton registry instance
provider_registry = ProviderRegistry()
