from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.trip_planner import TripPlanRequest, TripPlanResult
from app.algorithms import SearchError
from app.services.trip_planner_service import generate_complete_trip_plan

trips_router = APIRouter(prefix="/trips", tags=["Trip Planning"])


@trips_router.post("/plan", response_model=TripPlanResult)
def plan_trip(request: TripPlanRequest, db: Session = Depends(get_db)):
    """
    Complete Whole-Trip Planner Endpoint.
    Combines A* route search, transfer validation, stay & food optimization,
    activity selection, and daily itinerary generation under a strict maximum budget.
    """
    try:
        return generate_complete_trip_plan(db=db, request=request)
    except SearchError as e:
        status_code = status.HTTP_400_BAD_REQUEST
        if e.code == "NO_ROUTE":
            status_code = status.HTTP_404_NOT_FOUND
        elif e.code in ["TRANSPORT_BUDGET_TOO_LOW", "BUDGET_TOO_LOW"]:
            status_code = status.HTTP_422_UNPROCESSABLE_ENTITY

        raise HTTPException(
            status_code=status_code,
            detail={"code": e.code, "message": e.message}
        )
