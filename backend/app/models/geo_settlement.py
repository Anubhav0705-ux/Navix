from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geography

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.geo_administrative import AdminDivision
    from app.models.geo_transit import TransitFacility
    from app.models.geo_poi import PointOfInterest, Accommodation


class Settlement(Base):
    __tablename__ = "settlements"
    __table_args__ = (
        CheckConstraint("settlement_type IN ('METRO', 'CITY', 'TOWN', 'VILLAGE')", name="chk_settlement_type"),
        CheckConstraint("population_tier BETWEEN 1 AND 4", name="chk_population_tier"),
        CheckConstraint("coverage_status IN ('COVERED', 'UNCOVERED', 'PARTIAL')", name="chk_settlement_coverage"),
    )

    settlement_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    admin_division_id: Mapped[str] = mapped_column(String(50), ForeignKey("admin_divisions.division_id"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    settlement_type: Mapped[str] = mapped_column(String(30), nullable=False)
    population_tier: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    location: Mapped[Geography] = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata", nullable=False)
    coverage_status: Mapped[str] = mapped_column(String(20), default="UNCOVERED", nullable=False)

    # Relationships
    admin_division: Mapped["AdminDivision"] = relationship("AdminDivision", back_populates="settlements")
    localities: Mapped[List["Locality"]] = relationship("Locality", back_populates="settlement", cascade="all, delete-orphan")
    facilities: Mapped[List["TransitFacility"]] = relationship("TransitFacility", back_populates="settlement", cascade="all, delete-orphan")
    pois: Mapped[List["PointOfInterest"]] = relationship("PointOfInterest", back_populates="settlement", cascade="all, delete-orphan")
    accommodations: Mapped[List["Accommodation"]] = relationship("Accommodation", back_populates="settlement", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Settlement(settlement_id={self.settlement_id!r}, name={self.name!r}, type={self.settlement_type!r})>"


class Locality(Base):
    __tablename__ = "localities"

    locality_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    settlement_id: Mapped[str] = mapped_column(String(50), ForeignKey("settlements.settlement_id"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    location: Mapped[Geography] = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    # Relationships
    settlement: Mapped["Settlement"] = relationship("Settlement", back_populates="localities")
    pois: Mapped[List["PointOfInterest"]] = relationship("PointOfInterest", back_populates="locality")

    def __repr__(self) -> str:
        return f"<Locality(locality_id={self.locality_id!r}, name={self.name!r})>"
