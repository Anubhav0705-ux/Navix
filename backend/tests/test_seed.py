import pytest
from decimal import Decimal
from datetime import datetime
from sqlalchemy import select
from app.database.session import SessionLocal
from app.models import TransitNode, TransitSchedule
from app.seed.seed_demo_data import seed_data
from app.data import ACCOMMODATION_TIERS, FOOD_TIERS, ACTIVITY_OPTIONS


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_seeding_is_idempotent():
    """Verify executing seed_data when DB is seeded adds 0 duplicate records."""
    res = seed_data()
    assert res["nodes_added"] == 0
    assert res["schedules_added"] == 0


def test_demo_hubs_exist(db_session):
    """Verify key transit nodes exist in database."""
    expected_node_ids = [
        "node_SLI", "node_MRJ", "node_PUNE", "node_MUM",
        "node_DEL", "node_DEL_BUS", "node_IXC", "node_MNL_BUS", "node_OLD_MNL"
    ]
    for n_id in expected_node_ids:
        node = db_session.get(TransitNode, n_id)
        assert node is not None, f"Node {n_id} missing from database"
        assert -90.0 <= node.latitude <= 90.0
        assert -180.0 <= node.longitude <= 180.0


def test_route_alternatives_exist(db_session):
    """Verify multiple outgoing schedules exist from origin node Sangli."""
    sli_schedules = db_session.scalars(
        select(TransitSchedule).where(TransitSchedule.source_node_id == "node_SLI")
    ).all()
    assert len(sli_schedules) >= 3, "Expected at least 3 alternative route options from Sangli"
    
    dest_node_ids = {s.dest_node_id for s in sli_schedules}
    assert "node_MRJ" in dest_node_ids
    assert "node_PUNE" in dest_node_ids
    assert "node_MUM" in dest_node_ids


def test_schedule_leg_validity(db_session):
    """Verify schedules have valid timestamps and non-negative costs."""
    schedules = db_session.scalars(select(TransitSchedule)).all()
    assert len(schedules) >= 17
    for s in schedules:
        assert s.base_cost >= Decimal("0.00")
        assert s.arrival_time > s.departure_time, f"Schedule {s.schedule_id} arrival must be after departure"


def test_supporting_data_catalogs():
    """Verify static catalog data for accommodations, food, and activities."""
    assert len(ACCOMMODATION_TIERS) >= 3
    for acc in ACCOMMODATION_TIERS:
        assert acc["cost_per_night"] > Decimal("0.00")

    assert len(FOOD_TIERS) >= 3
    for f in FOOD_TIERS:
        assert f["cost_per_day"] > Decimal("0.00")

    assert len(ACTIVITY_OPTIONS) >= 4
    for act in ACTIVITY_OPTIONS:
        assert act["cost"] >= Decimal("0.00")
