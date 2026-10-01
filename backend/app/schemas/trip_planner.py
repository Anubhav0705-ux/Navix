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


class DailyItineraryItem(BaseModel):
    day_number: int
    date: date
    title: str
    events: List[str]
    estimated_daily_spend: Decimal


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

    model_config = ConfigDict(from_attributes=True)
