import os
import logging
from datetime import date, datetime
from decimal import Decimal
import pytest
from sqlalchemy import text

from app.core.config import settings
from app.database.session import engine, verify_database_connection, SessionLocal
from app.database.base import Base
from app.models import User, Traveler, Admin, Trip, TransitSegment, BudgetAllocation
from app.core.security import hash_password
from app.seed.seed_demo_data import seed_data

logger = logging.getLogger("navix.test_bootstrap")


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Session-wide fixture that safely initializes schema and seed data
    ONLY when running against a verified isolated test database (e.g. CI PostGIS container).

    Strict Isolation Safeguards:
    1. Requires explicit ALLOW_TEST_DB_BOOTSTRAP="true" environment authorization.
    2. Requires APP_ENV="TESTING".
    3. Rejects PRODUCTION and STAGING environments.
    4. Executes server-side identity check (SELECT current_database()).
    5. Strictly REJECTS development database "Navix".
    6. Requires target database name to end with 'test' or equal 'navixtest'.
    """
    # 1. Require explicit test-bootstrap environment authorization
    bootstrap_auth = os.getenv("ALLOW_TEST_DB_BOOTSTRAP", "").strip().lower()
    if bootstrap_auth != "true":
        logger.info("Test database bootstrap skipped: ALLOW_TEST_DB_BOOTSTRAP != 'true'")
        return

    # 2. Require APP_ENV == "TESTING"
    if settings.APP_ENV != "TESTING":
        logger.warning(f"Test database bootstrap aborted: APP_ENV={settings.APP_ENV} is not TESTING")
        return

    # 3. Verify database connectivity
    db_health = verify_database_connection()
    if not db_health.get("connected"):
        logger.info("Test database bootstrap skipped: Database is unconnected or offline.")
        return

    # 4. Perform server-side database identity verification
    try:
        with engine.connect() as conn:
            row = conn.execute(text("SELECT current_database(), current_user;")).fetchone()
            if not row:
                logger.error("Test database bootstrap aborted: Failed to retrieve database identity.")
                return

            current_db, current_user = row[0], row[1]
            current_db_lower = current_db.lower()

            # 5. Strictly reject primary development / production databases
            if current_db_lower in ["navix", "navix_dev", "production", "staging"]:
                logger.error(f"SECURITY ALERT: Test bootstrap attempt against database '{current_db}' REJECTED!")
                return

            # 6. Verify database is an explicitly designated test database
            if not (current_db_lower == "navixtest" or "test" in current_db_lower):
                logger.error(f"Test database bootstrap aborted: Database '{current_db}' is not a designated test database.")
                return

            # 7. Enable PostGIS extension in disposable test database
            try:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
            except Exception as ext_err:
                logger.warning(f"PostGIS extension creation in test DB warning: {ext_err}")

    except Exception as err:
        logger.error(f"Test database identity check failed: {err}")
        return

    # 8. Safely create ORM schema tables in disposable test database
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as schema_err:
        logger.error(f"Failed to create schema in test database: {schema_err}")
        raise RuntimeError(f"Authorized test database schema creation failed: {schema_err}") from schema_err

    # 9. Seed test users and profiles in disposable test database
    try:
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == "anubhav@example.com").first()
            if not user:
                u = User(
                    user_id="usr_01",
                    name="Anubhav User",
                    email="anubhav@example.com",
                    role="traveler",
                    password_hash=hash_password("Password123!")
                )
                db.add(u)
                db.flush()
                t = Traveler(traveler_id=u.user_id, preferences="Budget Traveler")
                db.add(t)

            admin_user = db.query(User).filter(User.email == "admin@navix.com").first()
            if not admin_user:
                a_usr = User(
                    user_id="usr_02",
                    name="System Admin",
                    email="admin@navix.com",
                    role="admin",
                    password_hash=hash_password("AdminPassword123!")
                )
                db.add(a_usr)
                db.flush()
                adm = Admin(admin_id=a_usr.user_id, department="Operations")
                db.add(adm)

            db.commit()
    except Exception as seed_user_err:
        logger.error(f"Failed to seed test users in test database: {seed_user_err}")
        raise RuntimeError(f"Authorized test user seeding failed: {seed_user_err}") from seed_user_err

    # 10. Seed demo transit nodes and schedules
    try:
        seed_data()
    except Exception as seed_err:
        logger.error(f"Failed to seed demo transit data in test database: {seed_err}")
        raise RuntimeError(f"Authorized demo transit seeding failed: {seed_err}") from seed_err

    # 11. Seed test trip, segment, and budget allocation in disposable test database
    try:
        with SessionLocal() as db:
            test_trip = db.query(Trip).filter(Trip.trip_id == "trip_test_01").first()
            if not test_trip:
                tr = Trip(
                    trip_id="trip_test_01",
                    traveler_id="usr_01",
                    origin="Sangli",
                    destination="Old Manali",
                    travel_date=date(2026, 9, 1),
                    budget_cap=Decimal("5000.00"),
                    plan_data="{}"
                )
                db.add(tr)
                db.flush()

                seg = TransitSegment(
                    segment_id="seg_test_01",
                    trip_id=tr.trip_id,
                    source_node_id="node_SLI",
                    dest_node_id="node_MRJ",
                    mode_type="Train",
                    provider_name="Sangli Express",
                    departure_time=datetime(2026, 9, 1, 6, 0),
                    arrival_time=datetime(2026, 9, 1, 6, 30),
                    cost=Decimal("50.00")
                )
                db.add(seg)

                alloc = BudgetAllocation(
                    allocation_id="alloc_test_01",
                    trip_id=tr.trip_id,
                    transit_cost=Decimal("50.00"),
                    lodging_cost=Decimal("1000.00"),
                    food_cost=Decimal("500.00"),
                    activities_cost=Decimal("300.00"),
                    total_cost=Decimal("1850.00")
                )
                db.add(alloc)
                db.commit()
    except Exception as seed_trip_err:
        logger.error(f"Failed to seed test trip data in test database: {seed_trip_err}")
        raise RuntimeError(f"Authorized test trip seeding failed: {seed_trip_err}") from seed_trip_err
