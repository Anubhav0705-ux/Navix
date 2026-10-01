import json
import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.user import User
from app.models.traveler import Traveler
from app.models.trip import Trip
from app.models.transit_segment import TransitSegment
from app.models.budget_allocation import BudgetAllocation
from app.schemas.trip_planner import TripPlanResult
from app.core.security import get_current_user

saved_trips_router = APIRouter(prefix="/trips/saved", tags=["Saved Trips"])


class SaveTripRequest(BaseModel):
    plan: TripPlanResult


class SavedTripSummary(BaseModel):
    trip_id: str
    origin: str
    destination: str
    travel_date: str
    budget_cap: float
    total_cost: float
    remaining_budget: float
    budget_status: str
    created_at: str
    plan: TripPlanResult


@saved_trips_router.post("", response_model=Dict[str, Any])
def save_generated_trip(
    request: SaveTripRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a generated trip plan to user profile."""
    # Ensure traveler record exists
    traveler = db.query(Traveler).filter(Traveler.traveler_id == current_user.user_id).first()
    if not traveler:
        traveler = Traveler(traveler_id=current_user.user_id)
        db.add(traveler)
        db.commit()

    plan = request.plan
    trip_id = f"trp_{uuid.uuid4().hex[:8]}"

    # Parse dates
    try:
        t_date = datetime.strptime(plan.departure_date, "%Y-%m-%d").date()
    except Exception:
        t_date = date.today()

    # Save Trip model
    new_trip = Trip(
        trip_id=trip_id,
        traveler_id=current_user.user_id,
        origin=plan.origin,
        destination=plan.destination,
        travel_date=t_date,
        budget_cap=Decimal(str(plan.cost_breakdown.maximum_budget)),
        plan_data=plan.model_dump_json()
    )
    db.add(new_trip)

    # Save Budget Allocation model
    budget_alloc = BudgetAllocation(
        allocation_id=f"alc_{uuid.uuid4().hex[:8]}",
        trip_id=trip_id,
        transport_spend=Decimal(str(plan.cost_breakdown.transport_cost)),
        accommodation_spend=Decimal(str(plan.cost_breakdown.accommodation_cost)),
        food_spend=Decimal(str(plan.cost_breakdown.food_cost)),
        activity_spend=Decimal(str(plan.cost_breakdown.activities_cost)),
        local_transit_spend=Decimal(str(plan.cost_breakdown.local_transport_cost)),
        buffer_amount=Decimal(str(plan.cost_breakdown.contingency_buffer)),
        status=plan.cost_breakdown.budget_status
    )
    db.add(budget_alloc)

    db.commit()

    return {
        "status": "success",
        "trip_id": trip_id,
        "message": "Trip successfully saved to your profile."
    }


@saved_trips_router.get("", response_model=List[SavedTripSummary])
def get_user_saved_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all saved trips for currently authenticated traveler."""
    trips = db.query(Trip).filter(Trip.traveler_id == current_user.user_id).all()
    results = []

    for t in trips:
        if t.plan_data:
            try:
                plan_obj = TripPlanResult.model_validate_json(t.plan_data)
                results.append(SavedTripSummary(
                    trip_id=t.trip_id,
                    origin=t.origin,
                    destination=t.destination,
                    travel_date=str(t.travel_date),
                    budget_cap=float(t.budget_cap),
                    total_cost=plan_obj.cost_breakdown.total_trip_cost,
                    remaining_budget=plan_obj.cost_breakdown.remaining_budget,
                    budget_status=plan_obj.cost_breakdown.budget_status,
                    created_at=str(t.travel_date),
                    plan=plan_obj
                ))
            except Exception:
                continue

    return results


@saved_trips_router.delete("/{trip_id}", response_model=Dict[str, Any])
def delete_saved_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a saved trip for the current user."""
    trip = db.query(Trip).filter(Trip.trip_id == trip_id, Trip.traveler_id == current_user.user_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "TRIP_NOT_FOUND", "message": "Saved trip not found."}
        )

    # Delete related allocations & segments
    if trip.budget_allocation:
        db.delete(trip.budget_allocation)
    for seg in trip.segments:
        db.delete(seg)

    db.delete(trip)
    db.commit()

    return {
        "status": "success",
        "message": f"Trip {trip_id} deleted."
    }
