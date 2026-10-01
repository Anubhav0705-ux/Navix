from datetime import date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class TripRead(BaseModel):
    trip_id: str
    traveler_id: str
    origin: str
    destination: str
    travel_date: date
    budget_cap: Decimal

    model_config = ConfigDict(from_attributes=True)
