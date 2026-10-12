from datetime import date
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Date, Numeric, Text, ForeignKey, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.traveler import Traveler
    from app.models.transit_segment import TransitSegment
    from app.models.budget_allocation import BudgetAllocation


class Trip(Base):
    __tablename__ = "trips"

    trip_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    traveler_id: Mapped[str] = mapped_column(String(50), ForeignKey("travelers.traveler_id"), nullable=False)
    origin: Mapped[str] = mapped_column(String(100), nullable=False)
    destination: Mapped[str] = mapped_column(String(100), nullable=False)
    travel_date: Mapped[date] = mapped_column(Date, nullable=False)
    budget_cap: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    plan_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Phase 10 Canonical External Place & Setup Identity
    origin_provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    origin_place_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    origin_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    origin_lon: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    destination_provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    destination_place_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    destination_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    destination_lon: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    return_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    travellers: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=1)
    travel_style: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    traveler: Mapped["Traveler"] = relationship("Traveler", back_populates="trips")
    segments: Mapped[List["TransitSegment"]] = relationship("TransitSegment", back_populates="trip")
    budget_allocation: Mapped[Optional["BudgetAllocation"]] = relationship("BudgetAllocation", back_populates="trip", uselist=False)

    def __repr__(self) -> str:
        return f"<Trip(trip_id={self.trip_id!r}, origin={self.origin!r}, destination={self.destination!r}, budget_cap={self.budget_cap})>"
