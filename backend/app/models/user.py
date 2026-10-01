from typing import Optional, TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.traveler import Traveler
    from app.models.admin import Admin


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)

    # Relationships
    traveler: Mapped[Optional["Traveler"]] = relationship("Traveler", back_populates="user", uselist=False)
    admin: Mapped[Optional["Admin"]] = relationship("Admin", back_populates="user", uselist=False)

    def __repr__(self) -> str:
        return f"<User(user_id={self.user_id!r}, name={self.name!r}, role={self.role!r})>"
