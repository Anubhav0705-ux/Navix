"""
Deterministic & Idempotent Demo Data Seeder for NAVIX.
Seeds transit nodes and multi-modal schedules representing Sangli -> Old Manali options.
DO NOT MUTATE OR DELETE PRE-EXISTING DATA.
"""
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, List

from sqlalchemy import select
from app.database.session import SessionLocal
from app.models import TransitNode, TransitSchedule, Admin

DEFAULT_ADMIN_ID = "usr_02"  # Existing admin user in DB

DEMO_NODES = [
    {
        "node_id": "node_SLI",
        "node_name": "Sangli Station",
        "city": "Sangli",
        "latitude": 16.8524,
        "longitude": 74.5815
    },
    {
        "node_id": "node_PUNE",
        "node_name": "Pune Central",
        "city": "Pune",
        "latitude": 18.5204,
        "longitude": 73.8567
    },
    {
        "node_id": "node_MRJ",
        "node_name": "Miraj Junction",
        "city": "Miraj",
        "latitude": 16.8202,
        "longitude": 74.6468
    },
    {
        "node_id": "node_MUM",
        "node_name": "Mumbai CSMT",
        "city": "Mumbai",
        "latitude": 18.9400,
        "longitude": 72.8354
    },
    {
        "node_id": "node_DEL",
        "node_name": "New Delhi Railway Station",
        "city": "Delhi",
        "latitude": 28.6430,
        "longitude": 77.2194
    },
    {
        "node_id": "node_DEL_BUS",
        "node_name": "Kashmiri Gate ISBT",
        "city": "Delhi",
        "latitude": 28.6675,
        "longitude": 77.2285
    },
    {
        "node_id": "node_IXC",
        "node_name": "Chandigarh Junction",
        "city": "Chandigarh",
        "latitude": 30.7046,
        "longitude": 76.8013
    },
    {
        "node_id": "node_MNL_BUS",
        "node_name": "Manali ISBT Bus Stand",
        "city": "Manali",
        "latitude": 32.2396,
        "longitude": 77.1887
    },
    {
        "node_id": "node_OLD_MNL",
        "node_name": "Old Manali Hub",
        "city": "Old Manali",
        "latitude": 32.2548,
        "longitude": 77.1751
    }
]

DEMO_SCHEDULES = [
    # --- Option A: Sangli -> Miraj -> Delhi -> Manali -> Old Manali (Balanced) ---
    {
        "schedule_id": "sch_101",
        "source_node_id": "node_SLI",
        "dest_node_id": "node_MRJ",
        "provider": "Sangli Local Auto",
        "departure_time": datetime(2026, 9, 1, 6, 0),
        "arrival_time": datetime(2026, 9, 1, 6, 30),
        "base_cost": Decimal("50.00")
    },
    {
        "schedule_id": "sch_102",
        "source_node_id": "node_MRJ",
        "dest_node_id": "node_DEL",
        "provider": "Goa Express (Train)",
        "departure_time": datetime(2026, 9, 1, 7, 30),
        "arrival_time": datetime(2026, 9, 2, 6, 30),
        "base_cost": Decimal("750.00")
    },
    {
        "schedule_id": "sch_103",
        "source_node_id": "node_DEL",
        "dest_node_id": "node_DEL_BUS",
        "provider": "Delhi Metro Yellow Line",
        "departure_time": datetime(2026, 9, 2, 7, 30),
        "arrival_time": datetime(2026, 9, 2, 8, 0),
        "base_cost": Decimal("40.00")
    },
    {
        "schedule_id": "sch_104",
        "source_node_id": "node_DEL_BUS",
        "dest_node_id": "node_MNL_BUS",
        "provider": "HRTC Volvo Bus (Day)",
        "departure_time": datetime(2026, 9, 2, 10, 0),
        "arrival_time": datetime(2026, 9, 2, 22, 0),
        "base_cost": Decimal("1200.00")
    },
    {
        "schedule_id": "sch_105",
        "source_node_id": "node_MNL_BUS",
        "dest_node_id": "node_OLD_MNL",
        "provider": "Manali Express Auto Shuttle",
        "departure_time": datetime(2026, 9, 2, 22, 15),
        "arrival_time": datetime(2026, 9, 2, 22, 30),
        "base_cost": Decimal("150.00")
    },
    {
        "schedule_id": "sch_105b",
        "source_node_id": "node_MNL_BUS",
        "dest_node_id": "node_OLD_MNL",
        "provider": "Manali Night Shuttle",
        "departure_time": datetime(2026, 9, 2, 22, 45),
        "arrival_time": datetime(2026, 9, 2, 23, 0),
        "base_cost": Decimal("150.00")
    },

    # --- Option B: Sangli -> Pune -> Delhi -> Manali -> Old Manali (Cheaper / Slower) ---
    # Note: sch_100 (node_SLI -> node_PUNE) already exists in DB
    {
        "schedule_id": "sch_106",
        "source_node_id": "node_PUNE",
        "dest_node_id": "node_DEL",
        "provider": "Jhelum Express (Train)",
        "departure_time": datetime(2026, 9, 1, 15, 0),
        "arrival_time": datetime(2026, 9, 2, 18, 0),
        "base_cost": Decimal("600.00")
    },
    {
        "schedule_id": "sch_107",
        "source_node_id": "node_DEL",
        "dest_node_id": "node_DEL_BUS",
        "provider": "Delhi Metro Evening",
        "departure_time": datetime(2026, 9, 2, 19, 0),
        "arrival_time": datetime(2026, 9, 2, 19, 30),
        "base_cost": Decimal("40.00")
    },
    {
        "schedule_id": "sch_108",
        "source_node_id": "node_DEL_BUS",
        "dest_node_id": "node_MNL_BUS",
        "provider": "Himalayan Travels Night AC",
        "departure_time": datetime(2026, 9, 2, 21, 0),
        "arrival_time": datetime(2026, 9, 3, 9, 0),
        "base_cost": Decimal("1100.00")
    },
    {
        "schedule_id": "sch_109",
        "source_node_id": "node_MNL_BUS",
        "dest_node_id": "node_OLD_MNL",
        "provider": "Local Shared Shuttle",
        "departure_time": datetime(2026, 9, 3, 9, 30),
        "arrival_time": datetime(2026, 9, 3, 9, 45),
        "base_cost": Decimal("100.00")
    },

    # --- Option C: Sangli -> Mumbai -> Delhi -> Chandigarh -> Manali -> Old Manali (Faster / Premium) ---
    {
        "schedule_id": "sch_110",
        "source_node_id": "node_SLI",
        "dest_node_id": "node_MUM",
        "provider": "Mahalaxmi Express (Train)",
        "departure_time": datetime(2026, 9, 1, 21, 0),
        "arrival_time": datetime(2026, 9, 2, 7, 0),
        "base_cost": Decimal("450.00")
    },
    {
        "schedule_id": "sch_111",
        "source_node_id": "node_MUM",
        "dest_node_id": "node_DEL",
        "provider": "Rajdhani Express (Premium Train)",
        "departure_time": datetime(2026, 9, 2, 16, 0),
        "arrival_time": datetime(2026, 9, 3, 8, 30),
        "base_cost": Decimal("1800.00")
    },
    {
        "schedule_id": "sch_112",
        "source_node_id": "node_DEL",
        "dest_node_id": "node_IXC",
        "provider": "Vande Bharat Express (Train)",
        "departure_time": datetime(2026, 9, 3, 10, 0),
        "arrival_time": datetime(2026, 9, 3, 13, 15),
        "base_cost": Decimal("850.00")
    },
    {
        "schedule_id": "sch_113",
        "source_node_id": "node_IXC",
        "dest_node_id": "node_MNL_BUS",
        "provider": "HRTC Himmani Deluxe",
        "departure_time": datetime(2026, 9, 3, 15, 0),
        "arrival_time": datetime(2026, 9, 3, 23, 0),
        "base_cost": Decimal("800.00")
    },
    {
        "schedule_id": "sch_114",
        "source_node_id": "node_MNL_BUS",
        "dest_node_id": "node_OLD_MNL",
        "provider": "Night Cab Service",
        "departure_time": datetime(2026, 9, 3, 23, 15),
        "arrival_time": datetime(2026, 9, 3, 23, 30),
        "base_cost": Decimal("150.00")
    },

    # --- Edge Cases for Layover Validation Testing ---
    {
        "schedule_id": "sch_115",
        "source_node_id": "node_DEL",
        "dest_node_id": "node_DEL_BUS",
        "provider": "Delayed Metro",
        "departure_time": datetime(2026, 9, 2, 9, 15),
        "arrival_time": datetime(2026, 9, 2, 9, 45),
        "base_cost": Decimal("40.00")
    },  # Arrives 09:45, sch_104 departs 10:00 -> 15 min layover (TIGHT)

    {
        "schedule_id": "sch_116",
        "source_node_id": "node_DEL_BUS",
        "dest_node_id": "node_MNL_BUS",
        "provider": "Early Morning Bus",
        "departure_time": datetime(2026, 9, 2, 7, 15),
        "arrival_time": datetime(2026, 9, 2, 19, 15),
        "base_cost": Decimal("1050.00")
    }   # Departs 07:15, sch_103 arrives 08:00 -> Departs BEFORE arrival (INVALID)
]


def seed_data() -> Dict[str, int]:
    """
    Executes idempotent seeding. Returns count of newly inserted nodes & schedules.
    """
    session = SessionLocal()
    nodes_added = 0
    schedules_added = 0

    try:
        # 1. Verify Admin User exists
        admin = session.get(Admin, DEFAULT_ADMIN_ID)
        if not admin:
            raise RuntimeError(f"Admin ID '{DEFAULT_ADMIN_ID}' not found in database. Cannot associate schedules.")

        # 2. Seed Nodes
        for n_data in DEMO_NODES:
            existing = session.get(TransitNode, n_data["node_id"])
            if not existing:
                node = TransitNode(**n_data)
                session.add(node)
                nodes_added += 1

        session.commit()

        # 3. Seed Schedules
        for s_data in DEMO_SCHEDULES:
            existing = session.get(TransitSchedule, s_data["schedule_id"])
            if not existing:
                schedule = TransitSchedule(
                    admin_id=DEFAULT_ADMIN_ID,
                    **s_data
                )
                session.add(schedule)
                schedules_added += 1

        session.commit()
        return {"nodes_added": nodes_added, "schedules_added": schedules_added}

    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


if __name__ == "__main__":
    result = seed_data()
    print(f"Seeding Complete: Nodes added = {result['nodes_added']}, Schedules added = {result['schedules_added']}")
