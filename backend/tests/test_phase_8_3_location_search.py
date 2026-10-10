import os
import pytest
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import get_db
from app.models.geo_administrative import Country, AdminDivision
from app.models.geo_settlement import Settlement, Locality
from app.models.geo_transit import TransitFacility, TransitStop
from app.models.geo_poi import PointOfInterest, Accommodation
from app.models.geo_mapping import LocationAlias, ProviderLocationMapping, GeoProvenance, LegacyGeoMapping
from app.geo_ingestion.runner import run_national_ingestion
from app.services.location_search import (
    search_locations,
    get_location_by_id,
    search_nearby_locations,
    get_settlement_facilities,
    get_location_coverage,
    normalize_search_query,
)


def resolve_test_db_url() -> str:
    """Dynamically resolves test database URL."""
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "15437")
    user = os.getenv("DB_USER", "postgres")
    pwd = os.getenv("DB_PASSWORD", "postgres")
    return f"postgresql://{user}:{pwd}@{host}:{port}/NavixTest"


@pytest.fixture(scope="module")
def setup_search_db():
    """
    Module-level fixture populating NavixTest with WP-8.2 real-data seed.
    Uses the existing shared NavixTest database bootstrapped by conftest.py.
    """
    db_url = resolve_test_db_url()

    # Safety check: target must be an explicitly designated test database
    db_name = db_url.rsplit("/", 1)[1].lower()
    if not ("test" in db_name or db_name == "navixtest"):
        raise ValueError(f"Refusing to run search tests against non-test database: {db_url}")

    engine = create_engine(db_url, echo=False)

    # Ensure PostGIS and pg_trgm extensions are enabled
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))

    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    # Unconditionally run national ingestion idempotently
    run_national_ingestion(session=session, dry_run=False)
    session.commit()

    yield session

    session.close()
    engine.dispose()


def test_normalize_search_query():
    assert normalize_search_query("  Sangli  ") == "sangli"
    assert normalize_search_query("New   Delhi") == "new delhi"
    assert normalize_search_query("SLI") == "sli"
    assert normalize_search_query("") == ""


def test_exact_settlement_lookup(setup_search_db):
    session = setup_search_db
    res = search_locations(session, "Sangli")
    assert res.total_matches >= 1
    top = res.results[0]
    assert top.id == "stl_sangli"
    assert top.canonical_name == "Sangli"
    assert top.matched_on in ("exact_canonical", "exact_alias")
    assert top.coverage_status in ("COVERED", "PARTIAL", "UNCOVERED")
    assert top.admin_context is not None
    assert "Sangli" in top.admin_context.display_hierarchy


def test_exact_facility_lookup(setup_search_db):
    session = setup_search_db
    res = search_locations(session, "Sangli Railway Station")
    assert res.total_matches >= 1
    top = res.results[0]
    assert top.entity_type == "TRANSIT_FACILITY"
    assert "Sangli" in top.canonical_name


def test_railway_station_code_lookup(setup_search_db):
    session = setup_search_db
    res_sli = search_locations(session, "SLI")
    assert res_sli.total_matches >= 1
    assert res_sli.results[0].id == "fac_sangli_sli"
    assert res_sli.results[0].matched_on == "provider_code"

    res_mrj = search_locations(session, "MRJ")
    assert res_mrj.total_matches >= 1
    assert res_mrj.results[0].id == "fac_miraj_mrj"

    res_ndls = search_locations(session, "NDLS")
    assert res_ndls.total_matches >= 1
    assert res_ndls.results[0].id == "fac_new_delhi_ndls"


def test_airport_code_lookup(setup_search_db):
    session = setup_search_db
    res_del = search_locations(session, "DEL")
    assert res_del.total_matches >= 1
    top = res_del.results[0]
    assert top.id == "fac_new_delhi_del"
    assert top.facility_type == "AIRPORT"
    assert top.matched_on == "provider_code"

    res_bom = search_locations(session, "BOM")
    assert res_bom.total_matches >= 1
    assert res_bom.results[0].id == "fac_mumbai_bom"


def test_prefix_autocomplete(setup_search_db):
    session = setup_search_db
    res_san = search_locations(session, "san")
    assert res_san.total_matches >= 1
    matched_ids = [r.id for r in res_san.results]
    assert "stl_sangli" in matched_ids

    res_del = search_locations(session, "New Del")
    assert res_del.total_matches >= 1
    assert any("Delhi" in r.canonical_name for r in res_del.results)


def test_alias_resolution(setup_search_db):
    session = setup_search_db
    # Historical alias Bombay -> Mumbai
    res_bom = search_locations(session, "Bombay")
    assert res_bom.total_matches >= 1
    top = res_bom.results[0]
    assert top.id == "stl_mumbai"
    assert top.canonical_name == "Mumbai"


def test_multilingual_alias_resolution(setup_search_db):
    session = setup_search_db
    # Devanagari alias सांगली -> Sangli
    res_dev = search_locations(session, "सांगली")
    assert res_dev.total_matches >= 1
    assert res_dev.results[0].id == "stl_sangli"

    # Devanagari alias पुणे -> Pune
    res_pune = search_locations(session, "पुणे")
    assert res_pune.total_matches >= 1
    assert res_pune.results[0].id == "stl_pune"


def test_fuzzy_matching_and_outranking(setup_search_db):
    session = setup_search_db
    # Typo: Sanglee -> Sangli
    res_typo = search_locations(session, "Sanglee")
    assert res_typo.total_matches >= 1
    assert res_typo.results[0].id == "stl_sangli"

    # Verify exact match outranks fuzzy match score
    exact_res = search_locations(session, "Sangli")
    fuzzy_res = search_locations(session, "Sanglee")
    assert exact_res.results[0].score > fuzzy_res.results[0].score


def test_duplicate_suppression(setup_search_db):
    session = setup_search_db
    res = search_locations(session, "Sangli")
    ids = [r.id for r in res.results]
    assert len(ids) == len(set(ids)), "Duplicate location IDs returned in search results!"


def test_canonical_id_lookup(setup_search_db):
    session = setup_search_db
    # Settlement lookup
    stl_detail = get_location_by_id(session, "stl_sangli")
    assert stl_detail is not None
    assert stl_detail.name == "Sangli"
    assert stl_detail.entity_type == "SETTLEMENT"
    assert stl_detail.admin_context is not None

    # Facility lookup
    fac_detail = get_location_by_id(session, "fac_sangli_sli")
    assert fac_detail is not None
    assert fac_detail.name == "Sangli Railway Station"
    assert fac_detail.facility_type == "RAIL_STATION"
    assert len(fac_detail.provider_mappings) >= 1

    # Unknown ID lookup
    unknown = get_location_by_id(session, "stl_non_existent_id")
    assert unknown is None


def test_nearby_spatial_search(setup_search_db):
    session = setup_search_db
    # Search nearby facilities around Sangli coordinates (16.8524, 74.5815) within 30 km
    nearby = search_nearby_locations(session, lat=16.8524, lon=74.5815, radius_km=30.0)
    assert nearby.total_facilities >= 2
    fac_ids = [f.facility_id for f in nearby.facilities]
    assert "fac_sangli_sli" in fac_ids
    assert "fac_miraj_mrj" in fac_ids

    # Distance ordering check: facilities are sorted in ascending distance order
    assert nearby.facilities[0].distance_km <= nearby.facilities[-1].distance_km


def test_nearby_coordinate_validation(setup_search_db):
    session = setup_search_db
    with pytest.raises(ValueError, match="Latitude out of bounds"):
        search_nearby_locations(session, lat=100.0, lon=74.5815)

    with pytest.raises(ValueError, match="Longitude out of bounds"):
        search_nearby_locations(session, lat=16.8524, lon=-200.0)

    with pytest.raises(ValueError, match="Radius out of bounds"):
        search_nearby_locations(session, lat=16.8524, lon=74.5815, radius_km=500.0)


def test_settlement_facilities_lookup(setup_search_db):
    session = setup_search_db
    facs = get_settlement_facilities(session, "stl_sangli")
    assert facs.total_facilities >= 1
    assert facs.settlement_name == "Sangli"
    assert any(f.facility_id == "fac_sangli_sli" for f in facs.facilities)


def test_location_coverage(setup_search_db):
    session = setup_search_db
    cov = get_location_coverage(session, "stl_sangli")
    assert cov.location_id == "stl_sangli"
    assert cov.coverage_status in ("COVERED", "PARTIAL", "UNCOVERED")
    assert cov.badge is not None


def test_sql_injection_safety(setup_search_db):
    session = setup_search_db
    injection_query = "Sangli'; DROP TABLE settlements;--"
    res = search_locations(session, injection_query)
    # Database remains completely intact
    count = session.query(Settlement).count()
    assert count > 0


def test_fastapi_endpoints_integration(setup_search_db):
    session = setup_search_db

    def override_get_db():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    try:
        # 1. Autocomplete Search Endpoint
        res1 = client.get("/api/v1/locations/search?q=Sangli")
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["total_matches"] >= 1
        assert data1["results"][0]["id"] == "stl_sangli"

        # 2. Station Code Search Endpoint
        res2 = client.get("/api/v1/locations/search?q=SLI")
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["results"][0]["id"] == "fac_sangli_sli"

        # 3. Canonical Location Detail Endpoint
        res3 = client.get("/api/v1/locations/stl_sangli")
        assert res3.status_code == 200
        data3 = res3.json()
        assert data3["name"] == "Sangli"

        # 4. 404 Unknown Location Detail
        res4 = client.get("/api/v1/locations/stl_invalid_999")
        assert res4.status_code == 404

        # 5. Nearby Search Endpoint
        res5 = client.get("/api/v1/locations/nearby?latitude=16.8524&longitude=74.5815&radius_km=30")
        assert res5.status_code == 200
        data5 = res5.json()
        assert data5["total_facilities"] >= 2

        # 6. Settlement Facilities Endpoint
        res6 = client.get("/api/v1/locations/stl_sangli/facilities")
        assert res6.status_code == 200
        data6 = res6.json()
        assert data6["total_facilities"] >= 1

        # 7. Coverage Endpoint
        res7 = client.get("/api/v1/locations/stl_sangli/coverage")
        assert res7.status_code == 200
        data7 = res7.json()
        assert data7["coverage_status"] in ("COVERED", "PARTIAL", "UNCOVERED")

    finally:
        app.dependency_overrides.clear()
