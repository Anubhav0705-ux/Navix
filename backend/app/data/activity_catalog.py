from decimal import Decimal
from typing import Dict, Any, List

# Deterministic Activity Catalog with realistic time windows, locations & duration
SCHEDULABLE_ACTIVITIES: Dict[str, Dict[str, Any]] = {
    "act_01": {
        "id": "act_01",
        "name": "Old Manali Village & Temple Walk",
        "category": "Culture",
        "cost": Decimal("0.00"),
        "duration_minutes": 90,
        "latitude": 32.2550,
        "longitude": 77.1740,
        "preferred_window": "MORNING",
        "minimum_visit_minutes": 60,
        "location": "Old Manali Village",
        "description": "Free self-guided heritage walk through Manu Temple and Old Manali streets."
    },
    "act_02": {
        "id": "act_02",
        "name": "Hadimba Temple & Van Vihar Deodar Park",
        "category": "Culture",
        "cost": Decimal("100.00"),
        "duration_minutes": 120,
        "latitude": 32.2483,
        "longitude": 77.1802,
        "preferred_window": "MORNING",
        "minimum_visit_minutes": 90,
        "location": "Dungri Forest, Manali",
        "description": "16th-century wooden pagoda temple surrounded by towering ancient cedar forest trees."
    },
    "act_03": {
        "id": "act_03",
        "name": "Jogini Waterfall Scenic Trek",
        "category": "Adventure",
        "cost": Decimal("300.00"),
        "duration_minutes": 180,
        "latitude": 32.2625,
        "longitude": 77.1950,
        "preferred_window": "MORNING",
        "minimum_visit_minutes": 120,
        "location": "Vashisht Village Trail",
        "description": "Guided half-day scenic trek to Jogini Waterfalls with hot tea."
    },
    "act_04": {
        "id": "act_04",
        "name": "Solang Valley Snow Point & Cable Car",
        "category": "Adventure",
        "cost": Decimal("1000.00"),
        "duration_minutes": 300,
        "latitude": 32.3167,
        "longitude": 77.1500,
        "preferred_window": "DAYTIME",
        "minimum_visit_minutes": 180,
        "location": "Solang Valley",
        "description": "Round-trip shuttle to Solang Valley with ropeway cable car pass."
    },
    "disc_05": {
        "id": "disc_05",
        "name": "Vashisht Hot Water Springs & Himalayan Temple",
        "category": "Wellness",
        "cost": Decimal("0.00"),
        "duration_minutes": 90,
        "latitude": 32.2611,
        "longitude": 77.1889,
        "preferred_window": "MORNING",
        "minimum_visit_minutes": 60,
        "location": "Vashisht Village",
        "description": "Natural thermal sulphur springs with dedicated stone bathing tanks."
    },
    "disc_06": {
        "id": "disc_06",
        "name": "Naggar Castle & Roerich Heritage Art Gallery",
        "category": "Heritage",
        "cost": Decimal("50.00"),
        "duration_minutes": 180,
        "latitude": 32.1147,
        "longitude": 77.1717,
        "preferred_window": "AFTERNOON",
        "minimum_visit_minutes": 120,
        "location": "Naggar Town",
        "description": "15th-century wood-and-stone Kullu kingdom castle overlooking Beas river valley."
    },
    "disc_07": {
        "id": "disc_07",
        "name": "Mall Road Evening Walk & Souvenir Market",
        "category": "Culture",
        "cost": Decimal("0.00"),
        "duration_minutes": 120,
        "latitude": 32.2396,
        "longitude": 77.1887,
        "preferred_window": "EVENING",
        "minimum_visit_minutes": 60,
        "location": "Central Manali",
        "description": "Vibrant pedestrian street with Kullu shawls, handicrafts, and local snacks."
    },
    "disc_08": {
        "id": "disc_08",
        "name": "Gulaba Alpine Meadow Viewpoint",
        "category": "Nature",
        "cost": Decimal("0.00"),
        "duration_minutes": 180,
        "latitude": 32.3200,
        "longitude": 77.2000,
        "preferred_window": "DAYTIME",
        "minimum_visit_minutes": 120,
        "location": "Rohtang Highway",
        "description": "Breathtaking high-altitude grassy meadows surrounded by snow peaks."
    }
}


def get_activity_by_id(act_id: str) -> Dict[str, Any]:
    """Retrieves activity definition from catalog by ID or returns fallback."""
    if act_id in SCHEDULABLE_ACTIVITIES:
        return dict(SCHEDULABLE_ACTIVITIES[act_id])

    # Check database DemoAttraction
    try:
        from app.database.session import SessionLocal
        from app.models.demo_catalog import DemoAttraction
        s = SessionLocal()
        db_attr = s.get(DemoAttraction, act_id)
        if not db_attr and not act_id.startswith("act_"):
            db_attr = s.query(DemoAttraction).filter(DemoAttraction.name.ilike(f"%{act_id}%")).first()
        if db_attr:
            res = {
                "id": db_attr.id,
                "name": db_attr.name,
                "category": db_attr.category,
                "cost": Decimal(str(db_attr.entry_fee)),
                "duration_minutes": db_attr.visit_duration_minutes,
                "latitude": db_attr.latitude,
                "longitude": db_attr.longitude,
                "preferred_window": "MORNING" if any(w in db_attr.name.lower() for w in ["temple", "fort", "sunrise", "ghat", "palace"]) else "DAYTIME",
                "minimum_visit_minutes": max(45, db_attr.visit_duration_minutes // 2),
                "location": db_attr.name,
                "description": db_attr.description
            }
            s.close()
            return res
        s.close()
    except Exception:
        pass
    
    # Check for name/partial match or return default
    for act in SCHEDULABLE_ACTIVITIES.values():
        if act["id"].lower() == act_id.lower() or act["name"].lower() in act_id.lower():
            return dict(act)
            
    return {
        "id": act_id,
        "name": f"Selected Activity ({act_id})",
        "category": "Sightseeing",
        "cost": Decimal("100.00"),
        "duration_minutes": 90,
        "latitude": 20.5937,
        "longitude": 78.9629,
        "preferred_window": "DAYTIME",
        "minimum_visit_minutes": 60,
        "location": "Local Attraction",
        "description": "Custom selected activity experience."
    }
