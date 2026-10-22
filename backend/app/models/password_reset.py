from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class PasswordResetRequest(Base):
    __tablename__ = "password_reset_requests"

    request_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING")  # PENDING, APPROVED, COMPLETED, REJECTED, EXPIRED
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by_admin_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    temporary_password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    temporary_password_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="password_resets")
    reviewed_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by_admin_id])

    def __repr__(self) -> str:
        return f"<PasswordResetRequest(request_id={self.request_id!r}, user_id={self.user_id!r}, status={self.status!r})>"
