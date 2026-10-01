from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class TransitNodeRead(BaseModel):
    node_id: str
    node_name: str
    city: str
    latitude: float
    longitude: float

    model_config = ConfigDict(from_attributes=True)


class TransitScheduleRead(BaseModel):
    schedule_id: str
    admin_id: str
    source_node_id: str
    dest_node_id: str
    provider: str
    departure_time: datetime
    arrival_time: datetime
    base_cost: Decimal

    model_config = ConfigDict(from_attributes=True)


class TransitSegmentRead(BaseModel):
    segment_id: str
    trip_id: str
    source_node_id: str
    dest_node_id: str
    mode_type: str
    provider_name: str
    departure_time: datetime
    arrival_time: datetime
    cost: Decimal

    model_config = ConfigDict(from_attributes=True)
