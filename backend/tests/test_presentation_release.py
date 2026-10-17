"""
Comprehensive Automated Test Suite for NAVIX Presentation Release.
Tests:
- Demo Seeder Idempotency & Catalog Counts
- Destination Catalog Search & Category Filters
- Destination Detail with Attractions, Food, and Stays
- Transport Alternatives Generation (RECOMMENDED, CHEAPEST, FASTEST, COMFORT)
- All 10 Guaranteed Demo Corridors
- Budget Constraint Invariants & Allocation Status
- End-to-end Trip Planning (Sangli -> Manali & Pune -> Goa)
- Travel Stories & Curated Guides
- Demo Presentation User Authentication
"""
import pytest
from datetime import date, datetime
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import SessionLocal
from app.seed.seed_demo_data import seed_data, get_catalog_counts
from app.algorithms import TransitGraph, search_routes, RoutingRequest, OptimizationProfile
from app.services.routing_service import get_route_alternatives
from app.services.trip_planner_service import generate_complete_trip_plan
from app.schemas.trip_planner import TripPlanRequest, StayPreference, FoodPreference, ActivityPreference

client = TestClient(app)


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


class TestDemoSeeding:
    def test_seeding_idempotency_and_counts(self):
        """Verify seeding runs idempotently and database totals meet targets."""
        # Run seeding
        res = seed_data()
        assert res["destinations"] == 0
        assert res["attractions"] == 0
        assert res["food_places"] == 0
        assert res["hotels"] == 0
        assert res["nodes_added"] == 0
        assert res["schedules_added"] == 0

        totals = get_catalog_counts()
        assert totals["destinations"] >= 60, f"Expected >=60 destinations, got {totals['destinations']}"
        assert totals["attractions"] >= 600, f"Expected >=600 attractions, got {totals['attractions']}"
        assert totals["food_places"] >= 400, f"Expected >=400 food places, got {totals['food_places']}"
        assert totals["hotels"] >= 400, f"Expected >=400 hotels, got {totals['hotels']}"
        assert totals["nodes"] >= 65, f"Expected >=65 transit nodes, got {totals['nodes']}"
        assert totals["schedules"] >= 250, f"Expected >=250 schedules, got {totals['schedules']}"
        assert totals["stories"] >= 30, f"Expected >=30 stories, got {totals['stories']}"


class TestDestinationsAPI:
    def test_list_destinations_pagination_and_search(self):
        """Verify destination search and listing."""
        res = client.get("/api/v1/destinations?limit=10")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 60
        assert len(data["items"]) == 10

        # Search query
        res_search = client.get("/api/v1/destinations?search=Manali")
        assert res_search.status_code == 200
        search_data = res_search.json()
        assert any("manali" in item["slug"] for item in search_data["items"])

    def test_category_filters(self):
        """Verify destination category filtering."""
        for cat in ["Mountains", "Beach", "Heritage"]:
            res = client.get(f"/api/v1/destinations?category={cat}&limit=5")
            assert res.status_code == 200
            data = res.json()
            assert data["total"] > 0
            for item in data["items"]:
                assert any(cat.lower() in c.lower() for c in item["categories"])

    def test_destination_detail_page(self):
        """Verify destination detail includes hero, attractions, food, and stays."""
        res = client.get("/api/v1/destinations/manali")
        assert res.status_code == 200
        data = res.json()
        assert "Manali" in data["name"]
        assert len(data["attractions"]) >= 8
        assert len(data["food_places"]) >= 6
        assert len(data["hotels"]) >= 6
        assert data["data_state"] == "DEMO_SEED"

        # Check attraction details
        first_attr = data["attractions"][0]
        assert "entry_fee" in first_attr
        assert "visit_duration_minutes" in first_attr
        assert first_attr["data_state"] == "DEMO_SEED"

        # Check hotel details
        first_hotel = data["hotels"][0]
        assert "price_per_night" in first_hotel
        assert "amenities" in first_hotel
        assert first_hotel["price_state"] == "DEMO_ESTIMATE"


class TestTransportAlternatives:
    def test_generate_transport_alternatives(self, db):
        """Verify 3 to 5 ranked alternatives generated with proper ranking labels."""
        req = RoutingRequest(
            origin="Sangli",
            destination="Manali",
            departure_time=datetime(2026, 10, 26, 6, 0)
        )
        alts = get_route_alternatives(db, req)
        assert len(alts) >= 3, f"Expected at least 3 alternatives, got {len(alts)}"
        labels = [a["label"] for a in alts]
        assert "RECOMMENDED" in labels
        assert any(l in labels for l in ["CHEAPEST", "FASTEST", "COMFORT"])

        # Check API endpoint
        res = client.post(
            "/api/v1/routes/alternatives",
            json={
                "origin": "Sangli",
                "destination": "Manali",
                "departure_time": "2026-10-26T06:00:00"
            }
        )
        assert res.status_code == 200
        api_data = res.json()
        assert len(api_data["alternatives"]) >= 3

    def test_pune_goa_pricing_and_duration_integrity(self, db):
        """Regression test: Pune -> Goa alternatives must have mathematically honest labels and realistic durations."""
        res = client.post(
            "/api/v1/routes/alternatives",
            json={
                "origin": "Pune",
                "destination": "Goa",
                "departure_time": "2026-10-26T06:00:00"
            }
        )
        assert res.status_code == 200
        data = res.json()
        alts = data["alternatives"]
        assert len(alts) >= 2, "Expected at least 2 alternatives for Pune -> Goa"

        min_cost = min(float(a["total_cost"]) for a in alts)
        cheapest_alts = [a for a in alts if a.get("label") == "CHEAPEST"]
        if cheapest_alts:
            for ch in cheapest_alts:
                assert float(ch["total_cost"]) == min_cost, f"CHEAPEST label has cost {ch['total_cost']} but min_cost is {min_cost}"

        for a in alts:
            assert a["duration_minutes"] < 2880, f"Duration {a['duration_minutes']} mins exceeds 48 hours artifact"
            assert a["duration_minutes"] > 0



class TestGuaranteedCorridors:
    @pytest.mark.parametrize("origin,destination", [
        ("Sangli", "Manali"),
        ("Pune", "Goa"),
        ("Mumbai", "Jaipur"),
        ("Delhi", "Manali"),
        ("Delhi", "Jaipur"),
        ("Bengaluru", "Mysuru"),
        ("Chennai", "Pondicherry"),
        ("Kochi", "Munnar"),
        ("Kolkata", "Darjeeling"),
        ("Mumbai", "Goa"),
    ])
    def test_guaranteed_route_produces_options(self, db, origin, destination):
        """Verify all 10 required presentation corridors produce valid transit routes."""
        graph = TransitGraph.load_from_db(db, target_date=date(2026, 10, 26))
        req = RoutingRequest(
            origin=origin,
            destination=destination,
            departure_time=datetime(2026, 10, 26, 6, 0)
        )
        result = search_routes(graph, req, use_heuristic=True)
        assert result is not None
        assert len(result.segments) >= 1
        assert result.summary.total_transport_cost > Decimal("0.00")
        assert result.summary.total_elapsed_minutes > 0


class TestTripPlannerScenarios:
    def test_sangli_to_manali_presentation_golden_scenario(self, db):
        """Verify guaranteed Sangli -> Manali 6-day trip under Rs.40,000 for 2 travellers."""
        req = TripPlanRequest(
            origin="Sangli",
            destination="Manali",
            departure_date=date(2026, 10, 26),
            return_date=date(2026, 11, 1),
            travellers=2,
            maximum_budget=Decimal("40000.00"),
            profile=OptimizationProfile.BALANCED,
            stay_preference=StayPreference.STANDARD,
            food_preference=FoodPreference.BALANCED,
            activity_preference=ActivityPreference.MEDIUM
        )
        res = generate_complete_trip_plan(db, req)
        assert res is not None
        assert res.cost_breakdown.total_trip_cost <= Decimal("40000.00")
        assert res.cost_breakdown.remaining_budget >= Decimal("0.00")
        assert len(res.daily_itinerary) == 7
        assert len(res.activities) >= 1
        assert res.stay is not None
        assert res.stay.cost_per_night > Decimal("0.00")

    def test_pune_to_goa_presentation_fast_scenario(self, db):
        """Verify guaranteed Pune -> Goa 4-day trip under Rs.25,000 for 2 travellers."""
        req = TripPlanRequest(
            origin="Pune",
            destination="Goa",
            departure_date=date(2026, 10, 26),
            return_date=date(2026, 10, 30),
            travellers=2,
            maximum_budget=Decimal("25000.00"),
            profile=OptimizationProfile.BALANCED
        )
        res = generate_complete_trip_plan(db, req)
        assert res is not None
        assert res.cost_breakdown.total_trip_cost <= Decimal("25000.00")
        assert len(res.daily_itinerary) == 5


class TestStoriesAPI:
    def test_list_stories_and_detail(self):
        """Verify stories list, category filter, and slug detail."""
        res = client.get("/api/v1/stories?limit=10")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 30
        assert len(data["items"]) == 10

        # Detail by slug
        first_slug = data["items"][0]["slug"]
        res_detail = client.get(f"/api/v1/stories/{first_slug}")
        assert res_detail.status_code == 200
        story = res_detail.json()
        assert story["title"] != ""
        assert story["body"] != ""
        assert story["author"] != ""


class TestDemoAuth:
    def test_demo_presentation_credentials(self):
        """Verify demo presentation user logs in successfully."""
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "demo@navix.com", "password": "DemoExplorer2026!"}
        )
        assert res.status_code == 200
        token_data = res.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
