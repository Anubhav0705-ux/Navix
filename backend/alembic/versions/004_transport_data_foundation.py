"""Transport Data Foundation Schema (Phase 9 WP-9.1)

Revision ID: 004_transport_data_foundation
Revises: 003_railway_semantics
Create Date: 2026-10-10 23:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_transport_data_foundation'
down_revision: Union[str, None] = '003_railway_semantics'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Transport Providers
    op.create_table(
        'transport_providers',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('operator_name', sa.String(length=255), nullable=True),
        sa.Column('code_system', sa.String(length=64), nullable=False),
        sa.Column('transport_mode', sa.String(length=32), nullable=False),
        sa.Column('website_url', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 2. Transport Services
    op.create_table(
        'transport_services',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('provider_id', sa.String(length=64), nullable=False),
        sa.Column('service_code', sa.String(length=64), nullable=False),
        sa.Column('service_name', sa.String(length=255), nullable=False),
        sa.Column('transport_mode', sa.String(length=32), nullable=False),
        sa.Column('origin_facility_id', sa.String(length=64), nullable=True),
        sa.Column('destination_facility_id', sa.String(length=64), nullable=True),
        sa.Column('data_state', sa.String(length=32), server_default='SCHEDULED', nullable=False),
        sa.Column('data_class', sa.String(length=32), server_default='REAL_SOURCE_DERIVED', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['destination_facility_id'], ['transit_facilities.facility_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['origin_facility_id'], ['transit_facilities.facility_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['provider_id'], ['transport_providers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('provider_id', 'service_code', name='uq_transport_service_provider_code'),
        sa.CheckConstraint("transport_mode IN ('RAIL', 'BUS', 'FLIGHT', 'METRO', 'FERRY', 'LOCAL_TRANSIT')", name='chk_transport_service_mode'),
        sa.CheckConstraint("data_state IN ('STATIC', 'SCHEDULED', 'LIVE', 'ESTIMATED', 'STALE', 'UNKNOWN')", name='chk_transport_service_data_state'),
        sa.CheckConstraint("data_class IN ('REAL_SOURCE_DERIVED', 'SYNTHETIC_CONTRACT_FIXTURE', 'LEGACY_DEMO')", name='chk_transport_service_data_class')
    )
    op.create_index('idx_transport_service_origin_dest', 'transport_services', ['origin_facility_id', 'destination_facility_id'], unique=False)
    op.create_index('idx_transport_service_provider_mode', 'transport_services', ['provider_id', 'transport_mode'], unique=False)

    # 3. Transport Service Calendars
    op.create_table(
        'transport_service_calendars',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('service_id', sa.String(length=64), nullable=False),
        sa.Column('monday', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('tuesday', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('wednesday', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('thursday', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('friday', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('saturday', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('sunday', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['service_id'], ['transport_services.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('service_id')
    )

    # 4. Transport Trips
    op.create_table(
        'transport_trips',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('service_id', sa.String(length=64), nullable=False),
        sa.Column('trip_headsign', sa.String(length=255), nullable=True),
        sa.Column('direction_id', sa.Integer(), server_default='0', nullable=False),
        sa.Column('data_state', sa.String(length=32), server_default='SCHEDULED', nullable=False),
        sa.ForeignKeyConstraint(['service_id'], ['transport_services.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Transport Calling Points
    op.create_table(
        'transport_calling_points',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('service_id', sa.String(length=64), nullable=False),
        sa.Column('trip_id', sa.String(length=64), nullable=True),
        sa.Column('facility_id', sa.String(length=64), nullable=True),
        sa.Column('provider_stop_code', sa.String(length=64), nullable=True),
        sa.Column('stop_name', sa.String(length=255), nullable=False),
        sa.Column('stop_sequence', sa.Integer(), nullable=False),
        sa.Column('arrival_time', sa.String(length=16), nullable=False),
        sa.Column('departure_time', sa.String(length=16), nullable=False),
        sa.Column('day_offset', sa.Integer(), server_default='0', nullable=False),
        sa.Column('pickup_type', sa.Integer(), server_default='0', nullable=False),
        sa.Column('dropoff_type', sa.Integer(), server_default='0', nullable=False),
        sa.ForeignKeyConstraint(['facility_id'], ['transit_facilities.facility_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['service_id'], ['transport_services.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['trip_id'], ['transport_trips.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('service_id', 'stop_sequence', name='uq_transport_calling_point_seq')
    )
    op.create_index('idx_transport_calling_point_facility', 'transport_calling_points', ['facility_id'], unique=False)
    op.create_index('idx_transport_calling_point_service', 'transport_calling_points', ['service_id'], unique=False)

    # 6. Transport Fares
    op.create_table(
        'transport_fares',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('service_id', sa.String(length=64), nullable=False),
        sa.Column('origin_facility_id', sa.String(length=64), nullable=True),
        sa.Column('destination_facility_id', sa.String(length=64), nullable=True),
        sa.Column('fare_class', sa.String(length=32), nullable=False),
        sa.Column('fare_status', sa.String(length=32), server_default='NOT_PROVIDED', nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('currency', sa.String(length=8), server_default='INR', nullable=False),
        sa.Column('is_estimated', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('data_source', sa.String(length=128), nullable=True),
        sa.Column('retrieved_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['destination_facility_id'], ['transit_facilities.facility_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['origin_facility_id'], ['transit_facilities.facility_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['service_id'], ['transport_services.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('amount IS NULL OR amount >= 0', name='chk_transport_fare_amount_positive'),
        sa.CheckConstraint("fare_status IN ('PUBLISHED', 'NOT_PROVIDED', 'ESTIMATED', 'UNAVAILABLE')", name='chk_transport_fare_status')
    )
    op.create_index('idx_transport_fare_od', 'transport_fares', ['origin_facility_id', 'destination_facility_id'], unique=False)
    op.create_index('idx_transport_fare_service', 'transport_fares', ['service_id'], unique=False)

    # 7. Transport Availabilities
    op.create_table(
        'transport_availabilities',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('service_id', sa.String(length=64), nullable=False),
        sa.Column('service_date', sa.Date(), nullable=False),
        sa.Column('fare_class', sa.String(length=32), nullable=True),
        sa.Column('availability_status', sa.String(length=32), server_default='NOT_PROVIDED', nullable=False),
        sa.Column('available_seats', sa.Integer(), nullable=True),
        sa.Column('last_updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['service_id'], ['transport_services.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("availability_status IN ('AVAILABLE', 'UNAVAILABLE', 'UNKNOWN', 'NOT_PROVIDED', 'STALE')", name='chk_transport_avail_status')
    )
    op.create_index('idx_transport_avail_service_date', 'transport_availabilities', ['service_id', 'service_date'], unique=False)

    # 8. Transport Provenance
    op.create_table(
        'transport_provenance',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('entity_type', sa.String(length=64), nullable=False),
        sa.Column('entity_id', sa.String(length=64), nullable=False),
        sa.Column('dataset_name', sa.String(length=255), nullable=False),
        sa.Column('dataset_url', sa.String(length=512), nullable=True),
        sa.Column('license', sa.String(length=128), nullable=False),
        sa.Column('attribution', sa.Text(), nullable=True),
        sa.Column('ingested_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_transport_prov_entity', 'transport_provenance', ['entity_type', 'entity_id'], unique=False)
    op.create_index('idx_transport_prov_source', 'transport_provenance', ['source_id'], unique=False)

    # 9. Transport Ingestion Runs
    op.create_table(
        'transport_ingestion_runs',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=32), server_default='RUNNING', nullable=False),
        sa.Column('records_read', sa.Integer(), server_default='0', nullable=False),
        sa.Column('records_inserted', sa.Integer(), server_default='0', nullable=False),
        sa.Column('records_updated', sa.Integer(), server_default='0', nullable=False),
        sa.Column('records_skipped', sa.Integer(), server_default='0', nullable=False),
        sa.Column('records_rejected', sa.Integer(), server_default='0', nullable=False),
        sa.Column('error_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('error_log', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("status IN ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED')", name='chk_transport_ingest_status')
    )


def downgrade() -> None:
    op.drop_table('transport_ingestion_runs')
    op.drop_table('transport_provenance')
    op.drop_table('transport_availabilities')
    op.drop_table('transport_fares')
    op.drop_table('transport_calling_points')
    op.drop_table('transport_trips')
    op.drop_table('transport_service_calendars')
    op.drop_table('transport_services')
    op.drop_table('transport_providers')
