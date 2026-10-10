from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geography

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.geo_settlement import Settlement, Locality


class PointOfInterest(Base):
    __tablename__ = "points_of_interest"
    __table_args__ = (
        CheckConstraint("category IN ('Culture', 'Adventure', 'Nature', 'Heritage', 'Sightseeing', 'Wellness')", name="chk_poi_category"),
        CheckConstraint("estimated_visit_minutes > 0", name="chk_poi_visit_duration"),
        CheckConstraint("base_ticket_cost >= 0", name="chk_poi_ticket_cost"),
    )

    poi_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    settlement_id: Mapped[str] = mapped_column(String(50), ForeignKey("settlements.settlement_id"), nullable=False)
    locality_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("localities.locality_id"), nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[Geography] = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    estimated_visit_minutes: Mapped[int] = mapped_column(Integer, default=90, nullable=False)
    base_ticket_cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)

    # Relationships
    settlement: Mapped["Settlement"] = relationship("Settlement", back_populates="pois")
    locality: Mapped[Optional["Locality"]] = relationship("Locality", back_populates="pois")

    def __repr__(self) -> str:
        return f"<PointOfInterest(poi_id={self.poi_id!r}, name={self.name!r}, category={self.category!r})>"


class Accommodation(Base):
    __tablename__ = "accommodations"
    __table_args__ = (
        CheckConstraint("tier IN ('Budget', 'Standard', 'Comfort')", name="chk_acc_tier"),
        CheckConstraint("cost_per_night > 0", name="chk_acc_cost"),
    )

    accommodation_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    settlement_id: Mapped[str] = mapped_column(String(50), ForeignKey("settlements.settlement_id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    tier: Mapped[str] = mapped_column(String(20), nullable=False)
    cost_per_night: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    location: Mapped[Geography] = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=False)

    # Relationships
    settlement: Mapped["Settlement"] = relationship("Settlement", back_populates="accommodations")

    def __repr__(self) -> str:
        return f"<Accommodation(accommodation_id={self.accommodation_id!r}, name={self.name!r}, tier={self.tier!r})>"
