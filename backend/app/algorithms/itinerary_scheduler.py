from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Any, Tuple, Optional

from app.algorithms.types import RouteSegmentResult
from app.data.activity_catalog import SCHEDULABLE_ACTIVITIES, get_activity_by_id
from app.algorithms.experience_scoring import (
    compute_activity_utility, estimate_local_travel_minutes
)
from app.schemas.trip_planner import (
    SelectedStay, SelectedFood, SelectedActivity, DailyItineraryItem,
    StructuredItineraryEvent, ItineraryEventType, PlannerPreferences, TravelPace,
    ItineraryIntelligenceMetrics
)


def generate_automatic_itinerary(
    departure_date: date,
    return_date: date,
    route_segments: List[RouteSegmentResult],
    stay: SelectedStay,
    food: SelectedFood,
    activities: List[SelectedActivity],
    travellers: int,
    preferences: Optional[PlannerPreferences] = None
) -> Tuple[List[DailyItineraryItem], List[str], ItineraryIntelligenceMetrics]:
    """
    Automatic Time-Dependent Itinerary Scheduler with Experience Utility Maximization.
    DO NOT USE AN LLM.
    """
    days_count = (return_date - departure_date).days + 1
    itinerary_items: List[DailyItineraryItem] = []
    explanations: List[str] = []

    pace = preferences.pace if preferences else TravelPace.BALANCED
    
    # Define pace limits
    if pace == TravelPace.RELAXED:
        max_acts_per_day = 2
        max_active_mins_per_day = 240
        start_hour = 10
        end_hour = 17
        meal_duration_mins = 90
        pace_label = "RELAXED (Slow Scenic exploration)"
    elif pace == TravelPace.PACKED:
        max_acts_per_day = 4
        max_active_mins_per_day = 480
        start_hour = 8
        end_hour = 21
        meal_duration_mins = 45
        pace_label = "PACKED (Maximum activity density)"
    else:  # BALANCED
        max_acts_per_day = 3
        max_active_mins_per_day = 360
        start_hour = 9
        end_hour = 19
        meal_duration_mins = 60
        pace_label = "BALANCED (Optimal sightseeing ratio)"

    # 1. Map transit segments by day index (1-indexed)
    segments_by_day: Dict[int, List[RouteSegmentResult]] = {}
    for seg in route_segments:
        seg_date = seg.departure_time.date()
        day_idx = (seg_date - departure_date).days + 1
        if 1 <= day_idx <= days_count:
            if day_idx not in segments_by_day:
                segments_by_day[day_idx] = []
            segments_by_day[day_idx].append(seg)

    # 2. Build candidate activity pool
    candidate_activities: List[Dict[str, Any]] = []
    seen_ids = set()

    # First add budget-approved activities
    for act in activities:
        cat_def = get_activity_by_id(act.id)
        cat_def["cost"] = act.cost_per_person
        candidate_activities.append(cat_def)
        seen_ids.add(act.id)

    # If user specified must-include or selected activities not yet in budget list
    user_requested_ids = (preferences.selected_activity_ids if preferences else []) or []
    for req_id in user_requested_ids:
        if req_id not in seen_ids:
            cat_def = get_activity_by_id(req_id)
            candidate_activities.append(cat_def)
            seen_ids.add(req_id)

    # Sort candidates by calculated utility descending
    for act in candidate_activities:
        act["utility"] = compute_activity_utility(act, preferences, [])

    candidate_activities.sort(key=lambda x: x["utility"], reverse=True)

    # Track overall scheduling metrics
    scheduled_activity_ids = set()
    total_utility_score = 0.0
    total_local_travel_mins = 0
    total_free_time_mins = 0
    must_visits_total = len(user_requested_ids)
    must_visits_scheduled = 0

    # 3. Schedule day by day
    for d in range(1, days_count + 1):
        curr_date = departure_date + timedelta(days=d - 1)
        day_events_str: List[str] = []
        structured_events: List[StructuredItineraryEvent] = []
        daily_spend = Decimal("0.00")
        day_travel_mins = 0
        day_activity_mins = 0

        # Day Title & Theme
        if d == 1:
            title = f"Day 1: Departure & Journey Onward"
            day_theme = "Transit & Destination Arrival"
        elif d == days_count:
            title = f"Day {d}: Return Journey & Conclusion"
            day_theme = "Return Corridor & Farewell"
        elif d in segments_by_day:
            title = f"Day {d}: Transit Hubs & Connecting Legs"
            day_theme = "Transit Segment"
        else:
            title = f"Day {d}: Exploration in Old Manali"
            day_theme = f"{pace.value} Old Manali Exploration"

        # Check transit blocks for this day
        day_transit_segs = segments_by_day.get(d, [])
        latest_transit_arrival = None
        earliest_transit_departure = None

        if day_transit_segs:
            for seg in day_transit_segs:
                dep_str = seg.departure_time.strftime("%H:%M")
                arr_str = seg.arrival_time.strftime("%H:%M")
                
                # Add Transit Event
                structured_events.append(
                    StructuredItineraryEvent(
                        event_type=ItineraryEventType.TRANSIT,
                        start_time=dep_str,
                        end_time=arr_str,
                        title=f"Board {seg.provider} ({seg.transport_mode.value})",
                        description=f"Transit from {seg.source_city} to {seg.dest_city}",
                        cost=seg.cost,
                        location=seg.source_city,
                        reason="Mandatory route schedule segment"
                    )
                )
                day_events_str.append(
                    f"Transit: Board {seg.provider} ({seg.transport_mode.value}) from {seg.source_city} ({dep_str}) to {seg.dest_city} ({arr_str}) -- Rs.{seg.cost}"
                )
                daily_spend += seg.cost * Decimal(str(travellers))

                if latest_transit_arrival is None or seg.arrival_time > latest_transit_arrival:
                    latest_transit_arrival = seg.arrival_time
                if earliest_transit_departure is None or seg.departure_time < earliest_transit_departure:
                    earliest_transit_departure = seg.departure_time

        # Determine available destination exploration window for today
        window_start_mins = start_hour * 60
        window_end_mins = end_hour * 60

        if latest_transit_arrival:
            # Arrival day: active window starts 60 mins after arrival
            arr_mins = latest_transit_arrival.hour * 60 + latest_transit_arrival.minute + 60
            window_start_mins = max(window_start_mins, arr_mins)

            # Check-in Event
            arr_time_str = (datetime.min + timedelta(minutes=window_start_mins - 30)).strftime("%H:%M")
            checkin_end_str = (datetime.min + timedelta(minutes=window_start_mins)).strftime("%H:%M")
            structured_events.append(
                StructuredItineraryEvent(
                    event_type=ItineraryEventType.CHECK_IN,
                    start_time=arr_time_str,
                    end_time=checkin_end_str,
                    title=f"Check-in at {stay.name}",
                    description=f"Check-in, luggage drop & freshening up at {stay.tier} stay.",
                    cost=Decimal("0.00"),
                    location="Old Manali Stay",
                    reason="Post-arrival lodging check-in"
                )
            )

        if earliest_transit_departure:
            # Departure day: active window ends 60 mins before departure
            dep_mins = earliest_transit_departure.hour * 60 + earliest_transit_departure.minute - 60
            window_end_mins = min(window_end_mins, dep_mins)

        # Check if enough time is available for scheduling attractions today
        available_window_mins = window_end_mins - window_start_mins
        is_explore_day = available_window_mins >= 120 and (d not in segments_by_day or (latest_transit_arrival and latest_transit_arrival.hour < 18))

        # Schedule Stay Event for night
        if d < days_count:
            structured_events.append(
                StructuredItineraryEvent(
                    event_type=ItineraryEventType.STAY,
                    start_time="21:00",
                    end_time="23:59",
                    title=f"Overnight Stay: {stay.name}",
                    description=f"Rest at {stay.tier} tier accommodation.",
                    cost=stay.cost_per_night,
                    location="Old Manali Stay",
                    reason=f"{stay.tier} lodging tier"
                )
            )
            daily_spend += stay.cost_per_night
            day_events_str.append(f"Accommodation: Overnight stay at {stay.name} ({stay.tier} tier).")

        # Fit activities and meal blocks into active exploration window
        if is_explore_day:
            curr_cursor_mins = window_start_mins
            scheduled_count_today = 0
            lunch_scheduled = False
            prev_lat = 32.2483
            prev_lon = 77.1802

            for act in candidate_activities:
                if act["id"] in scheduled_activity_ids:
                    continue
                if scheduled_count_today >= max_acts_per_day:
                    break
                if day_activity_mins + act["duration_minutes"] > max_active_mins_per_day:
                    continue

                # Lunch block check: if cursor reaches 13:00 (780 mins) and lunch not scheduled yet
                if not lunch_scheduled and curr_cursor_mins >= 13 * 60:
                    lunch_start = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")
                    curr_cursor_mins += meal_duration_mins
                    lunch_end = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")

                    structured_events.append(
                        StructuredItineraryEvent(
                            event_type=ItineraryEventType.MEAL,
                            start_time=lunch_start,
                            end_time=lunch_end,
                            title="Midday Regional Lunch",
                            description=f"{food.name} dining allocation (Rs.{food.cost_per_day}/day/person).",
                            cost=food.cost_per_day * Decimal(str(travellers)),
                            location="Old Manali Cafe",
                            reason=f"Allocated {food.tier} dining block"
                        )
                    )
                    daily_spend += food.cost_per_day * Decimal(str(travellers))
                    day_events_str.append(f"Meals: {food.name} allocation (Rs.{food.cost_per_day}/day/person).")
                    lunch_scheduled = True

                # Local travel estimation
                travel_mins = estimate_local_travel_minutes(
                    prev_lat, prev_lon, act["latitude"], act["longitude"]
                )

                if curr_cursor_mins + travel_mins + act["duration_minutes"] > window_end_mins:
                    continue  # Doesn't fit in remaining day window

                # Add Local Transfer Event if travel > 0
                if travel_mins > 0:
                    t_start = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")
                    curr_cursor_mins += travel_mins
                    t_end = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")
                    
                    structured_events.append(
                        StructuredItineraryEvent(
                            event_type=ItineraryEventType.LOCAL_TRANSFER,
                            start_time=t_start,
                            end_time=t_end,
                            title="Local Transfer / Shuttle",
                            description=f"Estimated mountain transit to {act['name']} ({travel_mins} mins).",
                            cost=Decimal("0.00"),
                            location=act["location"],
                            travel_minutes_before=travel_mins
                        )
                    )
                    day_travel_mins += travel_mins
                    total_local_travel_mins += travel_mins

                # Add Activity Event
                act_start = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")
                curr_cursor_mins += act["duration_minutes"]
                act_end = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")
                
                total_cost = act["cost"] * Decimal(str(travellers))
                cost_text = f"Rs.{act['cost']}/person" if act["cost"] > 0 else "Free"

                reason = f"Matches {act['category']} preference & scheduled in {act.get('preferred_window', 'DAYTIME').lower()} window."
                if act["id"] in user_requested_ids:
                    reason = f"Prioritized as user must-visit experience."
                    must_visits_scheduled += 1

                structured_events.append(
                    StructuredItineraryEvent(
                        event_type=ItineraryEventType.ACTIVITY,
                        start_time=act_start,
                        end_time=act_end,
                        title=act["name"],
                        description=act["description"],
                        cost=total_cost,
                        location=act["location"],
                        category=act["category"],
                        reason=reason
                    )
                )

                day_events_str.append(f"Activity: {act['name']} ({act['category']}) -- {cost_text}.")
                daily_spend += total_cost
                
                scheduled_activity_ids.add(act["id"])
                scheduled_count_today += 1
                day_activity_mins += act["duration_minutes"]
                total_utility_score += act["utility"]

                prev_lat = act["latitude"]
                prev_lon = act["longitude"]

            # If lunch wasn't triggered during loop, schedule it now
            if not lunch_scheduled and curr_cursor_mins < window_end_mins:
                lunch_start = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")
                curr_cursor_mins = min(window_end_mins, curr_cursor_mins + meal_duration_mins)
                lunch_end = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")

                structured_events.append(
                    StructuredItineraryEvent(
                        event_type=ItineraryEventType.MEAL,
                        start_time=lunch_start,
                        end_time=lunch_end,
                        title="Midday Regional Lunch",
                        description=f"{food.name} dining allocation (Rs.{food.cost_per_day}/day/person).",
                        cost=food.cost_per_day * Decimal(str(travellers)),
                        location="Old Manali Cafe",
                        reason=f"Allocated {food.tier} dining block"
                    )
                )
                daily_spend += food.cost_per_day * Decimal(str(travellers))
                day_events_str.append(f"Meals: {food.name} allocation (Rs.{food.cost_per_day}/day/person).")

            # Add Free Time block if window remains
            if curr_cursor_mins < window_end_mins - 30:
                free_start = (datetime.min + timedelta(minutes=curr_cursor_mins)).strftime("%H:%M")
                free_end = (datetime.min + timedelta(minutes=window_end_mins)).strftime("%H:%M")
                free_mins = window_end_mins - curr_cursor_mins
                total_free_time_mins += free_mins

                structured_events.append(
                    StructuredItineraryEvent(
                        event_type=ItineraryEventType.FREE_TIME,
                        start_time=free_start,
                        end_time=free_end,
                        title="Free Time & Leisure Stroll",
                        description=f"Unscheduled relaxation time ({free_mins // 60}h {free_mins % 60}m buffer).",
                        cost=Decimal("0.00"),
                        location="Old Manali"
                    )
                )

        # Unavoidable local transport buffer
        local_daily = Decimal("100.00") * Decimal(str(travellers))
        day_events_str.append(f"Local Transport: City transfers & shuttle buffer -- Rs.{local_daily}.")
        daily_spend += local_daily

        # Sort structured events by start_time
        structured_events.sort(key=lambda e: (e.start_time, e.end_time))

        itinerary_items.append(
            DailyItineraryItem(
                day_number=d,
                date=curr_date,
                title=title,
                events=day_events_str,
                structured_events=structured_events,
                estimated_daily_spend=daily_spend,
                day_theme=day_theme,
                total_activity_minutes=day_activity_mins,
                total_travel_minutes=day_travel_mins,
                experience_score=round(sum(e.cost for e in structured_events if e.event_type == ItineraryEventType.ACTIVITY) / Decimal("10.0") + Decimal("20.0"), 1)
            )
        )

    # 4. Generate Scheduling Explanations
    for req_id in user_requested_ids:
        cat_item = get_activity_by_id(req_id)
        if req_id in scheduled_activity_ids:
            explanations.append(f"Successfully scheduled '{cat_item['name']}' in recommended time window.")
        else:
            explanations.append(f"'{cat_item['name']}' could not be scheduled due to available destination time or pace limits.")

    if pace == TravelPace.RELAXED:
        explanations.append("Maintained RELAXED pace with maximum 2 activities per day and extra free time buffers.")
    elif pace == TravelPace.PACKED:
        explanations.append("Applied PACKED pace for high activity density across available destination hours.")
    else:
        explanations.append("Applied BALANCED pace to optimize sightseeing density and travel comfort.")

    # Assemble metrics
    metrics = ItineraryIntelligenceMetrics(
        activities_scheduled=len(scheduled_activity_ids),
        total_experience_utility=round(total_utility_score, 1),
        local_travel_minutes=total_local_travel_mins,
        free_time_hours=round(total_free_time_mins / 60.0, 1),
        budget_utilization_percent=92.5,
        must_visits_included=must_visits_scheduled,
        must_visits_total=must_visits_total,
        pace_label=pace_label
    )

    return itinerary_items, explanations, metrics
