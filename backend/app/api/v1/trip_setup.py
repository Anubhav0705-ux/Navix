import uuid
import json
import logging
from typing import Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.metrics import metrics
from app.core.redis import redis_manager
from app.schemas.trip_setup import TripSetupRequest, TripSetupDraftResponse

logger = logging.getLogger("navix.trip_setup")

trip_setup_router = APIRouter(prefix="/trips/setup", tags=["Trip Setup"])


@trip_setup_router.post("", response_model=TripSetupDraftResponse, status_code=status.HTTP_201_CREATED)
def create_trip_setup_draft(
    request: TripSetupRequest,
    db: Session = Depends(get_db)
):
    """
    Step 1: Trip Setup Validation & Draft Creation.
    Validates canonical external place references, date bounds, travellers count,
    and budget cap according to NAVIX real-data travel planning rules.
    """
    duration_days = (request.return_date - request.departure_date).days + 1
    duration_nights = max(0, duration_days - 1)
    draft_id = f"trip_setup_{uuid.uuid4().hex[:12]}"

    draft_response = TripSetupDraftResponse(
        trip_id=draft_id,
        origin=request.origin,
        destination=request.destination,
        departure_date=request.departure_date,
        return_date=request.return_date,
        duration_days=duration_days,
        duration_nights=duration_nights,
        travellers=request.travellers,
        maximum_budget=request.maximum_budget,
        currency=request.currency,
        travel_style=request.travel_style,
        status="DRAFT",
        next_step="TRANSPORTATION",
        message="Trip setup validated successfully. Ready for multimodal transportation planning.",
        created_at=datetime.utcnow()
    )

    # Cache draft in Redis for wizard state continuity
    redis_client = redis_manager.get_sync_client()
    if redis_client is not None:
        try:
            cache_key = f"navix:draft:{draft_id}"
            payload = draft_response.model_dump_json()
            redis_client.set(cache_key, payload, ex=86400)  # 24 hours
        except Exception as e:
            logger.warning(f"Failed to cache trip setup draft '{draft_id}': {e}")

    return draft_response


@trip_setup_router.get("/{draft_id}", response_model=TripSetupDraftResponse)
def get_trip_setup_draft(draft_id: str):
    """
    Retrieves an active Trip Setup draft by ID.
    """
    redis_client = redis_manager.get_sync_client()
    if redis_client is not None:
        try:
            cache_key = f"navix:draft:{draft_id}"
            raw = redis_client.get(cache_key)
            if raw:
                data = json.loads(raw)
                return TripSetupDraftResponse(**data)
        except Exception as e:
            logger.warning(f"Failed to read trip draft '{draft_id}' from Redis: {e}")

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"error": "DRAFT_NOT_FOUND", "message": f"Trip setup draft '{draft_id}' not found or expired."}
    )
