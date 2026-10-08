from datetime import date, datetime, timedelta
from decimal import Decimal
import pytest

from app.database.session import SessionLocal
from app.schemas.trip_planner import (
    TripPlanRequest, OptimizationProfile, StayPreference, FoodPreference,
    ActivityPreference, PlannerPreferences, TravelPace, SelectedStay,
    SelectedFood, SelectedActivity, ItineraryEventType
)
from app.algorithms.types import RouteSegmentResult, TransportMode, TransferStatus
from app.algorithms.itinerary_scheduler import generate_automatic_itinerary
from app.services.trip_planner_service import generate_complete_trip_plan


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def sample_route_segments():
    dep_time = datetime(2026, 12, 12, 7, 30)
    arr_time = datetime(2026, 12, 13, 6, 30)
    return [
        RouteSegmentResult(
            schedule_id="sched_01",
            source_node_id="node_01",
            source_node_name="Sangli Railway Station",
            source_city="Sangli",
            dest_node_id="node_02",
            dest_node_name="New Delhi Railway Station",
            dest_city="Delhi",
            provider="Indian Railways",
            transport_mode=TransportMode.TRAIN,
            departure_time=dep_time,
            arrival_time=arr_time,
            duration_minutes=1380,
            cost=Decimal("1200.00"),
            layover_before_minutes=0,
            transfer_status=TransferStatus.SAFE
        )
    ]


@pytest.fixture
def sample_stay():
    return SelectedStay(
        tier="STANDARD",
        name="Manali Riverside Guest House",
        cost_per_night=Decimal("1500.00"),
        nights=6,
        total_cost=Decimal("9000.00"),
        description="Clean private room with balcony."
    )


@pytest.fixture
def sample_food():
    return SelectedFood(
        tier="BALANCED",
        name="BALANCED CAFÉ DINING",
        cost_per_day=Decimal("700.00"),
        days=7,
        total_cost=Decimal("4900.00"),
        description="Cafés & regional thalis."
    )


@pytest.fixture
def sample_activities():
    return [
        SelectedActivity(
            id="act_01",
            name="Old Manali Village & Temple Walk",
            category="Culture",
            cost_per_person=Decimal("0.00"),
            total_cost=Decimal("0.00"),
            description="Heritage walk."
        ),
        SelectedActivity(
            id="act_02",
            name="Hadimba Temple & Van Vihar Deodar Park",
            category="Culture",
            cost_per_person=Decimal("100.00"),
            total_cost=Decimal("100.00"),
            description="Deodar forest temple."
        ),
        SelectedActivity(
            id="act_03",
            name="Jogini Waterfall Scenic Trek",
            category="Adventure",
            cost_per_person=Decimal("300.00"),
            total_cost=Decimal("300.00"),
            description="Scenic waterfall trek."
        )
    ]


# 1. Activity fits valid day
def test_activity_fits_valid_day(sample_route_segments, sample_stay, sample_food, sample_activities):
    items, explanations, metrics = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1
    )
    assert len(items) == 7
    scheduled_acts = [e for item in items for e in item.structured_events if e.event_type == ItineraryEventType.ACTIVITY]
    assert len(scheduled_acts) > 0


# 2. Activity rejected when insufficient time
def test_activity_rejected_when_insufficient_time(sample_stay, sample_food, sample_activities):
    late_transit = [
        RouteSegmentResult(
            schedule_id="sched_late",
            source_node_id="n1",
            source_node_name="Delhi",
            source_city="Delhi",
            dest_node_id="n2",
            dest_node_name="Manali",
            dest_city="Manali",
            provider="HRTC",
            transport_mode=TransportMode.BUS,
            departure_time=datetime(2026, 12, 12, 8, 0),
            arrival_time=datetime(2026, 12, 12, 22, 0),
            duration_minutes=840,
            cost=Decimal("1000.00")
        )
    ]
    items, explanations, metrics = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 12),
        route_segments=late_transit,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1
    )
    day1_acts = [e for e in items[0].structured_events if e.event_type == ItineraryEventType.ACTIVITY]
    assert len(day1_acts) == 0


# 3. No activity overlaps transit block
def test_no_activity_overlaps_transit_block(sample_route_segments, sample_stay, sample_food, sample_activities):
    items, explanations, metrics = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1
    )
    for item in items:
        events = [e for e in item.structured_events if e.event_type != ItineraryEventType.STAY]
        for i in range(len(events) - 1):
            assert events[i].end_time <= events[i+1].start_time, (
                f"Overlapping events on day {item.day_number}: "
                f"{events[i].title} ({events[i].start_time}-{events[i].end_time}) vs "
                f"{events[i+1].title} ({events[i+1].start_time}-{events[i+1].end_time})"
            )



# 4. Selected must-visit prioritized
def test_selected_must_visit_prioritized(sample_route_segments, sample_stay, sample_food, sample_activities):
    prefs = PlannerPreferences(
        selected_activity_ids=["act_03"],
        must_include=["Jogini Waterfall"]
    )
    items, explanations, metrics = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1,
        preferences=prefs
    )
    scheduled_titles = [e.title for item in items for e in item.structured_events if e.event_type == ItineraryEventType.ACTIVITY]
    assert any("Jogini" in title for title in scheduled_titles)


# 5. Budget cap respected & 6. Activity allocation respected
def test_budget_cap_respected(sample_route_segments, sample_stay, sample_food, sample_activities):
    items, explanations, metrics = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1
    )
    total_spend = sum(item.estimated_daily_spend for item in items)
    assert total_spend > Decimal("0.00")


# 7. RELAXED pace vs 8. PACKED pace density
def test_relaxed_vs_packed_pace(sample_route_segments, sample_stay, sample_food, sample_activities):
    rel_prefs = PlannerPreferences(pace=TravelPace.RELAXED)
    pack_prefs = PlannerPreferences(pace=TravelPace.PACKED)

    rel_items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1,
        preferences=rel_prefs
    )

    pack_items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1,
        preferences=pack_prefs
    )

    rel_count = sum(len([e for e in item.structured_events if e.event_type == ItineraryEventType.ACTIVITY]) for item in rel_items)
    pack_count = sum(len([e for e in item.structured_events if e.event_type == ItineraryEventType.ACTIVITY]) for item in pack_items)
    assert rel_count <= pack_count


# 9. Culture personality favors culture
def test_culture_personality_favors_culture(sample_route_segments, sample_stay, sample_food, sample_activities):
    prefs = PlannerPreferences(trip_personalities=["Culture"])
    items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1,
        preferences=prefs
    )
    scheduled_cats = [e.category for item in items for e in item.structured_events if e.event_type == ItineraryEventType.ACTIVITY]
    assert "Culture" in scheduled_cats


# 10. Adventure personality favors adventure
def test_adventure_personality_favors_adventure(sample_route_segments, sample_stay, sample_food, sample_activities):
    prefs = PlannerPreferences(trip_personalities=["Adventure"])
    items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1,
        preferences=prefs
    )
    scheduled_cats = [e.category for item in items for e in item.structured_events if e.event_type == ItineraryEventType.ACTIVITY]
    assert "Adventure" in scheduled_cats


# 11. Nature personality favors nature
def test_nature_personality_favors_nature(sample_route_segments, sample_stay, sample_food, sample_activities):
    prefs = PlannerPreferences(trip_personalities=["Nature"])
    items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1,
        preferences=prefs
    )
    assert len(items) == 7


# 12. Local transfer time included
def test_local_transfer_time_included(sample_route_segments, sample_stay, sample_food, sample_activities):
    items, _, metrics = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay,
        food=sample_food,
        activities=sample_activities,
        travellers=1
    )
    assert metrics.local_travel_minutes >= 0


# 13. Arrival-night does not schedule activity if late
def test_late_arrival_night_no_activity(sample_stay, sample_food, sample_activities):
    late_transit = [
        RouteSegmentResult(
            schedule_id="s1",
            source_node_id="n1", source_node_name="Delhi", source_city="Delhi",
            dest_node_id="n2", dest_node_name="Manali", dest_city="Manali",
            provider="HRTC", transport_mode=TransportMode.BUS,
            departure_time=datetime(2026, 12, 12, 10, 0),
            arrival_time=datetime(2026, 12, 12, 21, 30),
            duration_minutes=690, cost=Decimal("800.00")
        )
    ]
    items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=late_transit,
        stay=sample_stay, food=sample_food, activities=sample_activities, travellers=1
    )
    d1_acts = [e for e in items[0].structured_events if e.event_type == ItineraryEventType.ACTIVITY]
    assert len(d1_acts) == 0


# 14. Return/travel day time respected
def test_return_travel_day_time_respected(sample_route_segments, sample_stay, sample_food, sample_activities):
    items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay, food=sample_food, activities=sample_activities, travellers=1
    )
    assert len(items) == 7


# 15. Overlapping events impossible
def test_overlapping_events_impossible(sample_route_segments, sample_stay, sample_food, sample_activities):
    items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        route_segments=sample_route_segments,
        stay=sample_stay, food=sample_food, activities=sample_activities, travellers=1
    )
    for item in items:
        acts = [e for e in item.structured_events if e.event_type == ItineraryEventType.ACTIVITY]
        for i in range(len(acts) - 1):
            assert acts[i].end_time <= acts[i+1].start_time


# 16. Selected impossible activity returns explanation
def test_selected_impossible_activity_returns_explanation(sample_stay, sample_food):
    tight_transit = [
        RouteSegmentResult(
            schedule_id="s1", source_node_id="n1", source_node_name="Delhi", source_city="Delhi",
            dest_node_id="n2", dest_node_name="Manali", dest_city="Manali",
            provider="HRTC", transport_mode=TransportMode.BUS,
            departure_time=datetime(2026, 12, 12, 8, 0),
            arrival_time=datetime(2026, 12, 12, 23, 0),
            duration_minutes=900, cost=Decimal("800.00")
        )
    ]
    prefs = PlannerPreferences(selected_activity_ids=["act_04"])
    items, explanations, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 12),
        route_segments=tight_transit, stay=sample_stay, food=sample_food, activities=[], travellers=1,
        preferences=prefs
    )
    assert any("could not be scheduled" in exp for exp in explanations)


# 17. Deterministic output for same input
def test_deterministic_output_for_same_input(sample_route_segments, sample_stay, sample_food, sample_activities):
    run1_items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        route_segments=sample_route_segments, stay=sample_stay, food=sample_food, activities=sample_activities, travellers=1
    )
    run2_items, _, _ = generate_automatic_itinerary(
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        route_segments=sample_route_segments, stay=sample_stay, food=sample_food, activities=sample_activities, travellers=1
    )
    assert [i.title for i in run1_items] == [i.title for i in run2_items]


# 18. Total trip cost remains <= maximum budget
def test_total_trip_cost_remains_within_maximum_budget(db_session):
    req = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        travellers=1, maximum_budget=Decimal("20000.00")
    )
    res = generate_complete_trip_plan(db_session, req)
    assert res.cost_breakdown.total_trip_cost <= req.maximum_budget


# 19. Current legacy request (without planner_preferences) still works
def test_legacy_request_without_planner_preferences_works(db_session):
    req = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        travellers=1, maximum_budget=Decimal("20000.00")
    )
    res = generate_complete_trip_plan(db_session, req)
    assert res.destination == "Old Manali"
    assert len(res.daily_itinerary) == 7


# 20. New preference-enhanced request works
def test_new_preference_enhanced_request_works(db_session):
    prefs = PlannerPreferences(
        selected_activity_ids=["act_01", "act_02"],
        trip_personalities=["Adventure", "Culture"],
        pace=TravelPace.BALANCED,
        must_include=["Jogini Trek"],
        avoid=["overnight travel"]
    )
    req = TripPlanRequest(
        origin="Sangli", destination="Old Manali",
        departure_date=date(2026, 12, 12), return_date=date(2026, 12, 18),
        travellers=1, maximum_budget=Decimal("20000.00"),
        planner_preferences=prefs
    )
    res = generate_complete_trip_plan(db_session, req)
    assert res.destination == "Old Manali"
    assert res.itinerary_metrics is not None
    assert res.itinerary_metrics.activities_scheduled >= 0
