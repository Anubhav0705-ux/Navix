# NAVIX — National API Contracts & Schema Specification (V1)

> **Document Type**: Technical API Schema & Data Contracts Specification  
> **Status**: Official Technical Design Specification (Phase 6B.4 — Final Corrections Pass)  
> **Scope**: Typed Pydantic V2 Schemas, TypeScript Interfaces, Endpoint Contracts, Pagination & Standardized Errors  
> **Safety Notice**: Design Specification Only — Zero Application Code, PostgreSQL Mutations, or Dependencies Applied.

---

## 1. Overview & Standardized Data Types

All NAVIX API contracts strictly enforce static typing across client-server boundaries under prefix `/api/v1`:
- **Monetary Values**: Represented as `Decimal` in Python / strings in JSON to prevent floating-point rounding errors. Default currency is ISO-4217 `"INR"`.
- **Timestamps**: Represented in ISO-8601 UTC format (`YYYY-MM-DDTHH:MM:SSZ`).
- **Dates**: ISO-8601 date strings (`YYYY-MM-DD`).
- **Pagination**: 1-indexed page/page_size parameters returning standardized `PaginatedResponse[T]` wrappers.

---

## 2. Standardized Error Payload Contracts

All error responses return HTTP 4xx or 5xx status codes with a consistent structured JSON payload:

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class APIErrorDetail(BaseModel):
    field: Optional[str] = Field(default=None, description="Request parameter or field triggering error")
    message: str = Field(description="Human-readable error explanation")

class APIErrorResponse(BaseModel):
    error_code: str = Field(description="Canonical error string ID (e.g. LOCATION_NOT_FOUND)")
    message: str = Field(description="High-level failure summary")
    details: List[APIErrorDetail] = Field(default_factory=list)
    request_id: str = Field(description="Unique correlation ID for tracing (X-Request-ID)")
    timestamp_utc: str = Field(description="ISO-8601 UTC instant of failure")
```

---

## 3. Geographic Location Discovery APIs

### 3.1 `GET /api/v1/locations/search`

Autocomplete location resolution supporting settlements, railway stations, bus terminals, airports, and tourist destinations.

#### Query Parameters
- `q` (string, required, min length 2): Location search string (e.g. `"Sangli"`, `"Old Manali"`, `"NDLS"`).
- `type` (string, optional): Filter by location category (`SETTLEMENT`, `RAIL_STATION`, `BUS_TERMINAL`, `AIRPORT`, `ATTRACTION`).
- `state` (string, optional): State/province code filter (e.g. `"MH"`, `"HP"`).
- `country` (string, default `"IN"`): ISO country code.
- `limit` (integer, default `10`, max `50`): Max results to return.

#### Response Schema (`LocationSearchResponse`)
```python
class ResolvedLocationItem(BaseModel):
    location_id: str = Field(description="Stable internal ID (e.g. LOC_MH_SANGLI, FAC_NDLS)")
    name: str = Field(description="Canonical display name")
    aliases: List[str] = Field(default_factory=list, description="Alternative names / multilingual aliases")
    location_type: str = Field(description="SETTLEMENT | RAIL_STATION | BUS_TERMINAL | AIRPORT | ATTRACTION")
    city_name: str
    state_name: str
    country_code: str = "IN"
    latitude: float
    longitude: float
    timezone: str = "Asia/Kolkata"
    coverage_status: str = Field(description="COVERED | PARTIAL | UNCOVERED")

class LocationSearchResponse(BaseModel):
    query: str
    results: List[ResolvedLocationItem]
    execution_ms: float
```

---

## 4. Nationwide Routing APIs

### 4.1 `POST /api/v1/routes/search`

Executes multi-criteria date-scoped multimodal pathfinding.

#### Request Schema (`RouteSearchRequest`)
```python
class OptimizationProfile(str, Enum):
    CHEAPEST = "CHEAPEST"
    BALANCED = "BALANCED"
    FASTER = "FASTER"

class RouteSearchRequest(BaseModel):
    origin: str = Field(description="Origin settlement ID or search string (e.g. LOC_MH_SANGLI)")
    destination: str = Field(description="Destination settlement ID or search string")
    departure_time: Optional[datetime] = Field(default=None, description="Requested departure instant (UTC)")
    profile: OptimizationProfile = Field(default=OptimizationProfile.BALANCED)
    max_transport_budget: Optional[Decimal] = Field(default=None, gt=Decimal("0.00"), description="Optional budget cap in INR")
    preferred_modes: Optional[List[str]] = Field(default_factory=list, description="['TRAIN', 'INTERCITY_BUS', 'FLIGHT', 'METRO']")
    max_transfers: Optional[int] = Field(default=None, ge=0)
    allow_overnight: bool = Field(default=True)
```

#### Response Schema (`RouteSearchResponse`)
```python
class SearchOutcome(str, Enum):
    EXHAUSTIVE_SEARCH = "EXHAUSTIVE_SEARCH"
    APPROXIMATE_SEARCH = "APPROXIMATE_SEARCH"
    TRUNCATED_SEARCH = "TRUNCATED_SEARCH"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"

class RouteSearchResponse(BaseModel):
    origin_resolved: ResolvedLocationItem
    destination_resolved: ResolvedLocationItem
    profile: OptimizationProfile
    search_outcome: SearchOutcome
    candidates: List[RouteCandidate]  # Phase 6B.3A Candidate schema
    primary_recommendation: Optional[RouteCandidate] = None
    data_source_attribution: str = "NAVIX Multimodal Transit Index"
    search_execution_ms: float
```

---

## 5. Whole-Trip Planning APIs

### 5.1 `POST /api/v1/trips/plan`

Executes joint route-budget-itinerary optimization. Preserves additive compatibility with NAVIX V2 requests while returning enhanced V2 expense ledgers and structured timelines.

#### Request Schema (`WholeTripPlanRequest`)
```python
class WholeTripPlanRequest(BaseModel):
    origin: str = Field(description="Origin city name or location ID")
    destination: str = Field(description="Destination city name or location ID")
    departure_date: date
    return_date: date
    maximum_budget: Decimal = Field(gt=Decimal("0.00"))
    currency: str = Field(default="INR")
    travellers: int = Field(default=1, ge=1, description="Legacy total traveler count for V1 API compatibility")
    
    party: Optional[PartyComposition] = None
    profile: Optional[str] = Field(default="BALANCED")
    stay_preference: StayPreference = Field(default=StayPreference.STANDARD)
    food_preference: FoodPreference = Field(default=FoodPreference.BALANCED)
    activity_preference: ActivityPreference = Field(default=ActivityPreference.MEDIUM)
    pace: TravelPace = Field(default=TravelPace.BALANCED)
    must_visit_activity_ids: List[str] = Field(default_factory=list)
```

---

## 6. Saved Trip & Account APIs

### 6.1 `POST /api/v1/trips/save`
Persists a generated whole-trip plan to the authenticated traveler's account.

#### Request Schema (`SaveTripRequest`)
```python
class SaveTripRequest(BaseModel):
    plan_id: str = Field(description="Unique plan ID returned by /api/v1/trips/plan")
    custom_title: Optional[str] = Field(default=None, description="User custom name for saved trip")
    notes: Optional[str] = Field(default=None)
```

#### Response Schema (`SavedTripResponse`)
```python
class SavedTripResponse(BaseModel):
    trip_id: str = Field(description="Saved trip UUID")
    user_id: str = Field(description="Owner traveler user ID")
    title: str
    origin: str
    destination: str
    departure_date: date
    return_date: date
    total_cost: Decimal
    currency: str = "INR"
    created_at_utc: datetime
    updated_at_utc: datetime
    share_token: Optional[str] = None
    is_public: bool = False
```

### 6.2 `GET /api/v1/trips/saved`
Lists saved trips for the current authenticated user with pagination.

```python
class PaginatedSavedTrips(BaseModel):
    items: List[SavedTripResponse]
    total: int
    page: int
    page_size: int
```

---

## 7. TypeScript Frontend Interface Definitions

For Next.js frontend integration, TypeScript interface definitions strictly align with Pydantic v2 schemas:

```typescript
export interface ResolvedLocationItem {
  location_id: string;
  name: string;
  aliases: string[];
  location_type: 'SETTLEMENT' | 'RAIL_STATION' | 'BUS_TERMINAL' | 'AIRPORT' | 'ATTRACTION';
  city_name: string;
  state_name: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
  coverage_status: 'COVERED' | 'PARTIAL' | 'UNCOVERED';
}

export interface WholeTripPlanRequest {
  origin: string;
  destination: string;
  departure_date: string; // YYYY-MM-DD
  return_date: string;    // YYYY-MM-DD
  maximum_budget: number;
  currency?: string;
  travellers: number;
  profile?: 'CHEAPEST' | 'BALANCED' | 'FASTER';
  stay_preference?: 'BUDGET' | 'STANDARD' | 'COMFORT';
  food_preference?: 'BASIC' | 'BALANCED' | 'FLEXIBLE';
  activity_preference?: 'LOW' | 'MEDIUM' | 'HIGH';
  pace?: 'RELAXED' | 'BALANCED' | 'PACKED';
  must_visit_activity_ids?: string[];
}
```
