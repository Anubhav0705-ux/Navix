from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, BigInteger, Boolean, Numeric, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.geo_transit import TransitFacility
    from app.models.geo_settlement import Settlement


class LocationAlias(Base):
    __tablename__ = "location_aliases"
    __table_args__ = (
        CheckConstraint("entity_type IN ('SETTLEMENT', 'TRANSIT_FACILITY', 'POI')", name="chk_alias_entity_type"),
        CheckConstraint("alias_type IN ('ALTERNATIVE_NAME', 'HISTORICAL', 'TRANSLITERATION', 'COMMON_TYPO')", name="chk_alias_type"),
    )

    alias_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(30), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(50), nullable=False)
    alias_name: Mapped[str] = mapped_column(String(200), nullable=False)
    language_code: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    alias_type: Mapped[str] = mapped_column(String(30), default="ALTERNATIVE_NAME", nullable=False)

    def __repr__(self) -> str:
        return f"<LocationAlias(alias_id={self.alias_id}, entity_type={self.entity_type!r}, alias_name={self.alias_name!r})>"


class ProviderLocationMapping(Base):
    __tablename__ = "provider_mappings"
    __table_args__ = (
        CheckConstraint("provider_name IN ('IRCTC', 'GTFS_RAIL', 'GTFS_BUS', 'RED_BUS', 'IATA', 'OSM')", name="chk_provider_name"),
        UniqueConstraint("provider_name", "provider_entity_id", name="uq_provider_mapping"),
    )

    mapping_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    facility_id: Mapped[str] = mapped_column(String(50), ForeignKey("transit_facilities.facility_id"), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    facility: Mapped["TransitFacility"] = relationship("TransitFacility", back_populates="provider_mappings")

    def __repr__(self) -> str:
        return f"<ProviderLocationMapping(mapping_id={self.mapping_id}, provider={self.provider_name!r}, code={self.provider_entity_id!r})>"


class GeoProvenance(Base):
    __tablename__ = "geo_provenance"
    __table_args__ = (
        CheckConstraint("confidence_score BETWEEN 0.00 AND 1.00", name="chk_provenance_confidence"),
    )

    provenance_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(30), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(50), nullable=False)
    data_source: Mapped[str] = mapped_column(String(100), nullable=False)
    license_type: Mapped[str] = mapped_column(String(50), nullable=False)
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    confidence_score: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("1.00"), nullable=False)

    def __repr__(self) -> str:
        return f"<GeoProvenance(provenance_id={self.provenance_id}, source={self.data_source!r}, score={self.confidence_score})>"


class LegacyGeoMapping(Base):
    __tablename__ = "legacy_geo_mapping"

    legacy_node_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    v1_facility_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("transit_facilities.facility_id"), nullable=True)
    v1_settlement_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("settlements.settlement_id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<LegacyGeoMapping(legacy_node_id={self.legacy_node_id!r}, v1_facility_id={self.v1_facility_id!r})>"
