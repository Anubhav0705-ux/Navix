from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AnalyticsEvent(Base):
    """
    Privacy-safe first-party analytics event model.
    Stores aggregate-ready product metrics without personal information,
    passwords, full IPs, or sensitive itinerary contents.
    """
    __tablename__ = "analytics_events"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    route: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    anonymous_session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    safe_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    def __repr__(self) -> str:
        return f"<AnalyticsEvent(id={self.id!r}, event_type={self.event_type!r}, created_at={self.created_at!r})>"
