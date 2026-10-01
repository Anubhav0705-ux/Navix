from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.trip import Trip


class Traveler(Base):
    __tablename__ = "travelers"

    traveler_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.user_id"), primary_key=True)
    preferences: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="traveler")
    trips: Mapped[List["Trip"]] = relationship("Trip", back_populates="traveler")

    def __repr__(self) -> str:
        return f"<Traveler(traveler_id={self.traveler_id!r})>"
