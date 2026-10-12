from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class ExternalPlaceRef(BaseModel):
    """
    Strongly typed canonical reference to an external provider place.
    Used across Trip Setup and planning workflows to identify real-world destinations.
    """
    provider: str = Field(default="FOURSQUARE", description="External provider identifier (e.g. FOURSQUARE)")
    provider_place_id: str = Field(..., min_length=1, description="Provider unique place ID (e.g. FSQ ID)")
    display_name: str = Field(..., min_length=1, description="Human readable display name")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS84 latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS84 longitude")
    country: Optional[str] = Field(default="India", description="Country name")
    region: Optional[str] = Field(default=None, description="State / Province / Region")
    locality: Optional[str] = Field(default=None, description="City / Town / Settlement")

    @field_validator("display_name")
    @classmethod
    def validate_name_not_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("display_name cannot be empty or blank")
        return trimmed


class PlaceSearchResultItem(BaseModel):
    """Normalized search result returned by real place providers."""
    provider: str = Field(default="FOURSQUARE", description="Source provider name")
    provider_place_id: str = Field(..., description="Provider unique ID")
    display_name: str = Field(..., description="Name of the place or city")
    formatted_address: Optional[str] = None
    locality: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    categories: List[str] = Field(default_factory=list)
    timezone: Optional[str] = None
    data_state: str = Field(default="REAL_PROVIDER_DATA", description="REAL_PROVIDER_DATA | SANDBOX_PROVIDER_DATA")


class PlaceSearchResponse(BaseModel):
    """Response envelope for place search queries."""
    query: str
    total_matches: int
    results: List[PlaceSearchResultItem]
    provider: str = "FOURSQUARE"
    cached: bool = False
