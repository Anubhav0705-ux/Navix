from decimal import Decimal
from typing import List, Dict, Any

FOOD_TIERS: List[Dict[str, Any]] = [
    {
        "tier": "Basic",
        "name": "Local Dhabas & Street Food",
        "cost_per_day": Decimal("300.00"),
        "description": "Essential meals at local dhabas (Thali, Maggi, Tea, Parathas)."
    },
    {
        "tier": "Balanced",
        "name": "Mid-range Cafes & Family Restaurants",
        "cost_per_day": Decimal("700.00"),
        "description": "Comfortable dining at popular Old Manali cafes (Italian, Israeli, Himachali)."
    },
    {
        "tier": "Flexible",
        "name": "Gourmet Cafes & Specialty Dining",
        "cost_per_day": Decimal("1200.00"),
        "description": "Multi-course meals, artisanal coffee, and wood-fired pizzas."
    }
]
