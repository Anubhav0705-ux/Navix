"""
Comprehensive & Idempotent Demo Data Seeder for NAVIX 48-Hour Presentation Release.
Seeds:
- Demo Presentation User (demo@navix.com / DemoExplorer2026!)
- 65 Indian Destinations (demo_destinations)
- 650 Attractions (demo_attractions)
- 455 Food Places & Regional Specialities (demo_food_places)
- 455 Hotels & Stays (demo_hotels)
- 65 Transit Nodes across India (transit_nodes)
- Connected Multi-Modal National Transit Network (transit_schedules)
- 32 Travel Stories & Curated Guides (demo_stories)

Idempotent: Running multiple times will never duplicate or destroy records.
"""
import os
import json
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, List
from pathlib import Path

from sqlalchemy import select
from app.database.session import SessionLocal
from app.models import (
    User,
    Traveler,
    Admin,
    TransitNode,
    TransitSchedule,
    DemoDestination,
    DemoAttraction,
    DemoFoodPlace,
    DemoHotel,
    DemoStory
)
from app.core.security import hash_password
from app.core.config import settings

DEFAULT_ADMIN_ID = "usr_02"
DEMO_USER_ID = "usr_demo_navix"
DEMO_USER_EMAIL = "demo@navix.com"
DEMO_USER_PASSWORD = "DemoExplorer2026!"

# Locate data directory (backend/data/demo)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "demo"

# Fallback legacy nodes to maintain 100% compatibility with Phase 1-10 tests
LEGACY_NODES = [
    {"node_id": "node_SLI", "node_name": "Sangli Station", "city": "Sangli", "latitude": 16.8524, "longitude": 74.5815},
    {"node_id": "node_PUNE", "node_name": "Pune Central", "city": "Pune", "latitude": 18.5204, "longitude": 73.8567},
    {"node_id": "node_MRJ", "node_name": "Miraj Junction", "city": "Miraj", "latitude": 16.8202, "longitude": 74.6468},
    {"node_id": "node_MUM", "node_name": "Mumbai CSMT", "city": "Mumbai", "latitude": 18.9400, "longitude": 72.8354},
    {"node_id": "node_DEL", "node_name": "New Delhi Railway Station", "city": "Delhi", "latitude": 28.6430, "longitude": 77.2194},
    {"node_id": "node_DEL_BUS", "node_name": "Kashmiri Gate ISBT", "city": "Delhi", "latitude": 28.6675, "longitude": 77.2285},
    {"node_id": "node_IXC", "node_name": "Chandigarh Junction", "city": "Chandigarh", "latitude": 30.7046, "longitude": 76.8013},
    {"node_id": "node_MNL_BUS", "node_name": "Manali ISBT Bus Stand", "city": "Manali", "latitude": 32.2396, "longitude": 77.1887},
    {"node_id": "node_OLD_MNL", "node_name": "Old Manali Hub", "city": "Old Manali", "latitude": 32.2548, "longitude": 77.1751}
]

LEGACY_SCHEDULES = [
    {"schedule_id": "sch_101", "source_node_id": "node_SLI", "dest_node_id": "node_MRJ", "provider": "Sangli Local Auto", "departure_time": datetime(2026, 9, 1, 6, 0), "arrival_time": datetime(2026, 9, 1, 6, 30), "base_cost": Decimal("50.00")},
    {"schedule_id": "sch_102", "source_node_id": "node_MRJ", "dest_node_id": "node_DEL", "provider": "Goa Express (Train)", "departure_time": datetime(2026, 9, 1, 7, 30), "arrival_time": datetime(2026, 9, 2, 6, 30), "base_cost": Decimal("750.00")},
    {"schedule_id": "sch_103", "source_node_id": "node_DEL", "dest_node_id": "node_DEL_BUS", "provider": "Delhi Metro Yellow Line", "departure_time": datetime(2026, 9, 2, 7, 30), "arrival_time": datetime(2026, 9, 2, 8, 0), "base_cost": Decimal("40.00")},
    {"schedule_id": "sch_104", "source_node_id": "node_DEL_BUS", "dest_node_id": "node_MNL_BUS", "provider": "HRTC Volvo Bus (Day)", "departure_time": datetime(2026, 9, 2, 10, 0), "arrival_time": datetime(2026, 9, 2, 22, 0), "base_cost": Decimal("1200.00")},
    {"schedule_id": "sch_105", "source_node_id": "node_MNL_BUS", "dest_node_id": "node_OLD_MNL", "provider": "Manali Express Auto Shuttle", "departure_time": datetime(2026, 9, 2, 22, 15), "arrival_time": datetime(2026, 9, 2, 22, 30), "base_cost": Decimal("150.00")},
    {"schedule_id": "sch_105b", "source_node_id": "node_MNL_BUS", "dest_node_id": "node_OLD_MNL", "provider": "Manali Night Shuttle", "departure_time": datetime(2026, 9, 2, 22, 45), "arrival_time": datetime(2026, 9, 2, 23, 0), "base_cost": Decimal("150.00")},
    {"schedule_id": "sch_100", "source_node_id": "node_SLI", "dest_node_id": "node_PUNE", "provider": "MSRTC Shivneri Express (Bus)", "departure_time": datetime(2026, 9, 1, 8, 0), "arrival_time": datetime(2026, 9, 1, 13, 0), "base_cost": Decimal("350.00")},
    {"schedule_id": "sch_106", "source_node_id": "node_PUNE", "dest_node_id": "node_DEL", "provider": "Jhelum Express (Train)", "departure_time": datetime(2026, 9, 1, 15, 0), "arrival_time": datetime(2026, 9, 2, 18, 0), "base_cost": Decimal("600.00")},
    {"schedule_id": "sch_107", "source_node_id": "node_DEL", "dest_node_id": "node_DEL_BUS", "provider": "Delhi Metro Evening", "departure_time": datetime(2026, 9, 2, 19, 0), "arrival_time": datetime(2026, 9, 2, 19, 30), "base_cost": Decimal("40.00")},
    {"schedule_id": "sch_108", "source_node_id": "node_DEL_BUS", "dest_node_id": "node_MNL_BUS", "provider": "Himalayan Travels Night AC", "departure_time": datetime(2026, 9, 2, 21, 0), "arrival_time": datetime(2026, 9, 3, 9, 0), "base_cost": Decimal("1100.00")},
    {"schedule_id": "sch_109", "source_node_id": "node_MNL_BUS", "dest_node_id": "node_OLD_MNL", "provider": "Local Shared Shuttle", "departure_time": datetime(2026, 9, 3, 9, 30), "arrival_time": datetime(2026, 9, 3, 9, 45), "base_cost": Decimal("100.00")},
    {"schedule_id": "sch_110", "source_node_id": "node_SLI", "dest_node_id": "node_MUM", "provider": "Mahalaxmi Express (Train)", "departure_time": datetime(2026, 9, 1, 21, 0), "arrival_time": datetime(2026, 9, 2, 7, 0), "base_cost": Decimal("450.00")},
    {"schedule_id": "sch_111", "source_node_id": "node_MUM", "dest_node_id": "node_DEL", "provider": "Rajdhani Express (Premium Train)", "departure_time": datetime(2026, 9, 2, 16, 0), "arrival_time": datetime(2026, 9, 3, 8, 30), "base_cost": Decimal("1800.00")},
    {"schedule_id": "sch_112", "source_node_id": "node_DEL", "dest_node_id": "node_IXC", "provider": "Vande Bharat Express (Train)", "departure_time": datetime(2026, 9, 3, 10, 0), "arrival_time": datetime(2026, 9, 3, 13, 15), "base_cost": Decimal("850.00")},
    {"schedule_id": "sch_113", "source_node_id": "node_IXC", "dest_node_id": "node_MNL_BUS", "provider": "HRTC Himmani Deluxe", "departure_time": datetime(2026, 9, 3, 15, 0), "arrival_time": datetime(2026, 9, 3, 23, 0), "base_cost": Decimal("800.00")},
    {"schedule_id": "sch_114", "source_node_id": "node_MNL_BUS", "dest_node_id": "node_OLD_MNL", "provider": "Night Cab Service", "departure_time": datetime(2026, 9, 3, 23, 15), "arrival_time": datetime(2026, 9, 3, 23, 30), "base_cost": Decimal("150.00")},
    {"schedule_id": "sch_115", "source_node_id": "node_DEL", "dest_node_id": "node_DEL_BUS", "provider": "Delayed Metro", "departure_time": datetime(2026, 9, 2, 9, 15), "arrival_time": datetime(2026, 9, 2, 9, 45), "base_cost": Decimal("40.00")},
    {"schedule_id": "sch_116", "source_node_id": "node_DEL_BUS", "dest_node_id": "node_MNL_BUS", "provider": "Early Morning Bus", "departure_time": datetime(2026, 9, 2, 7, 15), "arrival_time": datetime(2026, 9, 2, 19, 15), "base_cost": Decimal("1050.00")}
]


def load_json_file(filename: str) -> Any:
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Required demo dataset file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_data() -> Dict[str, int]:
    """
    Executes idempotent seeding.
    Returns counts of all seeded items.
    """
    session = SessionLocal()
    counts = {
        "destinations": 0,
        "attractions": 0,
        "food_places": 0,
        "hotels": 0,
        "nodes": 0,
        "nodes_added": 0,
        "schedules": 0,
        "schedules_added": 0,
        "stories": 0,
        "demo_user": 0
    }

    try:
        # 1. Admin Verification / Creation (Environment-driven bootstrap only)
        admin = session.get(Admin, DEFAULT_ADMIN_ID)
        admin_user = session.get(User, DEFAULT_ADMIN_ID)

        # Bootstrap credential comes ONLY from environment and is permitted only in DEV/TEST/demo
        is_dev_or_test = settings.is_development or settings.is_testing or settings.NAVIX_DATA_MODE == "demo"
        demo_admin_pw = os.getenv("NAVIX_DEMO_ADMIN_PASSWORD") or settings.NAVIX_DEMO_ADMIN_PASSWORD

        if is_dev_or_test and demo_admin_pw:
            pw_hash = hash_password(demo_admin_pw)
            if not admin_user:
                admin_user = User(
                    user_id=DEFAULT_ADMIN_ID,
                    name="System Admin",
                    email="admin@navix.com",
                    role="admin",
                    password_hash=pw_hash
                )
                session.add(admin_user)
                session.flush()
            else:
                # Synchronize existing admin password hash with environment without logging
                admin_user.password_hash = pw_hash
                session.flush()

        if admin_user and not admin:
            admin = Admin(admin_id=DEFAULT_ADMIN_ID)
            session.add(admin)
            session.flush()

        # 2. Presentation User (demo@navix.com / DemoExplorer2026!)
        demo_user = session.scalar(select(User).where(User.email == DEMO_USER_EMAIL))
        if not demo_user:
            demo_user = User(
                user_id=DEMO_USER_ID,
                name="Demo Explorer",
                email=DEMO_USER_EMAIL,
                role="traveler",
                password_hash=hash_password(DEMO_USER_PASSWORD)
            )
            session.add(demo_user)
            session.flush()

            demo_traveler = session.get(Traveler, demo_user.user_id)
            if not demo_traveler:
                demo_traveler = Traveler(traveler_id=demo_user.user_id, preferences="Balanced, Heritage, Nature")
                session.add(demo_traveler)
            counts["demo_user"] = 1
        else:
            # Ensure traveler record exists
            if not session.get(Traveler, demo_user.user_id):
                demo_traveler = Traveler(traveler_id=demo_user.user_id, preferences="Balanced, Heritage, Nature")
                session.add(demo_traveler)

        session.commit()

        # 3. Seed Destinations
        dest_data = load_json_file("destinations.json")
        for item in dest_data:
            existing = session.get(DemoDestination, item["id"])
            if not existing:
                dest = DemoDestination(
                    id=item["id"],
                    slug=item["slug"],
                    name=item["name"],
                    city=item["city"],
                    state=item["state"],
                    country=item.get("country", "India"),
                    latitude=float(item["latitude"]),
                    longitude=float(item["longitude"]),
                    categories=item["categories"],
                    description=item["description"],
                    ideal_duration=item.get("ideal_duration", "3-4 Days"),
                    best_season=item.get("best_season", "October to March"),
                    daily_budget=float(item.get("daily_budget") or item.get("average_daily_budget", 2500)),
                    hero_image=item["hero_image"],
                    rating=float(item.get("popularity_rating") or item.get("rating", 4.7)),
                    popularity_score=float(item.get("popularity_score", 85.0)),
                    data_state=item.get("data_state", "DEMO_SEED"),
                    price_state=item.get("price_state", "DEMO_ESTIMATE")
                )
                session.add(dest)
                counts["destinations"] += 1
        session.commit()

        # 4. Seed Attractions
        attr_data = load_json_file("attractions.json")
        for item in attr_data:
            existing = session.get(DemoAttraction, item["id"])
            if not existing:
                attr = DemoAttraction(
                    id=item["id"],
                    destination_id=item["destination_id"],
                    destination_slug=item["destination_slug"],
                    name=item["name"],
                    category=item["category"],
                    latitude=float(item["latitude"]),
                    longitude=float(item["longitude"]),
                    rating=float(item["rating"]),
                    visit_duration_minutes=int(item["visit_duration_minutes"]),
                    entry_fee=float(item.get("demo_entry_fee") or item.get("entry_fee", 0.0)),
                    opening_time=item.get("opening_time", "09:00"),
                    closing_time=item.get("closing_time", "18:00"),
                    description=item["description"],
                    image=item["image"],
                    recommended_score=float(item.get("recommended_score", 80.0)),
                    data_state=item.get("data_state", "DEMO_SEED"),
                    price_state=item.get("price_state", "DEMO_ESTIMATE")
                )
                session.add(attr)
                counts["attractions"] += 1
            else:
                existing.name = item["name"]
                existing.category = item["category"]
                existing.description = item["description"]
                existing.latitude = float(item["latitude"])
                existing.longitude = float(item["longitude"])
                existing.entry_fee = float(item.get("demo_entry_fee") or item.get("entry_fee", 0.0))
                existing.visit_duration_minutes = int(item.get("visit_duration_minutes", 90))
                existing.opening_time = item.get("opening_time", "09:00")
                existing.closing_time = item.get("closing_time", "18:00")
                existing.image = item["image"]
                existing.rating = float(item["rating"])
                existing.recommended_score = float(item.get("recommended_score", 80.0))
                existing.data_state = item.get("data_state", "DEMO_SEED")
                existing.price_state = item.get("price_state", "DEMO_ESTIMATE")
        session.commit()

        # 5. Seed Food Places
        food_data = load_json_file("food.json")
        for item in food_data:
            existing = session.get(DemoFoodPlace, item["id"])
            if not existing:
                fp = DemoFoodPlace(
                    id=item["id"],
                    destination_id=item["destination_id"],
                    destination_slug=item["destination_slug"],
                    name=item["name"],
                    cuisine=item["cuisine"],
                    dietary=item.get("dietary") or item.get("food_type", "both"),
                    rating=float(item["rating"]),
                    cost_for_two=float(item.get("demo_cost_for_two") or item.get("cost_for_two", 400.0)),
                    opening_hours=item.get("opening_hours", "11:00 - 23:00"),
                    latitude=float(item["latitude"]),
                    longitude=float(item["longitude"]),
                    speciality=item["speciality"],
                    image=item["image"],
                    data_state=item.get("data_state", "DEMO_SEED"),
                    price_state=item.get("price_state", "DEMO_ESTIMATE")
                )
                session.add(fp)
                counts["food_places"] += 1
            else:
                existing.name = item["name"]
                existing.cuisine = item["cuisine"]
                existing.speciality = item["speciality"]
                existing.dietary = item.get("dietary") or item.get("food_type", "both")
                existing.cost_for_two = float(item.get("demo_cost_for_two") or item.get("cost_for_two", 400.0))
                existing.opening_hours = item.get("opening_hours", "11:00 - 23:00")
                existing.latitude = float(item["latitude"])
                existing.longitude = float(item["longitude"])
                existing.image = item["image"]
                existing.rating = float(item["rating"])
                existing.data_state = item.get("data_state", "DEMO_SEED")
                existing.price_state = item.get("price_state", "DEMO_ESTIMATE")
        session.commit()

        # 6. Seed Hotels / Stays
        hotel_data = load_json_file("hotels.json")
        for item in hotel_data:
            existing = session.get(DemoHotel, item["id"])
            if not existing:
                ht = DemoHotel(
                    id=item["id"],
                    destination_id=item["destination_id"],
                    destination_slug=item["destination_slug"],
                    name=item["name"],
                    category=item.get("tier") or item.get("category", "Standard"),
                    price_per_night=float(item.get("demo_price_per_night") or item.get("price_per_night", 1500.0)),
                    rating=float(item["rating"]),
                    room_type=item["room_type"],
                    amenities=item["amenities"],
                    latitude=float(item["latitude"]),
                    longitude=float(item["longitude"]),
                    image=item["image"],
                    availability=True,
                    data_state=item.get("data_state", "DEMO_SEED"),
                    price_state=item.get("price_state", "DEMO_ESTIMATE")
                )
                session.add(ht)
                counts["hotels"] += 1
            else:
                existing.name = item["name"]
                existing.category = item.get("tier") or item.get("category", "Standard")
                existing.price_per_night = float(item.get("demo_price_per_night") or item.get("price_per_night", 1500.0))
                existing.room_type = item.get("room_type", "Standard Room")
                existing.amenities = item.get("amenities", [])
                existing.latitude = float(item["latitude"])
                existing.longitude = float(item["longitude"])
                existing.image = item["image"]
                existing.rating = float(item["rating"])
                existing.availability = item.get("availability", True)
                existing.data_state = item.get("data_state", "DEMO_SEED")
                existing.price_state = item.get("price_state", "DEMO_ESTIMATE")
        session.commit()

        # 7. Seed Transit Nodes (Legacy + National Demo Graph)
        all_nodes = list(LEGACY_NODES)
        network_data = load_json_file("transport_network.json")
        all_nodes.extend(network_data.get("nodes", []))

        for n_data in all_nodes:
            existing = session.get(TransitNode, n_data["node_id"])
            if not existing:
                node = TransitNode(
                    node_id=n_data["node_id"],
                    node_name=n_data["node_name"],
                    city=n_data["city"],
                    latitude=n_data["latitude"],
                    longitude=n_data["longitude"]
                )
                session.add(node)
                counts["nodes"] += 1
                counts["nodes_added"] += 1
        session.commit()

        # 8. Seed Transit Schedules (Legacy + National Demo Graph)
        all_schedules = list(LEGACY_SCHEDULES)
        for s in network_data.get("schedules", []):
            dep_time = datetime.fromisoformat(s["departure_time"]) if isinstance(s["departure_time"], str) else s["departure_time"]
            arr_time = datetime.fromisoformat(s["arrival_time"]) if isinstance(s["arrival_time"], str) else s["arrival_time"]
            all_schedules.append({
                "schedule_id": s["schedule_id"],
                "source_node_id": s["source_node_id"],
                "dest_node_id": s["dest_node_id"],
                "provider": s["provider"],
                "departure_time": dep_time,
                "arrival_time": arr_time,
                "base_cost": Decimal(str(s["base_cost"]))
            })

        for s_data in all_schedules:
            existing = session.get(TransitSchedule, s_data["schedule_id"])
            if not existing:
                # Validate source and destination exist in TransitNodes
                if session.get(TransitNode, s_data["source_node_id"]) and session.get(TransitNode, s_data["dest_node_id"]):
                    schedule = TransitSchedule(
                        admin_id=DEFAULT_ADMIN_ID,
                        schedule_id=s_data["schedule_id"],
                        source_node_id=s_data["source_node_id"],
                        dest_node_id=s_data["dest_node_id"],
                        provider=s_data["provider"],
                        departure_time=s_data["departure_time"],
                        arrival_time=s_data["arrival_time"],
                        base_cost=s_data["base_cost"]
                    )
                    session.add(schedule)
                    counts["schedules"] += 1
                    counts["schedules_added"] += 1
        session.commit()

        # 9. Seed Stories
        story_data = load_json_file("stories.json")
        for item in story_data:
            existing = session.get(DemoStory, item["id"])
            if not existing:
                story = DemoStory(
                    id=item["id"],
                    slug=item["slug"],
                    title=item["title"],
                    destination_slug=item.get("destination_slug") or item.get("destination", "").lower().replace(" ", "-"),
                    destination_name=item.get("destination") or item.get("destination_name", "India"),
                    category=item.get("category", "Guides"),
                    summary=item["summary"],
                    body=item["body"],
                    author=item.get("author", "NAVIX Curators"),
                    read_time=item.get("read_time", "5 min read"),
                    hero_image=item.get("cover_image") or item.get("hero_image", ""),
                    data_state=item.get("data_state", "DEMO_SEED")
                )
                session.add(story)
                counts["stories"] += 1
            else:
                existing.title = item["title"]
                existing.slug = item["slug"]
                existing.destination_slug = item.get("destination_slug") or item.get("destination", "").lower().replace(" ", "-")
                existing.destination_name = item.get("destination") or item.get("destination_name", existing.destination_name)
                existing.category = item.get("category", existing.category)
                existing.summary = item["summary"]
                existing.body = item["body"]
                existing.author = item.get("author", existing.author)
                existing.read_time = item.get("read_time", existing.read_time)
                existing.hero_image = item.get("cover_image") or item.get("hero_image", existing.hero_image)
        session.commit()

        return counts

    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


def get_catalog_counts() -> Dict[str, int]:
    """Returns total counts of all catalog entities in the database."""
    session = SessionLocal()
    try:
        from sqlalchemy import func
        return {
            "destinations": session.scalar(select(func.count()).select_from(DemoDestination)) or 0,
            "attractions": session.scalar(select(func.count()).select_from(DemoAttraction)) or 0,
            "food_places": session.scalar(select(func.count()).select_from(DemoFoodPlace)) or 0,
            "hotels": session.scalar(select(func.count()).select_from(DemoHotel)) or 0,
            "nodes": session.scalar(select(func.count()).select_from(TransitNode)) or 0,
            "schedules": session.scalar(select(func.count()).select_from(TransitSchedule)) or 0,
            "stories": session.scalar(select(func.count()).select_from(DemoStory)) or 0,
        }
    finally:
        session.close()


if __name__ == "__main__":
    result = seed_data()
    print("=== NAVIX DEMO SEEDING COMPLETE ===")
    print(f"Newly Added Records: {result}")
    totals = get_catalog_counts()
    print(f"Total Database Counts: {totals}")
