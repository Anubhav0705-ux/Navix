import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.schemas.analytics import AnalyticsEventCreate, AnalyticsEventResponse
from app.services.analytics_service import analytics_service
from app.core.rate_limiter import enforce_rate_limit

logger = logging.getLogger("navix.analytics_api")

analytics_router = APIRouter(prefix="/analytics", tags=["Privacy-Safe Analytics"])


class ClientErrorReport(BaseModel):
    message: str = Field(..., max_length=500, description="Sanitized client error message")
    route: Optional[str] = Field(None, max_length=255, description="Client route where error occurred")
    component_name: Optional[str] = Field(None, max_length=100, description="React component or error boundary identifier")
    request_id: Optional[str] = Field(None, max_length=64, description="Backend correlation request ID if available")


@analytics_router.post("/events", response_model=AnalyticsEventResponse, status_code=status.HTTP_201_CREATED)
async def collect_analytics_event(
    event_data: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Privacy-Safe First-Party Analytics Ingestion.
    Accepts standardized, non-identifying product events.
    Enforces per-client rate limiting and payload validation.
    """
    # Rate limit by anonymous session ID
    await enforce_rate_limit(request, f"analytics_{event_data.anonymous_session_id[:16]}")

    try:
        event = analytics_service.record_event(db, event_data)
        return AnalyticsEventResponse(status="ok", event_id=event.id)
    except Exception as e:
        logger.error(f"Failed to record analytics event: {e}")
        # Return 200/ok or generic success so client is never broken by non-critical analytics failure
        return AnalyticsEventResponse(status="recorded", event_id="evt_unpersisted")


@analytics_router.post("/errors", response_model=AnalyticsEventResponse, status_code=status.HTTP_201_CREATED)
async def report_client_error(
    report: ClientErrorReport,
    request: Request
):
    """
    Sanitized Frontend Error Reporting.
    Captures runtime exceptions and React boundary failures.
    Does not accept passwords, tokens, form inputs, or PII.
    """
    await enforce_rate_limit(request, "client_errors")

    logger.warning(
        f"[FRONTEND_ERROR] Component: {report.component_name or 'Global'} | "
        f"Route: {report.route or 'Unknown'} | "
        f"RequestID: {report.request_id or 'N/A'} | "
        f"Message: {report.message[:200]}"
    )

    return AnalyticsEventResponse(status="ok", event_id="err_logged")
