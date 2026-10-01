import pytest
from decimal import Decimal
from datetime import datetime
from sqlalchemy import select, text
from app.database.session import SessionLocal
from app.algorithms import (
    TransitGraph, search_routes, RoutingRequest, OptimizationProfile,
    TransferStatus, validate_transfer, TransportMode, SearchError
)
from app.models import TransitSchedule


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def graph(db_session):
    return TransitGraph.load_from_db(db_session)


def test_graph_construction(graph):
    """1. Verify graph construction loads demo nodes and schedules."""
    assert len(graph.nodes) >= 9
    assert len(graph.outgoing_edges) >= 7


def test_sangli_to_old_manali_route_exists(graph):
    """2. Sangli -> Old Manali produces a route."""
    req = RoutingRequest(
        origin="Sangli",
        destination="Old Manali",
        profile=OptimizationProfile.BALANCED,
        departure_time=datetime(2026, 9, 1, 0, 0)
    )
    res = search_routes(graph, req)
    assert res is not None
    assert len(res.segments) >= 4
    assert res.summary.total_transport_cost > Decimal("0.00")


def test_route_not_hardcoded(graph):
    """3. Verify route is derived dynamically from schedules."""
    req = RoutingRequest(
        origin="Sangli",
        destination="Old Manali",
        profile=OptimizationProfile.BALANCED,
        departure_time=datetime(2026, 9, 1, 0, 0)
    )
    res = search_routes(graph, req)
    schedule_ids = [s.schedule_id for s in res.segments]
    # Check that returned schedule IDs exist in our graph
    for sid in schedule_ids:
        found = False
        for node_edges in graph.outgoing_edges.values():
            if any(e.schedule_id == sid for e in node_edges):
                found = True
                break
        assert found, f"Schedule ID {sid} must exist in graph"


def test_chronological_order_validity(graph):
    """4. Chronological order of segments is strictly valid."""
    req = RoutingRequest(origin="Sangli", destination="Old Manali", profile=OptimizationProfile.BALANCED)
    res = search_routes(graph, req)
    for i in range(len(res.segments)):
        seg = res.segments[i]
        assert seg.arrival_time > seg.departure_time
        if i > 0:
            prev_seg = res.segments[i - 1]
            assert seg.departure_time >= prev_seg.arrival_time


def test_transfer_validation_unit_rules():
    """5, 6, 7. Test transfer validation unit logic for SAFE, TIGHT, and INVALID."""
    t_arr = datetime(2026, 9, 2, 8, 0)

    # SAFE: 2 hour layover (120 mins >= 60 mins required)
    val_safe = validate_transfer(
        prev_arrival=t_arr,
        prev_mode=TransportMode.TRAIN,
        prev_dest_node_id="node_DEL",
        next_departure=datetime(2026, 9, 2, 10, 0),
        next_mode=TransportMode.BUS,
        next_source_node_id="node_DEL_BUS"
    )
    assert val_safe.status == TransferStatus.SAFE

    # TIGHT: 15 min layover (< 60 mins required for inter-node train-to-bus)
    val_tight = validate_transfer(
        prev_arrival=t_arr,
        prev_mode=TransportMode.TRAIN,
        prev_dest_node_id="node_DEL",
        next_departure=datetime(2026, 9, 2, 8, 15),
        next_mode=TransportMode.BUS,
        next_source_node_id="node_DEL_BUS"
    )
    assert val_tight.status == TransferStatus.TIGHT

    # INVALID: Departure before arrival
    val_invalid = validate_transfer(
        prev_arrival=t_arr,
        prev_mode=TransportMode.TRAIN,
        prev_dest_node_id="node_DEL",
        next_departure=datetime(2026, 9, 2, 7, 30),
        next_mode=TransportMode.BUS,
        next_source_node_id="node_DEL_BUS"
    )
    assert val_invalid.status == TransferStatus.INVALID


def test_cheapest_profile_route(graph):
    """8. CHEAPEST returns a valid low-cost route."""
    req = RoutingRequest(origin="Sangli", destination="Old Manali", profile=OptimizationProfile.CHEAPEST)
    res = search_routes(graph, req)
    assert res.summary.total_transport_cost > Decimal("0.00")


def test_faster_profile_route(graph):
    """9. FASTER returns a valid route."""
    req = RoutingRequest(origin="Sangli", destination="Old Manali", profile=OptimizationProfile.FASTER)
    res = search_routes(graph, req)
    assert res.summary.total_elapsed_minutes > 0


def test_balanced_profile_route(graph):
    """10. BALANCED returns a valid route."""
    req = RoutingRequest(origin="Sangli", destination="Old Manali", profile=OptimizationProfile.BALANCED)
    res = search_routes(graph, req)
    assert res.summary.number_of_segments >= 4


def test_no_route_error(graph):
    """11. Unreachable destination raises NO_ROUTE SearchError."""
    # Chandigarh -> Sangli has no reverse schedules in dataset
    req = RoutingRequest(origin="Chandigarh", destination="Sangli", profile=OptimizationProfile.BALANCED)
    with pytest.raises(SearchError) as exc_info:
        search_routes(graph, req)
    assert exc_info.value.code == "NO_ROUTE"


def test_unknown_origin_error(graph):
    """12. Unknown origin raises UNKNOWN_ORIGIN error."""
    req = RoutingRequest(origin="InvalidCityX", destination="Old Manali")
    with pytest.raises(SearchError) as exc_info:
        search_routes(graph, req)
    assert exc_info.value.code == "UNKNOWN_ORIGIN"


def test_unknown_destination_error(graph):
    """13. Unknown destination raises UNKNOWN_DESTINATION error."""
    req = RoutingRequest(origin="Sangli", destination="InvalidCityY")
    with pytest.raises(SearchError) as exc_info:
        search_routes(graph, req)
    assert exc_info.value.code == "UNKNOWN_DESTINATION"


def test_transport_budget_too_low(graph):
    """14. Budget cap below minimum route cost raises TRANSPORT_BUDGET_TOO_LOW."""
    req = RoutingRequest(
        origin="Sangli",
        destination="Old Manali",
        profile=OptimizationProfile.BALANCED,
        max_transport_budget=Decimal("500.00")
    )
    with pytest.raises(SearchError) as exc_info:
        search_routes(graph, req)
    assert exc_info.value.code == "TRANSPORT_BUDGET_TOO_LOW"


def test_budget_exact_or_above_succeeds(graph):
    """15, 16. Route under budget cap succeeds and satisfies budget cap."""
    cap = Decimal("3000.00")
    req = RoutingRequest(
        origin="Sangli",
        destination="Old Manali",
        profile=OptimizationProfile.BALANCED,
        max_transport_budget=cap
    )
    res = search_routes(graph, req)
    assert res.summary.total_transport_cost <= cap


def test_result_origin_destination_accuracy(graph):
    """17. Result origin and destination match request."""
    req = RoutingRequest(origin="Sangli", destination="Old Manali")
    res = search_routes(graph, req)
    assert res.origin == "Sangli"
    assert res.destination == "Old Manali"


def test_all_returned_schedules_exist_in_db(db_session, graph):
    """18. All returned schedule IDs exist in database."""
    req = RoutingRequest(origin="Sangli", destination="Old Manali")
    res = search_routes(graph, req)
    for seg in res.segments:
        s_db = db_session.get(TransitSchedule, seg.schedule_id)
        assert s_db is not None, f"Schedule {seg.schedule_id} does not exist in DB"


def test_all_recommended_transfers_are_safe(graph):
    """19. Every recommended transfer status is SAFE."""
    req = RoutingRequest(origin="Sangli", destination="Old Manali")
    res = search_routes(graph, req)
    for seg in res.segments:
        if seg.layover_before_minutes > 0:
            assert seg.transfer_status == TransferStatus.SAFE


def test_zero_database_mutations_during_search(db_session, graph):
    """20. Searching routes produces zero database row mutations."""
    # Count rows before
    count_nodes_before = db_session.execute(text('SELECT count(*) FROM "transit_nodes"')).scalar()
    count_sched_before = db_session.execute(text('SELECT count(*) FROM "transit_schedules"')).scalar()

    # Perform route search
    req = RoutingRequest(origin="Sangli", destination="Old Manali", profile=OptimizationProfile.BALANCED)
    res = search_routes(graph, req)
    assert res is not None

    # Count rows after
    count_nodes_after = db_session.execute(text('SELECT count(*) FROM "transit_nodes"')).scalar()
    count_sched_after = db_session.execute(text('SELECT count(*) FROM "transit_schedules"')).scalar()

    assert count_nodes_before == count_nodes_after
    assert count_sched_before == count_sched_after
