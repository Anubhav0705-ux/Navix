import math
from decimal import Decimal
from typing import Tuple
from app.algorithms.types import OptimizationProfile
from app.algorithms.graph import GraphNode

PROFILE_WEIGHTS = {
    OptimizationProfile.CHEAPEST: {"w_cost": 0.70, "w_dur": 0.20, "w_tx": 0.10},
    OptimizationProfile.BALANCED: {"w_cost": 0.40, "w_dur": 0.40, "w_tx": 0.20},
    OptimizationProfile.FASTER:   {"w_cost": 0.15, "w_dur": 0.70, "w_tx": 0.15},
}

MAX_ASSUMED_VELOCITY_KMH = 150.0  # Optimistic top speed for admissible time heuristic
MIN_ASSUMED_COST_PER_KM = 0.30     # Optimistic min cost per km for admissible fare heuristic


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes straight-line Haversine distance in kilometers between two geographic coordinates.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def compute_step_score(
    cost: Decimal,
    duration_minutes: int,
    transfers: int,
    profile: OptimizationProfile
) -> float:
    """
    Computes an explainable normalized cost score based on optimization profile weights.
    cost_unit = ₹100, duration_unit = 60 mins.
    """
    w = PROFILE_WEIGHTS[profile]
    cost_val = float(cost) / 100.0
    dur_val = float(duration_minutes) / 60.0
    tx_val = float(transfers) * 2.0

    return (w["w_cost"] * cost_val) + (w["w_dur"] * dur_val) + (w["w_tx"] * tx_val)


def compute_heuristic_score(
    curr_node: GraphNode,
    target_node: GraphNode,
    profile: OptimizationProfile
) -> float:
    """
    Admissible A* heuristic estimating remaining score to target node based on Haversine distance.
    Guaranteed to under-estimate remaining effort, preserving A* optimality.
    """
    dist_km = haversine_distance_km(
        curr_node.latitude, curr_node.longitude,
        target_node.latitude, target_node.longitude
    )

    # Under-estimated remaining time & cost
    optimistic_time_mins = (dist_km / MAX_ASSUMED_VELOCITY_KMH) * 60.0
    optimistic_cost = Decimal(str(round(dist_km * MIN_ASSUMED_COST_PER_KM, 2)))

    return compute_step_score(
        cost=optimistic_cost,
        duration_minutes=int(optimistic_time_mins),
        transfers=0,
        profile=profile
    )
