import pytest
from datetime import date
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import SessionLocal
from app.services.transport_query import TransportQueryService


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def client(db_session):
    return TestClient(app)


class TestTransportScheduleSearch:
    """Verifies unified search, reverse-direction rejection, calendar evaluation, and synthetic isolation."""

    def test_search_rail_sangli_to_pune(self, client):
        """Sangli -> Pune must find Mahalaxmi Express (17412) with duration 350 min."""
        response = client.get("/api/v1/transport/search", params={
            "origin_facility_id": "fac_sangli_sli",
            "destination_facility_id": "fac_pune_pune",
            "mode": "RAIL",
            "exclude_synthetic": "true"
        })
        assert response.status_code == 200
        data = response.json()

        assert data["origin_facility_id"] == "fac_sangli_sli"
        assert data["destination_facility_id"] == "fac_pune_pune"
        assert data["total_services_found"] >= 1

        service_codes = [s["service_code"] for s in data["services"]]
        assert "17412" in service_codes

        mahalaxmi = next(s for s in data["services"] if s["service_code"] == "17412")
        assert mahalaxmi["departure_time"].startswith("21:40")
        assert mahalaxmi["data_class"] == "REAL_SOURCE_DERIVED"
        assert mahalaxmi["fare_status"] == "NOT_PROVIDED"
        assert mahalaxmi["availability_status"] == "NOT_PROVIDED"
        assert mahalaxmi["license"] == "GODL-India"

    def test_reverse_trip_rejection_sangli_pune(self, client):
        """CRITICAL: Searching Pune -> Sangli MUST NOT return Train 17412 (Mahalaxmi Express)."""
        response = client.get("/api/v1/transport/search", params={
            "origin_facility_id": "fac_pune_pune",
            "destination_facility_id": "fac_sangli_sli",
            "mode": "RAIL",
            "exclude_synthetic": "true"
        })
        assert response.status_code == 200
        data = response.json()

        service_codes = [s["service_code"] for s in data["services"]]
        # 17412 runs Sangli -> Pune, so searching Pune -> Sangli must NEVER return 17412!
        assert "17412" not in service_codes

        # Koyna Express (11029) runs CSMT -> Kolhapur via Pune -> Sangli, so it IS valid
        assert "11029" in service_codes

    def test_search_bus_delhi_to_manali_gtfs(self, client):
        """Delhi ISBT -> Old Manali must be excluded on consumer search (exclude_synthetic=true) and present as synthetic fixture when requested."""
        # 1. Default / consumer search strictly excludes synthetic fixture
        resp_excluded = client.get("/api/v1/transport/search", params={
            "origin_facility_id": "fac_new_delhi_bs_del_isbt",
            "destination_facility_id": "fac_old_manali_bs_mnl",
            "mode": "BUS",
            "exclude_synthetic": "true"
        })
        assert resp_excluded.status_code == 200
        assert resp_excluded.json()["total_services_found"] == 0

        # 2. Explicit inspection with exclude_synthetic=false returns fixture truthfully classified
        response = client.get("/api/v1/transport/search", params={
            "origin_facility_id": "fac_new_delhi_bs_del_isbt",
            "destination_facility_id": "fac_old_manali_bs_mnl",
            "mode": "BUS",
            "exclude_synthetic": "false"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_services_found"] >= 1

        service = data["services"][0]
        assert service["transport_mode"] == "BUS"
        assert service["departure_time"].startswith("17:30")
        assert service["arrival_time"].startswith("08:30")
        assert service["duration_minutes"] == 900
        assert service["day_offset"] >= 0
        assert service["data_class"] == "SYNTHETIC_CONTRACT_FIXTURE"
        assert service["data_state"] == "ESTIMATED"
        assert service["fare_status"] == "NOT_PROVIDED"
        assert service["availability_status"] == "NOT_PROVIDED"
        assert service["license"] == "Delhi-OTD-Terms"

    def test_same_origin_and_destination_rejected(self, client):
        response = client.get("/api/v1/transport/search", params={
            "origin_facility_id": "fac_sangli_sli",
            "destination_facility_id": "fac_sangli_sli"
        })
        assert response.status_code == 400
        assert "identical" in response.json()["detail"].lower()

    def test_synthetic_isolation_in_search(self, client):
        """When exclude_synthetic is True, synthetic fixtures must be omitted."""
        resp_real = client.get("/api/v1/transport/search", params={
            "origin_facility_id": "fac_sangli_sli",
            "destination_facility_id": "fac_pune_pune",
            "exclude_synthetic": "true"
        })
        services_real = resp_real.json()["services"]
        for s in services_real:
            assert s["data_class"] == "REAL_SOURCE_DERIVED"

    def test_facility_arrivals_endpoint(self, client):
        response = client.get("/api/v1/transport/facilities/fac_pune_pune/arrivals")
        assert response.status_code == 200
        arrivals = response.json()
        assert len(arrivals) >= 1
        service_codes = [a["service_code"] for a in arrivals]
        assert "17412" in service_codes

    def test_source_coverage_endpoint(self, client):
        response = client.get("/api/v1/transport/coverage")
        assert response.status_code == 200
        cov = response.json()
        assert cov["total_services"] >= 5
        # Only authentic Indian Railways corridor trains are counted as verified real
        assert cov["verified_services_count"] == 3
        assert cov["synthetic_fixtures_count"] >= 4
        assert cov["resolved_facilities_count"] >= 10


class TestPhase9PurityAndProvenance:
    """Verifies that no generated synthetic fixture is ever claimed as REAL_SOURCE_DERIVED."""

    def test_dtc_synthetic_rows_not_real(self, client):
        """Asserts all DTC services in the platform are strictly SYNTHETIC_CONTRACT_FIXTURE."""
        resp = client.get("/api/v1/transport/services", params={"mode": "BUS"})
        assert resp.status_code == 200
        services = resp.json()
        dtc_services = [s for s in services if s["provider_id"] == "DTC_DELHI"]
        assert len(dtc_services) >= 1
        for s in dtc_services:
            assert s["data_class"] == "SYNTHETIC_CONTRACT_FIXTURE", f"DTC service {s['service_code']} cannot be REAL_SOURCE_DERIVED!"
            assert s["data_state"] == "ESTIMATED"

    def test_manali_route_not_verified_without_source_row(self, client):
        """Manali bus route must NEVER exist in verified real search results."""
        resp = client.get("/api/v1/transport/search", params={
            "origin_facility_id": "fac_new_delhi_bs_del_isbt",
            "destination_facility_id": "fac_old_manali_bs_mnl",
            "exclude_synthetic": "true"
        })
        assert resp.status_code == 200
        assert resp.json()["total_services_found"] == 0

    def test_consumer_search_excludes_synthetic(self, client):
        """Default consumer search without exclude_synthetic parameter must exclude synthetic records."""
        resp = client.get("/api/v1/transport/search", params={
            "origin_facility_id": "fac_sangli_sli",
            "destination_facility_id": "fac_pune_pune"
        })
        assert resp.status_code == 200
        for s in resp.json()["services"]:
            assert s["data_class"] == "REAL_SOURCE_DERIVED"

    def test_dtc_fare_and_availability_provenance(self, client):
        """GTFS fixtures must have null fare amount and NOT_PROVIDED status."""
        resp = client.get("/api/v1/transport/services", params={"mode": "BUS"})
        assert resp.status_code == 200
        dtc_services = [s for s in resp.json() if s["provider_id"] == "DTC_DELHI"]
        for s in dtc_services:
            for f in s["fares"]:
                assert f["amount"] is None
                assert f["fare_status"] == "NOT_PROVIDED"

    def test_gtfs_rt_disabled_without_credentials(self):
        """GTFS-Realtime adapter remains disabled without authorized credentials."""
        from app.transport_ingestion.gtfs_rt.adapter import GtfsRtAdapter
        adapter = GtfsRtAdapter()
        assert not adapter.is_enabled()
        assert adapter.get_status()["status"] == "DISABLED"


class TestTransportAdminRefresh:
    """Verifies secured administration endpoints for source refresh orchestration."""

    def test_unauthenticated_refresh_rejected(self, client):
        response = client.post("/api/v1/transport/admin/refresh/ind_railways_open_timetable")
        assert response.status_code == 401

    def test_invalid_token_refresh_rejected(self, client):
        response = client.post(
            "/api/v1/transport/admin/refresh/ind_railways_open_timetable",
            headers={"X-Navix-Admin-Token": "invalid_wrong_token"}
        )
        assert response.status_code == 401

    def test_authorized_admin_refresh_success(self, client):
        response = client.post(
            "/api/v1/transport/admin/refresh/ind_railways_open_timetable",
            headers={"X-Navix-Admin-Token": "navix_admin_token_wp9_secure"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUCCESS"
        assert data["source_id"] == "ind_railways_open_timetable"
        assert data["records_updated"] >= 1
