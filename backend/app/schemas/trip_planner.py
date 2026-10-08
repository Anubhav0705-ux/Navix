from enum import Enum
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.algorithms.types import OptimizationProfile, RouteSegmentResult, RouteSummary


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


class BudgetStatus(str, Enum):
    COMFORTABLE = "COMFORTABLE"  # remaining >= 15% of budget
    TIGHT = "TIGHT"              # 0% <= remaining < 15% of budget
    EXCEEDED = "EXCEEDED"        # should never occur in valid plan


class TravelPace(str, Enum):
    RELAXED = "RELAXED"
    BALANCED = "BALANCED"
    PACKED = "PACKED"


class PlannerPreferences(BaseModel):
    selected_activity_ids: Optional[List[str]] = Field(default_factory=list)
    trip_personalities: Optional[List[str]] = Field(default_factory=list)
    pace: TravelPace = TravelPace.BALANCED
    must_include: Optional[List[str]] = Field(default_factory=list)
    avoid: Optional[List[str]] = Field(default_factory=list)
    food_preferences: Optional[List[str]] = Field(default_factory=list)
    departure_preference: Optional[str] = "Morning"
    allow_overnight: Optional[bool] = True


class TripPlanRequest(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: date
    travellers: int = Field(default=1, ge=1)
    maximum_budget: Decimal = Field(gt=Decimal("0.00"))
    profile: OptimizationProfile = OptimizationProfile.BALANCED
    stay_preference: StayPreference = StayPreference.STANDARD
    food_preference: FoodPreference = FoodPreference.BALANCED
    activity_preference: ActivityPreference = ActivityPreference.MEDIUM
    planner_preferences: Optional[PlannerPreferences] = None


class SelectedStay(BaseModel):
    tier: str
    name: str
    cost_per_night: Decimal
    nights: int
    total_cost: Decimal
    description: str


class SelectedFood(BaseModel):
    tier: str
    name: str
    cost_per_day: Decimal
    days: int
    total_cost: Decimal
    description: str


class SelectedActivity(BaseModel):
    id: str
    name: str
    category: str
    cost_per_person: Decimal
    total_cost: Decimal
    description: str


class CostBreakdown(BaseModel):
    maximum_budget: Decimal
    transport_cost: Decimal
    accommodation_cost: Decimal
    food_cost: Decimal
    activities_cost: Decimal
    local_transport_cost: Decimal
    contingency_buffer: Decimal
    total_trip_cost: Decimal
    remaining_budget: Decimal
    budget_status: BudgetStatus


class ItineraryEventType(str, Enum):
    TRANSIT = "TRANSIT"
    TRANSFER = "TRANSFER"
    CHECK_IN = "CHECK_IN"
    ACTIVITY = "ACTIVITY"
    MEAL = "MEAL"
    LOCAL_TRANSFER = "LOCAL_TRANSFER"
    FREE_TIME = "FREE_TIME"
    STAY = "STAY"


class StructuredItineraryEvent(BaseModel):
    event_type: ItineraryEventType
    start_time: str
    end_time: str
    title: str
    description: str
    cost: Decimal
    location: Optional[str] = None
    category: Optional[str] = None
    reason: Optional[str] = None
    travel_minutes_before: Optional[int] = 0


class DailyItineraryItem(BaseModel):
    day_number: int
    date: date
    title: str
    events: List[str]
    structured_events: List[StructuredItineraryEvent] = Field(default_factory=list)
    estimated_daily_spend: Decimal
    day_theme: Optional[str] = None
    total_activity_minutes: Optional[int] = 0
    total_travel_minutes: Optional[int] = 0
    experience_score: Optional[float] = 0.0


class ItineraryIntelligenceMetrics(BaseModel):
    activities_scheduled: int
    total_experience_utility: float
    local_travel_minutes: int
    free_time_hours: float
    budget_utilization_percent: float
    must_visits_included: int
    must_visits_total: int
    pace_label: str


class TripPlanResult(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: date
    travellers: int
    days: int
    nights: int
    profile: OptimizationProfile
    data_source: str = "Demo Transit Dataset"

    route_summary: RouteSummary
    route_segments: List[RouteSegmentResult]

    stay: SelectedStay
    food: SelectedFood
    activities: List[SelectedActivity]
    cost_breakdown: CostBreakdown
    daily_itinerary: List[DailyItineraryItem]
    decision_explanations: List[str]
    itinerary_metrics: Optional[ItineraryIntelligenceMetrics] = None

    model_config = ConfigDict(from_attributes=True)

