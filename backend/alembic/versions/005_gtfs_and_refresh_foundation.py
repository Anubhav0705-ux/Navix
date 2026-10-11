"""GTFS and Refresh Foundation Schema (Phase 9 WP-9.2 & WP-9.3)

Revision ID: 005_gtfs_and_refresh_foundation
Revises: 004_transport_data_foundation
Create Date: 2026-10-11 14:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005_gtfs_and_refresh_foundation'
down_revision: Union[str, None] = '004_transport_data_foundation'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add quarantined_reason column to transport_calling_points
    op.add_column(
        'transport_calling_points',
        sa.Column('quarantined_reason', sa.String(length=255), nullable=True)
    )

    # 2. Transport Feeds (GTFS Feed Metadata and Versioning)
    op.create_table(
        'transport_feeds',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('feed_publisher_name', sa.String(length=255), nullable=False),
        sa.Column('feed_publisher_url', sa.String(length=512), nullable=True),
        sa.Column('feed_lang', sa.String(length=16), server_default='en', nullable=True),
        sa.Column('feed_version', sa.String(length=64), nullable=True),
        sa.Column('feed_start_date', sa.Date(), nullable=True),
        sa.Column('feed_end_date', sa.Date(), nullable=True),
        sa.Column('sha256', sa.String(length=64), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('imported_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_transport_feed_source', 'transport_feeds', ['source_id'])

    # 3. Transport Calendar Dates (GTFS Service Exceptions: Added/Removed Service)
    op.create_table(
        'transport_calendar_dates',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('service_id', sa.String(length=64), nullable=False),
        sa.Column('exception_date', sa.Date(), nullable=False),
        sa.Column('exception_type', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['service_id'], ['transport_services.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('exception_type IN (1, 2)', name='chk_transport_cal_date_type')
    )
    op.create_index('idx_transport_cal_date_service', 'transport_calendar_dates', ['service_id', 'exception_date'])

    # 4. Transport Service Alerts (Disruptions, Delays, Route Modifications)
    op.create_table(
        'transport_service_alerts',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('service_id', sa.String(length=64), nullable=True),
        sa.Column('header_text', sa.Text(), nullable=False),
        sa.Column('description_text', sa.Text(), nullable=True),
        sa.Column('cause', sa.String(length=64), server_default='UNKNOWN_CAUSE', nullable=False),
        sa.Column('effect', sa.String(length=64), server_default='UNKNOWN_EFFECT', nullable=False),
        sa.Column('active_from', sa.DateTime(timezone=True), nullable=True),
        sa.Column('active_to', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['service_id'], ['transport_services.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_transport_alert_service', 'transport_service_alerts', ['service_id'])

    # 5. Transport Realtime Observations (Delays, Vehicle Coordinates, Stale Tracking)
    op.create_table(
        'transport_realtime_observations',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('service_id', sa.String(length=64), nullable=False),
        sa.Column('trip_id', sa.String(length=64), nullable=True),
        sa.Column('stop_sequence', sa.Integer(), nullable=True),
        sa.Column('delay_seconds', sa.Integer(), server_default='0', nullable=False),
        sa.Column('vehicle_lat', sa.Numeric(precision=9, scale=6), nullable=True),
        sa.Column('vehicle_lon', sa.Numeric(precision=9, scale=6), nullable=True),
        sa.Column('observed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_stale', sa.Boolean(), server_default='false', nullable=False),
        sa.ForeignKeyConstraint(['service_id'], ['transport_services.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_transport_rt_service_observed', 'transport_realtime_observations', ['service_id', 'observed_at'])

    # 6. Transport Refresh Locks (Distributed Concurrency Guard for Scheduled Ingestion)
    op.create_table(
        'transport_refresh_locks',
        sa.Column('source_id', sa.String(length=64), nullable=False),
        sa.Column('locked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('locked_by', sa.String(length=128), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('source_id')
    )


def downgrade() -> None:
    op.drop_table('transport_refresh_locks')
    op.drop_table('transport_realtime_observations')
    op.drop_table('transport_service_alerts')
    op.drop_table('transport_calendar_dates')
    op.drop_table('transport_feeds')
    op.drop_column('transport_calling_points', 'quarantined_reason')
