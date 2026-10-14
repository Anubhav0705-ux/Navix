"""
Nationwide Reachability Analysis across all 113 Indian Destinations.
Evaluates all 12,656 ordered distinct destination pairs for topology reachability:
1. Scheduled Multi-Modal Graph Reachable
2. Regional Road Transfer Estimate Reachable (DEMO_ESTIMATE)
3. Unsupported (missing coordinates/isolated)
Measures latency on representative search queries.
"""
import time
from collections import deque
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.demo_catalog import DemoDestination
from app.models.transit_node import TransitNode
from app.algorithms import TransitGraph, RoutingRequest
from app.services.routing_service import plan_route, haversine_distance_km
from app.core.destinations import normalize_city_name


def run_reachability_analysis():
    db: Session = SessionLocal()
    try:
        destinations = db.query(DemoDestination).order_by(DemoDestination.name).all()
        dest_count = len(destinations)
        print(f"Total destinations in catalog: {dest_count}")

        # Load Transit Graph
        graph = TransitGraph.load_from_db(db)
        print(f"Transit graph nodes: {len(graph.nodes)}")
        print(f"Transit graph edges: {sum(len(adj) for adj in graph.outgoing_edges.values())}")

        # Map each destination to its resolved transit node IDs
        dest_to_nodes = {}
        dest_coords = {}
        for d in destinations:
            node_ids = graph.resolve_node_ids(d.city or d.name)
            if not node_ids:
                # Try alias / normalized
                node_ids = graph.resolve_node_ids(normalize_city_name(d.name))
            dest_to_nodes[d.id] = node_ids
            dest_coords[d.id] = (d.latitude, d.longitude)

        # Precompute graph connectivity between all nodes using BFS/reachability components
        # Build node adjacency
        node_adj = {n_id: set() for n_id in graph.nodes}
        for u, edges in graph.outgoing_edges.items():
            for e in edges:
                node_adj[u].add(e.dest_node_id)

        # Compute reachability map for each node
        reachability_cache = {}
        for n_id in graph.nodes:
            visited = set()
            queue = deque([n_id])
            visited.add(n_id)
            while queue:
                curr = queue.popleft()
                for neighbor in node_adj.get(curr, []):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            reachability_cache[n_id] = visited

        total_pairs = dest_count * (dest_count - 1)
        scheduled_reachable = 0
        road_estimate_reachable = 0
        unsupported = 0

        # Evaluate all ordered pairs
        for i, src in enumerate(destinations):
            src_nodes = dest_to_nodes[src.id]
            for j, dst in enumerate(destinations):
                if i == j:
                    continue

                dst_nodes = dest_to_nodes[dst.id]

                # Check if reachable via scheduled graph
                can_reach_scheduled = False
                if src_nodes and dst_nodes:
                    for s_n in src_nodes:
                        if can_reach_scheduled:
                            break
                        reachable_from_s = reachability_cache.get(s_n, set())
                        for d_n in dst_nodes:
                            if d_n in reachable_from_s:
                                can_reach_scheduled = True
                                break

                if can_reach_scheduled:
                    scheduled_reachable += 1
                else:
                    # Check road estimate connectivity (both have valid Indian coordinates)
                    c1 = dest_coords.get(src.id)
                    c2 = dest_coords.get(dst.id)
                    if c1 and c2 and c1[0] and c1[1] and c2[0] and c2[1]:
                        road_estimate_reachable += 1
                    else:
                        unsupported += 1

        print("\n================ NATIONWIDE REACHABILITY RESULTS ================")
        print(f"Total Supported Destinations:          {dest_count}")
        print(f"Total Possible Ordered Pairs:          {total_pairs:,}")
        print(f"Scheduled Graph Reachable Pairs:       {scheduled_reachable:,} ({scheduled_reachable/total_pairs*100:.2f}%)")
        print(f"Road-Estimate-Only Pairs (DEMO_EST):   {road_estimate_reachable:,} ({road_estimate_reachable/total_pairs*100:.2f}%)")
        print(f"Unsupported Pairs:                     {unsupported:,} ({unsupported/total_pairs*100:.2f}%)")
        total_covered = scheduled_reachable + road_estimate_reachable
        print(f"Total Functional Platform Coverage:    {total_covered:,} / {total_pairs:,} ({total_covered/total_pairs*100:.2f}%)")

        # Measure query latency over a representative sample
        sample_queries = [
            ("Sangli", "Manali"),
            ("Pune", "Goa"),
            ("Mumbai", "Jaipur"),
            ("Delhi", "Manali"),
            ("Bengaluru", "Mysuru"),
            ("Pune", "Udaipur"),
            ("Mumbai", "Goa"),
            ("Delhi", "Rishikesh"),
            ("Kochi", "Munnar"),
            ("Kolkata", "Darjeeling"),
        ]

        latencies = []
        print("\n--- Latency Benchmark on 10 Key Presentation Corridors ---")
        for orig, dest in sample_queries:
            req = RoutingRequest(origin=orig, destination=dest)
            t0 = time.perf_counter()
            res = plan_route(db, req)
            dt = (time.perf_counter() - t0) * 1000
            latencies.append(dt)
            print(f"  {orig:12} -> {dest:12} : {dt:6.2f} ms | Mode: {res.summary.algorithm_used[:32]}")

        avg_lat = sum(latencies) / len(latencies)
        p95_lat = sorted(latencies)[int(len(latencies) * 0.95)]
        print(f"\nAverage Route Search Latency: {avg_lat:.2f} ms")
        print(f"P95 Route Search Latency:     {p95_lat:.2f} ms")

    finally:
        db.close()


if __name__ == "__main__":
    run_reachability_analysis()
