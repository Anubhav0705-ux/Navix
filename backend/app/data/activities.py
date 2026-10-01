from decimal import Decimal
from typing import List, Dict, Any

ACTIVITY_OPTIONS: List[Dict[str, Any]] = [
    {
        "id": "act_01",
        "name": "Old Manali Village & Temple Walk",
        "category": "Sightseeing",
        "cost": Decimal("0.00"),
        "description": "Free self-guided heritage walk through Manu Temple and Old Manali streets."
    },
    {
        "id": "act_02",
        "name": "Hadimba Temple & Van Vihar Park",
        "category": "Culture",
        "cost": Decimal("100.00"),
        "description": "Entry fees for Hadimba Devi Temple and Deodar forest park stroll."
    },
    {
        "id": "act_03",
        "name": "Jogini Waterfall Trek",
        "category": "Adventure",
        "cost": Decimal("300.00"),
        "description": "Guided half-day scenic trek to Jogini Waterfalls with hot tea."
    },
    {
        "id": "act_04",
        "name": "Solang Valley Snow Point Shuttle & Cable Car",
        "category": "Excursion",
        "cost": Decimal("1000.00"),
        "description": "Round-trip shuttle to Solang Valley with ropeway cable car pass."
    }
]
