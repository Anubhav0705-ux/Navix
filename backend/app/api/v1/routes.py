from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict

from app.database.session import get_db
from app.algorithms import RoutingRequest, RouteSearchResult, SearchError
from app.algorithms.types import RouteSegmentResult, RouteSummary, OptimizationProfile
from app.services.routing_service import plan_route, get_route_alternatives
from app.core.metrics import metrics

routes_router = APIRouter(prefix="/routes", tags=["Route Search"])


class RouteAlternative(BaseModel):
    id: str
    label: str  # RECOMMENDED | CHEAPEST | FASTEST | COMFORT | LOWEST TRANSFERS
    profile: OptimizationProfile
    summary: RouteSummary
    segments: List[RouteSegmentResult]
    modes: List[str]
    operators: List[str]
    departure_time: datetime
    arrival_time: datetime
    transfers: int
    total_cost: Decimal
    duration_minutes: int

    model_config = ConfigDict(from_attributes=True)


class RouteAlternativesResponse(BaseModel):
    origin: str
    destination: str
    alternatives: List[RouteAlternative]


@routes_router.post("/search", response_model=RouteSearchResult)
def search_transit_routes(request: RoutingRequest, db: Session = Depends(get_db)):
    """
    Search multi-modal transit routes subject to layover constraints and transport budget cap.
    """
    metrics.record_route_search()
    try:
        return plan_route(db=db, request=request)
    except SearchError as e:
        status_code = status.HTTP_400_BAD_REQUEST
        if e.code == "NO_ROUTE":
            status_code = status.HTTP_404_NOT_FOUND
        elif e.code == "TRANSPORT_BUDGET_TOO_LOW":
            status_code = status.HTTP_422_UNPROCESSABLE_ENTITY

        raise HTTPException(
            status_code=status_code,
            detail={"code": e.code, "message": e.message}
        )


@routes_router.post("/alternatives", response_model=RouteAlternativesResponse)
def get_transit_route_alternatives(request: RoutingRequest, db: Session = Depends(get_db)):
    """
    Returns 3 to 5 ranked multi-modal transport alternatives (RECOMMENDED, CHEAPEST, FASTEST, COMFORT).
    """
    metrics.record_route_search()
    try:
        results = get_route_alternatives(db=db, request=request)
        return RouteAlternativesResponse(
            origin=request.origin,
            destination=request.destination,
            alternatives=[RouteAlternative(**item) for item in results]
        )
    except SearchError as e:
        status_code = status.HTTP_404_NOT_FOUND if e.code == "NO_ROUTE" else status.HTTP_400_BAD_REQUEST
        raise HTTPException(
            status_code=status_code,
            detail={"code": e.code, "message": e.message}
        )
