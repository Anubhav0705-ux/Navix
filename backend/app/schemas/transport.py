from typing import List, Optional, Dict
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict


class TransportProviderResponse(BaseModel):
    id: str
    name: str
    operator_name: Optional[str] = None
    code_system: str
    transport_mode: str
    website_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CallingPointResponse(BaseModel):
    id: str
    facility_id: Optional[str] = None
    provider_stop_code: Optional[str] = None
    stop_name: str
    stop_sequence: int
    arrival_time: str
    departure_time: str
    day_offset: int

    model_config = ConfigDict(from_attributes=True)


class TransportFareResponse(BaseModel):
    id: str
    origin_facility_id: Optional[str] = None
    destination_facility_id: Optional[str] = None
    fare_class: str
    fare_status: str = "NOT_PROVIDED"
    amount: Optional[float] = None
    currency: str = "INR"
    is_estimated: bool = False
    data_source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TransportServiceDetailResponse(BaseModel):
    id: str
    provider_id: str
    provider_name: str
    service_code: str
    service_name: str
    transport_mode: str
    origin_facility_id: Optional[str] = None
    destination_facility_id: Optional[str] = None
    data_state: str
    data_class: str = "REAL_SOURCE_DERIVED"
    is_active: bool
    calling_points: List[CallingPointResponse] = Field(default_factory=list)
    fares: List[TransportFareResponse] = Field(default_factory=list)
    license: Optional[str] = None
    attribution: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FacilityDepartureResponse(BaseModel):
    service_id: str
    service_code: str
    service_name: str
    provider_name: str
    transport_mode: str
    departure_time: str
    destination_facility_id: Optional[str] = None
    destination_stop_name: str
    data_state: str
    fare_sample: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class SourceStatusResponse(BaseModel):
    source_id: str
    transport_mode: str
    operator_name: str
    source_name: str
    license: str
    ingestion_status: str
    last_run_status: Optional[str] = None
    records_read: int = 0
    records_inserted: int = 0
    attribution: str

    model_config = ConfigDict(from_attributes=True)


class FacilityArrivalResponse(BaseModel):
    service_id: str
    service_code: str
    service_name: str
    provider_name: str
    transport_mode: str
    arrival_time: str
    origin_facility_id: Optional[str] = None
    origin_stop_name: str
    data_state: str
    day_offset: int = 0

    model_config = ConfigDict(from_attributes=True)


class TransportStopDetail(BaseModel):
    stop_sequence: int
    facility_id: Optional[str] = None
    stop_name: str
    arrival_time: str
    departure_time: str
    day_offset: int = 0


class TransportSearchServiceCard(BaseModel):
    service_id: str
    service_code: str
    service_name: str
    provider_id: str
    provider_name: str
    operator_name: Optional[str] = None
    transport_mode: str
    origin_facility_id: str
    origin_facility_name: str
    destination_facility_id: str
    destination_facility_name: str
    departure_time: str
    arrival_time: str
    duration_minutes: int
    day_offset: int = 0
    intermediate_stops_count: int = 0
    intermediate_stops: List[TransportStopDetail] = Field(default_factory=list)
    fares: List[TransportFareResponse] = Field(default_factory=list)
    fare_status: str = "NOT_PROVIDED"
    availability_status: str = "NOT_PROVIDED"
    data_state: str = "SCHEDULED"
    data_class: str = "REAL_SOURCE_DERIVED"
    is_expired: bool = False
    operates_on_selected_date: bool = True
    delay_seconds: int = 0
    active_alerts_count: int = 0
    license: str = "GODL-India"
    attribution: str = "Official Open Transport Feed"


class TransportSearchResult(BaseModel):
    origin_facility_id: str
    destination_facility_id: str
    travel_date: Optional[str] = None
    total_services_found: int
    services: List[TransportSearchServiceCard] = Field(default_factory=list)


class SourceCoverageResponse(BaseModel):
    total_services: int
    verified_services_count: int
    synthetic_fixtures_count: int
    modes_breakdown: Dict[str, int]
    total_calling_points: int
    resolved_facilities_count: int
    quarantined_stops_count: int
    total_sources: int
    approved_sources_count: int
    active_providers_count: int


class AdminRefreshResponse(BaseModel):
    source_id: str
    status: str
    records_updated: int = 0
    records_inserted: int = 0
    message: Optional[str] = None
