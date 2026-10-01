from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip
    from app.models.transit_node import TransitNode


class TransitSegment(Base):
    __tablename__ = "transit_segments"

    segment_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    trip_id: Mapped[str] = mapped_column(String(50), ForeignKey("trips.trip_id"), nullable=False)
    source_node_id: Mapped[str] = mapped_column(String(50), ForeignKey("transit_nodes.node_id"), nullable=False)
    dest_node_id: Mapped[str] = mapped_column(String(50), ForeignKey("transit_nodes.node_id"), nullable=False)
    mode_type: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(100), nullable=False)
    departure_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    arrival_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    trip: Mapped["Trip"] = relationship("Trip", back_populates="segments")
    source_node: Mapped["TransitNode"] = relationship("TransitNode", foreign_keys=[source_node_id], back_populates="outgoing_segments")
    dest_node: Mapped["TransitNode"] = relationship("TransitNode", foreign_keys=[dest_node_id], back_populates="incoming_segments")

    def __repr__(self) -> str:
        return f"<TransitSegment(segment_id={self.segment_id!r}, mode_type={self.mode_type!r}, cost={self.cost})>"
