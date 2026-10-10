import os
import pytest
from decimal import Decimal
from sqlalchemy import create_engine, text, select
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command

from app.geo_ingestion.manifest import load_source_manifest
from app.geo_ingestion.normalizer import normalize_name, normalize_code, normalize_pincode, slugify_id
from app.geo_ingestion.validator import validate_coordinates, validate_entity_hierarchy
from app.geo_ingestion.identity import (
    generate_country_id,
    generate_admin_div_id,
    generate_settlement_id,
    generate_facility_id,
    generate_provider_mapping_id,
    generate_provenance_id
)
from app.geo_ingestion.parsers.admin_parser import parse_country_record, parse_admin_divisions
from app.geo_ingestion.parsers.settlement_parser import parse_settlements, parse_localities
from app.geo_ingestion.parsers.facility_parser import parse_transit_facilities
from app.geo_ingestion.parsers.alias_parser import parse_location_aliases
from app.geo_ingestion.runner import run_national_ingestion
from app.models.geo_administrative import Country, AdminDivision
from app.models.geo_settlement import Settlement, Locality
from app.models.geo_transit import TransitFacility
from app.models.geo_mapping import LocationAlias, ProviderLocationMapping, GeoProvenance, LegacyGeoMapping


def test_source_manifest_audit():
    """Verify source manifest loads cleanly and contains approved datasets and blocked sources."""
    manifest = load_source_manifest()
    assert manifest.version == "1.0.0"
    assert len(manifest.datasets) >= 5
    assert len(manifest.blocked_sources) >= 3

    dataset_ids = [d.dataset_id for d in manifest.datasets]
    assert "src_in_lgd_admin" in dataset_ids
    assert "src_in_settlements" in dataset_ids
    assert "src_in_railway_stations" in dataset_ids
    assert "src_in_airports" in dataset_ids
    assert "src_in_bus_terminals" in dataset_ids

    # Confirm blocked sources audit
    blocked_names = [b["source_name"] for b in manifest.blocked_sources]
    assert any("IRCTC" in name for name in blocked_names)
    assert any("redBus" in name for name in blocked_names)
    assert any("Google Maps" in name for name in blocked_names)


def test_normalizer_unit_rules():
    """Verify text, code, and slug normalization rules."""
    assert normalize_name("  Sangli   City  ") == "Sangli City"
    assert normalize_name("Old ‘Manali’") == "Old 'Manali'"
    assert normalize_code(" sli ") == "SLI"
    assert normalize_code("del-123!") == "DEL-123"
    assert normalize_pincode(" 416416 ") == "416416"
    assert normalize_pincode("invalid") is None
    assert slugify_id("Sangli Junction") == "sangli_junction"


def test_validator_unit_rules():
    """Verify lat/lon bounds validation and quarantine flagging."""
    # Valid Sangli coordinates
    v_valid = validate_coordinates(16.8524, 74.5815)
    assert v_valid.is_valid is True
    assert len(v_valid.quarantine_reasons) == 0

    # Null Island
    v_null = validate_coordinates(0.0, 0.0)
    assert v_null.is_valid is False
    assert "NULL_ISLAND_COORDINATE" in v_null.quarantine_reasons

    # Out of India bounds
    v_oob = validate_coordinates(51.5074, -0.1278)  # London
    assert v_oob.is_valid is False
    assert any("OUTSIDE_INDIA_BOUNDING_BOX" in r for r in v_oob.quarantine_reasons)


def test_stable_identity_generation():
    """Verify deterministic stable NAVIX entity ID formatting."""
    assert generate_country_id("IN") == "ctry_in"
    assert generate_admin_div_id("MH") == "div_in_mh"
    assert generate_settlement_id("Sangli") == "stl_sangli"
    assert generate_facility_id("RAIL_STATION", "Sangli Station") == "fac_sangli_station"
    assert generate_provider_mapping_id("INDIAN_RAILWAYS", "SLI") == "map_indian_railways_sli"
    assert generate_provenance_id("stl_sangli", "src_in_settlements") == "prov_stl_sangli_src_in_settlements"


def test_parser_units():
    """Verify geographic parsers convert raw inputs to valid entity records."""
    c_parsed = parse_country_record({"iso2": "IN", "name": "India"})
    assert c_parsed["country_id"] == "ctry_in"

    s_parsed = parse_settlements([
        {"name": "Sangli", "settlement_type": "CITY", "state_code": "MH", "latitude": 16.8524, "longitude": 74.5815}
    ])
    assert len(s_parsed) == 1
    assert s_parsed[0]["settlement_id"] == "stl_sangli"
    assert s_parsed[0]["is_valid"] is True

    f_parsed = parse_transit_facilities([
        {"name": "Sangli Railway Station", "facility_type": "RAIL_STATION", "settlement_name": "Sangli", "station_code": "SLI", "latitude": 16.8524, "longitude": 74.5815}
    ])
    assert len(f_parsed) == 1
    assert f_parsed[0]["facility_id"] == "fac_sangli_sli"
    assert len(f_parsed[0]["provider_mappings"]) == 1
    assert f_parsed[0]["provider_mappings"][0]["provider_entity_id"] == "SLI"


def resolve_ingestion_test_db_url() -> str:
    explicit = os.getenv("INGESTION_TEST_DATABASE_URL")
    if explicit:
        return explicit

    base_url = os.getenv("DATABASE_URL")
    if base_url:
        parts = base_url.rsplit("/", 1)
        return f"{parts[0]}/NavixGeoIngestionTest"

    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "5433")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    return f"postgresql://{user}:{password}@{host}:{port}/NavixGeoIngestionTest"


def test_national_ingestion_end_to_end_on_disposable_postgis():
    """
    End-to-End Ingestion Pipeline Verification against disposable PostGIS database NavixGeoIngestionTest.
    Guarantees reproducible execution, idempotency, spatial query performance, and legacy V2 mapping.
    """
    db_url = resolve_ingestion_test_db_url()
    db_name = db_url.rsplit("/", 1)[-1]
    assert db_name == "NavixGeoIngestionTest", f"Ingestion test must target 'NavixGeoIngestionTest', got '{db_name}'"

    # Ensure database exists
    admin_url = db_url.rsplit("/", 1)[0] + "/postgres"
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as aconn:
        exists = aconn.execute(text("SELECT 1 FROM pg_database WHERE datname='NavixGeoIngestionTest'")).scalar()
        if not exists:
            aconn.execute(text('CREATE DATABASE "NavixGeoIngestionTest"'))

    engine = create_engine(db_url, echo=False)

    # 1. Reset database & apply Alembic migration
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public; CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS pg_trgm;"))

    alembic_ini_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "alembic.ini")
    alembic_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "alembic")
    alembic_cfg = Config(alembic_ini_path)
    alembic_cfg.set_main_option("script_location", alembic_dir)
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    command.upgrade(alembic_cfg, "head")

    SessionLocal = sessionmaker(bind=engine)

    # 2. Run Dry-Run Ingestion first
    with SessionLocal() as session:
        res_dry = run_national_ingestion(session=session, dry_run=True)
        assert res_dry["status"] == "COMPLETED"
        assert res_dry["dry_run"] is True
        assert res_dry["summary"]["total_accepted"] > 0

        # Verify dry-run did NOT insert records into DB
        country_count = session.query(Country).count()
        assert country_count == 0

    # 3. Run Actual Ingestion (Run #1)
    with SessionLocal() as session:
        res_run1 = run_national_ingestion(session=session, dry_run=False)
        session.commit()
        assert res_run1["status"] == "COMPLETED"
        assert res_run1["summary"]["total_accepted"] > 0
        assert res_run1["summary"]["total_quarantined"] == 0

    # 4. Run Actual Ingestion (Run #2 - Idempotency Check)
    with SessionLocal() as session:
        res_run2 = run_national_ingestion(session=session, dry_run=False)
        session.commit()
        assert res_run2["status"] == "COMPLETED"

    # 5. Audit Database Row Counts & Entity Records
    with SessionLocal() as session:
        c_count = session.query(Country).count()
        div_count = session.query(AdminDivision).count()
        stl_count = session.query(Settlement).count()
        loc_count = session.query(Locality).count()
        fac_count = session.query(TransitFacility).count()
        alias_count = session.query(LocationAlias).count()
        pmap_count = session.query(ProviderLocationMapping).count()
        prov_count = session.query(GeoProvenance).count()
        leg_count = session.query(LegacyGeoMapping).count()

        assert c_count == 1
        assert div_count >= 15
        assert stl_count >= 12
        assert loc_count >= 3
        assert fac_count >= 20
        assert alias_count >= 6
        assert pmap_count >= 20
        assert prov_count >= 40
        assert leg_count == 4

        # Audit specific entity values
        sangli = session.query(Settlement).filter_by(settlement_id="stl_sangli").first()
        assert sangli is not None
        assert sangli.name == "Sangli"
        assert sangli.population_tier == 2

        sli_station = session.query(TransitFacility).filter_by(facility_id="fac_sangli_sli").first()
        assert sli_station is not None
        assert sli_station.facility_type == "RAIL_STATION"

        sli_irctc = session.query(ProviderLocationMapping).filter_by(provider_name="INDIAN_RAILWAYS", provider_entity_id="SLI").first()
        assert sli_irctc is not None
        assert sli_irctc.facility_id == "fac_sangli_sli"

        # 6. PostGIS Spatial Distance Query Audit
        # Calculate geodesic distance between Sangli (stl_sangli) and Miraj (stl_miraj) (~8 km)
        dist_meters = session.execute(text("""
            SELECT ST_Distance(
                (SELECT location FROM settlements WHERE settlement_id = 'stl_sangli'),
                (SELECT location FROM settlements WHERE settlement_id = 'stl_miraj')
            );
        """)).scalar()

        assert dist_meters is not None
        assert 6000 <= dist_meters <= 11000  # ~8.2 km

        # Spatial Radius Search (ST_DWithin within 30 km of Sangli)
        nearby_facs = session.execute(text("""
            SELECT facility_id, name FROM transit_facilities
            WHERE ST_DWithin(
                location,
                (SELECT location FROM settlements WHERE settlement_id = 'stl_sangli'),
                30000
            );
        """)).all()

        fac_ids = [r[0] for r in nearby_facs]
        assert "fac_sangli_sli" in fac_ids
        assert "fac_miraj_mrj" in fac_ids
