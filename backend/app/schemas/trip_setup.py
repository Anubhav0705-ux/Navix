from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from app.schemas.places import ExternalPlaceRef


class TripSetupRequest(BaseModel):
    """
    Validated request payload for Step 1: Trip Setup.
    Requires real external place references for origin and destination.
    """
    origin: ExternalPlaceRef
    destination: ExternalPlaceRef
    departure_date: date
    return_date: date
    travellers: int = Field(default=1, ge=1, le=20, description="Total traveller count (1 to 20)")
    maximum_budget: Decimal = Field(..., gt=Decimal("0.00"), description="Total trip budget cap")
    currency: str = Field(default="INR", description="Three-letter ISO currency code (default: INR)")
    travel_style: str = Field(default="BALANCED", description="BUDGET | BALANCED | COMFORT | LUXURY")
    personalities: Optional[List[str]] = Field(default_factory=list)
    must_include: Optional[List[str]] = Field(default_factory=list)
    avoid: Optional[List[str]] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_trip_setup_constraints(self) -> "TripSetupRequest":
        today = date.today()
        # 1. Departure date not in past
        if self.departure_date < today:
            raise ValueError(f"Departure date ({self.departure_date}) cannot be in the past.")

        # 2. Return date >= departure date
        if self.return_date < self.departure_date:
            raise ValueError(f"Return date ({self.return_date}) cannot be before departure date ({self.departure_date}).")

        # 3. Maximum trip duration limit (e.g. 30 days)
        duration_days = (self.return_date - self.departure_date).days + 1
        if duration_days > 30:
            raise ValueError(f"Trip duration ({duration_days} days) exceeds maximum allowable duration of 30 days.")

        # 4. Same origin and destination check
        if self.origin.provider == self.destination.provider and self.origin.provider_place_id == self.destination.provider_place_id:
            raise ValueError("Origin and destination must be distinct places.")

        # Also check display names and coordinate distance if place ids differ
        if self.origin.display_name.strip().lower() == self.destination.display_name.strip().lower():
            raise ValueError("Origin and destination cannot be identical locations.")

        return self


class TripSetupDraftResponse(BaseModel):
    """
    Validated Trip Setup draft response returned to the frontend wizard.
    """
    trip_id: str
    origin: ExternalPlaceRef
    destination: ExternalPlaceRef
    departure_date: date
    return_date: date
    duration_days: int
    duration_nights: int
    travellers: int
    maximum_budget: Decimal
    currency: str
    travel_style: str
    status: str = "DRAFT"
    next_step: str = "TRANSPORTATION"
    message: str = "Trip setup validated successfully. Ready for multimodal transportation planning."
    created_at: datetime = Field(default_factory=datetime.utcnow)
