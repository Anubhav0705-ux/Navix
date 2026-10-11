from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.transport_query import TransportQueryService
from app.schemas.transport import (
    TransportProviderResponse, TransportServiceDetailResponse,
    FacilityDepartureResponse, SourceStatusResponse
)

router = APIRouter(prefix="/transport", tags=["Transport Data Platform"])


@router.get("/providers", response_model=List[TransportProviderResponse], summary="List ingested transport providers")
def list_transport_providers(
    mode: Optional[str] = Query(None, description="Filter by mode: RAIL, BUS, FLIGHT"),
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.list_providers(mode=mode)


@router.get("/services", response_model=List[TransportServiceDetailResponse], summary="List transport services")
def list_transport_services(
    mode: Optional[str] = Query(None, description="Filter by mode: RAIL, BUS, FLIGHT"),
    origin_facility_id: Optional[str] = Query(None, description="Origin facility ID"),
    destination_facility_id: Optional[str] = Query(None, description="Destination facility ID"),
    limit: int = Query(20, ge=1, le=100, description="Result limit"),
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.list_services(
        mode=mode,
        origin_facility_id=origin_facility_id,
        destination_facility_id=destination_facility_id,
        limit=limit
    )


@router.get("/services/{service_id}", response_model=TransportServiceDetailResponse, summary="Get transport service detail by ID")
def get_transport_service_detail(
    service_id: str,
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    result = service.get_service_detail(service_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transport service with ID '{service_id}' not found."
        )
    return result


@router.get("/facilities/{facility_id}/departures", response_model=List[FacilityDepartureResponse], summary="Get departures from a facility")
def get_facility_departures(
    facility_id: str,
    limit: int = Query(20, ge=1, le=100, description="Result limit"),
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.get_facility_departures(facility_id=facility_id, limit=limit)


@router.get("/source-status", response_model=List[SourceStatusResponse], summary="Get data source registry and ingestion status")
def get_transport_source_status(
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.get_source_statuses()
