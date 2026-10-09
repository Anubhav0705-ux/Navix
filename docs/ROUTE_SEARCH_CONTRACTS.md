# NAVIX — Route Search API & Data Contracts Specification (V1)

> **Document Type**: Technical API Schema & Contract Specification  
> **Status**: Official Technical Design Specification (Phase 6B.3A — Targeted Architecture Corrections Pass)  
> **Scope**: Typed Route Search Requests, Candidate Responses, Data Attributions, & Error Contracts  
> **Safety Notice**: Design Specification Only — Zero Application Code or PostgreSQL Mutations Executed.

---

## 1. Overview & Type Safety Principles

The route search contract specification defines the exact Pydantic v2 / TypeScript interfaces exchanged between the frontend, backend orchestrator, routing engine, and budget optimizer.

### Core Contract Guarantees
1. **Pydantic v2 Type Safety**: All contract models enforce strict field types, default values, and mathematical validation bounds (`Decimal` for fares, non-negative integers for durations).
2. **Backward Compatibility**: Fully compatible with existing frontend planner components (`PlannerContext.tsx`) and backend `/api/v1/routes/search` and `/api/v1/trips/plan` endpoints.
3. **4-Dimensional Data Quality Separation**: Explicitly separates `PriceCertainty`, `InventoryAvailability`, `SourceAuthority`, and `Freshness` while projecting cleanly into legacy `AvailabilityState`.

---

## 2. Orthogonal 4-Dimension Data Quality Models & Legacy Projection

### 2.1 Fine-Grained Quality Dimensions
```python
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PriceCertainty(str, Enum):
    FINAL_BOOKABLE = "FINAL_BOOKABLE"
    INDICATIVE_ESTIMATE = "INDICATIVE_ESTIMATE"
    DYNAMIC_UNCONFIRMED = "DYNAMIC_UNCONFIRMED"

class InventoryAvailability(str, Enum):
    SEATS_AVAILABLE = "SEATS_AVAILABLE"
    WAITLIST = "WAITLIST"
    RAC = "RAC"
    SOLD_OUT = "SOLD_OUT"
    UNCHECKED_SCHEDULE = "UNCHECKED_SCHEDULE"

class SourceAuthority(str, Enum):
    OFFICIAL_CARRIER_API = "OFFICIAL_CARRIER_API"
    AGGREGATOR_FEED = "AGGREGATOR_FEED"
    COMMUNITY_GTFS = "COMMUNITY_GTFS"
    SYNTHETIC_MODEL = "SYNTHETIC_MODEL"

class Freshness(str, Enum):
    LIVE_REALTIME = "LIVE_REALTIME"
    CACHED_VALID = "CACHED_VALID"
    STALE_FALLBACK = "STALE_FALLBACK"

class LegacyAvailabilityState(str, Enum):
    CONFIRMED_LIVE = "CONFIRMED_LIVE"
    PUBLISHED_SCHEDULE = "PUBLISHED_SCHEDULE"
    CACHED = "CACHED"
    ESTIMATED = "ESTIMATED"
    UNAVAILABLE = "UNAVAILABLE"
    UNKNOWN = "UNKNOWN"
```

### 2.2 Bidirectional Legacy Enum Projection Mapping
```python
def project_to_legacy_availability(
    price: PriceCertainty,
    inventory: InventoryAvailability,
    authority: SourceAuthority,
    freshness: Freshness
) -> LegacyAvailabilityState:
    """Projects 4-dimension state into legacy AvailabilityState enum for backward compatibility."""
    if freshness == Freshness.LIVE_REALTIME and authority == SourceAuthority.OFFICIAL_CARRIER_API:
        return LegacyAvailabilityState.CONFIRMED_LIVE
    if freshness == Freshness.CACHED_VALID and authority in (SourceAuthority.OFFICIAL_CARRIER_API, SourceAuthority.AGGREGATOR_FEED):
        return LegacyAvailabilityState.CACHED
    if authority == SourceAuthority.COMMUNITY_GTFS:
        return LegacyAvailabilityState.PUBLISHED_SCHEDULE
    if inventory == InventoryAvailability.SOLD_OUT:
        return LegacyAvailabilityState.UNAVAILABLE
    return LegacyAvailabilityState.ESTIMATED
```

---

## 3. Request & Endpoint Contracts

### 3.1 Canonical Mode IDs
Supported transport mode IDs:
`TRAIN`, `INTERCITY_BUS`, `FLIGHT`, `METRO`, `LOCAL_BUS`, `CAB`, `WALKING`.

### 3.2 `RouteSearchRequest`
```python
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict
from enum import Enum

class OptimizationProfile(str, Enum):
    CHEAPEST = "CHEAPEST"
    BALANCED = "BALANCED"
    FASTER = "FASTER"

class RouteSearchRequest(BaseModel):
    origin: str = Field(description="Origin city, town, or station query string")
    destination: str = Field(description="Destination city, town, or station query string")
    departure_time: Optional[datetime] = Field(default=None, description="Requested departure instant (UTC)")
    profile: OptimizationProfile = Field(default=OptimizationProfile.BALANCED)
    max_transport_budget: Optional[Decimal] = Field(default=None, gt=Decimal("0.00"), description="Optional maximum transport budget cap in INR")
    preferred_modes: Optional[List[str]] = Field(default_factory=list, description="Allowed transport modes (e.g. ['TRAIN', 'INTERCITY_BUS'])")
    max_transfers: Optional[int] = Field(default=None, ge=0, description="Optional maximum transfer count constraint")
    allow_overnight: bool = Field(default=True, description="Flag allowing overnight transit legs")
```

### 3.3 `ResolvedTravelEndpoint`
```python
class ResolvedTravelEndpoint(BaseModel):
    query_string: str
    settlement_id: Optional[str] = None
    settlement_name: str
    resolved_facilities: List[str] = Field(description="List of transit_facility IDs within adaptive radius")
    primary_facility_id: str
    coordinates: Dict[str, float] = Field(description="{'latitude': 16.8524, 'longitude': 74.5815}")
    coverage_status: str = Field(description="'COVERED' | 'PARTIAL' | 'UNCOVERED'")
```

---

## 4. Route Candidate & Segment Contracts

### 4.1 `RouteSegment`
```python
class TransferStatus(str, Enum):
    SAFE = "SAFE"
    TIGHT = "TIGHT"
    INVALID = "INVALID"

class RouteSegment(BaseModel):
    schedule_id: str = Field(description="Unique trip instance or schedule ID")
    source_facility_id: str = Field(description="Origin transit facility ID (e.g. FAC_NDLS)")
    source_stop_id: Optional[str] = Field(default=None, description="Origin platform/bay stop ID (e.g. STOP_NDLS_P3)")
    source_facility_name: str
    source_city: str
    dest_facility_id: str = Field(description="Destination transit facility ID")
    dest_stop_id: Optional[str] = Field(default=None, description="Destination platform/bay stop ID")
    dest_facility_name: str
    dest_city: str
    provider_name: str
    provider_id: str
    transport_mode: str = Field(description="'TRAIN', 'INTERCITY_BUS', 'FLIGHT', 'METRO', 'LOCAL_BUS', 'CAB', 'WALKING'")
    departure_time: datetime = Field(description="Departure instant (UTC)")
    arrival_time: datetime = Field(description="Arrival instant (UTC)")
    duration_minutes: int = Field(ge=0)
    cost: Decimal = Field(ge=Decimal("0.00"))
    currency: str = Field(default="INR", description="ISO-4217 currency code")
    quote_id: Optional[str] = Field(default=None, description="Unique fare quote reference")
    valid_until_utc: Optional[datetime] = Field(default=None, description="Quote expiration instant")
    layover_before_minutes: int = Field(default=0, ge=0)
    transfer_status: TransferStatus = Field(default=TransferStatus.SAFE)
    
    # Legacy Availability Field (Backward Compatibility)
    availability_state: LegacyAvailabilityState = Field(default=LegacyAvailabilityState.PUBLISHED_SCHEDULE)
    
    # Explicit 4-Dimension Quality Models
    price_certainty: PriceCertainty = Field(default=PriceCertainty.INDICATIVE_ESTIMATE)
    inventory_availability: InventoryAvailability = Field(default=InventoryAvailability.UNCHECKED_SCHEDULE)
    source_authority: SourceAuthority = Field(default=SourceAuthority.COMMUNITY_GTFS)
    freshness: Freshness = Field(default=Freshness.CACHED_VALID)
    
    user_notice: Optional[str] = None
```

### 4.2 `RouteCandidate`
```python
class RouteCandidate(BaseModel):
    candidate_id: str
    profile_label: OptimizationProfile
    total_transport_cost: Decimal
    currency: str = Field(default="INR")
    total_elapsed_minutes: int
    total_travel_minutes: int
    total_layover_minutes: int
    number_of_segments: int
    number_of_transfers: int
    segments: List[RouteSegment]
    is_pareto_optimal: bool = True
```

---

## 5. Response & Error Contracts

### 5.1 `SearchOutcome`
```python
class SearchOutcome(str, Enum):
    EXHAUSTIVE_SEARCH = "EXHAUSTIVE_SEARCH"
    APPROXIMATE_SEARCH = "APPROXIMATE_SEARCH"
    TRUNCATED_SEARCH = "TRUNCATED_SEARCH"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
```

### 5.2 `RouteSearchResponse`
```python
class RouteSearchResponse(BaseModel):
    origin: str
    destination: str
    profile: OptimizationProfile
    search_outcome: SearchOutcome = Field(default=SearchOutcome.EXHAUSTIVE_SEARCH)
    candidates: List[RouteCandidate]
    primary_recommendation: Optional[RouteCandidate] = None
    data_source_attribution: str = "NAVIX Multimodal Transit Index"
    search_execution_ms: float
```

### 5.3 `RoutingFailure`
```python
class RoutingErrorCode(str, Enum):
    NO_ROUTE_IN_DATA = "NO_ROUTE_IN_DATA"
    UNCOVERED_LOCATION = "UNCOVERED_LOCATION"
    TRANSPORT_BUDGET_TOO_LOW = "TRANSPORT_BUDGET_TOO_LOW"
    PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE"
    INVALID_DATE_RANGE = "INVALID_DATE_RANGE"

class RoutingFailure(BaseModel):
    error_code: RoutingErrorCode
    message: str
    origin_resolved: Optional[ResolvedTravelEndpoint] = None
    dest_resolved: Optional[ResolvedTravelEndpoint] = None
    lowest_cost_found: Optional[Decimal] = None
    suggested_actions: List[str] = Field(default_factory=list)
```
