"""
Tests for Phase 3: Content Enrichment, Must-Visit Hard Constraint, and Determinism.
"""
import pytest
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database.session import SessionLocal
from app.models.demo_catalog import DemoDestination, DemoAttraction, DemoFoodPlace, DemoHotel, DemoStory
from app.algorithms.itinerary_scheduler import generate_automatic_itinerary
from app.algorithms.types import RouteSegmentResult, TransportMode
from app.schemas.trip_planner import (
    PlannerPreferences, TravelPace, SelectedStay, SelectedFood, SelectedActivity, ItineraryEventType
)
from datetime import date, datetime
from decimal import Decimal

FORBIDDEN_PHRASES = [
    "nestled in the heart of",
    "hidden gem",
    "whether you're a seasoned traveller",
    "a perfect blend of",
    "something for everyone",
    "unforgettable experience"
]

FLAGSHIP_SLUGS = [
    "manali", "kasol", "shimla", "goa", "jaipur", "udaipur", "rishikesh",
    "varanasi", "amritsar", "munnar", "ooty", "kochi", "srinagar", "leh",
    "darjeeling", "hampi", "mumbai", "bengaluru", "kolkata", "mysuru"
]

@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_database_catalog_integrity(db_session: Session):
    """Verify exact catalog counts and non-empty entities."""
    dests = db_session.scalars(select(DemoDestination)).all()
    assert len(dests) == 113, f"Expected 113 destinations, got {len(dests)}"

    stories = db_session.scalars(select(DemoStory)).all()
    assert len(stories) == 32, f"Expected 32 stories, got {len(stories)}"

    attractions = db_session.scalars(select(DemoAttraction)).all()
    assert len(attractions) == 1130, f"Expected 1130 attractions, got {len(attractions)}"

    food = db_session.scalars(select(DemoFoodPlace)).all()
    assert len(food) == 791, f"Expected 791 food places, got {len(food)}"

    hotels = db_session.scalars(select(DemoHotel)).all()
    assert len(hotels) == 791, f"Expected 791 hotels, got {len(hotels)}"

def test_flagship_stories_editorial_quality(db_session: Session):
    """Verify flagship stories contain genuine writing and no forbidden AI clichés."""
    stories = db_session.scalars(select(DemoStory)).all()
    flagship_stories = [s for s in stories if any(slug in s.slug or slug in s.destination_slug for slug in FLAGSHIP_SLUGS)]
    assert len(flagship_stories) >= 20, f"Expected at least 20 flagship stories, got {len(flagship_stories)}"

    for story in flagship_stories:
        assert len(story.body) > 1000, f"Story {story.slug} body is too brief ({len(story.body)} chars)"
        body_lower = story.body.lower()
        for phrase in FORBIDDEN_PHRASES:
            assert phrase not in body_lower, f"Story {story.slug} contains forbidden cliché: '{phrase}'"
        assert "### What I'd Recommend" in story.body, f"Story {story.slug} missing recommendations section"
        assert "### Practical Trip Notes" in story.body or "### Practical Trip Information" in story.body, f"Story {story.slug} missing practical notes"
        assert "Plan Your Trip to" in story.body, f"Story {story.slug} missing Plan Trip CTA"
        assert "![" in story.body and "](" in story.body, f"Story {story.slug} missing image gallery embeds"

def test_flagship_landmarks_non_generic(db_session: Session):
    """Verify the 20 flagship destinations do not have generic placeholder names."""
    for slug in FLAGSHIP_SLUGS:
        atts = db_session.scalars(select(DemoAttraction).where(DemoAttraction.destination_slug == slug)).all()
        assert len(atts) == 10, f"Expected 10 attractions for {slug}, got {len(atts)}"
        names = [a.name.lower() for a in atts]
        assert not any("historic fort & panorama" in n for n in names), f"Generic name found in {slug}: {names}"
        assert not any("sacred river ghats & walk" in n for n in names), f"Generic name found in {slug}: {names}"

        foods = db_session.scalars(select(DemoFoodPlace).where(DemoFoodPlace.destination_slug == slug)).all()
        assert len(foods) == 7, f"Expected 7 food places for {slug}, got {len(foods)}"
        f_names = [f.name.lower() for f in foods]
        assert not any("heritage thali house" in fn for fn in f_names), f"Generic food name in {slug}: {f_names}"

def test_must_visit_hard_constraint_prioritization():
    """Verify that Must-Visit attractions are prioritized first by the scheduler."""
    departure_date = date(2026, 11, 15)
    return_date = date(2026, 11, 18)
    segments = [
        RouteSegmentResult(
            schedule_id="sch_test_01",
            source_node_id="NODE_SANGLI",
            source_node_name="Sangli Junction",
            dest_node_id="NODE_MANALI",
            dest_node_name="Manali Bus Station",
            source_city="Sangli",
            dest_city="Manali",
            transport_mode=TransportMode.BUS,
            provider="HRTC Himsuta",
            departure_time=datetime(2026, 11, 15, 6, 0),
            arrival_time=datetime(2026, 11, 15, 12, 0),
            cost=Decimal("1500.00"),
            duration_minutes=360,
            distance_km=450
        )
    ]
    stay = SelectedStay(
        tier="Standard",
        name="Cedar Wood Cottage",
        cost_per_night=Decimal("2000.00"),
        nights=2,
        total_cost=Decimal("4000.00"),
        description="Cozy cedar mountain cottage"
    )
    food = SelectedFood(
        tier="Standard",
        name="Himachali Regional Dining",
        cost_per_day=Decimal("600.00"),
        days=3,
        total_cost=Decimal("1800.00"),
        description="Authentic local meals"
    )
    # act_03 is Jogini Waterfall in activity catalog
    activities = [
        SelectedActivity(
            id="act_01",
            name="Hadimba Devi Temple",
            category="Heritage",
            cost_per_person=Decimal("50.00"),
            total_cost=Decimal("100.00"),
            description="Historical pagoda wooden temple"
        ),
        SelectedActivity(
            id="act_02",
            name="Solang Valley Snow Point",
            category="Adventure",
            cost_per_person=Decimal("500.00"),
            total_cost=Decimal("1000.00"),
            description="Snow point and paragliding arena"
        ),
        SelectedActivity(
            id="act_03",
            name="Jogini Waterfall",
            category="Nature",
            cost_per_person=Decimal("0.00"),
            total_cost=Decimal("0.00"),
            description="Natural cascading mountain waterfall"
        )
    ]
    # User specifically requests act_03 as Must-Visit
    prefs = PlannerPreferences(
        pace=TravelPace.BALANCED,
        selected_activity_ids=["act_03"],
        must_include=["Jogini Waterfall"]
    )

    itinerary, explanations, metrics = generate_automatic_itinerary(
        departure_date=departure_date,
        return_date=return_date,
        route_segments=segments,
        stay=stay,
        food=food,
        activities=activities,
        travellers=2,
        preferences=prefs,
        destination_name="Manali"
    )

    assert metrics.must_visits_total >= 1
    assert metrics.must_visits_included >= 1
    scheduled_titles = [e.title for day in itinerary for e in day.structured_events if e.event_type == ItineraryEventType.ACTIVITY]
    assert any("Jogini" in t for t in scheduled_titles)
