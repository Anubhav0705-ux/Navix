import pytest
from decimal import Decimal
from datetime import datetime
from sqlalchemy import select, inspect, text
from sqlalchemy.exc import IntegrityError
from geoalchemy2.elements import WKTElement

from app.database.session import SessionLocal
from app.models import (
    Base, User, Traveler, Admin, Trip, TransitNode, TransitSchedule, TransitSegment, BudgetAllocation,
    Country, AdminDivision, Settlement, Locality, TransitFacility, TransitStop,
    PointOfInterest, Accommodation, LocationAlias, ProviderLocationMapping,
    GeoProvenance, LegacyGeoMapping
)


@pytest.fixture(scope="module")
def db_session():
    """Module-level session for Phase 8.1 schema tests with automatic teardown cleanup."""
    session = SessionLocal()
    try:
        yield session
    finally:
        # Teardown: delete all synthetic t8_* test entities created during schema testing
        try:
            session.execute(text("DELETE FROM legacy_geo_mapping WHERE v1_facility_id LIKE '%t8_%' OR legacy_node_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM geo_provenance WHERE entity_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM location_aliases WHERE entity_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM provider_mappings WHERE facility_id LIKE '%t8_%' OR provider_entity_id LIKE 'T8_%';"))
            session.execute(text("DELETE FROM accommodations WHERE settlement_id LIKE '%t8_%' OR accommodation_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM points_of_interest WHERE settlement_id LIKE '%t8_%' OR poi_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM transit_facilities WHERE facility_id LIKE '%t8_%' OR settlement_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM localities WHERE settlement_id LIKE '%t8_%' OR locality_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM settlements WHERE settlement_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM admin_divisions WHERE division_id LIKE '%t8_%';"))
            session.execute(text("DELETE FROM countries WHERE country_id LIKE '%t8_%';"))
            session.commit()
        except Exception:
            session.rollback()
        session.close()


def test_national_geo_table_existence(db_session):
    """Verify all 12 national geographic tables exist in SQLAlchemy metadata & database engine."""
    inspector = inspect(db_session.bind)
    tables = inspector.get_table_names()

    expected_tables = [
        "countries",
        "admin_divisions",
        "settlements",
        "localities",
        "transit_facilities",
        "transit_stops",
        "points_of_interest",
        "accommodations",
        "location_aliases",
        "provider_mappings",
        "geo_provenance",
        "legacy_geo_mapping"
    ]

    for tbl in expected_tables:
        assert tbl in tables, f"Expected national geographic table '{tbl}' is missing from database schema."


def test_country_and_admin_division_hierarchy(db_session):
    """Verify Country and hierarchical AdminDivision ORM mapping and relationships."""
    country = db_session.scalars(select(Country).filter(Country.country_id == "ctry_t8_in")).first()
    if not country:
        country = Country(
            country_id="ctry_t8_in",
            iso_code_2="T8",
            iso_code_3="T8I",
            name="Testland India",
            default_currency="INR",
            default_timezone="Asia/Kolkata"
        )
        db_session.add(country)
        db_session.flush()

    state = db_session.scalars(select(AdminDivision).filter(AdminDivision.division_id == "div_t8_mh")).first()
    if not state:
        state = AdminDivision(
            division_id="div_t8_mh",
            country_id=country.country_id,
            name="Test Maharashtra",
            division_level="STATE",
            code="MH"
        )
        db_session.add(state)
        db_session.flush()

    district = db_session.scalars(select(AdminDivision).filter(AdminDivision.division_id == "div_t8_sangli")).first()
    if not district:
        district = AdminDivision(
            division_id="div_t8_sangli",
            country_id=country.country_id,
            parent_division_id=state.division_id,
            name="Test Sangli District",
            division_level="DISTRICT",
            code="SANGLI"
        )
        db_session.add(district)
        db_session.commit()

    assert district.parent_division is not None
    assert district.parent_division.name == "Test Maharashtra"
    assert district.country.name == "Testland India"


def test_settlement_and_locality_spatial_points(db_session):
    """Verify Settlement and Locality spatial point models with WGS84 coordinates."""
    settlement = db_session.scalars(select(Settlement).filter(Settlement.settlement_id == "stl_t8_sangli")).first()
    if not settlement:
        settlement = Settlement(
            settlement_id="stl_t8_sangli",
            admin_division_id="div_t8_sangli",
            name="Test Sangli",
            settlement_type="CITY",
            population_tier=3,
            location=WKTElement("POINT(74.5815 16.8524)", srid=4326),
            timezone="Asia/Kolkata",
            coverage_status="COVERED"
        )
        db_session.add(settlement)
        db_session.flush()

    locality = db_session.scalars(select(Locality).filter(Locality.locality_id == "loc_t8_sangli_city")).first()
    if not locality:
        locality = Locality(
            locality_id="loc_t8_sangli_city",
            settlement_id=settlement.settlement_id,
            name="Test Sangli Market Area",
            location=WKTElement("POINT(74.5820 16.8530)", srid=4326),
            pincode="416416"
        )
        db_session.add(locality)
        db_session.commit()

    assert locality.settlement.name == "Test Sangli"
    assert len(settlement.localities) > 0


def test_transit_facility_and_provider_mapping(db_session):
    """Verify TransitFacility, TransitStop, and ProviderLocationMapping relationships."""
    facility = db_session.scalars(select(TransitFacility).filter(TransitFacility.facility_id == "fac_t8_sli_rail")).first()
    if not facility:
        facility = TransitFacility(
            facility_id="fac_t8_sli_rail",
            settlement_id="stl_t8_sangli",
            name="Test Sangli Railway Station",
            facility_type="RAIL_STATION",
            location=WKTElement("POINT(74.5815 16.8524)", srid=4326),
            is_multimodal=False,
            operating_status="ACTIVE"
        )
        db_session.add(facility)
        db_session.flush()

    mapping = db_session.scalars(
        select(ProviderLocationMapping).filter(
            ProviderLocationMapping.provider_name == "IRCTC",
            ProviderLocationMapping.provider_entity_id == "T8_SLI"
        )
    ).first()

    if not mapping:
        mapping = ProviderLocationMapping(
            facility_id=facility.facility_id,
            provider_name="IRCTC",
            provider_entity_id="T8_SLI",
            is_primary=True
        )
        db_session.add(mapping)
        db_session.commit()

    assert mapping.facility.name == "Test Sangli Railway Station"
    assert mapping.provider_entity_id == "T8_SLI"


def test_points_of_interest_and_accommodations(db_session):
    """Verify PointOfInterest and Accommodation ORM models."""
    poi = db_session.scalars(select(PointOfInterest).filter(PointOfInterest.poi_id == "poi_t8_ganpati")).first()
    if not poi:
        poi = PointOfInterest(
            poi_id="poi_t8_ganpati",
            settlement_id="stl_t8_sangli",
            locality_id="loc_t8_sangli_city",
            name="Test Sangli Ganpati Temple",
            category="Culture",
            location=WKTElement("POINT(74.5850 16.8550)", srid=4326),
            estimated_visit_minutes=60,
            base_ticket_cost=Decimal("0.00")
        )
        db_session.add(poi)

    acc = db_session.scalars(select(Accommodation).filter(Accommodation.accommodation_id == "acc_t8_hotel")).first()
    if not acc:
        acc = Accommodation(
            accommodation_id="acc_t8_hotel",
            settlement_id="stl_t8_sangli",
            name="Test Sangli Grand Hotel",
            tier="Standard",
            cost_per_night=Decimal("1800.00"),
            location=WKTElement("POINT(74.5830 16.8540)", srid=4326)
        )
        db_session.add(acc)

    db_session.commit()

    assert poi.settlement.name == "Test Sangli"
    assert acc.cost_per_night == Decimal("1800.00")


def test_location_alias_search_indexing(db_session):
    """Verify LocationAlias ORM mapping and searching."""
    alias = db_session.scalars(
        select(LocationAlias).filter(
            LocationAlias.entity_type == "SETTLEMENT",
            LocationAlias.entity_id == "stl_t8_sangli",
            LocationAlias.alias_name == "Test Sangli City"
        )
    ).first()

    if not alias:
        alias = LocationAlias(
            entity_type="SETTLEMENT",
            entity_id="stl_t8_sangli",
            alias_name="Test Sangli City",
            language_code="en",
            alias_type="ALTERNATIVE_NAME"
        )
        db_session.add(alias)
        db_session.commit()

    assert alias.alias_name == "Test Sangli City"


def test_geo_provenance_tracking(db_session):
    """Verify GeoProvenance audit trail recording."""
    prov = db_session.scalars(
        select(GeoProvenance).filter(
            GeoProvenance.entity_type == "SETTLEMENT",
            GeoProvenance.entity_id == "stl_t8_sangli"
        )
    ).first()

    if not prov:
        prov = GeoProvenance(
            entity_type="SETTLEMENT",
            entity_id="stl_t8_sangli",
            data_source="Data.gov.in",
            license_type="OGDL-India",
            imported_at=datetime.utcnow(),
            confidence_score=Decimal("1.00")
        )
        db_session.add(prov)
        db_session.commit()

    assert prov.data_source == "Data.gov.in"


def test_legacy_geo_mapping_bridge(db_session):
    """Verify LegacyGeoMapping bridge table maps legacy node_id to V1 facility_id."""
    bridge = db_session.scalars(select(LegacyGeoMapping).filter(LegacyGeoMapping.legacy_node_id == "node_t8_sli")).first()
    if not bridge:
        bridge = LegacyGeoMapping(
            legacy_node_id="node_t8_sli",
            v1_facility_id="fac_t8_sli_rail",
            v1_settlement_id="stl_t8_sangli"
        )
        db_session.add(bridge)
        db_session.commit()

    assert bridge.v1_facility_id == "fac_t8_sli_rail"
    assert bridge.v1_settlement_id == "stl_t8_sangli"


def test_provider_mapping_uniqueness_constraint(db_session):
    """Verify provider mapping enforces unique (provider_name, provider_entity_id)."""
    dup_mapping = ProviderLocationMapping(
        facility_id="fac_t8_sli_rail",
        provider_name="IRCTC",
        provider_entity_id="T8_SLI",  # Already inserted in previous test
        is_primary=False
    )
    db_session.add(dup_mapping)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_spatial_radius_query_postgis(db_session):
    """Verify PostGIS ST_DWithin radius search returns nearby transit facility."""
    res = db_session.execute(
        text("""
            SELECT tf.facility_id, tf.name
            FROM transit_facilities tf
            JOIN settlements s ON s.settlement_id = 'stl_t8_sangli'
            WHERE ST_DWithin(tf.location, s.location, 30000);
        """)
    ).fetchall()

    assert len(res) > 0
    fac_ids = [r[0] for r in res]
    assert "fac_t8_sli_rail" in fac_ids


def test_v2_model_compatibility(db_session):
    """Verify existing V2 application models remain 100% functional alongside Phase 8 models."""
    users = db_session.scalars(select(User)).all()
    assert len(users) > 0

    schedules = db_session.scalars(select(TransitSchedule)).all()
    assert len(schedules) > 0
