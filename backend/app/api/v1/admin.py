import secrets
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.transit_node import TransitNode
from app.models.transit_schedule import TransitSchedule
from app.models.trip import Trip
from app.models.password_reset import PasswordResetRequest
from app.schemas.auth import PasswordResetAdminView, ApproveResetResponse, GenericMessageResponse
from app.core.security import get_current_admin, hash_password

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


@admin_router.get("/password-resets", response_model=List[PasswordResetAdminView])
def admin_get_password_resets(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all manual password reset requests for administrative verification."""
    requests = db.query(PasswordResetRequest).order_by(PasswordResetRequest.requested_at.desc()).all()
    results = []
    for r in requests:
        user = db.query(User).filter(User.user_id == r.user_id).first()
        results.append(PasswordResetAdminView(
            request_id=r.request_id,
            user_id=r.user_id,
            user_name=user.name if user else None,
            user_email=user.email if user else None,
            requested_at=r.requested_at.isoformat() if r.requested_at else "",
            status=r.status,
            reviewed_at=r.reviewed_at.isoformat() if r.reviewed_at else None,
            reviewed_by_admin_id=r.reviewed_by_admin_id,
            temporary_password_expires_at=r.temporary_password_expires_at.isoformat() if r.temporary_password_expires_at else None,
            completed_at=r.completed_at.isoformat() if r.completed_at else None
        ))
    return results


@admin_router.post("/password-resets/{request_id}/approve", response_model=ApproveResetResponse)
def admin_approve_password_reset(
    request_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approve a password reset request.
    Generates a cryptographically secure temporary password (shown ONCE to authorized admin).
    Stores only the secure bcrypt hash and sets 24-hour expiration.
    """
    req = db.query(PasswordResetRequest).filter(PasswordResetRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "REQUEST_NOT_FOUND", "message": "Password reset request not found."}
        )

    if req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_STATE", "message": f"Cannot approve request with status '{req.status}'."}
        )

    # Generate cryptographically secure temporary password (e.g., NX-aB3k9Xm2)
    temp_pw = f"NX-{secrets.token_urlsafe(8)}"
    pw_hash = hash_password(temp_pw)
    expires_at = datetime.utcnow() + timedelta(hours=24)

    req.status = "APPROVED"
    req.reviewed_at = datetime.utcnow()
    req.reviewed_by_admin_id = current_admin.user_id
    req.temporary_password_hash = pw_hash
    req.temporary_password_expires_at = expires_at

    db.commit()

    return ApproveResetResponse(
        request_id=req.request_id,
        status="APPROVED",
        temporary_password=temp_pw,
        expires_at=expires_at.isoformat(),
        message="Temporary password generated. Please deliver this to the traveler securely. It will not be shown again."
    )


@admin_router.post("/password-resets/{request_id}/reject", response_model=GenericMessageResponse)
def admin_reject_password_reset(
    request_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Reject a pending password reset request."""
    req = db.query(PasswordResetRequest).filter(PasswordResetRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "REQUEST_NOT_FOUND", "message": "Password reset request not found."}
        )

    if req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_STATE", "message": f"Cannot reject request with status '{req.status}'."}
        )

    req.status = "REJECTED"
    req.reviewed_at = datetime.utcnow()
    req.reviewed_by_admin_id = current_admin.user_id
    req.temporary_password_hash = None
    req.temporary_password_expires_at = None

    db.commit()

    return GenericMessageResponse(message="Password reset request rejected.")
