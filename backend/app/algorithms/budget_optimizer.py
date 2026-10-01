from decimal import Decimal
from typing import List, Dict, Any, Tuple, Optional
from itertools import combinations

from app.data import ACCOMMODATION_TIERS, FOOD_TIERS, ACTIVITY_OPTIONS
from app.schemas.trip_planner import (
    StayPreference, FoodPreference, ActivityPreference, BudgetStatus,
    SelectedStay, SelectedFood, SelectedActivity, CostBreakdown
)
from app.algorithms.routing import SearchError


def evaluate_stay_utility(tier_name: str, preference: StayPreference) -> float:
    """Returns preference utility score for stay tier."""
    pref_map = {
        StayPreference.BUDGET: "Budget",
        StayPreference.STANDARD: "Standard",
        StayPreference.COMFORT: "Comfort"
    }
    target = pref_map[preference]
    tiers = ["Budget", "Standard", "Comfort"]
    target_idx = tiers.index(target)
    actual_idx = tiers.index(tier_name)

    if actual_idx == target_idx:
        return 40.0
    elif actual_idx > target_idx:
        return 35.0  # Affordable upgrade
    else:
        # Downgrade penalty per level
        return 40.0 - (target_idx - actual_idx) * 15.0


def evaluate_food_utility(tier_name: str, preference: FoodPreference) -> float:
    """Returns preference utility score for food tier."""
    pref_map = {
        FoodPreference.BASIC: "Basic",
        FoodPreference.BALANCED: "Balanced",
        FoodPreference.FLEXIBLE: "Flexible"
    }
    target = pref_map[preference]
    tiers = ["Basic", "Balanced", "Flexible"]
    target_idx = tiers.index(target)
    actual_idx = tiers.index(tier_name)

    if actual_idx == target_idx:
        return 30.0
    elif actual_idx > target_idx:
        return 25.0  # Upgrade
    else:
        return 30.0 - (target_idx - actual_idx) * 12.0


def evaluate_activity_utility(selected_activities: List[Dict[str, Any]], preference: ActivityPreference) -> float:
    """Returns utility score for selected activities against preference."""
    count = len(selected_activities)
    base_score = sum([float(a["cost"]) / 100.0 + 5.0 for a in selected_activities])

    if preference == ActivityPreference.LOW:
        target_count = 1
    elif preference == ActivityPreference.MEDIUM:
        target_count = 2
    else:
        target_count = len(ACTIVITY_OPTIONS)

    count_diff = abs(count - target_count)
    pref_score = max(0.0, 25.0 - count_diff * 8.0)
    return base_score + pref_score


def optimize_trip_budget(
    maximum_budget: Decimal,
    transport_cost_per_person: Decimal,
    travellers: int,
    days: int,
    nights: int,
    stay_preference: StayPreference,
    food_preference: FoodPreference,
    activity_preference: ActivityPreference
) -> Tuple[SelectedStay, SelectedFood, List[SelectedActivity], CostBreakdown, List[str]]:
    """
    Constrained DP / Knapsack Optimizer for whole-trip budget allocation.
    Guarantees Total Trip Cost <= Maximum Budget.
    """
    total_transport_cost = transport_cost_per_person * Decimal(str(travellers))
    unavoidable_local_transport = Decimal("100.00") * Decimal(str(days)) * Decimal(str(travellers))

    # 1. Calculate Minimum Mandatory Cost (Cheapest stay, food, 0 activities)
    min_stay = ACCOMMODATION_TIERS[0]
    min_food = FOOD_TIERS[0]

    min_stay_total = min_stay["cost_per_night"] * Decimal(str(nights))
    min_food_total = min_food["cost_per_day"] * Decimal(str(days)) * Decimal(str(travellers))
    min_mandatory_total = total_transport_cost + min_stay_total + min_food_total + unavoidable_local_transport

    if min_mandatory_total > maximum_budget:
        shortfall = min_mandatory_total - maximum_budget
        raise SearchError(
            code="BUDGET_TOO_LOW",
            message=f"No complete trip is feasible within budget cap of Rs.{maximum_budget}. Minimum required cost is Rs.{min_mandatory_total} (Shortfall: Rs.{shortfall})."
        )

    # 2. Grid Search / Dynamic Programming over feasible combinations
    best_combo = None
    best_utility = -1.0

    # Activity subsets (from empty to all activities)
    activity_subsets = []
    for r in range(len(ACTIVITY_OPTIONS) + 1):
        for combo in combinations(ACTIVITY_OPTIONS, r):
            activity_subsets.append(list(combo))

    for stay in ACCOMMODATION_TIERS:
        stay_cost = stay["cost_per_night"] * Decimal(str(nights))

        for food in FOOD_TIERS:
            food_cost = food["cost_per_day"] * Decimal(str(days)) * Decimal(str(travellers))

            for act_subset in activity_subsets:
                act_cost = sum([a["cost"] for a in act_subset]) * Decimal(str(travellers))
                
                # Base cost without contingency
                subtotal = total_transport_cost + stay_cost + food_cost + act_cost + unavoidable_local_transport

                if subtotal > maximum_budget:
                    continue

                rem = maximum_budget - subtotal
                # Allocate contingency buffer up to 5% of maximum budget or remaining funds
                desired_buffer = Decimal("0.05") * maximum_budget
                contingency = min(desired_buffer, rem)
                total_trip_cost = subtotal + contingency

                if total_trip_cost > maximum_budget:
                    contingency = maximum_budget - subtotal
                    total_trip_cost = subtotal + contingency

                # Calculate Utility
                u_stay = evaluate_stay_utility(stay["tier"], stay_preference)
                u_food = evaluate_food_utility(food["tier"], food_preference)
                u_act = evaluate_activity_utility(act_subset, activity_preference)
                total_utility = u_stay + u_food + u_act

                if total_utility > best_utility:
                    best_utility = total_utility
                    best_combo = (stay, food, act_subset, total_trip_cost, contingency)

    if not best_combo:
        # Fallback to absolute minimum mandatory combo
        best_combo = (min_stay, min_food, [], min_mandatory_total, Decimal("0.00"))

    opt_stay, opt_food, opt_acts, opt_total_cost, opt_contingency = best_combo

    # 3. Format Output Components
    selected_stay = SelectedStay(
        tier=opt_stay["tier"],
        name=opt_stay["name"],
        cost_per_night=opt_stay["cost_per_night"],
        nights=nights,
        total_cost=opt_stay["cost_per_night"] * Decimal(str(nights)),
        description=opt_stay["description"]
    )

    selected_food = SelectedFood(
        tier=opt_food["tier"],
        name=opt_food["name"],
        cost_per_day=opt_food["cost_per_day"],
        days=days,
        total_cost=opt_food["cost_per_day"] * Decimal(str(days)) * Decimal(str(travellers)),
        description=opt_food["description"]
    )

    selected_activities = [
        SelectedActivity(
            id=a["id"],
            name=a["name"],
            category=a["category"],
            cost_per_person=a["cost"],
            total_cost=a["cost"] * Decimal(str(travellers)),
            description=a["description"]
        ) for a in opt_acts
    ]

    remaining_budget = maximum_budget - opt_total_cost
    ratio = remaining_budget / maximum_budget
    budget_status = BudgetStatus.COMFORTABLE if ratio >= Decimal("0.15") else BudgetStatus.TIGHT

    cost_breakdown = CostBreakdown(
        maximum_budget=maximum_budget,
        transport_cost=total_transport_cost,
        accommodation_cost=selected_stay.total_cost,
        food_cost=selected_food.total_cost,
        activities_cost=sum([a.total_cost for a in selected_activities], Decimal("0.00")),
        local_transport_cost=unavoidable_local_transport,
        contingency_buffer=opt_contingency,
        total_trip_cost=opt_total_cost,
        remaining_budget=remaining_budget,
        budget_status=budget_status
    )

    # 4. Generate Decision Explanations
    explanations = []
    if opt_stay["tier"] == stay_preference.value:
        explanations.append(f"{opt_stay['tier']} accommodation selected to best match your preference within budget.")
    else:
        explanations.append(f"Accommodation allocated to {opt_stay['tier']} tier to satisfy total budget constraint of Rs.{maximum_budget}.")

    if opt_food["tier"] == food_preference.value:
        explanations.append(f"{opt_food['tier']} food tier allocated to match dining preferences.")
    else:
        explanations.append(f"Food tier adjusted to {opt_food['tier']} to ensure budget compliance.")

    if len(opt_acts) == len(ACTIVITY_OPTIONS):
        explanations.append("All requested activities included within maximum budget.")
    elif len(opt_acts) > 0:
        explanations.append(f"Included {len(opt_acts)} activities ({', '.join([a.name for a in selected_activities])}) as budget permitted.")
    else:
        explanations.append("Activities omitted to prioritize essential transport and accommodation costs.")

    explanations.append(f"Reserved Rs.{opt_contingency} as contingency buffer ({cost_breakdown.budget_status.value} budget health).")

    return selected_stay, selected_food, selected_activities, cost_breakdown, explanations
