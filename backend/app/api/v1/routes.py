from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.algorithms import RoutingRequest, RouteSearchResult, SearchError
from app.services.routing_service import plan_route

routes_router = APIRouter(prefix="/routes", tags=["Route Search"])


@routes_router.post("/search", response_model=RouteSearchResult)
def search_transit_routes(request: RoutingRequest, db: Session = Depends(get_db)):
    """
    Search multi-modal transit routes subject to layover constraints and transport budget cap.
    """
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
