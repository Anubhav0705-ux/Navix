from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geography

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.geo_settlement import Settlement


class Country(Base):
    __tablename__ = "countries"

    country_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    iso_code_2: Mapped[str] = mapped_column(String(2), unique=True, nullable=False)
    iso_code_3: Mapped[str] = mapped_column(String(3), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    default_currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    default_timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata", nullable=False)

    # Relationships
    admin_divisions: Mapped[List["AdminDivision"]] = relationship("AdminDivision", back_populates="country", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Country(country_id={self.country_id!r}, iso_code_2={self.iso_code_2!r}, name={self.name!r})>"


class AdminDivision(Base):
    __tablename__ = "admin_divisions"
    __table_args__ = (
        CheckConstraint("division_level IN ('STATE', 'UT', 'DISTRICT', 'SUB_DISTRICT')", name="chk_admin_div_level"),
    )

    division_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    country_id: Mapped[str] = mapped_column(String(10), ForeignKey("countries.country_id"), nullable=False)
    parent_division_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("admin_divisions.division_id"), nullable=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    division_level: Mapped[str] = mapped_column(String(30), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    boundary_polygon: Mapped[Optional[Geography]] = mapped_column(Geography(geometry_type="POLYGON", srid=4326), nullable=True)

    # Relationships
    country: Mapped["Country"] = relationship("Country", back_populates="admin_divisions")
    parent_division: Mapped[Optional["AdminDivision"]] = relationship("AdminDivision", remote_side=[division_id], back_populates="sub_divisions")
    sub_divisions: Mapped[List["AdminDivision"]] = relationship("AdminDivision", back_populates="parent_division")
    settlements: Mapped[List["Settlement"]] = relationship("Settlement", back_populates="admin_division")

    def __repr__(self) -> str:
        return f"<AdminDivision(division_id={self.division_id!r}, name={self.name!r}, level={self.division_level!r})>"
