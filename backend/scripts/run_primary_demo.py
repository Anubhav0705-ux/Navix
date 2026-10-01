import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import date
from decimal import Decimal
import json
from app.database.session import SessionLocal
from app.schemas.trip_planner import TripPlanRequest, StayPreference, FoodPreference, ActivityPreference, OptimizationProfile
from app.services.trip_planner_service import generate_complete_trip_plan
from app.algorithms import SearchError

def main():
    session = SessionLocal()

    print("\n==========================================================================================")
    print("NAVIX PRIMARY DEMO TRIP PLAN (Sangli -> Old Manali | Budget: Rs. 20,000)")
    print("==========================================================================================")

    req = TripPlanRequest(
        origin="Sangli",
        destination="Old Manali",
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        travellers=1,
        maximum_budget=Decimal("20000.00"),
        profile=OptimizationProfile.BALANCED,
        stay_preference=StayPreference.STANDARD,
        food_preference=FoodPreference.BALANCED,
        activity_preference=ActivityPreference.MEDIUM
    )

    plan = generate_complete_trip_plan(session, req)

    print(f"Origin            : {plan.origin}")
    print(f"Destination       : {plan.destination}")
    print(f"Dates             : {plan.departure_date} to {plan.return_date} ({plan.days} Days / {plan.nights} Nights)")
    print(f"Travellers        : {plan.travellers}")
    print(f"Maximum Budget    : Rs. {plan.cost_breakdown.maximum_budget:,.2f}")
    print(f"Total Trip Cost   : Rs. {plan.cost_breakdown.total_trip_cost:,.2f}")
    print(f"Remaining Funds   : Rs. {plan.cost_breakdown.remaining_budget:,.2f} ({plan.cost_breakdown.budget_status.value})")
    print("-" * 90)
    print("COST BREAKDOWN:")
    print(f"  - Transport Leg : Rs. {plan.cost_breakdown.transport_cost:,.2f}")
    print(f"  - Stay ({plan.stay.tier:<8}): Rs. {plan.cost_breakdown.accommodation_cost:,.2f} ({plan.stay.name})")
    print(f"  - Food ({plan.food.tier:<8}): Rs. {plan.cost_breakdown.food_cost:,.2f} ({plan.food.name})")
    print(f"  - Activities    : Rs. {plan.cost_breakdown.activities_cost:,.2f} ({len(plan.activities)} activities)")
    print(f"  - Local Transfer: Rs. {plan.cost_breakdown.local_transport_cost:,.2f}")
    print(f"  - Contingency   : Rs. {plan.cost_breakdown.contingency_buffer:,.2f}")
    print("-" * 90)
    print("DECISION EXPLANATIONS:")
    for exp in plan.decision_explanations:
        print(f"  * {exp}")
    print("-" * 90)
    print("DAILY ITINERARY SUMMARY:")
    for item in plan.daily_itinerary:
        print(f"  {item.title:<40} | Est. Daily Spend: Rs. {item.estimated_daily_spend:,.2f}")
        for evt in item.events[:2]:
            print(f"    - {evt}")

    print("\n------------------------------------------------------------------------------------------")
    print("LOW BUDGET TEST (Sangli -> Old Manali | Budget: Rs. 5,000)")
    print("------------------------------------------------------------------------------------------")

    low_req = TripPlanRequest(
        origin="Sangli",
        destination="Old Manali",
        departure_date=date(2026, 12, 12),
        return_date=date(2026, 12, 18),
        travellers=1,
        maximum_budget=Decimal("5000.00"),
        profile=OptimizationProfile.BALANCED
    )

    try:
        generate_complete_trip_plan(session, low_req)
        print("ERROR: Low budget request should have failed!")
    except SearchError as e:
        print(f"Code   : {e.code}")
        print(f"Message: {e.message}")

    print("==========================================================================================\n")
    session.close()

if __name__ == "__main__":
    main()
