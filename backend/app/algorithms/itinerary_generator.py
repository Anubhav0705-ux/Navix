from datetime import date, timedelta
from decimal import Decimal
from typing import List

from app.algorithms.types import RouteSegmentResult
from app.schemas.trip_planner import (
    SelectedStay, SelectedFood, SelectedActivity, DailyItineraryItem
)


def generate_daily_itinerary(
    departure_date: date,
    return_date: date,
    route_segments: List[RouteSegmentResult],
    stay: SelectedStay,
    food: SelectedFood,
    activities: List[SelectedActivity],
    travellers: int
) -> List[DailyItineraryItem]:
    """
    Deterministically generates day-by-day itinerary breakdown for the trip.
    DO NOT USE AN LLM.
    """
    days = (return_date - departure_date).days + 1
    itinerary: List[DailyItineraryItem] = []

    # Map transit segments by day relative to departure_date
    segments_by_day = {}
    for seg in route_segments:
        # Relative day index based on segment departure time
        seg_date = seg.departure_time.date()
        day_idx = (seg_date - departure_date).days + 1
        if day_idx not in segments_by_day:
            segments_by_day[day_idx] = []
        segments_by_day[day_idx].append(seg)

    # Distribute activities across destination stay days
    dest_days = [d for d in range(1, days + 1) if d not in segments_by_day or d == days or d == 2]
    activities_by_day = {}
    for idx, act in enumerate(activities):
        target_day = dest_days[idx % len(dest_days)] if dest_days else 2
        if target_day not in activities_by_day:
            activities_by_day[target_day] = []
        activities_by_day[target_day].append(act)

    for d in range(1, days + 1):
        curr_date = departure_date + timedelta(days=d - 1)
        day_events: List[str] = []
        daily_spend = Decimal("0.00")

        # 1. Add Transit Events
        if d in segments_by_day:
            for seg in segments_by_day[d]:
                dep_str = seg.departure_time.strftime("%H:%M")
                arr_str = seg.arrival_time.strftime("%H:%M")
                day_events.append(
                    f"Transit: Board {seg.provider} ({seg.transport_mode.value}) from {seg.source_city} ({dep_str}) to {seg.dest_city} ({arr_str}) -- Rs.{seg.cost}"
                )
                daily_spend += seg.cost * Decimal(str(travellers))
        else:
            day_events.append("Destination Stay in Old Manali.")

        # 2. Add Stay Event
        if d < days:
            day_events.append(f"Accommodation: Overnight stay at {stay.name} ({stay.tier} tier).")
            daily_spend += stay.cost_per_night

        # 3. Add Food Event
        day_events.append(f"Meals: {food.name} allocation (Rs.{food.cost_per_day}/day/person).")
        daily_spend += food.cost_per_day * Decimal(str(travellers))

        # 4. Add Activity Events
        if d in activities_by_day:
            for act in activities_by_day[d]:
                cost_str = f"Rs.{act.cost_per_person}/person" if act.cost_per_person > 0 else "Free"
                day_events.append(f"Activity: {act.name} ({act.category}) -- {cost_str}.")
                daily_spend += act.total_cost

        # 5. Local Transport Event
        local_daily = Decimal("100.00") * Decimal(str(travellers))
        day_events.append(f"Local Transport: City transfers & shuttle buffer -- Rs.{local_daily}.")
        daily_spend += local_daily

        # Generate Title
        if d == 1:
            title = "Day 1: Departure & Journey Onward"
        elif d == days:
            title = f"Day {d}: Return Journey & Conclusion"
        elif d in segments_by_day:
            title = f"Day {d}: Transit & Connecting Hubs"
        else:
            title = f"Day {d}: Exploration & Local Activities in Old Manali"

        itinerary.append(
            DailyItineraryItem(
                day_number=d,
                date=curr_date,
                title=title,
                events=day_events,
                estimated_daily_spend=daily_spend
            )
        )

    return itinerary
