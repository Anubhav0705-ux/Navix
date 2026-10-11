from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class RtStopTimeUpdate(BaseModel):
    stop_sequence: Optional[int] = None
    stop_id: Optional[str] = None
    arrival_delay: Optional[int] = None      # in seconds
    departure_delay: Optional[int] = None    # in seconds
    schedule_relationship: str = "SCHEDULED"  # SCHEDULED, SKIPPED, NO_DATA


class RtTripUpdate(BaseModel):
    trip_id: str
    route_id: Optional[str] = None
    start_time: Optional[str] = None
    start_date: Optional[str] = None
    delay_seconds: int = 0
    schedule_relationship: str = "SCHEDULED"  # SCHEDULED, ADDED, UNSCHEDULED, CANCELED
    stop_time_updates: List[RtStopTimeUpdate] = Field(default_factory=list)


class RtVehiclePosition(BaseModel):
    trip_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    latitude: float
    longitude: float
    bearing: Optional[float] = None
    speed: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class RtServiceAlert(BaseModel):
    alert_id: str
    cause: str = "UNKNOWN_CAUSE"
    effect: str = "UNKNOWN_EFFECT"
    header_text: str
    description_text: Optional[str] = None
    informed_service_id: Optional[str] = None
    active_from: Optional[datetime] = None
    active_to: Optional[datetime] = None


class RtFeedMessage(BaseModel):
    feed_timestamp: datetime
    is_stale: bool = False
    trip_updates: List[RtTripUpdate] = Field(default_factory=list)
    vehicles: List[RtVehiclePosition] = Field(default_factory=list)
    alerts: List[RtServiceAlert] = Field(default_factory=list)
