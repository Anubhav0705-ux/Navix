from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class NormalizedCallingPoint(BaseModel):
    provider_stop_code: Optional[str] = None
    stop_name: str
    facility_id: Optional[str] = None
    stop_sequence: int
    arrival_time: str
    departure_time: str
    day_offset: int = 0
    pickup_type: int = 0
    dropoff_type: int = 0


class NormalizedFare(BaseModel):
    origin_facility_id: Optional[str] = None
    destination_facility_id: Optional[str] = None
    fare_class: str
    fare_status: str = "NOT_PROVIDED"
    amount: Optional[float] = None
    currency: str = "INR"
    is_estimated: bool = False
    data_source: Optional[str] = None


class NormalizedAvailability(BaseModel):
    service_date: str  # YYYY-MM-DD
    fare_class: Optional[str] = None
    availability_status: str = "NOT_PROVIDED"  # AVAILABLE, UNAVAILABLE, UNKNOWN, NOT_PROVIDED, STALE
    available_seats: Optional[int] = None


class NormalizedService(BaseModel):
    service_code: str
    service_name: str
    provider_id: str
    provider_name: str
    operator_name: Optional[str] = None
    code_system: str
    transport_mode: str  # RAIL, BUS, FLIGHT, METRO
    data_state: str = "SCHEDULED"  # STATIC, SCHEDULED, LIVE, ESTIMATED, STALE, UNKNOWN
    data_class: str = "REAL_SOURCE_DERIVED"  # REAL_SOURCE_DERIVED, SYNTHETIC_CONTRACT_FIXTURE, LEGACY_DEMO
    calendar: Dict[str, bool] = Field(default_factory=lambda: {
        "monday": True, "tuesday": True, "wednesday": True, "thursday": True,
        "friday": True, "saturday": True, "sunday": True
    })
    calendar_dates: List[Dict[str, Any]] = Field(default_factory=list)
    calling_points: List[NormalizedCallingPoint] = Field(default_factory=list)
    fares: List[NormalizedFare] = Field(default_factory=list)
    availabilities: List[NormalizedAvailability] = Field(default_factory=list)


class ResolvedMappingResult(BaseModel):
    method: str  # EXACT_CODE, EXACT_PROVIDER_MAPPING, ALIAS_MATCH, UNRESOLVED, REJECTED_MODE_MISMATCH
    confidence: float  # 1.0 for exact, 0.8 for alias, 0.0 for unresolved
    facility_id: Optional[str] = None
    facility_type: Optional[str] = None
    review_state: str = "VERIFIED"  # VERIFIED, NEEDS_REVIEW, UNRESOLVED
    error_code: Optional[str] = None


class BaseProviderAdapter(ABC):
    @abstractmethod
    def fetch(self) -> Any:
        """Fetch raw dataset from source or file."""
        pass

    @abstractmethod
    def parse(self, raw_data: Any) -> List[NormalizedService]:
        """Parse raw dataset into normalized service records."""
        pass

    @abstractmethod
    def validate(self, services: List[NormalizedService]) -> List[NormalizedService]:
        """Validate stop sequences, times, and positive fares."""
        pass
