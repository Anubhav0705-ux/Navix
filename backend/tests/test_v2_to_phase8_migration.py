import os
import pytest
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import create_engine, text, inspect, Table, Column, String, Date, Numeric, Text, DateTime, ForeignKey, Boolean, Integer, CheckConstraint, select
from sqlalchemy.orm import declarative_base, Session, sessionmaker
from alembic.config import Config
from alembic import command

# V2 Baseline Metadata (Pure V2 schema without Phase 8 models)
V2Base = declarative_base()


class V2User(V2Base):
    __tablename__ = "users"
    user_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)


class V2Traveler(V2Base):
    __tablename__ = "travelers"
    traveler_id = Column(String(50), ForeignKey("users.user_id"), primary_key=True)
    preferences = Column(Text, nullable=True)


class V2Admin(V2Base):
    __tablename__ = "admins"
    admin_id = Column(String(50), ForeignKey("users.user_id"), primary_key=True)
    department = Column(String(100), nullable=False)


class V2Trip(V2Base):
    __tablename__ = "trips"
    trip_id = Column(String(50), primary_key=True)
    traveler_id = Column(String(50), ForeignKey("travelers.traveler_id"), nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    travel_date = Column(Date, nullable=False)
    budget_cap = Column(Numeric(10, 2), nullable=False)
    plan_data = Column(Text, nullable=True)


class V2TransitNode(V2Base):
    __tablename__ = "transit_nodes"
    node_id = Column(String(50), primary_key=True)
    node_name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)


class V2TransitSchedule(V2Base):
    __tablename__ = "transit_schedules"
    schedule_id = Column(String(50), primary_key=True)
    source_node_id = Column(String(50), ForeignKey("transit_nodes.node_id"), nullable=False)
    dest_node_id = Column(String(50), ForeignKey("transit_nodes.node_id"), nullable=False)
    mode_type = Column(String(50), nullable=False)
    provider_name = Column(String(100), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    base_cost = Column(Numeric(10, 2), nullable=False)


class V2TransitSegment(V2Base):
    __tablename__ = "transit_segments"
    segment_id = Column(String(50), primary_key=True)
    trip_id = Column(String(50), ForeignKey("trips.trip_id"), nullable=False)
    source_node_id = Column(String(50), ForeignKey("transit_nodes.node_id"), nullable=False)
    dest_node_id = Column(String(50), ForeignKey("transit_nodes.node_id"), nullable=False)
    mode_type = Column(String(50), nullable=False)
    provider_name = Column(String(100), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    cost = Column(Numeric(10, 2), nullable=False)


class V2BudgetAllocation(V2Base):
    __tablename__ = "budget_allocations"
    allocation_id = Column(String(50), primary_key=True)
    trip_id = Column(String(50), ForeignKey("trips.trip_id"), nullable=False)
    transit_cost = Column(Numeric(10, 2), default=Decimal("0.00"))
    lodging_cost = Column(Numeric(10, 2), default=Decimal("0.00"))
    food_cost = Column(Numeric(10, 2), default=Decimal("0.00"))
    activities_cost = Column(Numeric(10, 2), default=Decimal("0.00"))
    total_cost = Column(Numeric(10, 2), nullable=False)


def resolve_migration_test_db_url() -> str:
    explicit = os.getenv("MIGRATION_TEST_DATABASE_URL")
    if explicit:
        return explicit

    base_url = os.getenv("DATABASE_URL")
    if base_url:
        parts = base_url.rsplit("/", 1)
        return f"{parts[0]}/NavixV2MigrationTest"

    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "5433")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    return f"postgresql://{user}:{password}@{host}:{port}/NavixV2MigrationTest"


def validate_migration_db_safety(db_url: str) -> None:
    app_env = os.getenv("APP_ENV", "TESTING").upper()
    allow_bootstrap = os.getenv("ALLOW_TEST_DB_BOOTSTRAP", "true").lower()

    if app_env != "TESTING" and os.getenv("CI") != "true":
        raise ValueError(f"Database bootstrap permitted only under APP_ENV=TESTING, got: {app_env}")

    if allow_bootstrap not in ("true", "1", "yes"):
        raise ValueError(f"Database bootstrap disabled by ALLOW_TEST_DB_BOOTSTRAP={allow_bootstrap}")

    db_name = db_url.rsplit("/", 1)[-1]
    protected_names = ("navix", "navix_dev", "postgres", "production", "staging")
    if db_name.lower() in protected_names or "prod" in db_name.lower() or "staging" in db_name.lower():
        raise ValueError(f"Refusing to execute migration test against protected database name: '{db_name}'")

    if db_name != "NavixV2MigrationTest":
        raise ValueError(f"Migration test must target 'NavixV2MigrationTest', got: '{db_name}'")


def test_migration_db_safety_guardrails(monkeypatch):
    """Verify safety guardrails reject non-TESTING environments or protected database names."""
    # 1. Reject protected production/dev database names
    with pytest.raises(ValueError, match="protected database name"):
        validate_migration_db_safety("postgresql://user:pass@localhost:5433/Navix")

    with pytest.raises(ValueError, match="protected database name"):
        validate_migration_db_safety("postgresql://user:pass@localhost:5433/production_db")

    with pytest.raises(ValueError, match="must target 'NavixV2MigrationTest'"):
        validate_migration_db_safety("postgresql://user:pass@localhost:5433/ArbitraryTestDb")

    # 2. Reject non-TESTING APP_ENV
    monkeypatch.setenv("APP_ENV", "PRODUCTION")
    monkeypatch.delenv("CI", raising=False)
    with pytest.raises(ValueError, match="APP_ENV=TESTING"):
        validate_migration_db_safety("postgresql://user:pass@localhost:5433/NavixV2MigrationTest")

    # 3. Reject disabled ALLOW_TEST_DB_BOOTSTRAP
    monkeypatch.setenv("APP_ENV", "TESTING")
    monkeypatch.setenv("ALLOW_TEST_DB_BOOTSTRAP", "false")
    with pytest.raises(ValueError, match="ALLOW_TEST_DB_BOOTSTRAP"):
        validate_migration_db_safety("postgresql://user:pass@localhost:5433/NavixV2MigrationTest")


def test_v2_to_phase8_alembic_migration_gate():
    """
    Dedicated V2 -> Phase 8 Alembic Migration Gate Verification Test.
    Executes against isolated disposable PostGIS database NavixV2MigrationTest.
    Guarantees Alembic itself executes the migration without relying on create_all().
    """
    db_url = resolve_migration_test_db_url()
    validate_migration_db_safety(db_url)

    # Ensure database exists
    admin_url = db_url.rsplit("/", 1)[0] + "/postgres"
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as aconn:
        exists = aconn.execute(text("SELECT 1 FROM pg_database WHERE datname='NavixV2MigrationTest'")).scalar()
        if not exists:
            aconn.execute(text('CREATE DATABASE "NavixV2MigrationTest"'))

    engine = create_engine(db_url, echo=False)

    # 1. Query Server & PostGIS Versions
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
        pg_version = conn.execute(text("SELECT version();")).scalar()
        postgis_ver = conn.execute(text("SELECT PostGIS_Full_Version();")).scalar()
        assert pg_version is not None
        assert postgis_ver is not None
        assert "POSTGIS" in postgis_ver.upper()

    # 2. Reset disposable database to clean slate & build pure V2 schema
    engine.dispose()
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public; CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS pg_trgm;"))

    V2Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(bind=engine)
    with SessionLocal() as session:
        # Seed users
        u1 = V2User(user_id="usr_01", name="Anubhav User", email="anubhav@example.com", role="traveler", password_hash="hash123")
        u2 = V2User(user_id="usr_02", name="System Admin", email="admin@navix.com", role="admin", password_hash="hash456")
        session.add_all([u1, u2])
        session.flush()

        t1 = V2Traveler(traveler_id="usr_01", preferences="Budget Traveler")
        a1 = V2Admin(admin_id="usr_02", department="Operations")
        session.add_all([t1, a1])

        # Seed V2 demo transit nodes
        n_sli = V2TransitNode(node_id="node_SLI", node_name="Sangli Station", city="Sangli", latitude=Decimal("16.8524"), longitude=Decimal("74.5815"))
        n_mrj = V2TransitNode(node_id="node_MRJ", node_name="Miraj Junction", city="Miraj", latitude=Decimal("16.8202"), longitude=Decimal("74.6468"))
        n_pune = V2TransitNode(node_id="node_PUNE", node_name="Pune Central", city="Pune", latitude=Decimal("18.5204"), longitude=Decimal("73.8567"))
        n_mnl = V2TransitNode(node_id="node_OLD_MNL", node_name="Old Manali Bus Hub", city="Old Manali", latitude=Decimal("32.2562"), longitude=Decimal("77.1740"))
        session.add_all([n_sli, n_mrj, n_pune, n_mnl])
        session.flush()

        # Seed V2 transit schedule
        sch = V2TransitSchedule(
            schedule_id="sch_101",
            source_node_id="node_SLI",
            dest_node_id="node_PUNE",
            mode_type="Train",
            provider_name="Sangli Express",
            departure_time=datetime(2026, 9, 1, 6, 0),
            arrival_time=datetime(2026, 9, 1, 9, 30),
            base_cost=Decimal("150.00")
        )
        session.add(sch)

        # Seed V2 user trip
        tr = V2Trip(
            trip_id="trip_test_01",
            traveler_id="usr_01",
            origin="Sangli",
            destination="Old Manali",
            travel_date=date(2026, 9, 1),
            budget_cap=Decimal("5000.00"),
            plan_data="{}"
        )
        session.add(tr)
        session.flush()

        seg = V2TransitSegment(
            segment_id="seg_test_01",
            trip_id="trip_test_01",
            source_node_id="node_SLI",
            dest_node_id="node_PUNE",
            mode_type="Train",
            provider_name="Sangli Express",
            departure_time=datetime(2026, 9, 1, 6, 0),
            arrival_time=datetime(2026, 9, 1, 9, 30),
            cost=Decimal("150.00")
        )
        alloc = V2BudgetAllocation(
            allocation_id="alloc_test_01",
            trip_id="trip_test_01",
            transit_cost=Decimal("150.00"),
            lodging_cost=Decimal("1000.00"),
            food_cost=Decimal("500.00"),
            activities_cost=Decimal("300.00"),
            total_cost=Decimal("1950.00")
        )
        session.add_all([seg, alloc])
        session.commit()

    # Verify baseline row counts BEFORE Alembic migration
    with SessionLocal() as session:
        v2_counts_before = {
            "users": session.query(V2User).count(),
            "travelers": session.query(V2Traveler).count(),
            "admins": session.query(V2Admin).count(),
            "trips": session.query(V2Trip).count(),
            "transit_nodes": session.query(V2TransitNode).count(),
            "transit_schedules": session.query(V2TransitSchedule).count(),
            "transit_segments": session.query(V2TransitSegment).count(),
            "budget_allocations": session.query(V2BudgetAllocation).count(),
        }
        assert v2_counts_before["users"] == 2
        assert v2_counts_before["travelers"] == 1
        assert v2_counts_before["admins"] == 1
        assert v2_counts_before["trips"] == 1
        assert v2_counts_before["transit_nodes"] == 4
        assert v2_counts_before["transit_schedules"] == 1
        assert v2_counts_before["transit_segments"] == 1
        assert v2_counts_before["budget_allocations"] == 1

    # Verify Alembic version table and Phase 8 tables do NOT exist yet
    inspector_before = inspect(engine)
    tables_before = inspector_before.get_table_names()
    assert "alembic_version" not in tables_before
    assert "countries" not in tables_before
    assert "settlements" not in tables_before

    # 3. Execute Alembic Migration (alembic upgrade head)
    alembic_ini_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "alembic.ini")
    alembic_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "alembic")
    alembic_cfg = Config(alembic_ini_path)
    alembic_cfg.set_main_option("script_location", alembic_dir)
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    command.upgrade(alembic_cfg, "head")

    # Verify alembic_version table records 001_national_geo revision
    with engine.connect() as conn:
        rev = conn.execute(text("SELECT version_num FROM alembic_version;")).scalar()
        assert rev in ("001_national_geo", "002_search_indexes")

    # Verify idempotent re-run of alembic upgrade head
    command.upgrade(alembic_cfg, "head")

    # 4. Audit V2 Data Preservation AFTER Migration
    with SessionLocal() as session:
        v2_counts_after = {
            "users": session.query(V2User).count(),
            "travelers": session.query(V2Traveler).count(),
            "admins": session.query(V2Admin).count(),
            "trips": session.query(V2Trip).count(),
            "transit_nodes": session.query(V2TransitNode).count(),
            "transit_schedules": session.query(V2TransitSchedule).count(),
            "transit_segments": session.query(V2TransitSegment).count(),
            "budget_allocations": session.query(V2BudgetAllocation).count(),
        }

        # 100% Data Preservation Verification
        for table_name, count in v2_counts_before.items():
            assert v2_counts_after[table_name] == count, f"Data loss detected in V2 table '{table_name}' after migration!"

        # Verify specific record values remained unmutated
        user = session.query(V2User).filter_by(user_id="usr_01").first()
        assert user.email == "anubhav@example.com"
        assert user.role == "traveler"

        trip = session.query(V2Trip).filter_by(trip_id="trip_test_01").first()
        assert trip.origin == "Sangli"
        assert trip.destination == "Old Manali"
        assert trip.budget_cap == Decimal("5000.00")

    # 5. Audit Phase 8 Schema & Spatial Features AFTER Migration
    inspector_after = inspect(engine)
    tables_after = inspector_after.get_table_names()

    phase8_tables = [
        "countries", "admin_divisions", "settlements", "localities",
        "transit_facilities", "transit_stops", "points_of_interest",
        "accommodations", "location_aliases", "provider_mappings",
        "geo_provenance", "legacy_geo_mapping"
    ]

    for tbl in phase8_tables:
        assert tbl in tables_after, f"Phase 8 table '{tbl}' was not created by Alembic migration!"

    # Audit spatial columns
    settlement_cols = {col["name"]: col for col in inspector_after.get_columns("settlements")}
    assert "location" in settlement_cols
    assert str(settlement_cols["location"]["type"]).upper().startswith("GEOGRAPHY")

    facility_cols = {col["name"]: col for col in inspector_after.get_columns("transit_facilities")}
    assert "location" in facility_cols
    assert str(facility_cols["location"]["type"]).upper().startswith("GEOGRAPHY")

    admin_cols = {col["name"]: col for col in inspector_after.get_columns("admin_divisions")}
    assert "boundary_polygon" in admin_cols
    assert str(admin_cols["boundary_polygon"]["type"]).upper().startswith("GEOGRAPHY")

    # Audit indexes
    facility_indexes = [idx["name"] for idx in inspector_after.get_indexes("transit_facilities")]
    assert "idx_transit_fac_spatial" in facility_indexes or "idx_transit_fac_settlement" in facility_indexes

    alias_indexes = [idx["name"] for idx in inspector_after.get_indexes("location_aliases")]
    assert "idx_aliases_trgm" in alias_indexes or "idx_aliases_lookup" in alias_indexes
