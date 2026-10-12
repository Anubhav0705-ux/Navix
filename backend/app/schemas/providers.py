from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ProviderHealthStatus(str, Enum):
    READY = "READY"
    MISSING_CREDENTIALS = "MISSING_CREDENTIALS"
    UNAUTHORIZED = "UNAUTHORIZED"
    RATE_LIMITED = "RATE_LIMITED"
    UNAVAILABLE = "UNAVAILABLE"
    SANDBOX_ONLY = "SANDBOX_ONLY"
    EVALUATION = "EVALUATION"


class ProviderHealth(BaseModel):
    provider: str
    status: ProviderHealthStatus
    environment: str = Field(description="PRODUCTION | TEST | EVALUATION | DEVELOPMENT")
    public_consumer_enabled: bool = Field(description="Whether this provider's data can appear in public consumer results")
    message: str
    details: Optional[Dict[str, Any]] = None
    last_checked_at: Optional[datetime] = None


class ProviderSummaryResponse(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    providers: Dict[str, ProviderHealth]
