from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class BudgetAllocation(Base):
    __tablename__ = "budget_allocations"

    allocation_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    trip_id: Mapped[str] = mapped_column(String(50), ForeignKey("trips.trip_id"), nullable=False)
    transit_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True, default=Decimal("0.00"))
    lodging_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True, default=Decimal("0.00"))
    food_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True, default=Decimal("0.00"))
    activities_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True, default=Decimal("0.00"))
    total_cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    trip: Mapped["Trip"] = relationship("Trip", back_populates="budget_allocation")

    def __repr__(self) -> str:
        return f"<BudgetAllocation(allocation_id={self.allocation_id!r}, total_cost={self.total_cost})>"
