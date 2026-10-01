from typing import List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.transit_schedule import TransitSchedule


class Admin(Base):
    __tablename__ = "admins"

    admin_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.user_id"), primary_key=True)
    department: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="admin")
    transit_schedules: Mapped[List["TransitSchedule"]] = relationship("TransitSchedule", back_populates="admin")

    def __repr__(self) -> str:
        return f"<Admin(admin_id={self.admin_id!r}, department={self.department!r})>"
