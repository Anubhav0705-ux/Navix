from typing import List, TYPE_CHECKING
from sqlalchemy import String, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.transit_schedule import TransitSchedule
    from app.models.transit_segment import TransitSegment


class TransitNode(Base):
    __tablename__ = "transit_nodes"

    node_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    node_name: Mapped[str] = mapped_column(String(150), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationships
    outgoing_schedules: Mapped[List["TransitSchedule"]] = relationship(
        "TransitSchedule", foreign_keys="TransitSchedule.source_node_id", back_populates="source_node"
    )
    incoming_schedules: Mapped[List["TransitSchedule"]] = relationship(
        "TransitSchedule", foreign_keys="TransitSchedule.dest_node_id", back_populates="dest_node"
    )
    outgoing_segments: Mapped[List["TransitSegment"]] = relationship(
        "TransitSegment", foreign_keys="TransitSegment.source_node_id", back_populates="source_node"
    )
    incoming_segments: Mapped[List["TransitSegment"]] = relationship(
        "TransitSegment", foreign_keys="TransitSegment.dest_node_id", back_populates="dest_node"
    )

    def __repr__(self) -> str:
        return f"<TransitNode(node_id={self.node_id!r}, node_name={self.node_name!r}, city={self.city!r})>"
