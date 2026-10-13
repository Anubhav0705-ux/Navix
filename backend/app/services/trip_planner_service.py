from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_

from app.algorithms import TransitGraph, search_routes, RoutingRequest, SearchError
from app.algorithms.budget_optimizer import optimize_trip_budget
from app.algorithms.itinerary_scheduler import generate_automatic_itinerary
from app.schemas.trip_planner import TripPlanRequest, TripPlanResult
from app.models.demo_catalog import DemoDestination, DemoHotel, DemoFoodPlace, DemoAttraction


def generate_complete_trip_plan(db: Session, request: TripPlanRequest) -> TripPlanResult:
    """
    Orchestrates end-to-end trip planning:
    1. Input Validation
    2. A* Time-Dependent Route Search with Schedule Projection
    3. Constrained Whole-Trip Budget Optimizer
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

    # 2. A* Route Search with Date Projection
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

    route_res = search_routes(graph, routing_req, use_heuristic=True)

    # 3. Whole-Trip Budget Optimization with Destination-Specific Catalog
    custom_hotels = None
    custom_food = None
    custom_activities = None

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

    if dest_obj and request.destination.strip().lower() != "old manali":
        db_hotels = db.scalars(
            select(DemoHotel).where(DemoHotel.destination_id == dest_obj.id).order_by(DemoHotel.price_per_night.asc())
        ).all()
        if db_hotels:
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
        activities=custom_activities
    )

    # 4. Automatic Daily Itinerary Scheduling
    daily_itinerary, sched_explanations, metrics = generate_automatic_itinerary(
        departure_date=request.departure_date,
        return_date=request.return_date,
        route_segments=route_res.segments,
        stay=stay,
        food=food,
        activities=activities,
        travellers=request.travellers,
        preferences=request.planner_preferences
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
        data_source="Demo Transit Dataset",
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

