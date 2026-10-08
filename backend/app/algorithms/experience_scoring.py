import math
from typing import Dict, Any, List, Optional
from app.schemas.trip_planner import PlannerPreferences


def calculate_haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Haversine distance in kilometers between two lat/lon coordinates."""
    r = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def estimate_local_travel_minutes(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    """Estimates local mountain travel time in minutes assuming 20 km/h average speed + 10 min buffer."""
    dist_km = calculate_haversine_distance_km(lat1, lon1, lat2, lon2)
    if dist_km < 0.1:
        return 0
    travel_hours = dist_km / 20.0
    minutes = int(round(travel_hours * 60.0)) + 10
    return max(10, min(120, minutes))


def compute_activity_utility(
    activity: Dict[str, Any],
    preferences: Optional[PlannerPreferences],
    scheduled_categories: List[str]
) -> float:
    """
    Computes deterministic experience utility score for a candidate activity.
    DO NOT USE AN LLM.
    """
    utility = 20.0  # Base activity score
    category = str(activity.get("category", "")).upper()
    name = str(activity.get("name", "")).lower()
    act_id = str(activity.get("id", ""))

    if not preferences:
        return utility

    # 1. Explicitly Selected by User / Must Include (+50 points)
    if act_id in preferences.selected_activity_ids or any(m.lower() in name for m in preferences.must_include):
        utility += 50.0

    # 2. Match with Trip Personalities (+25 points)
    for pers in preferences.trip_personalities or []:
        p_upper = pers.upper()
        if p_upper == category or (p_upper == "ADVENTURE" and category in ["ADVENTURE", "EXCURSION"]):
            utility += 25.0
        elif p_upper == "CULTURE" and category in ["CULTURE", "HERITAGE", "SIGHTSEEING"]:
            utility += 25.0
        elif p_upper == "NATURE" and category in ["NATURE", "WELLNESS"]:
            utility += 25.0

    # 3. Match with Must-Have Tag Preferences (+20 points)
    for tag in preferences.must_include or []:
        t_low = tag.lower()
        if t_low in name or t_low in category.lower() or t_low in str(activity.get("description", "")).lower():
            utility += 20.0

    # 4. Schedule Diversity Bonus (+5 points if category not repeated in current day)
    if category not in [c.upper() for c in scheduled_categories]:
        utility += 5.0

    # 5. Avoid Tag Penalties (-40 points)
    for avoid_tag in preferences.avoid or []:
        a_low = avoid_tag.lower()
        if "overnight" in a_low and "overnight" in name:
            utility -= 40.0
        elif "long walk" in a_low and ("trek" in name or "walk" in name):
            utility -= 40.0
        elif "early morning" in a_low and activity.get("preferred_window") == "MORNING":
            utility -= 25.0

    return max(1.0, utility)
