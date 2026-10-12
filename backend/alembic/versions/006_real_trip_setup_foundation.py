"""Real Trip Setup Foundation Schema (Phase 10)

Revision ID: 006_real_trip_setup_foundation
Revises: 005_gtfs_and_refresh_foundation
Create Date: 2026-10-12 11:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '006_real_trip_setup_foundation'
down_revision: Union[str, None] = '005_gtfs_and_refresh_foundation'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'trips' in tables:
        columns = [c['name'] for c in inspector.get_columns('trips')]
        if 'origin_provider' not in columns:
            op.add_column('trips', sa.Column('origin_provider', sa.String(length=50), nullable=True))
        if 'origin_place_id' not in columns:
            op.add_column('trips', sa.Column('origin_place_id', sa.String(length=100), nullable=True))
        if 'origin_lat' not in columns:
            op.add_column('trips', sa.Column('origin_lat', sa.Float(), nullable=True))
        if 'origin_lon' not in columns:
            op.add_column('trips', sa.Column('origin_lon', sa.Float(), nullable=True))
        if 'destination_provider' not in columns:
            op.add_column('trips', sa.Column('destination_provider', sa.String(length=50), nullable=True))
        if 'destination_place_id' not in columns:
            op.add_column('trips', sa.Column('destination_place_id', sa.String(length=100), nullable=True))
        if 'destination_lat' not in columns:
            op.add_column('trips', sa.Column('destination_lat', sa.Float(), nullable=True))
        if 'destination_lon' not in columns:
            op.add_column('trips', sa.Column('destination_lon', sa.Float(), nullable=True))
        if 'return_date' not in columns:
            op.add_column('trips', sa.Column('return_date', sa.Date(), nullable=True))
        if 'travellers' not in columns:
            op.add_column('trips', sa.Column('travellers', sa.Integer(), nullable=True, server_default='1'))
        if 'travel_style' not in columns:
            op.add_column('trips', sa.Column('travel_style', sa.String(length=50), nullable=True))
    else:
        # If trips does not exist yet (disposable schema-only test environment)
        op.create_table(
            'trips',
            sa.Column('trip_id', sa.String(length=50), primary_key=True),
            sa.Column('traveler_id', sa.String(length=50), nullable=False),
            sa.Column('origin', sa.String(length=100), nullable=False),
            sa.Column('destination', sa.String(length=100), nullable=False),
            sa.Column('travel_date', sa.Date(), nullable=False),
            sa.Column('budget_cap', sa.Numeric(precision=10, scale=2), nullable=False),
            sa.Column('plan_data', sa.Text(), nullable=True),
            sa.Column('origin_provider', sa.String(length=50), nullable=True),
            sa.Column('origin_place_id', sa.String(length=100), nullable=True),
            sa.Column('origin_lat', sa.Float(), nullable=True),
            sa.Column('origin_lon', sa.Float(), nullable=True),
            sa.Column('destination_provider', sa.String(length=50), nullable=True),
            sa.Column('destination_place_id', sa.String(length=100), nullable=True),
            sa.Column('destination_lat', sa.Float(), nullable=True),
            sa.Column('destination_lon', sa.Float(), nullable=True),
            sa.Column('return_date', sa.Date(), nullable=True),
            sa.Column('travellers', sa.Integer(), nullable=True, server_default='1'),
            sa.Column('travel_style', sa.String(length=50), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()
    if 'trips' in tables:
        columns = [c['name'] for c in inspector.get_columns('trips')]
        cols_to_drop = [
            'travel_style', 'travellers', 'return_date',
            'destination_lon', 'destination_lat', 'destination_place_id', 'destination_provider',
            'origin_lon', 'origin_lat', 'origin_place_id', 'origin_provider'
        ]
        for col in cols_to_drop:
            if col in columns:
                op.drop_column('trips', col)
