import pytest
from decimal import Decimal
from datetime import date, timedelta
from sqlalchemy import text
from app.database.session import SessionLocal
from app.schemas.trip_planner import (
    TripPlanRequest, StayPreference, FoodPreference, ActivityPreference,
    BudgetStatus, TripPlanResult, OptimizationProfile
)
from app.algorithms import SearchError
from app.services.trip_planner_service import generate_complete_trip_plan


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_primary_20k_sangli_to_old_manali_trip(db_session):
    """14. ₹20,000 Sangli -> Old Manali produces complete feasible result."""
    req = TripPlanRequest(
        origin="Sangli",
        destination="Old Manali",
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        travellers=1,
        maximum_budget=Decimal("20000.00"),
        profile=OptimizationProfile.BALANCED,
        stay_preference=StayPreference.STANDARD,
        food_preference=FoodPreference.BALANCED,
        activity_preference=ActivityPreference.MEDIUM
    )
    res = generate_complete_trip_plan(db_session, req)
    assert res is not None
    assert res.cost_breakdown.total_trip_cost <= Decimal("20000.00")
    assert res.cost_breakdown.remaining_budget >= Decimal("0.00")
    assert len(res.daily_itinerary) == 7
    assert len(res.activities) > 0


def test_hard_budget_invariant(db_session):
    """1, 11, 12. Total trip cost NEVER exceeds maximum budget and remaining = max - total."""
    req = TripPlanRequest(
        origin="Sangli",
        destination="Old Manali",
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        travellers=2,
        maximum_budget=Decimal("18000.00")
    )
    res = generate_complete_trip_plan(db_session, req)
    cb = res.cost_breakdown
    assert cb.total_trip_cost <= cb.maximum_budget
    assert cb.remaining_budget == cb.maximum_budget - cb.total_trip_cost


def test_low_budget_shortfall_handling(db_session):
    """3, 15. Very low budget (e.g. ₹5,000) fails cleanly with BUDGET_TOO_LOW shortfall."""
    req = TripPlanRequest(
        origin="Sangli",
        destination="Old Manali",
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        travellers=1,
        maximum_budget=Decimal("5000.00")
    )
    with pytest.raises(SearchError) as exc_info:
        generate_complete_trip_plan(db_session, req)
    assert exc_info.value.code == "BUDGET_TOO_LOW"
    assert "Shortfall" in exc_info.value.message


def test_stay_downgrade_when_necessary(db_session):
    """5, 6, 7. Stay/food/activities are downgraded when budget is tight."""
    req = TripPlanRequest(
        origin="Sangli",
        destination="Old Manali",
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        travellers=1,
        maximum_budget=Decimal("8500.00"),
        stay_preference=StayPreference.COMFORT,  # ₹3000/night requested
        food_preference=FoodPreference.FLEXIBLE
    )
    res = generate_complete_trip_plan(db_session, req)
    assert res.cost_breakdown.total_trip_cost <= Decimal("8500.00")
    # Must have downgraded to Budget stay to fit ₹8,500
    assert res.stay.tier == "Budget"


def test_traveller_count_cost_scaling(db_session):
    """8. Traveller count scales transport, food, and activity costs."""
    req1 = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        travellers=1, maximum_budget=Decimal("30000.00")
    )
    res1 = generate_complete_trip_plan(db_session, req1)

    req2 = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        travellers=2, maximum_budget=Decimal("30000.00")
    )
    res2 = generate_complete_trip_plan(db_session, req2)

    assert res2.cost_breakdown.transport_cost == res1.cost_breakdown.transport_cost * 2
    assert res2.cost_breakdown.food_cost == res1.cost_breakdown.food_cost * 2


def test_multi_day_scaling(db_session):
    """9. Multi-day trip scales stay & food costs according to days/nights."""
    req = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 16), # 5 days, 4 nights
        travellers=1, maximum_budget=Decimal("20000.00")
    )
    res = generate_complete_trip_plan(db_session, req)
    assert res.days == 5
    assert res.nights == 4
    assert res.stay.nights == 4
    assert res.food.days == 5


def test_invalid_date_range_error(db_session):
    """10. Return date <= departure date raises INVALID_DATE_RANGE."""
    req = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 18), return_date=date(2026, 12, 12),
        travellers=1, maximum_budget=Decimal("20000.00")
    )
    with pytest.raises(SearchError) as exc_info:
        generate_complete_trip_plan(db_session, req)
    assert exc_info.value.code == "INVALID_DATE_RANGE"


def test_daily_itinerary_generation(db_session):
    """16, 17. Daily itinerary generated with SAFE transfer status on all legs."""
    req = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        travellers=1, maximum_budget=Decimal("20000.00")
    )
    res = generate_complete_trip_plan(db_session, req)
    assert len(res.daily_itinerary) == 7
    for item in res.daily_itinerary:
        assert len(item.events) > 0
    for seg in res.route_segments:
        if seg.layover_before_minutes > 0:
            assert seg.transfer_status == "SAFE"


def test_zero_database_mutations_during_planning(db_session):
    """19. Trip planning produces zero database mutations."""
    count_nodes_before = db_session.execute(text('SELECT count(*) FROM "transit_nodes"')).scalar()
    count_sched_before = db_session.execute(text('SELECT count(*) FROM "transit_schedules"')).scalar()

    req = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        travellers=1, maximum_budget=Decimal("20000.00")
    )
    res = generate_complete_trip_plan(db_session, req)
    assert res is not None

    count_nodes_after = db_session.execute(text('SELECT count(*) FROM "transit_nodes"')).scalar()
    count_sched_after = db_session.execute(text('SELECT count(*) FROM "transit_schedules"')).scalar()

    assert count_nodes_before == count_nodes_after
    assert count_sched_before == count_sched_after
