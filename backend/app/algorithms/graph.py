from dataclasses import dataclass
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import TransitNode, TransitSchedule
from app.algorithms.types import TransportMode


@dataclass
class GraphEdge:
    schedule_id: str
    source_node_id: str
    dest_node_id: str
    provider: str
    transport_mode: TransportMode
    departure_time: datetime
    arrival_time: datetime
    base_cost: Decimal
    duration_minutes: int


@dataclass
class GraphNode:
    node_id: str
    node_name: str
    city: str
    latitude: float
    longitude: float


def infer_transport_mode(provider: str) -> TransportMode:
    """Infers TransportMode enum from provider string."""
    p_lower = provider.lower()
    if any(k in p_lower for k in ["train", "express", "rajdhani", "vande bharat"]):
        return TransportMode.TRAIN
    if any(k in p_lower for k in ["bus", "hrtc", "volvo", "travels", "sleeper"]):
        return TransportMode.BUS
    if "metro" in p_lower:
        return TransportMode.METRO
    if any(k in p_lower for k in ["auto", "cab", "shuttle", "local", "taxi"]):
        return TransportMode.LOCAL
    return TransportMode.OTHER


class TransitGraph:
    """
    Time-dependent multi-modal transit graph built from database models.
    Supports deterministic schedule projection onto requested trip departure dates.
    """
    def __init__(self):
        self.nodes: Dict[str, GraphNode] = {}
        self.city_to_node_ids: Dict[str, List[str]] = {}
        self.outgoing_edges: Dict[str, List[GraphEdge]] = {}
        self.base_schedule_date: Optional[date] = None

    @classmethod
    def load_from_db(cls, session: Session, target_date: Optional[date] = None) -> "TransitGraph":
        graph = cls()

        # Load Nodes
        db_nodes = session.scalars(select(TransitNode)).all()
        for n in db_nodes:
            g_node = GraphNode(
                node_id=n.node_id,
                node_name=n.node_name,
                city=n.city,
                latitude=n.latitude,
                longitude=n.longitude
            )
            graph.nodes[n.node_id] = g_node
            
            # Map city name (case-insensitive)
            city_key = n.city.strip().lower()
            if city_key not in graph.city_to_node_ids:
                graph.city_to_node_ids[city_key] = []
            graph.city_to_node_ids[city_key].append(n.node_id)
            
            # Map node_name
            name_key = n.node_name.strip().lower()
            if name_key not in graph.city_to_node_ids:
                graph.city_to_node_ids[name_key] = []
            if n.node_id not in graph.city_to_node_ids[name_key]:
                graph.city_to_node_ids[name_key].append(n.node_id)

        # Load Schedules (Edges)
        db_schedules = session.scalars(select(TransitSchedule)).all()
        if db_schedules:
            graph.base_schedule_date = min([s.departure_time.date() for s in db_schedules])

        # Compute date projection offset if target_date is provided
        days_offset = 0
        if target_date and graph.base_schedule_date:
            days_offset = (target_date - graph.base_schedule_date).days

        for s in db_schedules:
            if s.source_node_id not in graph.nodes or s.dest_node_id not in graph.nodes:
                continue

            # Project dates if offset applies
            if days_offset != 0:
                dep_time = s.departure_time + timedelta(days=days_offset)
                arr_time = s.arrival_time + timedelta(days=days_offset)
            else:
                dep_time = s.departure_time
                arr_time = s.arrival_time

            duration = int((arr_time - dep_time).total_seconds() / 60)
            mode = infer_transport_mode(s.provider)

            edge = GraphEdge(
                schedule_id=s.schedule_id,
                source_node_id=s.source_node_id,
                dest_node_id=s.dest_node_id,
                provider=s.provider,
                transport_mode=mode,
                departure_time=dep_time,
                arrival_time=arr_time,
                base_cost=s.base_cost,
                duration_minutes=duration
            )

            if s.source_node_id not in graph.outgoing_edges:
                graph.outgoing_edges[s.source_node_id] = []
            graph.outgoing_edges[s.source_node_id].append(edge)

        return graph

    def resolve_node_ids(self, city_or_node_query: str) -> List[str]:
        """Resolves a city or station name string to matching node IDs."""
        key = city_or_node_query.strip().lower()
        if key in self.nodes:
            return [key]
        if key in self.city_to_node_ids:
            return self.city_to_node_ids[key]
        
        matching = []
        for city_key, node_list in self.city_to_node_ids.items():
            if key in city_key or city_key in key:
                matching.extend(node_list)
        return list(set(matching))
