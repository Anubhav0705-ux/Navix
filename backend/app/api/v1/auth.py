import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.traveler import Traveler
from app.models.trip import Trip
from app.models.password_reset import PasswordResetRequest
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    ForgotPasswordRequest,
    SetNewPasswordRequest,
    ChangePasswordRequest,
    DeleteAccountRequest,
    GenericMessageResponse
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_user_for_forced_password_change
)

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/register", response_model=TokenResponse)
def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new traveler user with input validation and anti-bot check."""
    # 1. Anti-bot honeypot check
    if request.hp_field and request.hp_field.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "BOT_DETECTED", "message": "Automated registration request rejected."}
        )

    email_clean = request.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMAIL_EXISTS", "message": "An account with this email address already exists."}
        )

    # Password policy validation
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "WEAK_PASSWORD", "message": "Password must be at least 8 characters long."}
        )

    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    pw_hash = hash_password(request.password)

    new_user = User(
        user_id=user_id,
        name=request.name.strip(),
        email=email_clean,
        role="traveler",
        password_hash=pw_hash
    )
    db.add(new_user)

    # Create traveler record
    new_traveler = Traveler(
        traveler_id=user_id,
        preferences=None
    )
    db.add(new_traveler)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.user_id, "role": new_user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
        must_change_password=False
    )


@auth_router.post("/login", response_model=TokenResponse)
def login_user(request: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user with email and password.
    Supports both primary password and admin-approved temporary passwords.
    """
    # 1. Anti-bot honeypot check
    if request.hp_field and request.hp_field.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "BOT_DETECTED", "message": "Automated login request rejected."}
        )

    email_clean = request.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}
        )

    # 2. Check standard password first
    if user.password_hash and verify_password(request.password, user.password_hash):
        token = create_access_token({"sub": user.user_id, "role": user.role, "must_change_password": False})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
            must_change_password=False
        )

    # 3. Check for active admin-approved temporary password
    now = datetime.utcnow()
    active_reset = db.query(PasswordResetRequest).filter(
        PasswordResetRequest.user_id == user.user_id,
        PasswordResetRequest.status == "APPROVED",
        PasswordResetRequest.temporary_password_expires_at > now
    ).order_by(PasswordResetRequest.requested_at.desc()).first()

    if active_reset and active_reset.temporary_password_hash:
        if verify_password(request.password, active_reset.temporary_password_hash):
            # Temporary password authentication successful: force password change
            token = create_access_token({
                "sub": user.user_id,
                "role": user.role,
                "must_change_password": True,
                "reset_request_id": active_reset.request_id
            })
            return TokenResponse(
                access_token=token,
                token_type="bearer",
                user=UserResponse.model_validate(user),
                must_change_password=True
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}
    )


@auth_router.post("/forgot-password", response_model=GenericMessageResponse)
def request_password_reset(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Submit an admin-assisted password recovery request.
    Does NOT reveal whether an account exists to prevent user enumeration attacks.
    """
    generic_msg = "If the account exists, your reset request has been submitted. An administrator will verify the request and provide a temporary password."

    # Anti-bot honeypot check (silently drop without tipping off bots)
    if request.hp_field and request.hp_field.strip():
        return GenericMessageResponse(message=generic_msg)

    identifier = request.identifier.strip().lower()
    user = db.query(User).filter(
        (User.email == identifier) | (User.name.ilike(identifier))
    ).first()

    if not user:
        return GenericMessageResponse(message=generic_msg)

    # Duplicate spam throttle: check for PENDING request in the last 15 minutes
    ten_mins_ago = datetime.utcnow() - timedelta(minutes=15)
    recent_pending = db.query(PasswordResetRequest).filter(
        PasswordResetRequest.user_id == user.user_id,
        PasswordResetRequest.status == "PENDING",
        PasswordResetRequest.requested_at > ten_mins_ago
    ).first()

    if not recent_pending:
        new_req = PasswordResetRequest(
            request_id=f"pwr_{uuid.uuid4().hex[:10]}",
            user_id=user.user_id,
            requested_at=datetime.utcnow(),
            status="PENDING"
        )
        db.add(new_req)
        db.commit()

    return GenericMessageResponse(message=generic_msg)


@auth_router.post("/set-new-password", response_model=TokenResponse)
def set_new_password_after_recovery(
    request: SetNewPasswordRequest,
    auth_info: tuple[User, Optional[str]] = Depends(get_user_for_forced_password_change),
    db: Session = Depends(get_db)
):
    """
    Forced password change after authenticating with an admin-approved temporary password.
    Updates the user password and invalidates the temporary credential permanently.
    """
    user, reset_request_id = auth_info

    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "PASSWORDS_DO_NOT_MATCH", "message": "New password and confirmation do not match."}
        )

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "WEAK_PASSWORD", "message": "Password must be at least 8 characters long."}
        )

    # Update user password hash
    user.password_hash = hash_password(request.new_password)

    # Invalidate temporary password request if provided
    if reset_request_id:
        req = db.query(PasswordResetRequest).filter(PasswordResetRequest.request_id == reset_request_id).first()
        if req:
            req.status = "COMPLETED"
            req.completed_at = datetime.utcnow()
            req.temporary_password_hash = None

    # Also invalidate any other active APPROVED requests for this user
    other_approved = db.query(PasswordResetRequest).filter(
        PasswordResetRequest.user_id == user.user_id,
        PasswordResetRequest.status.in_(["APPROVED", "PENDING"])
    ).all()
    for o_req in other_approved:
        if o_req.request_id != reset_request_id:
            o_req.status = "EXPIRED"
            o_req.temporary_password_hash = None

    db.commit()
    db.refresh(user)

    # Issue clean token with normal access privileges
    new_token = create_access_token({"sub": user.user_id, "role": user.role, "must_change_password": False})
    return TokenResponse(
        access_token=new_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        must_change_password=False
    )


@auth_router.post("/change-password", response_model=GenericMessageResponse)
def change_password_logged_in(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Authenticated user password change from Account Settings."""
    if not current_user.password_hash or not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INCORRECT_CURRENT_PASSWORD", "message": "Current password is incorrect."}
        )

    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "PASSWORDS_DO_NOT_MATCH", "message": "New password and confirmation do not match."}
        )

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "WEAK_PASSWORD", "message": "Password must be at least 8 characters long."}
        )

    current_user.password_hash = hash_password(request.new_password)
    db.commit()

    return GenericMessageResponse(message="Password successfully updated.")


@auth_router.post("/delete-account", response_model=GenericMessageResponse)
def delete_own_account(
    request: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete own account and associated saved trips.
    Requires password verification and typing 'DELETE'.
    """
    if request.confirmation_text.strip() != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_CONFIRMATION", "message": "Please type DELETE exactly to confirm account deletion."}
        )

    if not current_user.password_hash or not verify_password(request.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INCORRECT_PASSWORD", "message": "Incorrect password. Account deletion aborted."}
        )

    # 1. Transactionally remove traveler's trips, segments & budget allocations
    trips = db.query(Trip).filter(Trip.traveler_id == current_user.user_id).all()
    for trip in trips:
        if trip.budget_allocation:
            db.delete(trip.budget_allocation)
        for seg in trip.segments:
            db.delete(seg)
        db.delete(trip)

    # 2. Remove password reset requests
    resets = db.query(PasswordResetRequest).filter(PasswordResetRequest.user_id == current_user.user_id).all()
    for r in resets:
        db.delete(r)

    # 3. Remove traveler profile if present
    if current_user.traveler:
        db.delete(current_user.traveler)

    # 4. Remove user record
    db.delete(current_user)
    db.commit()

    return GenericMessageResponse(message="Account and associated trip records permanently deleted.")


@auth_router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return UserResponse.model_validate(current_user)
