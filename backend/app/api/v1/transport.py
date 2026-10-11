import os
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.config import settings
from app.services.transport_query import TransportQueryService
from app.schemas.transport import (
    TransportProviderResponse, TransportServiceDetailResponse,
    FacilityDepartureResponse, FacilityArrivalResponse,
    SourceStatusResponse, TransportSearchResult, SourceCoverageResponse,
    AdminRefreshResponse
)
from app.transport_ingestion.manifest import TransportSourceManifest, TransportSourceSpec

router = APIRouter(prefix="/transport", tags=["Transport Data Platform"])


@router.get("/providers", response_model=List[TransportProviderResponse], summary="List ingested transport providers")
def list_transport_providers(
    mode: Optional[str] = Query(None, description="Filter by mode: RAIL, BUS, FLIGHT, METRO"),
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.list_providers(mode=mode)


@router.get("/services", response_model=List[TransportServiceDetailResponse], summary="List transport services")
def list_transport_services(
    mode: Optional[str] = Query(None, description="Filter by mode: RAIL, BUS, FLIGHT, METRO"),
    origin_facility_id: Optional[str] = Query(None, description="Origin facility ID"),
    destination_facility_id: Optional[str] = Query(None, description="Destination facility ID"),
    exclude_synthetic: bool = Query(False, description="Exclude synthetic contract fixtures"),
    limit: int = Query(20, ge=1, le=100, description="Result limit"),
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.list_services(
        mode=mode,
        origin_facility_id=origin_facility_id,
        destination_facility_id=destination_facility_id,
        exclude_synthetic=exclude_synthetic,
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


@router.get("/search", response_model=TransportSearchResult, summary="Multi-Modal Schedule Search between Canonical Facilities")
def search_transport_schedules(
    origin_facility_id: str = Query(..., description="Canonical origin facility ID (e.g. fac_sangli_sli)"),
    destination_facility_id: str = Query(..., description="Canonical destination facility ID (e.g. fac_pune_pune)"),
    date: Optional[str] = Query(None, description="Travel date in YYYY-MM-DD format"),
    mode: Optional[str] = Query(None, description="Optional transport mode filter: RAIL, BUS, FLIGHT, METRO"),
    provider_id: Optional[str] = Query(None, description="Optional provider ID filter"),
    exclude_synthetic: bool = Query(True, description="Strictly exclude synthetic contract fixtures from consumer results"),
    limit: int = Query(20, ge=1, le=100, description="Page limit"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db)
):
    if origin_facility_id == destination_facility_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Origin facility and destination facility cannot be identical."
        )

    service = TransportQueryService(db)
    return service.search_schedules(
        origin_facility_id=origin_facility_id,
        destination_facility_id=destination_facility_id,
        travel_date_str=date,
        mode=mode,
        provider_id=provider_id,
        exclude_synthetic=exclude_synthetic,
        limit=limit,
        offset=offset
    )


@router.get("/facilities/{facility_id}/departures", response_model=List[FacilityDepartureResponse], summary="Get departures from a facility")
def get_facility_departures(
    facility_id: str,
    limit: int = Query(20, ge=1, le=100, description="Result limit"),
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.get_facility_departures(facility_id=facility_id, limit=limit)


@router.get("/facilities/{facility_id}/arrivals", response_model=List[FacilityArrivalResponse], summary="Get arrivals at a facility")
def get_facility_arrivals(
    facility_id: str,
    limit: int = Query(20, ge=1, le=100, description="Result limit"),
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.get_facility_arrivals(facility_id=facility_id, limit=limit)


@router.get("/sources", response_model=List[TransportSourceSpec], summary="List registered transport data sources")
def list_registered_transport_sources():
    manifest = TransportSourceManifest()
    return list(manifest.sources.values())


@router.get("/source-status", response_model=List[SourceStatusResponse], summary="Get data source registry and ingestion status")
def get_transport_source_status(
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.get_source_statuses()


@router.get("/coverage", response_model=SourceCoverageResponse, summary="Get comprehensive transport data coverage and metrics")
def get_transport_data_coverage(
    db: Session = Depends(get_db)
):
    service = TransportQueryService(db)
    return service.get_source_coverage()


@router.post("/admin/refresh/{source_id}", response_model=AdminRefreshResponse, summary="Secure Administrative Source Refresh")
def admin_refresh_transport_source(
    source_id: str,
    x_navix_admin_token: Optional[str] = Header(None, alias="X-Navix-Admin-Token"),
    db: Session = Depends(get_db)
):
    expected_token = os.getenv("ADMIN_REFRESH_TOKEN", "navix_admin_token_wp9_secure")
    if not x_navix_admin_token or x_navix_admin_token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: valid administrative authentication token required."
        )

    service = TransportQueryService(db)
    return service.admin_refresh_source(source_id=source_id)
