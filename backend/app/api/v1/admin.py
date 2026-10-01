from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.transit_node import TransitNode
from app.models.transit_schedule import TransitSchedule
from app.models.trip import Trip
from app.core.security import get_current_admin

admin_router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@admin_router.get("/nodes", response_model=List[Dict[str, Any]])
def admin_get_nodes(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all transit nodes for admin view."""
    nodes = db.query(TransitNode).all()
    return [
        {
            "node_id": n.node_id,
            "name": n.node_name,
            "city": n.city,
            "latitude": float(n.latitude) if n.latitude is not None else None,
            "longitude": float(n.longitude) if n.longitude is not None else None,
        }
        for n in nodes
    ]


@admin_router.get("/schedules", response_model=List[Dict[str, Any]])
def admin_get_schedules(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all transit schedules for admin view."""
    schedules = db.query(TransitSchedule).all()
    return [
        {
            "schedule_id": s.schedule_id,
            "provider": s.provider,
            "source_node_id": s.source_node_id,
            "dest_node_id": s.dest_node_id,
            "departure_time": str(s.departure_time),
            "arrival_time": str(s.arrival_time),
            "base_cost": float(s.base_cost)
        }
        for s in schedules
    ]


@admin_router.get("/users", response_model=List[Dict[str, Any]])
def admin_get_users(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all system users for admin view."""
    users = db.query(User).all()
    return [
        {
            "user_id": u.user_id,
            "name": u.name,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]


@admin_router.get("/trips", response_model=List[Dict[str, Any]])
def admin_get_trips(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all saved trips across system for admin view."""
    trips = db.query(Trip).all()
    return [
        {
            "trip_id": t.trip_id,
            "traveler_id": t.traveler_id,
            "origin": t.origin,
            "destination": t.destination,
            "travel_date": str(t.travel_date),
            "budget_cap": float(t.budget_cap)
        }
        for t in trips
    ]
