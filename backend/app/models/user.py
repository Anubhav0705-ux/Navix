from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.traveler import Traveler
    from app.models.admin import Admin
    from app.models.password_reset import PasswordResetRequest


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    traveler: Mapped[Optional["Traveler"]] = relationship("Traveler", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin: Mapped[Optional["Admin"]] = relationship("Admin", back_populates="user", uselist=False, cascade="all, delete-orphan")
    password_resets: Mapped[List["PasswordResetRequest"]] = relationship(
        "PasswordResetRequest",
        back_populates="user",
        foreign_keys="[PasswordResetRequest.user_id]",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(user_id={self.user_id!r}, name={self.name!r}, role={self.role!r})>"
