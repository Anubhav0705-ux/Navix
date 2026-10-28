from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator


ALLOWED_EVENT_TYPES = {
    "PAGE_VIEW",
    "EXPLORE_SEARCH",
    "DESTINATION_VIEW",
    "PLANNER_STARTED",
    "PLANNER_COMPLETED",
    "TRIP_SAVED",
    "TRIP_DELETED",
    "STORY_VIEW"
}

FORBIDDEN_METADATA_KEYS = {
    "password", "token", "jwt", "secret", "authorization",
    "cookie", "email", "phone", "name", "credit_card"
}


class AnalyticsEventCreate(BaseModel):
    event_type: str = Field(..., description="Allowed event category")
    route: Optional[str] = Field(None, max_length=255, description="Client page route")
    anonymous_session_id: str = Field(..., min_length=8, max_length=64, description="Anonymous client session identifier")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Safe event metadata")

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        upper_val = v.strip().upper()
        if upper_val not in ALLOWED_EVENT_TYPES:
            raise ValueError(f"Invalid event_type '{v}'. Allowed types are: {', '.join(sorted(ALLOWED_EVENT_TYPES))}")
        return upper_val

    @field_validator("metadata")
    @classmethod
    def validate_metadata(cls, v: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not v:
            return {}
        if len(v) > 10:
            raise ValueError("Metadata exceeds maximum allowed key count (10).")

        sanitized = {}
        for key, val in v.items():
            k_lower = key.strip().lower()
            if any(f in k_lower for f in FORBIDDEN_METADATA_KEYS):
                continue
            if isinstance(val, (str, int, float, bool)):
                sanitized[key] = val if not isinstance(val, str) else val[:100]
        return sanitized


class AnalyticsEventResponse(BaseModel):
    status: str = "ok"
    event_id: str


class PopularDestinationMetric(BaseModel):
    destination: str
    views: int


class DailyTrendMetric(BaseModel):
    date: str
    count: int


class AdminAnalyticsSummary(BaseModel):
    total_events: int
    total_page_views: int
    total_planner_starts: int
    total_completed_plans: int
    planner_completion_rate: float
    total_saved_trips: int
    total_story_views: int
    total_destination_views: int
    popular_destinations: List[PopularDestinationMetric]
    daily_activity_trend: List[DailyTrendMetric]
    has_data: bool
