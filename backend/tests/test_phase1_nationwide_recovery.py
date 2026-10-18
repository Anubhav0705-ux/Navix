"""
NAVIX Phase 1 Nationwide Recovery Test Suite.
Verifies:
1. 20 Mandatory Cross-Location Journeys across India
2. Property-Based & Differential Testing (Destination & Origin Differentiation, Traveller Scaling, Duration Scaling, Must Visit, Hotel Selection)
3. Elimination of hardcoded Sangli -> Manali fallback
"""
import pytest
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.schemas.trip_planner import (
    TripPlanRequest, StayPreference, FoodPreference, ActivityPreference,
    OptimizationProfile, TravelPace, PlannerPreferences
)
from app.services.trip_planner_service import generate_complete_trip_plan
from app.services.routing_service import get_route_alternatives, plan_route
from app.algorithms import RoutingRequest
from app.core.destinations import resolve_canonical_destination, normalize_city_name


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


MANDATORY_20_JOURNEYS = [
    (1, "Sangli", "Manali"),
    (2, "Pune", "Goa"),
    (3, "Mumbai", "Jaipur"),
    (4, "Delhi", "Manali"),
    (5, "Bengaluru", "Mysuru"),
    (6, "Pune", "Udaipur"),
    (7, "Mumbai", "Goa"),
    (8, "Delhi", "Rishikesh"),
    (9, "Kochi", "Munnar"),
    (10, "Kolkata", "Darjeeling"),
    (11, "Hyderabad", "Hampi"),
    (12, "Chennai", "Pondicherry"),
    (13, "Ahmedabad", "Dwarka"),
    (14, "Jaipur", "Udaipur"),
    (15, "Chandigarh", "Shimla"),
    (16, "Delhi", "Agra"),
    (17, "Varanasi", "Lucknow"),
    (18, "Bengaluru", "Ooty"),
    (19, "Pune", "Nashik"),
    (20, "Guwahati", "Shillong"),
]


class TestMandatory20Journeys:
    @pytest.mark.parametrize("idx,origin,destination", MANDATORY_20_JOURNEYS)
    def test_mandatory_journey_end_to_end(self, db: Session, idx: int, origin: str, destination: str):
        """Verify each of the 20 mandatory journeys plans deterministically end-to-end."""
        dep_date = date(2026, 11, 10)
        ret_date = date(2026, 11, 15)  # 5 nights, 6 days

        req = TripPlanRequest(
            origin=origin,
            destination=destination,
            departure_date=dep_date,
            return_date=ret_date,
            travellers=2,
            maximum_budget=Decimal("45000.00"),
            profile=OptimizationProfile.BALANCED,
            stay_preference=StayPreference.STANDARD,
            food_preference=FoodPreference.BALANCED,
            activity_preference=ActivityPreference.MEDIUM
        )

        plan = generate_complete_trip_plan(db, req)

        assert plan is not None, f"Journey {idx} ({origin} -> {destination}) produced None"
        assert plan.origin == origin
        assert plan.destination == destination
        assert plan.cost_breakdown.total_trip_cost <= Decimal("45000.00")
        assert plan.cost_breakdown.remaining_budget >= Decimal("0.00")
        assert len(plan.daily_itinerary) == 6, f"Expected 6 days for {origin} -> {destination}, got {len(plan.daily_itinerary)}"
        assert len(plan.route_segments) >= 1
        assert plan.stay is not None

        # Verify no hardcoded Manali string leak in day titles when destination is not Manali
        if destination.lower() not in ["manali", "old manali"]:
            for item in plan.daily_itinerary:
                assert "old manali" not in item.title.lower(), f"Leaked 'Old Manali' in title for {destination}: {item.title}"
                assert "old manali" not in item.day_theme.lower(), f"Leaked 'Old Manali' in theme for {destination}: {item.day_theme}"

    @pytest.mark.parametrize("idx,origin,destination", MANDATORY_20_JOURNEYS)
    def test_mandatory_journey_route_alternatives(self, db: Session, idx: int, origin: str, destination: str):
        """Verify transport alternatives return 3+ ranked choices for each journey."""
        req = RoutingRequest(
            origin=origin,
            destination=destination,
            departure_time=datetime(2026, 11, 10, 6, 0)
        )
        alts = get_route_alternatives(db, req)
        assert len(alts) >= 3, f"Expected at least 3 alternatives for {origin} -> {destination}, got {len(alts)}"
        labels = [a["label"] for a in alts]
        assert "RECOMMENDED" in labels


class TestPropertyBasedAndDifferential:
    def test_destination_differentiation(self, db: Session):
        """Test A — Pune -> Goa vs Pune -> Udaipur produce completely distinct plans."""
        req_goa = TripPlanRequest(
            origin="Pune",
            destination="Goa",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 14),
            travellers=2,
            maximum_budget=Decimal("35000.00")
        )
        plan_goa = generate_complete_trip_plan(db, req_goa)

        req_udaipur = TripPlanRequest(
            origin="Pune",
            destination="Udaipur",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 14),
            travellers=2,
            maximum_budget=Decimal("35000.00")
        )
        plan_udaipur = generate_complete_trip_plan(db, req_udaipur)

        assert plan_goa.destination == "Goa"
        assert plan_udaipur.destination == "Udaipur"

        # Destinations must have distinct stays
        assert plan_goa.stay.name != plan_udaipur.stay.name
        # Destinations must have distinct activities
        goa_act_names = {a.name for a in plan_goa.activities}
        udaipur_act_names = {a.name for a in plan_udaipur.activities}
        assert goa_act_names != udaipur_act_names
        # Daily titles and locations must differ
        assert plan_goa.daily_itinerary[0].title != plan_udaipur.daily_itinerary[0].title
        assert "Goa" in plan_goa.daily_itinerary[0].title
        assert "Udaipur" in plan_udaipur.daily_itinerary[0].title


    def test_origin_differentiation(self, db: Session):
        """Test B — Pune -> Goa vs Mumbai -> Goa starts from correct origin with distinct routes."""
        req_pune = TripPlanRequest(
            origin="Pune",
            destination="Goa",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 14),
            travellers=1,
            maximum_budget=Decimal("25000.00")
        )
        plan_pune = generate_complete_trip_plan(db, req_pune)

        req_mumbai = TripPlanRequest(
            origin="Mumbai",
            destination="Goa",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 14),
            travellers=1,
            maximum_budget=Decimal("25000.00")
        )
        plan_mumbai = generate_complete_trip_plan(db, req_mumbai)

        assert plan_pune.origin == "Pune"
        assert plan_mumbai.origin == "Mumbai"
        assert plan_pune.route_segments[0].source_city != plan_mumbai.route_segments[0].source_city

    def test_traveller_scaling(self, db: Session):
        """Test C — Traveller scaling: 1 vs 3 travellers scales per-person costs deterministically."""
        req_1 = TripPlanRequest(
            origin="Delhi",
            destination="Rishikesh",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 13),
            travellers=1,
            maximum_budget=Decimal("20000.00")
        )
        plan_1 = generate_complete_trip_plan(db, req_1)

        req_3 = TripPlanRequest(
            origin="Delhi",
            destination="Rishikesh",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 13),
            travellers=3,
            maximum_budget=Decimal("50000.00")
        )
        plan_3 = generate_complete_trip_plan(db, req_3)

        # Transport cost should scale by 3
        assert plan_3.cost_breakdown.transport_cost == plan_1.cost_breakdown.transport_cost * 3
        # Food cost should scale by 3
        assert plan_3.cost_breakdown.food_cost == plan_1.cost_breakdown.food_cost * 3

    def test_trip_duration_scaling(self, db: Session):
        """Test D — 3-day vs 7-day trip scales accommodation nights and timeline days."""
        req_short = TripPlanRequest(
            origin="Bengaluru",
            destination="Mysuru",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 12),  # 3 days, 2 nights
            travellers=2,
            maximum_budget=Decimal("20000.00")
        )
        plan_short = generate_complete_trip_plan(db, req_short)

        req_long = TripPlanRequest(
            origin="Bengaluru",
            destination="Mysuru",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 16),  # 7 days, 6 nights
            travellers=2,
            maximum_budget=Decimal("40000.00")
        )
        plan_long = generate_complete_trip_plan(db, req_long)

        assert len(plan_short.daily_itinerary) == 3
        assert len(plan_long.daily_itinerary) == 7
        assert plan_short.stay.nights == 2
        assert plan_long.stay.nights == 6

    def test_must_visit_attraction_inclusion(self, db: Session):
        """Test E — Selected Must-Visit attraction is scheduled in itinerary."""
        # Find an attraction for Udaipur
        dest_obj = resolve_canonical_destination(db, "Udaipur")
        assert dest_obj is not None
        act = dest_obj.attractions[0]

        req = TripPlanRequest(
            origin="Pune",
            destination="Udaipur",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 14),
            travellers=2,
            maximum_budget=Decimal("35000.00"),
            planner_preferences=PlannerPreferences(
                selected_activity_ids=[act.id],
                must_include=[act.id]
            )
        )
        plan = generate_complete_trip_plan(db, req)

        # Check that the activity is in activities list
        act_ids = [a.id for a in plan.activities]
        assert act.id in act_ids

    def test_hotel_selection_impact(self, db: Session):
        """Test F — Selecting specific hotel overrides default and impacts budget."""
        dest_obj = resolve_canonical_destination(db, "Goa")
        assert dest_obj is not None
        hotels = dest_obj.hotels
        assert len(hotels) >= 2

        h_budget = next(h for h in hotels if h.category == "Budget")
        h_premium = next(h for h in hotels if h.category in ["Standard", "Premium"])

        req_b = TripPlanRequest(
            origin="Pune",
            destination="Goa",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 13),
            travellers=1,
            maximum_budget=Decimal("30000.00"),
            selected_hotel_id=h_budget.id
        )
        plan_b = generate_complete_trip_plan(db, req_b)

        req_p = TripPlanRequest(
            origin="Pune",
            destination="Goa",
            departure_date=date(2026, 11, 10),
            return_date=date(2026, 11, 13),
            travellers=1,
            maximum_budget=Decimal("30000.00"),
            selected_hotel_id=h_premium.id
        )
        plan_p = generate_complete_trip_plan(db, req_p)

        assert plan_b.stay.name == h_budget.name
        assert plan_p.stay.name == h_premium.name
        assert plan_p.cost_breakdown.accommodation_cost > plan_b.cost_breakdown.accommodation_cost
