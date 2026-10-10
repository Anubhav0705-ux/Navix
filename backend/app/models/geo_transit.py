from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geography

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.geo_settlement import Settlement
    from app.models.geo_mapping import ProviderLocationMapping


class TransitFacility(Base):
    __tablename__ = "transit_facilities"
    __table_args__ = (
        CheckConstraint("facility_type IN ('RAIL_STATION', 'BUS_TERMINAL', 'AIRPORT', 'METRO_STATION', 'MULTIMODAL_HUB')", name="chk_facility_type"),
        CheckConstraint("operating_status IN ('ACTIVE', 'TEMPORARY_CLOSED', 'PLANNED')", name="chk_operating_status"),
    )

    facility_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    settlement_id: Mapped[str] = mapped_column(String(50), ForeignKey("settlements.settlement_id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    facility_type: Mapped[str] = mapped_column(String(30), nullable=False)
    location: Mapped[Geography] = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    is_multimodal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    operating_status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)

    # Relationships
    settlement: Mapped["Settlement"] = relationship("Settlement", back_populates="facilities")
    stops: Mapped[List["TransitStop"]] = relationship("TransitStop", back_populates="facility", cascade="all, delete-orphan")
    provider_mappings: Mapped[List["ProviderLocationMapping"]] = relationship("ProviderLocationMapping", back_populates="facility", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<TransitFacility(facility_id={self.facility_id!r}, name={self.name!r}, type={self.facility_type!r})>"


class TransitStop(Base):
    __tablename__ = "transit_stops"

    stop_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    facility_id: Mapped[str] = mapped_column(String(50), ForeignKey("transit_facilities.facility_id"), nullable=False)
    stop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    stop_code: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    location: Mapped[Optional[Geography]] = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=True)

    # Relationships
    facility: Mapped["TransitFacility"] = relationship("TransitFacility", back_populates="stops")

    def __repr__(self) -> str:
        return f"<TransitStop(stop_id={self.stop_id!r}, stop_name={self.stop_name!r})>"
