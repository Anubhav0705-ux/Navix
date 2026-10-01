from sqlalchemy.orm import Session
from app.algorithms import TransitGraph, search_routes, RoutingRequest, RouteSearchResult


def plan_route(db: Session, request: RoutingRequest) -> RouteSearchResult:
    """
    Service layer for planning multi-modal routes over the database transit graph.
    """
    target_date = request.departure_time.date() if request.departure_time else None
    graph = TransitGraph.load_from_db(db, target_date=target_date)
    return search_routes(graph=graph, request=request, use_heuristic=True)
