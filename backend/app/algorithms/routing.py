import heapq
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Set, Tuple

from app.algorithms.types import (
    OptimizationProfile, RouteSearchResult, RouteSegmentResult,
    RouteSummary, TransferStatus, RoutingRequest
)
from app.algorithms.graph import TransitGraph, GraphEdge, GraphNode
from app.algorithms.transfer_validation import validate_transfer
from app.algorithms.scoring import compute_step_score, compute_heuristic_score


class SearchError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def search_routes(
    graph: TransitGraph,
    request: RoutingRequest,
    use_heuristic: bool = True
) -> RouteSearchResult:
    """
    Core Time-Dependent A* (or Dijkstra baseline if use_heuristic=False) Route Search Engine.
    Guarantees deterministic execution, hard transport budget enforcement, and transfer validation.
    """
    # 1. Resolve Origin and Destination Node IDs
    origin_node_ids = graph.resolve_node_ids(request.origin)
    if not origin_node_ids:
        raise SearchError(
            code="UNKNOWN_ORIGIN",
            message=f"Origin location '{request.origin}' could not be resolved to any transit node."
        )

    dest_node_ids = set(graph.resolve_node_ids(request.destination))
    if not dest_node_ids:
        raise SearchError(
            code="UNKNOWN_DESTINATION",
            message=f"Destination location '{request.destination}' could not be resolved to any transit node."
        )

    start_time = request.departure_time or datetime(2026, 9, 1, 0, 0)
    profile = request.profile

    # Priority Queue Priority Tuple: (f_score, counter, state)
    # State: (current_node_id, current_time, total_cost, total_travel_mins, total_layover_mins, segments)
    pq: List[Tuple[float, float, int, str, datetime, Decimal, int, int, List[RouteSegmentResult]]] = []
    counter = 0

    # Initialize queue with all matching origin nodes
    for orig_id in origin_node_ids:
        orig_node = graph.nodes[orig_id]
        # Target node for heuristic estimation (pick closest target node if multiple)
        best_h = min([
            compute_heuristic_score(orig_node, graph.nodes[d_id], profile)
            for d_id in dest_node_ids
        ]) if use_heuristic else 0.0

        heapq.heappush(pq, (best_h, 0.0, counter, orig_id, start_time, Decimal("0.00"), 0, 0, []))
        counter += 1

    visited_best_g: dict = {}

    while pq:
        f_score, g_score, _, curr_node_id, curr_time, cost_so_far, travel_mins, layover_mins, segments = heapq.heappop(pq)

        # Check Goal State
        if curr_node_id in dest_node_ids and len(segments) > 0:
            total_elapsed = int((segments[-1].arrival_time - start_time).total_seconds() / 60)
            summary = RouteSummary(
                total_transport_cost=cost_so_far,
                total_elapsed_minutes=total_elapsed,
                total_travel_minutes=travel_mins,
                total_layover_minutes=layover_mins,
                number_of_segments=len(segments),
                number_of_transfers=len(segments) - 1,
                algorithm_used="A*" if use_heuristic else "Dijkstra Baseline",
                data_source="Demo Transit Dataset"
            )
            return RouteSearchResult(
                origin=request.origin,
                destination=request.destination,
                profile=profile,
                segments=segments,
                summary=summary
            )

        # Pruning optimization
        state_key = (curr_node_id, curr_time)
        if state_key in visited_best_g and visited_best_g[state_key] <= g_score:
            continue
        visited_best_g[state_key] = g_score

        # Explore outgoing edges
        outgoing = graph.outgoing_edges.get(curr_node_id, [])
        for edge in outgoing:
            # 1. Transfer Validation
            if not segments:
                # First leg
                if edge.departure_time < start_time:
                    continue
                layover_before = 0
                tx_status = TransferStatus.SAFE
            else:
                prev_seg = segments[-1]
                val_res = validate_transfer(
                    prev_arrival=prev_seg.arrival_time,
                    prev_mode=prev_seg.transport_mode,
                    prev_dest_node_id=prev_seg.dest_node_id,
                    next_departure=edge.departure_time,
                    next_mode=edge.transport_mode,
                    next_source_node_id=edge.source_node_id
                )
                if val_res.status != TransferStatus.SAFE:
                    # REJECT TIGHT and INVALID transfers!
                    continue
                layover_before = val_res.layover_minutes
                tx_status = val_res.status

            # 2. Hard Transport Budget Check
            new_cost = cost_so_far + edge.base_cost
            if request.max_transport_budget is not None and new_cost > request.max_transport_budget:
                continue

            # Construct new segment result
            src_node = graph.nodes[edge.source_node_id]
            dst_node = graph.nodes[edge.dest_node_id]

            new_seg = RouteSegmentResult(
                schedule_id=edge.schedule_id,
                source_node_id=edge.source_node_id,
                source_node_name=src_node.node_name,
                source_city=src_node.city,
                dest_node_id=edge.dest_node_id,
                dest_node_name=dst_node.node_name,
                dest_city=dst_node.city,
                provider=edge.provider,
                transport_mode=edge.transport_mode,
                departure_time=edge.departure_time,
                arrival_time=edge.arrival_time,
                duration_minutes=edge.duration_minutes,
                cost=edge.base_cost,
                layover_before_minutes=layover_before,
                transfer_status=tx_status
            )

            new_segments = segments + [new_seg]
            new_travel_mins = travel_mins + edge.duration_minutes
            new_layover_mins = layover_mins + layover_before
            new_elapsed_mins = int((edge.arrival_time - start_time).total_seconds() / 60)
            num_transfers = len(new_segments) - 1

            new_g = compute_step_score(new_cost, new_elapsed_mins, num_transfers, profile)

            # Heuristic calculation to target
            if use_heuristic:
                h_score = min([
                    compute_heuristic_score(dst_node, graph.nodes[d_id], profile)
                    for d_id in dest_node_ids
                ])
            else:
                h_score = 0.0

            new_f = new_g + h_score
            heapq.heappush(
                pq,
                (new_f, new_g, counter, edge.dest_node_id, edge.arrival_time, new_cost, new_travel_mins, new_layover_mins, new_segments)
            )
            counter += 1

    # Check if budget was the limiting factor
    if request.max_transport_budget is not None:
        # Check if route existed without budget constraint
        req_nobudget = RoutingRequest(
            origin=request.origin,
            destination=request.destination,
            profile=profile,
            departure_time=start_time,
            max_transport_budget=None
        )
        try:
            unconstrained_res = search_routes(graph, req_nobudget, use_heuristic)
            raise SearchError(
                code="TRANSPORT_BUDGET_TOO_LOW",
                message=f"No route found within transport budget cap of ₹{request.max_transport_budget}. Lowest cost route is ₹{unconstrained_res.summary.total_transport_cost}."
            )
        except SearchError as e:
            if e.code == "TRANSPORT_BUDGET_TOO_LOW":
                raise e

    raise SearchError(
        code="NO_ROUTE",
        message=f"No feasible schedule-safe route found from '{request.origin}' to '{request.destination}'."
    )
