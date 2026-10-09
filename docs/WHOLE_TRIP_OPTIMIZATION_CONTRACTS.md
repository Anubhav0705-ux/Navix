# NAVIX — Whole-Trip Optimization API & Data Contracts Specification (V2)

> **Document Type**: Technical API Schema & Contract Specification  
> **Status**: Official Technical Design Specification (Phase 6B.3B — Targeted Corrections Pass)  
> **Scope**: Typed Optimization Requests, Expense Ledgers, Price Evidence Attributions & Additive DB Persistence Models  
> **Safety Notice**: Design Specification Only — Zero Application Code or PostgreSQL Mutations Executed.

---

## 1. Overview & Additive Compatibility Design Obligations

This contract specification defines the Pydantic v2 / TypeScript schemas exchanged across the whole-trip optimization pipeline.

### Architectural Compatibility Obligations
1. **API Endpoint Compatibility**: Extends `/api/v1/trips/plan` in an **additive, backward-compatible manner**. Existing request fields (`origin`, `destination`, `maximum_budget`, `travellers`, `stay_preference`, `food_preference`, `activity_preference`) remain untouched.
2. **Frontend Adapter Layer**: An explicit adapter projects Phase 6B.3B multi-day structured itineraries into legacy `DailyItineraryItem` structures consumed by `PlannerContext.tsx` and Leaflet map renderers.
3. **Database Ledger Mapping**: Maps whole-trip cost breakdowns to existing PostgreSQL `trips` and `budget_allocations` tables while storing granular 4-state price evidence and party composition in additive JSONB columns.
4. **Verification Disclaimer**: Compatibility claims in this document represent **proposed additive design guarantees**. Runtime software compatibility must be empirically verified via test suites in Phase 6B.4.

---

## 2. Demographic & Expense Request Models

```python
from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Dict
from enum import Enum

class TravelPace(str, Enum):
    RELAXED = "RELAXED"
    BALANCED = "BALANCED"
    PACKED = "PACKED"

class StayPreference(str, Enum):
    BUDGET = "BUDGET"
    STANDARD = "STANDARD"
    COMFORT = "COMFORT"

class FoodPreference(str, Enum):
    BASIC = "BASIC"
    BALANCED = "BALANCED"
    FLEXIBLE = "FLEXIBLE"

class ActivityPreference(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class PartyComposition(BaseModel):
    adults: int = Field(default=1, ge=1, description="Adult travelers (12-59 yrs)")
    children: int = Field(default=0, ge=0, description="Child travelers (3-11 yrs)")
    infants: int = Field(default=0, ge=0, description="Infant travelers (0-2 yrs)")
    seniors: int = Field(default=0, ge=0, description="Senior travelers (60+ yrs)")
    required_rooms: int = Field(default=1, ge=1, description="Calculated hotel room count")

class WholeTripPlanRequest(BaseModel):
    origin: str = Field(description="Origin city or hub name")
    destination: str = Field(description="Destination city or hub name")
    departure_date: date = Field(description="Trip departure date")
    return_date: date = Field(description="Trip return date")
    maximum_budget: Decimal = Field(gt=Decimal("0.00"), description="Hard total budget cap")
    currency: str = Field(default="INR", description="ISO-4217 currency code")
    party: PartyComposition = Field(default_factory=PartyComposition)
    travellers: int = Field(default=1, ge=1, description="Legacy traveler count for V1 API compatibility")
    
    profile: Optional[str] = Field(default="BALANCED")
    stay_preference: StayPreference = Field(default=StayPreference.STANDARD)
    food_preference: FoodPreference = Field(default=FoodPreference.BALANCED)
    activity_preference: ActivityPreference = Field(default=ActivityPreference.MEDIUM)
    pace: TravelPace = Field(default=TravelPace.BALANCED)
    must_visit_activity_ids: List[str] = Field(default_factory=list)
```

---

## 3. Price Evidence States vs. Budget Feasibility Status

```python
class PriceEvidenceState(str, Enum):
    QUOTED_PAYABLE = "QUOTED_PAYABLE"
    BOUNDED_ESTIMATE = "BOUNDED_ESTIMATE"
    UNCERTAIN_PRICE = "UNCERTAIN_PRICE"
    MISSING_DATA = "MISSING_DATA"

class BudgetStatus(str, Enum):
    COMFORTABLE = "COMFORTABLE"  # Remaining budget >= 15%
    TIGHT = "TIGHT"              # Remaining budget < 15%
    EXCEEDED = "EXCEEDED"        # Over budget (Infeasible)

class CategoryLedgerItem(BaseModel):
    ledger_entry_id: str = Field(description="Unique UUID for expense entry")
    category_name: str
    amount: Decimal = Field(ge=Decimal("0.00"))
    currency: str = "INR"
    price_evidence_state: PriceEvidenceState
    description: str
    is_mandatory: bool = True
    is_missing: bool = False

class WholeTripCostBreakdown(BaseModel):
    maximum_budget: Decimal
    currency: str = "INR"
    intercity_transit_cost: Decimal
    local_transport_cost: Decimal
    accommodation_cost: Decimal
    food_cost: Decimal
    activities_cost: Decimal
    mandatory_fees_cost: Decimal
    contingency_buffer: Decimal
    total_trip_cost: Decimal
    remaining_budget: Decimal
    
    # Orthogonal Status Separations
    budget_status: BudgetStatus
    overall_price_evidence: PriceEvidenceState
    is_guaranteed_payable: bool = False
    cost_range_min: Decimal
    cost_range_max: Decimal
    
    ledger_items: List[CategoryLedgerItem] = Field(default_factory=list)
```

---

## 4. Structured Itinerary Event & Response Schemas

```python
class ItineraryEventType(str, Enum):
    TRANSIT = "TRANSIT"
    CHECK_IN = "CHECK_IN"
    STAY = "STAY"
    MEAL = "MEAL"
    ACTIVITY = "ACTIVITY"
    LOCAL_TRANSFER = "LOCAL_TRANSFER"
    FREE_TIME = "FREE_TIME"

class StructuredItineraryEvent(BaseModel):
    event_id: str
    event_type: ItineraryEventType
    start_time: str   # "HH:MM"
    end_time: str     # "HH:MM"
    title: str
    description: str
    cost: Decimal = Field(default=Decimal("0.00"))
    currency: str = "INR"
    location: str
    price_evidence_state: PriceEvidenceState = PriceEvidenceState.QUOTED_PAYABLE
    reason: Optional[str] = None

class OptimizationOutcome(str, Enum):
    CONVERGED_OPTIMAL = "CONVERGED_OPTIMAL"
    FEASIBLE_SUBOPTIMAL = "FEASIBLE_SUBOPTIMAL"
    NON_CONVERGED_INFEASIBLE = "NON_CONVERGED_INFEASIBLE"

class WholeTripPlanResponse(BaseModel):
    plan_id: str
    origin: str
    destination: str
    departure_date: date
    return_date: date
    days_count: int
    nights_count: int
    party: PartyComposition
    
    optimization_outcome: OptimizationOutcome
    cost_breakdown: WholeTripCostBreakdown
    route_candidate: Dict[str, Any]
    structured_itinerary: List[Dict[str, Any]]
    
    decision_explanations: List[str]
    warning_notices: List[str] = Field(default_factory=list)
    execution_time_ms: float
```

---

## 5. Database Schema & Persistence Compatibility Layer

To persist Phase 6B.3B whole-trip plans in PostgreSQL without altering core existing table columns:

- **`trips` table extension**:
  Fields stored inside existing JSONB column `preferences_json` or additive nullable columns:
  - `party_composition_json`: JSON representation of `PartyComposition`.
  - `affordability_summary_json`: JSON representation of `WholeTripCostBreakdown`.
- **`budget_allocations` table extension**:
  Extends existing category columns (`transport_cost`, `accommodation_cost`, `food_cost`, `activities_cost`) with additive JSONB column `ledger_details_json` storing 4-state price evidence attributions.
