from decimal import Decimal
from typing import List, Dict, Any

ACCOMMODATION_TIERS: List[Dict[str, Any]] = [
    {
        "tier": "Budget",
        "name": "Old Manali Backpacker Hostel / Homestay",
        "cost_per_night": Decimal("500.00"),
        "description": "Shared dorm or simple private room with basic amenities in Old Manali."
    },
    {
        "tier": "Standard",
        "name": "Manali Riverside Guest House",
        "cost_per_night": Decimal("1500.00"),
        "description": "Clean private room with attached bathroom, Wi-Fi, and river view."
    },
    {
        "tier": "Comfort",
        "name": "Himalayan Boutique Heritage Hotel",
        "cost_per_night": Decimal("3000.00"),
        "description": "Premium heated room with breakfast included, balcony view, and room service."
    }
]
