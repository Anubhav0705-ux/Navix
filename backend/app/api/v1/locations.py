import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.metrics import metrics
from app.schemas.location_search import (
    LocationSearchResponse,
    LocationDetailResponse,
    NearbyLocationResponse,
    SettlementFacilitiesResponse,
    LocationCoverageResponse,
)
from app.services.location_search import (
    search_locations,
    get_location_by_id,
    search_nearby_locations,
    get_settlement_facilities,
    get_location_coverage,
)

logger = logging.getLogger("navix.api.locations")

locations_router = APIRouter(prefix="/locations", tags=["Location Search & Intelligence"])


@locations_router.get(
    "/search",
    response_model=LocationSearchResponse,
    summary="Search & Autocomplete Locations",
    description="Search settlements, transit facilities, aliases, and station/airport codes with ranked relevance."
)
@locations_router.get(
    "/autocomplete",
    response_model=LocationSearchResponse,
    include_in_schema=False
)
def search_locations_endpoint(
    q: str = Query(..., min_length=1, max_length=100, description="Search query string e.g. Sangli, SLI, NDLS, Poona, Manali"),
    type: Optional[str] = Query(None, description="Optional entity type filter e.g. SETTLEMENT, TRANSIT_FACILITY, POI"),
    facility_type: Optional[str] = Query(None, description="Optional facility type filter e.g. RAIL_STATION, AIRPORT, BUS_TERMINAL"),
    limit: int = Query(10, ge=1, le=25, description="Maximum number of results (Default 10, Max 25)"),
    db: Session = Depends(get_db)
):
    """
    Search & Autocomplete API endpoint.
    Performs multi-stage deterministic query processing, alias matching, code resolution, and trigram fuzzy matching.
    """
    try:
        metrics.record_search_request()
        entity_types = [type] if type else None
        res = search_locations(
            db=db,
            q=q,
            entity_types=entity_types,
            facility_type=facility_type,
            limit=limit
        )

        if res.total_matches == 0:
            metrics.record_search_no_results()

        return res
    except Exception as exc:
        logger.error(f"Error in location search for query '{q}': {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing location search."
        )


@locations_router.get(
    "/nearby",
    response_model=NearbyLocationResponse,
    summary="PostGIS Nearby Facility Search",
    description="Find transit facilities within a specified radius (in km) of GPS coordinates using PostGIS geography ST_DWithin."
)
def search_nearby_endpoint(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude in WGS 84 degrees [-90, 90]"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude in WGS 84 degrees [-180, 180]"),
    radius_km: float = Query(30.0, ge=0.1, le=200.0, description="Search radius in kilometers (Default 30 km, Max 200 km)"),
    facility_type: Optional[str] = Query(None, description="Optional facility type filter e.g. RAIL_STATION, AIRPORT, BUS_TERMINAL"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of facilities returned"),
    db: Session = Depends(get_db)
):
    """
    Nearby Spatial Facility Search API.
    Executes geodesic distance queries using PostGIS ST_DWithin and ST_Distance.
    """
    try:
        metrics.record_nearby_request()
        return search_nearby_locations(
            db=db,
            lat=latitude,
            lon=longitude,
            radius_km=radius_km,
            facility_type=facility_type,
            limit=limit
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.error(f"Error in nearby spatial search: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while querying nearby facilities."
        )


@locations_router.get(
    "/{location_id}/coverage",
    response_model=LocationCoverageResponse,
    summary="Get Location Coverage Status",
    description="Retrieve explicit routing coverage status (COVERED, PARTIAL, UNCOVERED) and badge for a location ID."
)
def get_location_coverage_endpoint(
    location_id: str,
    db: Session = Depends(get_db)
):
    """
    Location Coverage Status API.
    """
    try:
        return get_location_coverage(db=db, location_id=location_id)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.error(f"Error checking coverage for '{location_id}': {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while checking location coverage."
        )


@locations_router.get(
    "/{location_id}",
    response_model=LocationDetailResponse,
    summary="Resolve Canonical Location Details",
    description="Resolves any NAVIX location ID (stl_*, fac_*, loc_*, poi_*) to complete canonical details and administrative hierarchy."
)
def get_location_detail_endpoint(
    location_id: str,
    db: Session = Depends(get_db)
):
    """
    Canonical Location Resolution API.
    Returns 404 for unknown location IDs.
    """
    try:
        metrics.record_resolution_request()
        detail = get_location_by_id(db=db, location_id=location_id)
        if not detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Location not found with ID: '{location_id}'"
            )
        return detail
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error resolving location ID '{location_id}': {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resolving location details."
        )


@locations_router.get(
    "/{settlement_id}/facilities",
    response_model=SettlementFacilitiesResponse,
    summary="Get Facilities for a Settlement",
    description="Retrieve all transit facilities (railway stations, ISBT bus terminals, airports) belonging to a settlement."
)
def get_settlement_facilities_endpoint(
    settlement_id: str,
    facility_type: Optional[str] = Query(None, description="Optional facility type filter"),
    limit: int = Query(20, ge=1, le=50, description="Maximum facilities to return"),
    db: Session = Depends(get_db)
):
    """
    Settlement Facilities Lookup API.
    """
    try:
        return get_settlement_facilities(
            db=db,
            settlement_id=settlement_id,
            facility_type=facility_type,
            limit=limit
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.error(f"Error fetching facilities for settlement '{settlement_id}': {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching settlement facilities."
        )
