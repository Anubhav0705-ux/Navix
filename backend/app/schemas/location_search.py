from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CoordinatesSchema(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS 84 latitude in degrees [-90, 90]")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS 84 longitude in degrees [-180, 180]")


class AdminContextSchema(BaseModel):
    country_id: str = Field("ctry_in", description="Country ID")
    country_name: str = Field("India", description="Country Name")
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
    display_hierarchy: str = Field(..., description="Formatted administrative context string e.g. Sangli District, Maharashtra, India")


class LocationSearchResultItem(BaseModel):
    id: str = Field(..., description="Canonical NAVIX entity ID e.g. stl_sangli, fac_sangli_sli")
    entity_type: str = Field(..., description="SETTLEMENT, TRANSIT_FACILITY, LOCALITY, POI")
    name: str = Field(..., description="Canonical entity display name")
    canonical_name: str = Field(..., description="Canonical entity name")
    display_name: str = Field(..., description="Formatted display string with administrative or facility details")
    matched_on: str = Field(..., description="Match category: provider_code, exact_canonical, exact_alias, prefix_canonical, prefix_alias, fuzzy")
    matched_name: Optional[str] = Field(None, description="Actual string query matched against")
    score: float = Field(..., description="Relevance score (higher is better)")
    settlement_id: Optional[str] = None
    settlement_name: Optional[str] = None
    admin_context: Optional[AdminContextSchema] = None
    facility_type: Optional[str] = None
    codes: List[Dict[str, str]] = Field(default_factory=list, description="Associated provider codes e.g. [{'provider': 'IRCTC', 'code': 'SLI'}]")
    coordinates: CoordinatesSchema
    coverage_status: str = Field("UNCOVERED", description="COVERED, PARTIAL, UNCOVERED")
    badge: str = Field(..., description="User-facing coverage badge e.g. ACTIVE ROUTE COVERAGE")


class LocationSearchResponse(BaseModel):
    query: str
    total_matches: int
    results: List[LocationSearchResultItem]


class LocationDetailResponse(BaseModel):
    id: str
    entity_type: str
    name: str
    canonical_name: str
    coordinates: CoordinatesSchema
    coverage_status: str
    badge: str
    admin_context: Optional[AdminContextSchema] = None
    settlement_id: Optional[str] = None
    settlement_name: Optional[str] = None
    facility_type: Optional[str] = None
    is_multimodal: Optional[bool] = None
    operating_status: Optional[str] = None
    population_tier: Optional[int] = None
    aliases: List[Dict[str, Any]] = Field(default_factory=list)
    provider_mappings: List[Dict[str, Any]] = Field(default_factory=list)


class NearbyFacilityItem(BaseModel):
    facility_id: str
    name: str
    facility_type: str
    distance_km: float
    distance_meters: float
    is_multimodal: bool
    operating_status: str
    coordinates: CoordinatesSchema
    settlement_id: str
    settlement_name: Optional[str] = None
    provider_codes: List[Dict[str, str]] = Field(default_factory=list)


class NearbyLocationResponse(BaseModel):
    center_coordinates: CoordinatesSchema
    radius_km: float
    total_facilities: int
    facilities: List[NearbyFacilityItem]


class SettlementFacilityItem(BaseModel):
    facility_id: str
    name: str
    facility_type: str
    is_multimodal: bool
    operating_status: str
    coordinates: CoordinatesSchema
    provider_codes: List[Dict[str, str]] = Field(default_factory=list)


class SettlementFacilitiesResponse(BaseModel):
    settlement_id: str
    settlement_name: str
    total_facilities: int
    facilities: List[SettlementFacilityItem]


class LocationCoverageResponse(BaseModel):
    location_id: str
    name: str
    entity_type: str
    coverage_status: str
    badge: str
    details: str
