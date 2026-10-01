from enum import Enum
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class OptimizationProfile(str, Enum):
    CHEAPEST = "CHEAPEST"
    BALANCED = "BALANCED"
    FASTER = "FASTER"


class TransferStatus(str, Enum):
    SAFE = "SAFE"
    TIGHT = "TIGHT"
    INVALID = "INVALID"


class TransportMode(str, Enum):
    LOCAL = "LOCAL"
    TRAIN = "TRAIN"
    BUS = "BUS"
    METRO = "METRO"
    OTHER = "OTHER"


class TransferValidationResult(BaseModel):
    status: TransferStatus
    layover_minutes: int
    required_minutes: int
    reason: str


class RouteSegmentResult(BaseModel):
    schedule_id: str
    source_node_id: str
    source_node_name: str
    source_city: str
    dest_node_id: str
    dest_node_name: str
    dest_city: str
    provider: str
    transport_mode: TransportMode
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int
    cost: Decimal
    layover_before_minutes: Optional[int] = 0
    transfer_status: Optional[TransferStatus] = TransferStatus.SAFE


class RouteSummary(BaseModel):
    total_transport_cost: Decimal
    total_elapsed_minutes: int
    total_travel_minutes: int
    total_layover_minutes: int
    number_of_segments: int
    number_of_transfers: int
    algorithm_used: str
    data_source: str = "Demo Transit Dataset"


class RouteSearchResult(BaseModel):
    origin: str
    destination: str
    profile: OptimizationProfile
    segments: List[RouteSegmentResult]
    summary: RouteSummary

    model_config = ConfigDict(from_attributes=True)


class RoutingRequest(BaseModel):
    origin: str
    destination: str
    profile: OptimizationProfile = OptimizationProfile.BALANCED
    max_transport_budget: Optional[Decimal] = None
    departure_time: Optional[datetime] = None
