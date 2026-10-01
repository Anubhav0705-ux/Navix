from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session

from app.algorithms import TransitGraph, search_routes, RoutingRequest, SearchError
from app.algorithms.budget_optimizer import optimize_trip_budget
from app.algorithms.itinerary_generator import generate_daily_itinerary
from app.schemas.trip_planner import TripPlanRequest, TripPlanResult


def generate_complete_trip_plan(db: Session, request: TripPlanRequest) -> TripPlanResult:
    """
    Orchestrates end-to-end trip planning:
    1. Input Validation
    2. A* Time-Dependent Route Search with Schedule Projection
    3. Constrained Whole-Trip Budget Optimizer
    4. Deterministic Daily Itinerary Generator
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

    # 3. Whole-Trip Budget Optimization
    stay, food, activities, breakdown, explanations = optimize_trip_budget(
        maximum_budget=request.maximum_budget,
        transport_cost_per_person=route_res.summary.total_transport_cost,
        travellers=request.travellers,
        days=days,
        nights=nights,
        stay_preference=request.stay_preference,
        food_preference=request.food_preference,
        activity_preference=request.activity_preference
    )

    # 4. Daily Itinerary Generation
    daily_itinerary = generate_daily_itinerary(
        departure_date=request.departure_date,
        return_date=request.return_date,
        route_segments=route_res.segments,
        stay=stay,
        food=food,
        activities=activities,
        travellers=request.travellers
    )

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
        decision_explanations=explanations
    )
