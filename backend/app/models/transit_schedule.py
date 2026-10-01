from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.admin import Admin
    from app.models.transit_node import TransitNode


class TransitSchedule(Base):
    __tablename__ = "transit_schedules"

    schedule_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    admin_id: Mapped[str] = mapped_column(String(50), ForeignKey("admins.admin_id"), nullable=False)
    source_node_id: Mapped[str] = mapped_column(String(50), ForeignKey("transit_nodes.node_id"), nullable=False)
    dest_node_id: Mapped[str] = mapped_column(String(50), ForeignKey("transit_nodes.node_id"), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    departure_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    arrival_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    base_cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    admin: Mapped["Admin"] = relationship("Admin", back_populates="transit_schedules")
    source_node: Mapped["TransitNode"] = relationship("TransitNode", foreign_keys=[source_node_id], back_populates="outgoing_schedules")
    dest_node: Mapped["TransitNode"] = relationship("TransitNode", foreign_keys=[dest_node_id], back_populates="incoming_schedules")

    def __repr__(self) -> str:
        return f"<TransitSchedule(schedule_id={self.schedule_id!r}, provider={self.provider!r}, base_cost={self.base_cost})>"
