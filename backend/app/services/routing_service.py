from sqlalchemy.orm import Session
from app.algorithms import TransitGraph, search_routes, RoutingRequest, RouteSearchResult


def plan_route(db: Session, request: RoutingRequest) -> RouteSearchResult:
    """
    Service layer for planning multi-modal routes over the database transit graph.
    """
    graph = TransitGraph.load_from_db(db)
    return search_routes(graph=graph, request=request, use_heuristic=True)
