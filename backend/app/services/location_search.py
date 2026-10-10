import logging
import re
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text, func

from app.models.geo_administrative import Country, AdminDivision
from app.models.geo_settlement import Settlement, Locality
from app.models.geo_transit import TransitFacility, TransitStop
from app.models.geo_poi import PointOfInterest, Accommodation
from app.models.geo_mapping import LocationAlias, ProviderLocationMapping, GeoProvenance
from app.schemas.location_search import (
    CoordinatesSchema,
    AdminContextSchema,
    LocationSearchResultItem,
    LocationSearchResponse,
    LocationDetailResponse,
    NearbyFacilityItem,
    NearbyLocationResponse,
    SettlementFacilityItem,
    SettlementFacilitiesResponse,
    LocationCoverageResponse,
)

logger = logging.getLogger("navix.location_search")


def normalize_search_query(q: str) -> str:
    """
    Normalizes user input for search matching:
    - Trims leading/trailing whitespace
    - Collapses multiple whitespace characters to single space
    - Converts to lowercase
    """
    if not q:
        return ""
    cleaned = re.sub(r"\s+", " ", q.strip()).lower()
    return cleaned


def resolve_admin_context(db: Session, admin_division_id: str) -> AdminContextSchema:
    """
    Resolves full administrative hierarchy for a given AdminDivision ID.
    Returns structured state, district, and country context.
    """
    admin_div = db.query(AdminDivision).filter_by(division_id=admin_division_id).first()
    if not admin_div:
        return AdminContextSchema(
            country_id="ctry_in",
            country_name="India",
            display_hierarchy="India"
        )

    state_name = None
    state_id = None
    district_name = None
    district_id = None

    if admin_div.division_level in ("STATE", "UT"):
        state_name = admin_div.name
        state_id = admin_div.division_id
    elif admin_div.division_level in ("DISTRICT", "SUB_DISTRICT"):
        district_name = admin_div.name
        district_id = admin_div.division_id
        if admin_div.parent_division_id:
            parent = db.query(AdminDivision).filter_by(division_id=admin_div.parent_division_id).first()
            if parent:
                state_name = parent.name
                state_id = parent.division_id

    hierarchy_parts = []
    if district_name:
        hierarchy_parts.append(f"{district_name} District")
    if state_name:
        hierarchy_parts.append(state_name)
    hierarchy_parts.append("India")

    return AdminContextSchema(
        country_id="ctry_in",
        country_name="India",
        state_id=state_id,
        state_name=state_name,
        district_id=district_id,
        district_name=district_name,
        display_hierarchy=", ".join(hierarchy_parts)
    )


def get_coverage_badge(status: str) -> str:
    """Returns human-readable user-facing coverage badge."""
    upper = (status or "UNCOVERED").upper()
    if upper == "COVERED":
        return "ACTIVE ROUTE COVERAGE"
    elif upper == "PARTIAL":
        return "LOCAL SHUTTLE REQUIRED"
    else:
        return "LOCATION REGISTERED · NO ROUTE YET"


def search_locations(
    db: Session,
    q: str,
    entity_types: Optional[List[str]] = None,
    facility_type: Optional[str] = None,
    limit: int = 10
) -> LocationSearchResponse:
    """
    Production Location Autocomplete & Search Engine for NAVIX.
    Executes deterministic multi-tier ranking:
    1. Provider Code Match (Score 100.0)
    2. Exact Canonical Name (Score 95.0)
    3. Exact Alias Match (Score 90.0)
    4. Prefix Canonical Name (Score 80.0)
    5. Prefix Alias Match (Score 75.0)
    6. Trigram Fuzzy Match (Score 50.0 * similarity)
    
    Plus population tier, facility, and coverage bonuses.
    """
    raw_query = (q or "").strip()
    q_norm = normalize_search_query(raw_query)

    if not q_norm:
        return LocationSearchResponse(query=raw_query, total_matches=0, results=[])

    limit = max(1, min(limit, 25))

    # Candidates dictionary keyed by canonical_id -> LocationSearchResultItem
    candidates: Dict[str, LocationSearchResultItem] = {}

    # Helper to add candidate keeping highest score
    def add_candidate(item: LocationSearchResultItem):
        if item.id not in candidates or item.score > candidates[item.id].score:
            candidates[item.id] = item

    # -------------------------------------------------------------
    # STEP 1: Provider / Station / Airport Code Match (Score: 100.0)
    # -------------------------------------------------------------
    code_mappings = db.execute(
        text("""
            SELECT pm.facility_id, pm.provider_name, pm.provider_entity_id,
                   tf.name AS fac_name, tf.facility_type, tf.settlement_id, tf.operating_status,
                   ST_Y(tf.location::geometry) AS lat, ST_X(tf.location::geometry) AS lon,
                   s.name AS settlement_name, s.coverage_status, s.admin_division_id
            FROM provider_mappings pm
            JOIN transit_facilities tf ON pm.facility_id = tf.facility_id
            JOIN settlements s ON tf.settlement_id = s.settlement_id
            WHERE UPPER(pm.provider_entity_id) = UPPER(:q_raw)
               OR UPPER(pm.provider_entity_id) = UPPER(:q_norm)
        """),
        {"q_raw": raw_query, "q_norm": q_norm}
    ).all()

    for row in code_mappings:
        fac_id = row[0]
        p_name = row[1]
        p_code = row[2]
        fac_name = row[3]
        fac_type = row[4]
        stl_id = row[5]
        lat = float(row[7])
        lon = float(row[8])
        stl_name = row[9]
        cov_status = row[10]
        admin_id = row[11]

        admin_ctx = resolve_admin_context(db, admin_id)
        display_name = f"{fac_name} [{p_name}: {p_code}] ({stl_name})"

        add_candidate(LocationSearchResultItem(
            id=fac_id,
            entity_type="TRANSIT_FACILITY",
            name=fac_name,
            canonical_name=fac_name,
            display_name=display_name,
            matched_on="provider_code",
            matched_name=f"{p_name}:{p_code}",
            score=100.0 + (10.0 if cov_status == "COVERED" else 0.0),
            settlement_id=stl_id,
            settlement_name=stl_name,
            admin_context=admin_ctx,
            facility_type=fac_type,
            codes=[{"provider": p_name, "code": p_code}],
            coordinates=CoordinatesSchema(latitude=lat, longitude=lon),
            coverage_status=cov_status,
            badge=get_coverage_badge(cov_status)
        ))

    # -------------------------------------------------------------
    # STEP 2: Exact Canonical Name Match (Score: 95.0)
    # -------------------------------------------------------------
    # 2a. Settlements
    exact_settlements = db.execute(
        text("""
            SELECT s.settlement_id, s.name, s.settlement_type, s.population_tier, s.coverage_status, s.admin_division_id,
                   ST_Y(s.location::geometry) AS lat, ST_X(s.location::geometry) AS lon
            FROM settlements s
            WHERE LOWER(s.name) = :q_norm
        """),
        {"q_norm": q_norm}
    ).all()

    for row in exact_settlements:
        stl_id, name, stl_type, pop_tier, cov_status, admin_id, lat, lon = row
        admin_ctx = resolve_admin_context(db, admin_id)
        score = 95.0
        if pop_tier == 1:
            score += 15.0
        elif pop_tier == 2:
            score += 10.0
        if cov_status == "COVERED":
            score += 10.0

        add_candidate(LocationSearchResultItem(
            id=stl_id,
            entity_type="SETTLEMENT",
            name=name,
            canonical_name=name,
            display_name=f"{name}, {admin_ctx.display_hierarchy}",
            matched_on="exact_canonical",
            matched_name=name,
            score=score,
            settlement_id=stl_id,
            settlement_name=name,
            admin_context=admin_ctx,
            coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
            coverage_status=cov_status,
            badge=get_coverage_badge(cov_status)
        ))

    # 2b. Transit Facilities
    exact_facilities = db.execute(
        text("""
            SELECT tf.facility_id, tf.name, tf.facility_type, tf.settlement_id,
                   ST_Y(tf.location::geometry) AS lat, ST_X(tf.location::geometry) AS lon,
                   s.name AS settlement_name, s.coverage_status, s.admin_division_id
            FROM transit_facilities tf
            JOIN settlements s ON tf.settlement_id = s.settlement_id
            WHERE LOWER(tf.name) = :q_norm
        """),
        {"q_norm": q_norm}
    ).all()

    for row in exact_facilities:
        fac_id, name, fac_type, stl_id, lat, lon, stl_name, cov_status, admin_id = row
        admin_ctx = resolve_admin_context(db, admin_id)
        add_candidate(LocationSearchResultItem(
            id=fac_id,
            entity_type="TRANSIT_FACILITY",
            name=name,
            canonical_name=name,
            display_name=f"{name} ({stl_name})",
            matched_on="exact_canonical",
            matched_name=name,
            score=95.0 + (10.0 if cov_status == "COVERED" else 0.0),
            settlement_id=stl_id,
            settlement_name=stl_name,
            admin_context=admin_ctx,
            facility_type=fac_type,
            coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
            coverage_status=cov_status,
            badge=get_coverage_badge(cov_status)
        ))

    # -------------------------------------------------------------
    # STEP 3: Exact Alias Match (Score: 90.0)
    # -------------------------------------------------------------
    exact_aliases = db.execute(
        text("""
            SELECT la.entity_type, la.entity_id, la.alias_name, la.alias_type, la.language_code
            FROM location_aliases la
            WHERE LOWER(la.alias_name) = :q_norm
        """),
        {"q_norm": q_norm}
    ).all()

    for e_type, e_id, alias_name, alias_type, lang in exact_aliases:
        if e_type == "SETTLEMENT":
            stl = db.execute(
                text("""
                    SELECT s.settlement_id, s.name, s.population_tier, s.coverage_status, s.admin_division_id,
                           ST_Y(s.location::geometry) AS lat, ST_X(s.location::geometry) AS lon
                    FROM settlements s WHERE s.settlement_id = :id
                """),
                {"id": e_id}
            ).first()
            if stl:
                stl_id, name, pop_tier, cov_status, admin_id, lat, lon = stl
                admin_ctx = resolve_admin_context(db, admin_id)
                score = 90.0 + (10.0 if pop_tier == 1 else 5.0)
                add_candidate(LocationSearchResultItem(
                    id=stl_id,
                    entity_type="SETTLEMENT",
                    name=name,
                    canonical_name=name,
                    display_name=f"{name} ({alias_name}), {admin_ctx.display_hierarchy}",
                    matched_on="exact_alias",
                    matched_name=alias_name,
                    score=score,
                    settlement_id=stl_id,
                    settlement_name=name,
                    admin_context=admin_ctx,
                    coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
                    coverage_status=cov_status,
                    badge=get_coverage_badge(cov_status)
                ))

    # -------------------------------------------------------------
    # STEP 4: Prefix Canonical Name Match (Score: 80.0)
    # -------------------------------------------------------------
    prefix_settlements = db.execute(
        text("""
            SELECT s.settlement_id, s.name, s.settlement_type, s.population_tier, s.coverage_status, s.admin_division_id,
                   ST_Y(s.location::geometry) AS lat, ST_X(s.location::geometry) AS lon
            FROM settlements s
            WHERE LOWER(s.name) LIKE :q_prefix
        """),
        {"q_prefix": f"{q_norm}%"}
    ).all()

    for row in prefix_settlements:
        stl_id, name, stl_type, pop_tier, cov_status, admin_id, lat, lon = row
        admin_ctx = resolve_admin_context(db, admin_id)
        score = 80.0
        if pop_tier == 1:
            score += 10.0
        if cov_status == "COVERED":
            score += 5.0
        add_candidate(LocationSearchResultItem(
            id=stl_id,
            entity_type="SETTLEMENT",
            name=name,
            canonical_name=name,
            display_name=f"{name}, {admin_ctx.display_hierarchy}",
            matched_on="prefix_canonical",
            matched_name=name,
            score=score,
            settlement_id=stl_id,
            settlement_name=name,
            admin_context=admin_ctx,
            coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
            coverage_status=cov_status,
            badge=get_coverage_badge(cov_status)
        ))

    prefix_facilities = db.execute(
        text("""
            SELECT tf.facility_id, tf.name, tf.facility_type, tf.settlement_id,
                   ST_Y(tf.location::geometry) AS lat, ST_X(tf.location::geometry) AS lon,
                   s.name AS settlement_name, s.coverage_status, s.admin_division_id
            FROM transit_facilities tf
            JOIN settlements s ON tf.settlement_id = s.settlement_id
            WHERE LOWER(tf.name) LIKE :q_prefix
        """),
        {"q_prefix": f"{q_norm}%"}
    ).all()

    for row in prefix_facilities:
        fac_id, name, fac_type, stl_id, lat, lon, stl_name, cov_status, admin_id = row
        admin_ctx = resolve_admin_context(db, admin_id)
        add_candidate(LocationSearchResultItem(
            id=fac_id,
            entity_type="TRANSIT_FACILITY",
            name=name,
            canonical_name=name,
            display_name=f"{name} ({stl_name})",
            matched_on="prefix_canonical",
            matched_name=name,
            score=80.0 + (5.0 if cov_status == "COVERED" else 0.0),
            settlement_id=stl_id,
            settlement_name=stl_name,
            admin_context=admin_ctx,
            facility_type=fac_type,
            coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
            coverage_status=cov_status,
            badge=get_coverage_badge(cov_status)
        ))

    # -------------------------------------------------------------
    # STEP 5: Prefix Alias Match (Score: 75.0)
    # -------------------------------------------------------------
    prefix_aliases = db.execute(
        text("""
            SELECT la.entity_type, la.entity_id, la.alias_name
            FROM location_aliases la
            WHERE LOWER(la.alias_name) LIKE :q_prefix
        """),
        {"q_prefix": f"{q_norm}%"}
    ).all()

    for e_type, e_id, alias_name in prefix_aliases:
        if e_type == "SETTLEMENT":
            stl = db.execute(
                text("""
                    SELECT s.settlement_id, s.name, s.population_tier, s.coverage_status, s.admin_division_id,
                           ST_Y(s.location::geometry) AS lat, ST_X(s.location::geometry) AS lon
                    FROM settlements s WHERE s.settlement_id = :id
                """),
                {"id": e_id}
            ).first()
            if stl:
                stl_id, name, pop_tier, cov_status, admin_id, lat, lon = stl
                admin_ctx = resolve_admin_context(db, admin_id)
                add_candidate(LocationSearchResultItem(
                    id=stl_id,
                    entity_type="SETTLEMENT",
                    name=name,
                    canonical_name=name,
                    display_name=f"{name} ({alias_name}), {admin_ctx.display_hierarchy}",
                    matched_on="prefix_alias",
                    matched_name=alias_name,
                    score=75.0 + (5.0 if pop_tier == 1 else 0.0),
                    settlement_id=stl_id,
                    settlement_name=name,
                    admin_context=admin_ctx,
                    coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
                    coverage_status=cov_status,
                    badge=get_coverage_badge(cov_status)
                ))

    # -------------------------------------------------------------
    # STEP 6: Trigram / Fuzzy Match (Score: 50.0 * similarity)
    # -------------------------------------------------------------
    if len(q_norm) >= 3:
        # 6a. Fuzzy Match on Settlement Names
        fuzzy_settlements = db.execute(
            text("""
                SELECT s.settlement_id, s.name, s.settlement_type, s.population_tier, s.coverage_status, s.admin_division_id,
                       ST_Y(s.location::geometry) AS lat, ST_X(s.location::geometry) AS lon,
                       similarity(s.name, :q_raw) AS sim
                FROM settlements s
                WHERE similarity(s.name, :q_raw) >= 0.20
                ORDER BY sim DESC
                LIMIT 10
            """),
            {"q_raw": raw_query}
        ).all()

        for row in fuzzy_settlements:
            stl_id, name, stl_type, pop_tier, cov_status, admin_id, lat, lon, sim = row
            admin_ctx = resolve_admin_context(db, admin_id)
            sim_score = float(sim) * 50.0
            add_candidate(LocationSearchResultItem(
                id=stl_id,
                entity_type="SETTLEMENT",
                name=name,
                canonical_name=name,
                display_name=f"{name}, {admin_ctx.display_hierarchy}",
                matched_on="fuzzy",
                matched_name=name,
                score=sim_score,
                settlement_id=stl_id,
                settlement_name=name,
                admin_context=admin_ctx,
                coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
                coverage_status=cov_status,
                badge=get_coverage_badge(cov_status)
            ))

        # 6b. Fuzzy Match on Location Aliases
        fuzzy_aliases = db.execute(
            text("""
                SELECT la.entity_type, la.entity_id, la.alias_name,
                       similarity(la.alias_name, :q_raw) AS sim
                FROM location_aliases la
                WHERE similarity(la.alias_name, :q_raw) >= 0.20
                ORDER BY sim DESC
                LIMIT 10
            """),
            {"q_raw": raw_query}
        ).all()

        for e_type, e_id, alias_name, sim in fuzzy_aliases:
            sim_score = float(sim) * 50.0
            if e_type == "SETTLEMENT":
                stl = db.execute(
                    text("""
                        SELECT s.settlement_id, s.name, s.population_tier, s.coverage_status, s.admin_division_id,
                               ST_Y(s.location::geometry) AS lat, ST_X(s.location::geometry) AS lon
                        FROM settlements s WHERE s.settlement_id = :id
                    """),
                    {"id": e_id}
                ).first()
                if stl:
                    stl_id, name, pop_tier, cov_status, admin_id, lat, lon = stl
                    admin_ctx = resolve_admin_context(db, admin_id)
                    add_candidate(LocationSearchResultItem(
                        id=stl_id,
                        entity_type="SETTLEMENT",
                        name=name,
                        canonical_name=name,
                        display_name=f"{name} ({alias_name}), {admin_ctx.display_hierarchy}",
                        matched_on="fuzzy",
                        matched_name=alias_name,
                        score=sim_score,
                        settlement_id=stl_id,
                        settlement_name=name,
                        admin_context=admin_ctx,
                        coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
                        coverage_status=cov_status,
                        badge=get_coverage_badge(cov_status)
                    ))

    # Filter by entity_types or facility_type if supplied
    filtered_results = list(candidates.values())
    if entity_types:
        allowed_types = [t.upper() for t in entity_types]
        filtered_results = [r for r in filtered_results if r.entity_type.upper() in allowed_types]

    if facility_type:
        target_f_type = facility_type.upper()
        filtered_results = [r for r in filtered_results if r.facility_type and r.facility_type.upper() == target_f_type]

    # Populate associated provider codes for facilities
    for item in filtered_results:
        if item.entity_type == "TRANSIT_FACILITY" and not item.codes:
            codes = db.execute(
                text("""
                    SELECT provider_name, provider_entity_id
                    FROM provider_mappings
                    WHERE facility_id = :fac_id
                """),
                {"fac_id": item.id}
            ).all()
            item.codes = [{"provider": r[0], "code": r[1]} for r in codes]

    # Sort descending by score, then by canonical_name
    filtered_results.sort(key=lambda x: (-x.score, x.canonical_name))

    final_results = filtered_results[:limit]
    return LocationSearchResponse(
        query=raw_query,
        total_matches=len(filtered_results),
        results=final_results
    )


def get_location_by_id(db: Session, location_id: str) -> Optional[LocationDetailResponse]:
    """
    Canonical Resolution API Service.
    Resolves any NAVIX location ID (stl_*, fac_*, loc_*, poi_*) to complete canonical details.
    Returns None if not found.
    """
    if not location_id:
        return None

    loc_id = location_id.strip()

    # 1. Settlement Lookup
    if loc_id.startswith("stl_"):
        stl = db.execute(
            text("""
                SELECT s.settlement_id, s.name, s.settlement_type, s.population_tier, s.coverage_status, s.admin_division_id,
                       ST_Y(s.location::geometry) AS lat, ST_X(s.location::geometry) AS lon
                FROM settlements s WHERE s.settlement_id = :id
            """),
            {"id": loc_id}
        ).first()

        if stl:
            stl_id, name, stl_type, pop_tier, cov_status, admin_id, lat, lon = stl
            admin_ctx = resolve_admin_context(db, admin_id)

            # Fetch aliases
            aliases = db.execute(
                text("SELECT alias_name, language_code, alias_type FROM location_aliases WHERE entity_type='SETTLEMENT' AND entity_id=:id"),
                {"id": loc_id}
            ).all()
            alias_list = [{"alias_name": a[0], "language_code": a[1], "alias_type": a[2]} for a in aliases]

            return LocationDetailResponse(
                id=stl_id,
                entity_type="SETTLEMENT",
                name=name,
                canonical_name=name,
                coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
                coverage_status=cov_status,
                badge=get_coverage_badge(cov_status),
                admin_context=admin_ctx,
                settlement_id=stl_id,
                settlement_name=name,
                population_tier=pop_tier,
                aliases=alias_list
            )

    # 2. Transit Facility Lookup
    if loc_id.startswith("fac_"):
        fac = db.execute(
            text("""
                SELECT tf.facility_id, tf.name, tf.facility_type, tf.is_multimodal, tf.operating_status, tf.settlement_id,
                       ST_Y(tf.location::geometry) AS lat, ST_X(tf.location::geometry) AS lon,
                       s.name AS settlement_name, s.coverage_status, s.admin_division_id
                FROM transit_facilities tf
                JOIN settlements s ON tf.settlement_id = s.settlement_id
                WHERE tf.facility_id = :id
            """),
            {"id": loc_id}
        ).first()

        if fac:
            fac_id, name, fac_type, is_multi, op_status, stl_id, lat, lon, stl_name, cov_status, admin_id = fac
            admin_ctx = resolve_admin_context(db, admin_id)

            # Fetch provider mappings
            pmaps = db.execute(
                text("SELECT provider_name, provider_entity_id, is_primary FROM provider_mappings WHERE facility_id=:id"),
                {"id": loc_id}
            ).all()
            provider_list = [{"provider_name": p[0], "provider_entity_id": p[1], "is_primary": p[2]} for p in pmaps]

            return LocationDetailResponse(
                id=fac_id,
                entity_type="TRANSIT_FACILITY",
                name=name,
                canonical_name=name,
                coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
                coverage_status=cov_status,
                badge=get_coverage_badge(cov_status),
                admin_context=admin_ctx,
                settlement_id=stl_id,
                settlement_name=stl_name,
                facility_type=fac_type,
                is_multimodal=is_multi,
                operating_status=op_status,
                provider_mappings=provider_list
            )

    # Fallback search by ID across all primary keys
    # 3. Locality Lookup
    loc = db.execute(
        text("""
            SELECT l.locality_id, l.name, l.settlement_id,
                   ST_Y(l.location::geometry) AS lat, ST_X(l.location::geometry) AS lon,
                   s.name AS settlement_name, s.coverage_status, s.admin_division_id
            FROM localities l
            JOIN settlements s ON l.settlement_id = s.settlement_id
            WHERE l.locality_id = :id
        """),
        {"id": loc_id}
    ).first()

    if loc:
        loc_id_res, name, stl_id, lat, lon, stl_name, cov_status, admin_id = loc
        admin_ctx = resolve_admin_context(db, admin_id)
        return LocationDetailResponse(
            id=loc_id_res,
            entity_type="LOCALITY",
            name=name,
            canonical_name=name,
            coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
            coverage_status=cov_status,
            badge=get_coverage_badge(cov_status),
            admin_context=admin_ctx,
            settlement_id=stl_id,
            settlement_name=stl_name
        )

    # 4. Point of Interest Lookup
    poi = db.execute(
        text("""
            SELECT p.poi_id, p.name, p.category, p.settlement_id,
                   ST_Y(p.location::geometry) AS lat, ST_X(p.location::geometry) AS lon,
                   s.name AS settlement_name, s.coverage_status, s.admin_division_id
            FROM points_of_interest p
            JOIN settlements s ON p.settlement_id = s.settlement_id
            WHERE p.poi_id = :id
        """),
        {"id": loc_id}
    ).first()

    if poi:
        poi_id_res, name, cat, stl_id, lat, lon, stl_name, cov_status, admin_id = poi
        admin_ctx = resolve_admin_context(db, admin_id)
        return LocationDetailResponse(
            id=poi_id_res,
            entity_type="POI",
            name=name,
            canonical_name=name,
            coordinates=CoordinatesSchema(latitude=float(lat), longitude=float(lon)),
            coverage_status=cov_status,
            badge=get_coverage_badge(cov_status),
            admin_context=admin_ctx,
            settlement_id=stl_id,
            settlement_name=stl_name
        )

    return None


def search_nearby_locations(
    db: Session,
    lat: float,
    lon: float,
    radius_km: float = 30.0,
    facility_type: Optional[str] = None,
    limit: int = 10
) -> NearbyLocationResponse:
    """
    PostGIS-backed Spatial Proximity Search.
    Queries transit_facilities within radius_km of (lat, lon) using ST_DWithin and orders by ST_Distance.
    """
    if not (-90.0 <= lat <= 90.0):
        raise ValueError(f"Latitude out of bounds [-90, 90]: {lat}")
    if not (-180.0 <= lon <= 180.0):
        raise ValueError(f"Longitude out of bounds [-180, 180]: {lon}")
    if not (0.1 <= radius_km <= 200.0):
        raise ValueError(f"Radius out of bounds [0.1, 200.0] km: {radius_km}")

    limit = max(1, min(limit, 50))
    radius_meters = radius_km * 1000.0

    sql = """
        SELECT tf.facility_id, tf.name, tf.facility_type, tf.is_multimodal, tf.operating_status, tf.settlement_id,
               ST_Y(tf.location::geometry) AS f_lat, ST_X(tf.location::geometry) AS f_lon,
               ST_Distance(tf.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) AS dist_m,
               s.name AS settlement_name
        FROM transit_facilities tf
        JOIN settlements s ON tf.settlement_id = s.settlement_id
        WHERE ST_DWithin(
            tf.location,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
            :radius_m
        )
    """
    params: Dict[str, Any] = {
        "lat": lat,
        "lon": lon,
        "radius_m": radius_meters
    }

    if facility_type and facility_type.upper() != "ALL":
        sql += " AND UPPER(tf.facility_type) = :fac_type"
        params["fac_type"] = facility_type.upper()

    sql += " ORDER BY dist_m ASC LIMIT :limit"
    params["limit"] = limit

    rows = db.execute(text(sql), params).all()

    facility_items: List[NearbyFacilityItem] = []
    for row in rows:
        fac_id, name, f_type, is_multi, op_status, stl_id, f_lat, f_lon, dist_m, stl_name = row
        dist_meters = float(dist_m)
        dist_km = round(dist_meters / 1000.0, 2)

        # Provider codes
        codes = db.execute(
            text("SELECT provider_name, provider_entity_id FROM provider_mappings WHERE facility_id=:id"),
            {"id": fac_id}
        ).all()
        provider_codes = [{"provider": c[0], "code": c[1]} for c in codes]

        facility_items.append(NearbyFacilityItem(
            facility_id=fac_id,
            name=name,
            facility_type=f_type,
            distance_km=dist_km,
            distance_meters=round(dist_meters, 1),
            is_multimodal=is_multi,
            operating_status=op_status,
            coordinates=CoordinatesSchema(latitude=float(f_lat), longitude=float(f_lon)),
            settlement_id=stl_id,
            settlement_name=stl_name,
            provider_codes=provider_codes
        ))

    return NearbyLocationResponse(
        center_coordinates=CoordinatesSchema(latitude=lat, longitude=lon),
        radius_km=radius_km,
        total_facilities=len(facility_items),
        facilities=facility_items
    )


def get_settlement_facilities(
    db: Session,
    settlement_id: str,
    facility_type: Optional[str] = None,
    limit: int = 20
) -> SettlementFacilitiesResponse:
    """
    Retrieves all transit facilities associated with a specific settlement.
    """
    stl = db.query(Settlement).filter_by(settlement_id=settlement_id).first()
    if not stl:
        raise ValueError(f"Settlement not found: '{settlement_id}'")

    limit = max(1, min(limit, 50))
    sql = """
        SELECT tf.facility_id, tf.name, tf.facility_type, tf.is_multimodal, tf.operating_status,
               ST_Y(tf.location::geometry) AS f_lat, ST_X(tf.location::geometry) AS f_lon
        FROM transit_facilities tf
        WHERE tf.settlement_id = :stl_id
    """
    params: Dict[str, Any] = {"stl_id": settlement_id, "limit": limit}

    if facility_type and facility_type.upper() != "ALL":
        sql += " AND UPPER(tf.facility_type) = :fac_type"
        params["fac_type"] = facility_type.upper()

    sql += " ORDER BY tf.name ASC LIMIT :limit"

    rows = db.execute(text(sql), params).all()
    facility_list: List[SettlementFacilityItem] = []

    for row in rows:
        fac_id, name, f_type, is_multi, op_status, f_lat, f_lon = row
        codes = db.execute(
            text("SELECT provider_name, provider_entity_id FROM provider_mappings WHERE facility_id=:id"),
            {"id": fac_id}
        ).all()
        provider_codes = [{"provider": c[0], "code": c[1]} for c in codes]

        facility_list.append(SettlementFacilityItem(
            facility_id=fac_id,
            name=name,
            facility_type=f_type,
            is_multimodal=is_multi,
            operating_status=op_status,
            coordinates=CoordinatesSchema(latitude=float(f_lat), longitude=float(f_lon)),
            provider_codes=provider_codes
        ))

    return SettlementFacilitiesResponse(
        settlement_id=stl.settlement_id,
        settlement_name=stl.name,
        total_facilities=len(facility_list),
        facilities=facility_list
    )


def get_location_coverage(db: Session, location_id: str) -> LocationCoverageResponse:
    """
    Returns explicit coverage details for a given location ID.
    """
    detail = get_location_by_id(db, location_id)
    if not detail:
        raise ValueError(f"Location not found: '{location_id}'")

    cov_status = detail.coverage_status
    badge = detail.badge

    if cov_status == "COVERED":
        details_str = "Verified active multi-modal route coverage. Full trip budget optimization supported."
    elif cov_status == "PARTIAL":
        details_str = "Nearby transit hub verified. Final transfer leg requires local shuttle or taxi buffer."
    else:
        details_str = "Location spatially registered in NAVIX catalog. No verified active transit schedules yet."

    return LocationCoverageResponse(
        location_id=detail.id,
        name=detail.name,
        entity_type=detail.entity_type,
        coverage_status=cov_status,
        badge=badge,
        details=details_str
    )
