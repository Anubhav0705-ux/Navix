import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime
from app.database.session import SessionLocal
from app.algorithms import TransitGraph, search_routes, RoutingRequest, OptimizationProfile

def main():
    session = SessionLocal()
    graph = TransitGraph.load_from_db(session)
    session.close()

    profiles = [OptimizationProfile.CHEAPEST, OptimizationProfile.BALANCED, OptimizationProfile.FASTER]
    
    print("\n==========================================================================================")
    print("NAVIX REAL DEMO ROUTE COMPARISON: Sangli -> Old Manali")
    print("==========================================================================================")
    print(f"{'PROFILE':<10} | {'COST (INR)':<10} | {'ELAPSED':<12} | {'TRAVEL':<10} | {'LAYOVER':<10} | {'SEGS':<5} | {'PATH'}")
    print("-" * 110)

    for p in profiles:
        req = RoutingRequest(
            origin="Sangli",
            destination="Old Manali",
            profile=p,
            departure_time=datetime(2026, 9, 1, 0, 0)
        )
        res = search_routes(graph, req)
        
        path_str = " -> ".join([seg.source_city for seg in res.segments] + [res.segments[-1].dest_city])
        elapsed_hrs = f"{res.summary.total_elapsed_minutes // 60}h {res.summary.total_elapsed_minutes % 60}m"
        travel_hrs = f"{res.summary.total_travel_minutes // 60}h {res.summary.total_travel_minutes % 60}m"
        layover_hrs = f"{res.summary.total_layover_minutes // 60}h {res.summary.total_layover_minutes % 60}m"

        print(f"{p.value:<10} | Rs.{res.summary.total_transport_cost:<8.2f} | {elapsed_hrs:<12} | {travel_hrs:<10} | {layover_hrs:<10} | {res.summary.number_of_segments:<5} | {path_str}")

    print("==========================================================================================\n")

if __name__ == "__main__":
    main()
