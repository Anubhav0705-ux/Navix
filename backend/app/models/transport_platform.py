from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean, Date, DateTime, Text, ForeignKey, CheckConstraint, Index, UniqueConstraint
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base


class TransportProvider(Base):
    __tablename__ = "transport_providers"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    operator_name = Column(String(255), nullable=True)
    code_system = Column(String(64), nullable=False)
    transport_mode = Column(String(32), nullable=False)  # RAIL, BUS, FLIGHT, METRO, FERRY
    website_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    services = relationship("TransportService", back_populates="provider", cascade="all, delete-orphan")


class TransportService(Base):
    __tablename__ = "transport_services"

    id = Column(String(64), primary_key=True)
    provider_id = Column(String(64), ForeignKey("transport_providers.id", ondelete="CASCADE"), nullable=False)
    service_code = Column(String(64), nullable=False)
    service_name = Column(String(255), nullable=False)
    transport_mode = Column(String(32), nullable=False)
    origin_facility_id = Column(String(64), ForeignKey("transit_facilities.facility_id", ondelete="SET NULL"), nullable=True)
    destination_facility_id = Column(String(64), ForeignKey("transit_facilities.facility_id", ondelete="SET NULL"), nullable=True)
    data_state = Column(String(32), nullable=False, default="SCHEDULED")  # STATIC, SCHEDULED, LIVE, ESTIMATED, STALE, UNKNOWN
    data_class = Column(String(32), nullable=False, default="REAL_SOURCE_DERIVED")  # REAL_SOURCE_DERIVED, SYNTHETIC_CONTRACT_FIXTURE, LEGACY_DEMO
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    provider = relationship("TransportProvider", back_populates="services")
    calendar = relationship("TransportServiceCalendar", back_populates="service", uselist=False, cascade="all, delete-orphan")
    calling_points = relationship("TransportCallingPoint", back_populates="service", cascade="all, delete-orphan", order_by="TransportCallingPoint.stop_sequence")
    fares = relationship("TransportFare", back_populates="service", cascade="all, delete-orphan")
    availabilities = relationship("TransportAvailability", back_populates="service", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("provider_id", "service_code", name="uq_transport_service_provider_code"),
        CheckConstraint("transport_mode IN ('RAIL', 'BUS', 'FLIGHT', 'METRO', 'FERRY', 'LOCAL_TRANSIT')", name="chk_transport_service_mode"),
        CheckConstraint("data_state IN ('STATIC', 'SCHEDULED', 'LIVE', 'ESTIMATED', 'STALE', 'UNKNOWN')", name="chk_transport_service_data_state"),
        CheckConstraint("data_class IN ('REAL_SOURCE_DERIVED', 'SYNTHETIC_CONTRACT_FIXTURE', 'LEGACY_DEMO')", name="chk_transport_service_data_class"),
        Index("idx_transport_service_provider_mode", "provider_id", "transport_mode"),
        Index("idx_transport_service_origin_dest", "origin_facility_id", "destination_facility_id"),
    )


class TransportServiceCalendar(Base):
    __tablename__ = "transport_service_calendars"

    id = Column(String(64), primary_key=True)
    service_id = Column(String(64), ForeignKey("transport_services.id", ondelete="CASCADE"), nullable=False, unique=True)
    monday = Column(Boolean, default=True, nullable=False)
    tuesday = Column(Boolean, default=True, nullable=False)
    wednesday = Column(Boolean, default=True, nullable=False)
    thursday = Column(Boolean, default=True, nullable=False)
    friday = Column(Boolean, default=True, nullable=False)
    saturday = Column(Boolean, default=True, nullable=False)
    sunday = Column(Boolean, default=True, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    service = relationship("TransportService", back_populates="calendar")


class TransportTrip(Base):
    __tablename__ = "transport_trips"

    id = Column(String(64), primary_key=True)
    service_id = Column(String(64), ForeignKey("transport_services.id", ondelete="CASCADE"), nullable=False)
    trip_headsign = Column(String(255), nullable=True)
    direction_id = Column(Integer, default=0, nullable=False)
    data_state = Column(String(32), default="SCHEDULED", nullable=False)


class TransportCallingPoint(Base):
    __tablename__ = "transport_calling_points"

    id = Column(String(64), primary_key=True)
    service_id = Column(String(64), ForeignKey("transport_services.id", ondelete="CASCADE"), nullable=False)
    trip_id = Column(String(64), ForeignKey("transport_trips.id", ondelete="CASCADE"), nullable=True)
    facility_id = Column(String(64), ForeignKey("transit_facilities.facility_id", ondelete="SET NULL"), nullable=True)
    provider_stop_code = Column(String(64), nullable=True)
    stop_name = Column(String(255), nullable=False)
    stop_sequence = Column(Integer, nullable=False)
    arrival_time = Column(String(16), nullable=False)
    departure_time = Column(String(16), nullable=False)
    day_offset = Column(Integer, default=0, nullable=False)
    pickup_type = Column(Integer, default=0, nullable=False)
    dropoff_type = Column(Integer, default=0, nullable=False)

    service = relationship("TransportService", back_populates="calling_points")

    __table_args__ = (
        UniqueConstraint("service_id", "stop_sequence", name="uq_transport_calling_point_seq"),
        Index("idx_transport_calling_point_facility", "facility_id"),
        Index("idx_transport_calling_point_service", "service_id"),
    )


class TransportFare(Base):
    __tablename__ = "transport_fares"

    id = Column(String(64), primary_key=True)
    service_id = Column(String(64), ForeignKey("transport_services.id", ondelete="CASCADE"), nullable=False)
    origin_facility_id = Column(String(64), ForeignKey("transit_facilities.facility_id", ondelete="SET NULL"), nullable=True)
    destination_facility_id = Column(String(64), ForeignKey("transit_facilities.facility_id", ondelete="SET NULL"), nullable=True)
    fare_class = Column(String(32), nullable=False)
    fare_status = Column(String(32), default="NOT_PROVIDED", nullable=False)  # PUBLISHED, NOT_PROVIDED, ESTIMATED, UNAVAILABLE
    amount = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(8), default="INR", nullable=False)
    is_estimated = Column(Boolean, default=False, nullable=False)
    data_source = Column(String(128), nullable=True)
    retrieved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    service = relationship("TransportService", back_populates="fares")

    __table_args__ = (
        CheckConstraint("amount IS NULL OR amount >= 0", name="chk_transport_fare_amount_positive"),
        CheckConstraint("fare_status IN ('PUBLISHED', 'NOT_PROVIDED', 'ESTIMATED', 'UNAVAILABLE')", name="chk_transport_fare_status"),
        Index("idx_transport_fare_service", "service_id"),
        Index("idx_transport_fare_od", "origin_facility_id", "destination_facility_id"),
    )


class TransportAvailability(Base):
    __tablename__ = "transport_availabilities"

    id = Column(String(64), primary_key=True)
    service_id = Column(String(64), ForeignKey("transport_services.id", ondelete="CASCADE"), nullable=False)
    service_date = Column(Date, nullable=False)
    fare_class = Column(String(32), nullable=True)
    availability_status = Column(String(32), nullable=False, default="NOT_PROVIDED")  # AVAILABLE, UNAVAILABLE, UNKNOWN, NOT_PROVIDED, STALE
    available_seats = Column(Integer, nullable=True)
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    service = relationship("TransportService", back_populates="availabilities")

    __table_args__ = (
        CheckConstraint("availability_status IN ('AVAILABLE', 'UNAVAILABLE', 'UNKNOWN', 'NOT_PROVIDED', 'STALE')", name="chk_transport_avail_status"),
        Index("idx_transport_avail_service_date", "service_id", "service_date"),
    )


class TransportProvenance(Base):
    __tablename__ = "transport_provenance"

    id = Column(String(64), primary_key=True)
    source_id = Column(String(64), nullable=False)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=False)
    dataset_name = Column(String(255), nullable=False)
    dataset_url = Column(String(512), nullable=True)
    license = Column(String(128), nullable=False)
    attribution = Column(Text, nullable=True)
    ingested_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_transport_prov_entity", "entity_type", "entity_id"),
        Index("idx_transport_prov_source", "source_id"),
    )


class TransportIngestionRun(Base):
    __tablename__ = "transport_ingestion_runs"

    id = Column(String(64), primary_key=True)
    source_id = Column(String(64), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(32), nullable=False, default="RUNNING")  # RUNNING, SUCCESS, PARTIAL, FAILED
    records_read = Column(Integer, default=0, nullable=False)
    records_inserted = Column(Integer, default=0, nullable=False)
    records_updated = Column(Integer, default=0, nullable=False)
    records_skipped = Column(Integer, default=0, nullable=False)
    records_rejected = Column(Integer, default=0, nullable=False)
    error_count = Column(Integer, default=0, nullable=False)
    error_log = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED')", name="chk_transport_ingest_status"),
    )
