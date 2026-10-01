import pytest
from decimal import Decimal
from datetime import date, datetime
from sqlalchemy import select, text
from app.database.session import SessionLocal
from app.models import (
    User, Traveler, Admin, Trip,
    TransitNode, TransitSchedule, TransitSegment, BudgetAllocation
)


@pytest.fixture(scope="module")
def db_session():
    """Module-level session for read-only test verification."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_database_connection(db_session):
    """Verify live read-only connection to PostgreSQL."""
    res = db_session.execute(text("SELECT 1;")).scalar()
    assert res == 1


def test_user_model_mapping(db_session):
    """Verify User ORM model mapping against live database."""
    users = db_session.scalars(select(User)).all()
    assert len(users) > 0
    for u in users:
        assert isinstance(u.user_id, str)
        assert isinstance(u.name, str)
        assert isinstance(u.email, str)
        assert u.role in ["traveler", "admin"]


def test_traveler_model_mapping(db_session):
    """Verify Traveler ORM model & relationship to User."""
    travelers = db_session.scalars(select(Traveler)).all()
    assert len(travelers) > 0
    for t in travelers:
        assert isinstance(t.traveler_id, str)
        assert t.user is not None
        assert t.user.role == "traveler"


def test_admin_model_mapping(db_session):
    """Verify Admin ORM model & relationship to User."""
    admins = db_session.scalars(select(Admin)).all()
    assert len(admins) > 0
    for a in admins:
        assert isinstance(a.admin_id, str)
        assert a.user is not None
        assert a.user.role == "admin"


def test_trip_model_mapping(db_session):
    """Verify Trip ORM model & Decimal budget cap."""
    trips = db_session.scalars(select(Trip)).all()
    assert len(trips) > 0
    for tr in trips:
        assert isinstance(tr.trip_id, str)
        assert isinstance(tr.travel_date, date)
        assert isinstance(tr.budget_cap, Decimal)
        assert tr.traveler is not None


def test_transit_node_model_mapping(db_session):
    """Verify TransitNode ORM model mapping & coordinates."""
    nodes = db_session.scalars(select(TransitNode)).all()
    assert len(nodes) > 0
    for n in nodes:
        assert isinstance(n.node_id, str)
        assert isinstance(n.latitude, float)
        assert isinstance(n.longitude, float)


def test_transit_schedule_model_mapping(db_session):
    """Verify TransitSchedule ORM model & relationships."""
    schedules = db_session.scalars(select(TransitSchedule)).all()
    assert len(schedules) > 0
    for s in schedules:
        assert isinstance(s.schedule_id, str)
        assert isinstance(s.departure_time, datetime)
        assert isinstance(s.base_cost, Decimal)
        assert s.source_node is not None
        assert s.dest_node is not None


def test_transit_segment_model_mapping(db_session):
    """Verify TransitSegment ORM model & relationships."""
    segments = db_session.scalars(select(TransitSegment)).all()
    assert len(segments) > 0
    for seg in segments:
        assert isinstance(seg.segment_id, str)
        assert isinstance(seg.cost, Decimal)
        assert seg.trip is not None
        assert seg.source_node is not None
        assert seg.dest_node is not None


def test_budget_allocation_model_mapping(db_session):
    """Verify BudgetAllocation ORM model & Decimal fields."""
    allocations = db_session.scalars(select(BudgetAllocation)).all()
    assert len(allocations) > 0
    for b in allocations:
        assert isinstance(b.allocation_id, str)
        assert isinstance(b.total_cost, Decimal)
        assert b.trip is not None
