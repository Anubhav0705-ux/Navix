import pytest
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import SessionLocal
from app.models.transport_platform import (
    TransportProvider, TransportService, TransportServiceCalendar,
    TransportCallingPoint, TransportFare, TransportAvailability,
    TransportProvenance, TransportIngestionRun
)
from app.transport_ingestion.manifest import TransportSourceManifest
from app.transport_ingestion.contracts import (
    NormalizedService, NormalizedCallingPoint, NormalizedFare
)
from app.transport_ingestion.validator import TransportValidator
from app.transport_ingestion.resolver import LocationResolver
from app.transport_ingestion.loader import TransportLoader
from app.transport_ingestion.runner import TransportIngestionRunner
from app.transport_ingestion.adapters.rail_adapter import RailProviderAdapter
from app.transport_ingestion.adapters.bus_adapter import BusProviderAdapter
from app.transport_ingestion.adapters.flight_adapter import FlightProviderAdapter
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


class TestPhase91TransportPlatform:

    def test_source_manifest_parsing(self):
        """Verifies parsing of transport source manifest registry with rigorous licensing."""
        manifest = TransportSourceManifest()
        approved = manifest.list_approved_sources()
        # Exactly one approved real open data source under GODL-India
        assert len(approved) == 1
        assert len(manifest.sources) >= 5

        rail_src = manifest.get_source("ind_railways_open_timetable")
        assert rail_src is not None
        assert rail_src.transport_mode == "RAIL"
        assert rail_src.license == "GODL-India"
        assert rail_src.ingestion_status == "APPROVED"
        assert rail_src.approval_status == "APPROVED"
        assert rail_src.fare_available is False
        assert rail_src.data_state == "STATIC"
        assert rail_src.data_class == "REAL_SOURCE_DERIVED"
        assert rail_src.redistribution_allowed is True
        assert len(rail_src.fields_available) >= 5

        # Unverified sources are downgraded
        msrtc_src = manifest.get_source("msrtc_intercity_schedules")
        assert msrtc_src.ingestion_status == "REQUIRES_LICENSE_REVIEW"
        assert msrtc_src.data_class == "SYNTHETIC_CONTRACT_FIXTURE"

        dgca_src = manifest.get_source("dgca_domestic_flight_schedules")
        assert dgca_src.ingestion_status == "REQUIRES_LICENSE_REVIEW"
        assert dgca_src.data_class == "SYNTHETIC_CONTRACT_FIXTURE"

        # Private proprietary endpoints are rejected
        irctc_src = manifest.get_source("irctc_private_booking_api")
        assert irctc_src.ingestion_status == "REJECTED"

        redbus_src = manifest.get_source("redbus_private_api")
        assert redbus_src.ingestion_status == "REJECTED"

    def test_canonical_geography_integrity(self, db_session: Session):
        """Verifies Phase 8 canonical facilities are exclusively used and synthetic IDs are strictly blocked."""
        resolver = LocationResolver(db_session)

        # 1. Indian Railways canonical stations
        res_sli = resolver.resolve_stop("INDIAN_RAILWAYS", "SLI", "Sangli Railway Station", mode="RAIL")
        assert res_sli.facility_id == "fac_sangli_sli"
        assert res_sli.facility_id != "fac_sli_rail"

        res_mrj = resolver.resolve_stop("INDIAN_RAILWAYS", "MRJ", "Miraj Junction", mode="RAIL")
        assert res_mrj.facility_id == "fac_miraj_mrj"
        assert res_mrj.facility_id != "fac_mrj_rail"

        res_ndls = resolver.resolve_stop("INDIAN_RAILWAYS", "NDLS", "New Delhi Railway Station", mode="RAIL")
        assert res_ndls.facility_id == "fac_new_delhi_ndls"

        res_pune = resolver.resolve_stop("INDIAN_RAILWAYS", "PUNE", "Pune Junction", mode="RAIL")
        assert res_pune.facility_id == "fac_pune_pune"
        assert res_pune.facility_type == "RAIL_STATION"
        assert res_pune.facility_id != "fac_pune_pnq"

        # 2. IATA canonical airports
        res_pnq = resolver.resolve_stop("IATA", "PNQ", "Pune Airport", mode="FLIGHT")
        assert res_pnq.facility_id == "fac_pune_pnq"
        assert res_pnq.facility_type == "AIRPORT"
        assert res_pnq.facility_id != "fac_pune_pune"

        res_del = resolver.resolve_stop("IATA", "DEL", "Indira Gandhi International Airport", mode="FLIGHT")
        assert res_del.facility_id == "fac_new_delhi_del"
        assert res_del.facility_type == "AIRPORT"

        res_bom = resolver.resolve_stop("IATA", "BOM", "Chhatrapati Shivaji Maharaj International Airport", mode="FLIGHT")
        assert res_bom.facility_id == "fac_mumbai_bom"
        assert res_bom.facility_type == "AIRPORT"

        res_blr = resolver.resolve_stop("IATA", "BLR", "Kempegowda International Airport", mode="FLIGHT")
        assert res_blr.facility_id == "fac_bengaluru_blr"

        # 3. Cross-Mode Collision Prevention Assertions
        assert res_pune.facility_id != res_pnq.facility_id, "PUNE rail must never collide with PNQ airport!"
        res_csmt = resolver.resolve_stop("INDIAN_RAILWAYS", "CSTM", "Chhatrapati Shivaji Maharaj Terminus", mode="RAIL")
        assert res_csmt.facility_id != res_bom.facility_id, "CSMT rail must never collide with BOM airport!"
        assert res_ndls.facility_id != res_del.facility_id, "NDLS rail must never collide with DEL airport!"

        # 4. Mode Mismatch Enforcement
        mismatch_rail = resolver.resolve_stop("INDIAN_RAILWAYS", "PNQ", "Pune Airport", mode="RAIL")
        assert mismatch_rail.facility_id is None
        assert mismatch_rail.error_code == "FACILITY_MODE_MISMATCH"

        mismatch_flight = resolver.resolve_stop("IATA", "PUNE", "Pune Junction", mode="FLIGHT")
        assert mismatch_flight.facility_id is None
        assert mismatch_flight.error_code == "FACILITY_MODE_MISMATCH"

        # 5. Regression assertion: Resolver refuses synthetic facility IDs
        res_fake = resolver.resolve_stop("INDIAN_RAILWAYS", "FAC_SLI_RAIL", "Fake Sangli")
        assert res_fake.facility_id != "fac_sli_rail"

        # 4. Regression assertion: TransportValidator forbids fac_sli_rail and fac_mrj_rail
        validator = TransportValidator()
        forbidden_sli_srv = NormalizedService(
            service_code="T9_REGRESS_01",
            service_name="Forbidden SLI Train",
            provider_id="prv_test",
            provider_name="Test Provider",
            code_system="TEST",
            transport_mode="RAIL",
            calling_points=[
                NormalizedCallingPoint(stop_name="Bad SLI", facility_id="fac_sli_rail", stop_sequence=1, arrival_time="10:00", departure_time="10:05", day_offset=0),
                NormalizedCallingPoint(stop_name="Good PUNE", facility_id="fac_pune_pune", stop_sequence=2, arrival_time="12:00", departure_time="12:05", day_offset=0)
            ]
        )
        assert validator.validate_service(forbidden_sli_srv) is False

        forbidden_mrj_srv = NormalizedService(
            service_code="T9_REGRESS_02",
            service_name="Forbidden MRJ Train",
            provider_id="prv_test",
            provider_name="Test Provider",
            code_system="TEST",
            transport_mode="RAIL",
            calling_points=[
                NormalizedCallingPoint(stop_name="Bad MRJ", facility_id="fac_mrj_rail", stop_sequence=1, arrival_time="10:00", departure_time="10:05", day_offset=0),
                NormalizedCallingPoint(stop_name="Good PUNE", facility_id="fac_pune_pune", stop_sequence=2, arrival_time="12:00", departure_time="12:05", day_offset=0)
            ]
        )
        assert validator.validate_service(forbidden_mrj_srv) is False

    def test_validator_rules_and_edge_cases(self):
        """Verifies TransportValidator rejects malformed records safely."""
        validator = TransportValidator()

        # Valid service with nullable fare
        valid_srv = NormalizedService(
            service_code="T9_VAL_01",
            service_name="Valid Test Train",
            provider_id="prv_test",
            provider_name="Test Provider",
            code_system="TEST",
            transport_mode="RAIL",
            calling_points=[
                NormalizedCallingPoint(stop_name="Stop A", stop_sequence=1, arrival_time="10:00", departure_time="10:05", day_offset=0),
                NormalizedCallingPoint(stop_name="Stop B", stop_sequence=2, arrival_time="12:00", departure_time="12:05", day_offset=0)
            ],
            fares=[NormalizedFare(fare_class="SL", fare_status="NOT_PROVIDED", amount=None)]
        )
        assert validator.validate_service(valid_srv) is True

        # Invalid stop sequence (non-increasing)
        invalid_seq_srv = NormalizedService(
            service_code="T9_VAL_02",
            service_name="Invalid Seq Train",
            provider_id="prv_test",
            provider_name="Test Provider",
            code_system="TEST",
            transport_mode="RAIL",
            calling_points=[
                NormalizedCallingPoint(stop_name="Stop A", stop_sequence=2, arrival_time="10:00", departure_time="10:05", day_offset=0),
                NormalizedCallingPoint(stop_name="Stop B", stop_sequence=1, arrival_time="12:00", departure_time="12:05", day_offset=0)
            ]
        )
        assert validator.validate_service(invalid_seq_srv) is False

        # Negative fare rejected
        neg_fare_srv = NormalizedService(
            service_code="T9_VAL_03",
            service_name="Negative Fare Train",
            provider_id="prv_test",
            provider_name="Test Provider",
            code_system="TEST",
            transport_mode="RAIL",
            calling_points=[
                NormalizedCallingPoint(stop_name="Stop A", stop_sequence=1, arrival_time="10:00", departure_time="10:05", day_offset=0),
                NormalizedCallingPoint(stop_name="Stop B", stop_sequence=2, arrival_time="12:00", departure_time="12:05", day_offset=0)
            ],
            fares=[NormalizedFare(fare_class="SL", amount=-50.0)]
        )
        assert validator.validate_service(neg_fare_srv) is False

        # Malformed time format rejected
        bad_time_srv = NormalizedService(
            service_code="T9_VAL_04",
            service_name="Bad Time Train",
            provider_id="prv_test",
            provider_name="Test Provider",
            code_system="TEST",
            transport_mode="RAIL",
            calling_points=[
                NormalizedCallingPoint(stop_name="Stop A", stop_sequence=1, arrival_time="25:99", departure_time="10:05", day_offset=0),
                NormalizedCallingPoint(stop_name="Stop B", stop_sequence=2, arrival_time="12:00", departure_time="12:05", day_offset=0)
            ]
        )
        assert validator.validate_service(bad_time_srv) is False

        # Negative day offset rejected
        neg_day_srv = NormalizedService(
            service_code="T9_VAL_05",
            service_name="Neg Day Train",
            provider_id="prv_test",
            provider_name="Test Provider",
            code_system="TEST",
            transport_mode="RAIL",
            calling_points=[
                NormalizedCallingPoint(stop_name="Stop A", stop_sequence=1, arrival_time="10:00", departure_time="10:05", day_offset=-1),
                NormalizedCallingPoint(stop_name="Stop B", stop_sequence=2, arrival_time="12:00", departure_time="12:05", day_offset=0)
            ]
        )
        assert validator.validate_service(neg_day_srv) is False

    def test_rail_adapter_ingestion_and_fare_provenance(self, db_session: Session):
        """Verifies end-to-end rail schedule ingestion with truthful fare status (amount=null, fare_status=NOT_PROVIDED)."""
        adapter = RailProviderAdapter()
        raw = adapter.fetch()
        parsed = adapter.parse(raw)
        validated = adapter.validate(parsed)
        assert len(validated) >= 3

        manifest = TransportSourceManifest()
        src = manifest.get_source("ind_railways_open_timetable")
        loader = TransportLoader(db_session)
        run = loader.load_services(src, validated)

        assert run.status == "SUCCESS"
        assert run.records_inserted > 0 or run.records_updated > 0

        # Query ingested service
        query_service = TransportQueryService(db_session)
        services = query_service.list_services(mode="RAIL")
        assert len(services) >= 3
        koyna = next((s for s in services if s.service_code == "11029"), None)
        assert koyna is not None
        assert len(koyna.calling_points) >= 5
        assert koyna.license == "GODL-India"
        assert koyna.data_state == "STATIC"
        assert koyna.data_class == "REAL_SOURCE_DERIVED"

        # Audit rail fare provenance: No fabricated or estimated fares marked as real
        for f in koyna.fares:
            assert f.amount is None, f"Rail fare amount must be null (found {f.amount})"
            assert f.fare_status == "NOT_PROVIDED", f"Rail fare status must be NOT_PROVIDED (found {f.fare_status})"
            assert f.is_estimated is False

        # Verify calling points use canonical facility IDs
        sli_cp = next((cp for cp in koyna.calling_points if cp.provider_stop_code == "SLI"), None)
        assert sli_cp is not None
        assert sli_cp.facility_id == "fac_sangli_sli"

        mrj_cp = next((cp for cp in koyna.calling_points if cp.provider_stop_code == "MRJ"), None)
        assert mrj_cp is not None
        assert mrj_cp.facility_id == "fac_miraj_mrj"

    def test_idempotent_reingestion(self, db_session: Session):
        """Verifies repeated ingestion of the same source updates without duplicating records."""
        adapter = RailProviderAdapter()
        raw = adapter.fetch()
        parsed = adapter.parse(raw)
        validated = adapter.validate(parsed)

        manifest = TransportSourceManifest()
        src = manifest.get_source("ind_railways_open_timetable")
        loader = TransportLoader(db_session)

        # Run 1
        run1 = loader.load_services(src, validated)
        assert run1.status == "SUCCESS"

        # Run 2
        run2 = loader.load_services(src, validated)
        assert run2.status == "SUCCESS"
        assert run2.records_inserted == 0
        assert run2.records_updated == len(validated)

    def test_overnight_multi_day_journey(self, db_session: Session):
        """Verifies overnight and multi-day train schedule calling points with day_offset."""
        query_service = TransportQueryService(db_session)
        services = query_service.list_services(mode="RAIL")
        goa_exp = next((s for s in services if s.service_code == "12779"), None)
        assert goa_exp is not None

        cps = goa_exp.calling_points
        assert cps[-1].day_offset == 2  # Arrives Day +2 in Chandigarh
        assert cps[0].facility_id == "fac_miraj_mrj"
        assert cps[-2].facility_id == "fac_new_delhi_ndls"
        assert cps[-1].facility_id == "fac_chandigarh_cdg"

    def test_bus_and_flight_adapters_as_contract_fixtures(self, db_session: Session):
        """Verifies MSRTC bus and domestic flight ingestion as SYNTHETIC_CONTRACT_FIXTURE."""
        bus_adapter = BusProviderAdapter()
        bus_services = bus_adapter.validate(bus_adapter.parse(bus_adapter.fetch()))
        assert len(bus_services) >= 2

        flight_adapter = FlightProviderAdapter()
        flight_services = flight_adapter.validate(flight_adapter.parse(flight_adapter.fetch()))
        assert len(flight_services) >= 2

        manifest = TransportSourceManifest()
        loader = TransportLoader(db_session)

        run_bus = loader.load_services(manifest.get_source("msrtc_intercity_schedules"), bus_services)
        assert run_bus.status == "SUCCESS"

        run_flight = loader.load_services(manifest.get_source("dgca_domestic_flight_schedules"), flight_services)
        assert run_flight.status == "SUCCESS"

        # Verify data class isolation
        query_service = TransportQueryService(db_session)
        bus_res = query_service.list_services(mode="BUS")
        assert len(bus_res) >= 2
        for b in bus_res:
            assert b.data_class == "SYNTHETIC_CONTRACT_FIXTURE"

        flight_res = query_service.list_services(mode="FLIGHT")
        assert len(flight_res) >= 2
        for fl in flight_res:
            assert fl.data_class == "SYNTHETIC_CONTRACT_FIXTURE"

    def test_query_service_departures(self, db_session: Session):
        """Verifies facility departures query service."""
        query_service = TransportQueryService(db_session)
        deps = query_service.get_facility_departures(facility_id="fac_sangli_sli")
        assert isinstance(deps, list)

    def test_api_endpoints_integration(self, client):
        """Verifies REST endpoints /api/v1/transport/."""
        # 1. Providers
        resp = client.get("/api/v1/transport/providers")
        assert resp.status_code == 200
        providers = resp.json()
        assert len(providers) >= 1

        # 2. Services
        resp_serv = client.get("/api/v1/transport/services")
        assert resp_serv.status_code == 200
        services = resp_serv.json()
        assert len(services) >= 1

        # Check fields of first service
        s0 = services[0]
        assert "data_class" in s0
        assert "data_state" in s0
        assert s0["data_class"] in ("REAL_SOURCE_DERIVED", "SYNTHETIC_CONTRACT_FIXTURE", "LEGACY_DEMO")

        # 3. Source Status
        resp_src = client.get("/api/v1/transport/source-status")
        assert resp_src.status_code == 200
        sources = resp_src.json()
        assert len(sources) >= 3

        # 4. 404 Not Found
        resp_404 = client.get("/api/v1/transport/services/non_existent_srv_999")
        assert resp_404.status_code == 404

    def test_cross_mode_facility_audit_and_bus_codes(self, db_session: Session):
        """Audits all cross-mode codes and ensures no cross-mode pollution."""
        resolver = LocationResolver(db_session)

        # Bus codes resolve to bus terminals
        res_sli_bus = resolver.resolve_stop("RED_BUS", "BS_SLI", "Sangli Central Bus Stand", mode="BUS")
        assert res_sli_bus.facility_id == "fac_sangli_bs_sli"
        assert res_sli_bus.facility_type == "BUS_TERMINAL"

        res_pune_bus = resolver.resolve_stop("RED_BUS", "BS_PUNE_SW", "Swargate Central Bus Stand Pune", mode="BUS")
        assert res_pune_bus.facility_id == "fac_pune_bs_pune_sw"
        assert res_pune_bus.facility_type == "BUS_TERMINAL"

        res_del_bus = resolver.resolve_stop("RED_BUS", "BS_DEL_ISBT", "Maharana Pratap ISBT Kashmere Gate Delhi", mode="BUS")
        assert res_del_bus.facility_id == "fac_new_delhi_bs_del_isbt"
        assert res_del_bus.facility_type == "BUS_TERMINAL"

        res_mnl_bus = resolver.resolve_stop("RED_BUS", "BS_MNL", "Old Manali Bus Stand Hub", mode="BUS")
        assert res_mnl_bus.facility_id == "fac_old_manali_bs_mnl"
        assert res_mnl_bus.facility_type == "BUS_TERMINAL"

        # Bus mode rejecting airport or railway station
        bus_mismatch_air = resolver.resolve_stop("RED_BUS", "PNQ", "Pune Airport", mode="BUS")
        assert bus_mismatch_air.facility_id is None
        assert bus_mismatch_air.error_code == "FACILITY_MODE_MISMATCH"

        bus_mismatch_rail = resolver.resolve_stop("RED_BUS", "fac_pune_pune", "Pune Junction Railway Station", mode="BUS")
        assert bus_mismatch_rail.facility_id is None
        assert bus_mismatch_rail.error_code == "FACILITY_MODE_MISMATCH"

    def test_rail_source_provenance_and_cryptographic_integrity(self):
        """Verifies verified rail snapshot matches metadata and contains no fabricated fares."""
        import os
        import json
        import hashlib

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        verified_path = os.path.join(base_dir, "data", "transport", "indian_railways_timetable_verified.json")
        metadata_path = os.path.join(base_dir, "data", "transport", "indian_railways_timetable_metadata.json")

        assert os.path.exists(verified_path), "Verified rail fixture must exist"
        assert os.path.exists(metadata_path), "Metadata file must exist"

        with open(verified_path, "rb") as f:
            content = f.read()
        calculated_sha = hashlib.sha256(content).hexdigest()

        with open(metadata_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

        assert meta["sha256"] == calculated_sha, "Cryptographic SHA-256 digest mismatch!"
        assert meta["license"] == "GODL-India"
        assert meta["publisher"] == "Ministry of Railways, Government of India"
        assert meta["data_state"] == "STATIC"
        assert meta["data_class"] == "REAL_SOURCE_DERIVED"

        # Verify records content: 100% truthful, zero fabricated fares
        records = json.loads(content.decode("utf-8"))
        assert len(records) == 3
        for srv in records:
            assert srv["data_class"] == "REAL_SOURCE_DERIVED"
            assert srv["data_state"] == "STATIC"
            for fare in srv.get("fares", []):
                assert fare["amount"] is None, "Real timetable must NOT contain fabricated fare amount"
                assert fare["fare_status"] == "NOT_PROVIDED"
                assert fare["is_estimated"] is False

