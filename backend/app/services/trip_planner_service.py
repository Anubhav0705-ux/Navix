from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_

from app.algorithms import TransitGraph, search_routes, RoutingRequest, SearchError
from app.algorithms.budget_optimizer import optimize_trip_budget
from app.algorithms.itinerary_scheduler import generate_automatic_itinerary
from app.schemas.trip_planner import TripPlanRequest, TripPlanResult
from app.models.demo_catalog import DemoDestination, DemoHotel, DemoFoodPlace, DemoAttraction
from app.core.destinations import resolve_canonical_destination
from app.services.routing_service import compute_road_fallback_route


def generate_complete_trip_plan(db: Session, request: TripPlanRequest) -> TripPlanResult:
    """
    Orchestrates end-to-end trip planning:
    1. Input Validation
    2. A* Time-Dependent Route Search with Schedule Projection & Road Fallback
    3. Constrained Whole-Trip Budget Optimizer with Destination Catalog
    4. Deterministic Automatic Itinerary Scheduler
    """
    # 1. Input Validation
    if request.return_date <= request.departure_date:
        raise SearchError(
            code="INVALID_DATE_RANGE",
            message=f"Return date ({request.return_date}) must be strictly after departure date ({request.departure_date})."
        )

    if request.travellers < 1:
        raise SearchError(
            code="INVALID_TRAVELLER_COUNT",
            message="Traveller count must be at least 1."
        )

    if request.maximum_budget <= Decimal("0.00"):
        raise SearchError(
            code="INVALID_BUDGET",
            message="Maximum trip budget must be greater than Rs.0.00."
        )

    days = (request.return_date - request.departure_date).days + 1
    nights = (request.return_date - request.departure_date).days

    # 2. A* Route Search with Date Projection & Deterministic Road Fallback
    graph = TransitGraph.load_from_db(db, target_date=request.departure_date)
    
    # Departure timestamp for route search
    dep_datetime = datetime.combine(request.departure_date, datetime.min.time())

    routing_req = RoutingRequest(
        origin=request.origin,
        destination=request.destination,
        profile=request.profile,
        max_transport_budget=request.maximum_budget,
        departure_time=dep_datetime
    )

    try:
        route_res = search_routes(graph, routing_req, use_heuristic=True)
    except SearchError as e:
        if e.code == "NO_ROUTE":
            # Fall back to nationwide road transfer estimate (DEMO_ESTIMATE)
            route_res = compute_road_fallback_route(
                db=db,
                origin=request.origin,
                destination=request.destination,
                departure_time=dep_datetime,
                max_transport_budget=request.maximum_budget
            )
        else:
            raise

    # 3. Whole-Trip Budget Optimization with Destination-Specific Catalog
    custom_hotels = None
    custom_food = None
    custom_activities = None

    dest_obj = resolve_canonical_destination(db, request.destination)
    if not dest_obj:
        dest_pattern = f"%{request.destination.strip().lower()}%"
        dest_obj = db.scalar(
            select(DemoDestination).where(
                or_(
                    func.lower(DemoDestination.name).like(dest_pattern),
                    func.lower(DemoDestination.city).like(dest_pattern),
                    DemoDestination.slug.like(dest_pattern)
                )
            )
        )

    if dest_obj:
        db_hotels = db.scalars(
            select(DemoHotel).where(DemoHotel.destination_id == dest_obj.id).order_by(DemoHotel.price_per_night.asc())
        ).all()
        if db_hotels:
            # If user selected a specific hotel in Stage 5, honor that selection
            if request.selected_hotel_id:
                sel_hotel = next((h for h in db_hotels if h.id == request.selected_hotel_id), None)
                if sel_hotel:
                    db_hotels = [sel_hotel]


            custom_hotels = [
                {
                    "tier": h.category,
                    "name": h.name,
                    "cost_per_night": Decimal(str(h.price_per_night)),
                    "description": f"{h.room_type} • {', '.join(h.amenities or [])}"
                }
                for h in db_hotels
            ]

        db_food = db.scalars(
            select(DemoFoodPlace).where(DemoFoodPlace.destination_id == dest_obj.id).order_by(DemoFoodPlace.cost_for_two.asc())
        ).all()
        if db_food:
            if request.selected_food_id:
                sel_f = next((f for f in db_food if f.id == request.selected_food_id), None)
                if sel_f:
                    db_food = [sel_f] + [f for f in db_food if f.id != request.selected_food_id]

            tiers = ["Basic", "Balanced", "Flexible"]
            custom_food = []
            for i, fp in enumerate(db_food[:3]):
                tier_name = tiers[i] if i < len(tiers) else "Flexible"
                custom_food.append({
                    "tier": tier_name,
                    "name": fp.name,
                    "cost_per_day": Decimal(str(round(fp.cost_for_two * 1.5))),
                    "description": f"{fp.cuisine} • Speciality: {fp.speciality}"
                })

        db_attractions = db.scalars(
            select(DemoAttraction).where(DemoAttraction.destination_id == dest_obj.id).order_by(DemoAttraction.recommended_score.desc())
        ).all()
        if db_attractions:
            # If user marked specific activities, prioritize them
            user_activity_ids = set()
            if request.planner_preferences:
                if request.planner_preferences.selected_activity_ids:
                    user_activity_ids.update(request.planner_preferences.selected_activity_ids)
                if request.planner_preferences.must_include:
                    user_activity_ids.update(request.planner_preferences.must_include)

            if user_activity_ids:
                prioritized = [a for a in db_attractions if a.id in user_activity_ids]
                others = [a for a in db_attractions if a.id not in user_activity_ids]
                db_attractions = prioritized + others

            custom_activities = [
                {
                    "id": a.id,
                    "name": a.name,
                    "category": a.category,
                    "cost": Decimal(str(a.entry_fee)),
                    "duration_hours": max(1, round(a.visit_duration_minutes / 60)),
                    "description": a.description
                }
                for a in db_attractions
            ]

    user_activity_ids = set()
    if request.planner_preferences:
        if request.planner_preferences.selected_activity_ids:
            user_activity_ids.update(request.planner_preferences.selected_activity_ids)
        if request.planner_preferences.must_include:
            user_activity_ids.update(request.planner_preferences.must_include)

    try:
        stay, food, activities, breakdown, explanations = optimize_trip_budget(
            maximum_budget=request.maximum_budget,
            transport_cost_per_person=route_res.summary.total_transport_cost,
            travellers=request.travellers,
            days=days,
            nights=nights,
            stay_preference=request.stay_preference,
            food_preference=request.food_preference,
            activity_preference=request.activity_preference,
            accommodations=custom_hotels,
            food_options=custom_food,
            activities=custom_activities,
            must_include_ids=list(user_activity_ids) if user_activity_ids else None
        )
    except SearchError as e:
        if e.code == "BUDGET_TOO_LOW" and custom_hotels is not None:
            # Fall back to baseline economy tiers to accommodate tight budget caps
            stay, food, activities, breakdown, explanations = optimize_trip_budget(
                maximum_budget=request.maximum_budget,
                transport_cost_per_person=route_res.summary.total_transport_cost,
                travellers=request.travellers,
                days=days,
                nights=nights,
                stay_preference=request.stay_preference,
                food_preference=request.food_preference,
                activity_preference=request.activity_preference,
                must_include_ids=list(user_activity_ids) if user_activity_ids else None
            )
        else:
            raise



    # 4. Automatic Daily Itinerary Scheduling
    destination_display = dest_obj.name if dest_obj else request.destination
    destination_coords = (dest_obj.latitude, dest_obj.longitude) if (dest_obj and dest_obj.latitude and dest_obj.longitude) else None

    daily_itinerary, sched_explanations, metrics = generate_automatic_itinerary(
        departure_date=request.departure_date,
        return_date=request.return_date,
        route_segments=route_res.segments,
        stay=stay,
        food=food,
        activities=activities,
        travellers=request.travellers,
        preferences=request.planner_preferences,
        destination_name=destination_display,
        destination_coords=destination_coords
    )

    # Combine explanations
    all_explanations = explanations + sched_explanations

    # 5. Assemble Result
    return TripPlanResult(
        origin=request.origin,
        destination=request.destination,
        departure_date=request.departure_date,
        return_date=request.return_date,
        travellers=request.travellers,
        days=days,
        nights=nights,
        profile=request.profile,
        data_source=route_res.summary.data_source,
        route_summary=route_res.summary,
        route_segments=route_res.segments,
        stay=stay,
        food=food,
        activities=activities,
        cost_breakdown=breakdown,
        daily_itinerary=daily_itinerary,
        decision_explanations=all_explanations,
        itinerary_metrics=metrics
    )


