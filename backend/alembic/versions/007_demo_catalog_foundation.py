"""Demo Catalog Foundation Schema (Presentation Release)

Revision ID: 007_demo_catalog_foundation
Revises: 006_real_trip_setup_foundation
Create Date: 2026-10-13 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '007_demo_catalog_foundation'
down_revision: Union[str, None] = '006_real_trip_setup_foundation'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # 1. demo_destinations
    if 'demo_destinations' not in tables:
        op.create_table(
            'demo_destinations',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('slug', sa.String(length=100), unique=True, nullable=False),
            sa.Column('name', sa.String(length=150), nullable=False),
            sa.Column('city', sa.String(length=100), nullable=False),
            sa.Column('state', sa.String(length=100), nullable=False),
            sa.Column('country', sa.String(length=100), server_default='India', nullable=False),
            sa.Column('latitude', sa.Float(), nullable=False),
            sa.Column('longitude', sa.Float(), nullable=False),
            sa.Column('categories', sa.JSON(), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('ideal_duration', sa.String(length=50), nullable=False),
            sa.Column('best_season', sa.String(length=100), nullable=False),
            sa.Column('daily_budget', sa.Float(), nullable=False),
            sa.Column('hero_image', sa.String(length=500), nullable=False),
            sa.Column('rating', sa.Float(), server_default='4.7', nullable=False),
            sa.Column('popularity_score', sa.Float(), server_default='85.0', nullable=False),
            sa.Column('data_state', sa.String(length=50), server_default='DEMO_SEED', nullable=False),
            sa.Column('price_state', sa.String(length=50), server_default='DEMO_ESTIMATE', nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )
        op.create_index('ix_demo_destinations_slug', 'demo_destinations', ['slug'], unique=True)
        op.create_index('ix_demo_destinations_city', 'demo_destinations', ['city'])

    # 2. demo_attractions
    if 'demo_attractions' not in tables:
        op.create_table(
            'demo_attractions',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('destination_id', sa.String(length=50), sa.ForeignKey('demo_destinations.id', ondelete='CASCADE'), nullable=False),
            sa.Column('destination_slug', sa.String(length=100), nullable=False),
            sa.Column('name', sa.String(length=150), nullable=False),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('latitude', sa.Float(), nullable=False),
            sa.Column('longitude', sa.Float(), nullable=False),
            sa.Column('rating', sa.Float(), nullable=False),
            sa.Column('visit_duration_minutes', sa.Integer(), nullable=False),
            sa.Column('entry_fee', sa.Float(), server_default='0.0', nullable=False),
            sa.Column('opening_time', sa.String(length=20), server_default='09:00', nullable=False),
            sa.Column('closing_time', sa.String(length=20), server_default='18:00', nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('image', sa.String(length=500), nullable=False),
            sa.Column('recommended_score', sa.Float(), server_default='80.0', nullable=False),
            sa.Column('data_state', sa.String(length=50), server_default='DEMO_SEED', nullable=False),
            sa.Column('price_state', sa.String(length=50), server_default='DEMO_ESTIMATE', nullable=False),
        )
        op.create_index('ix_demo_attractions_dest_slug', 'demo_attractions', ['destination_slug'])
        op.create_index('ix_demo_attractions_category', 'demo_attractions', ['category'])

    # 3. demo_food_places
    if 'demo_food_places' not in tables:
        op.create_table(
            'demo_food_places',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('destination_id', sa.String(length=50), sa.ForeignKey('demo_destinations.id', ondelete='CASCADE'), nullable=False),
            sa.Column('destination_slug', sa.String(length=100), nullable=False),
            sa.Column('name', sa.String(length=150), nullable=False),
            sa.Column('cuisine', sa.String(length=100), nullable=False),
            sa.Column('dietary', sa.String(length=50), server_default='both', nullable=False),
            sa.Column('rating', sa.Float(), nullable=False),
            sa.Column('cost_for_two', sa.Float(), nullable=False),
            sa.Column('opening_hours', sa.String(length=50), server_default='11:00 - 23:00', nullable=False),
            sa.Column('latitude', sa.Float(), nullable=False),
            sa.Column('longitude', sa.Float(), nullable=False),
            sa.Column('speciality', sa.String(length=200), nullable=False),
            sa.Column('image', sa.String(length=500), nullable=False),
            sa.Column('data_state', sa.String(length=50), server_default='DEMO_SEED', nullable=False),
            sa.Column('price_state', sa.String(length=50), server_default='DEMO_ESTIMATE', nullable=False),
        )
        op.create_index('ix_demo_food_places_dest_slug', 'demo_food_places', ['destination_slug'])

    # 4. demo_hotels
    if 'demo_hotels' not in tables:
        op.create_table(
            'demo_hotels',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('destination_id', sa.String(length=50), sa.ForeignKey('demo_destinations.id', ondelete='CASCADE'), nullable=False),
            sa.Column('destination_slug', sa.String(length=100), nullable=False),
            sa.Column('name', sa.String(length=150), nullable=False),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('price_per_night', sa.Float(), nullable=False),
            sa.Column('rating', sa.Float(), nullable=False),
            sa.Column('room_type', sa.String(length=100), nullable=False),
            sa.Column('amenities', sa.JSON(), nullable=False),
            sa.Column('latitude', sa.Float(), nullable=False),
            sa.Column('longitude', sa.Float(), nullable=False),
            sa.Column('image', sa.String(length=500), nullable=False),
            sa.Column('availability', sa.Boolean(), server_default='true', nullable=False),
            sa.Column('data_state', sa.String(length=50), server_default='DEMO_SEED', nullable=False),
            sa.Column('price_state', sa.String(length=50), server_default='DEMO_ESTIMATE', nullable=False),
        )
        op.create_index('ix_demo_hotels_dest_slug', 'demo_hotels', ['destination_slug'])
        op.create_index('ix_demo_hotels_category', 'demo_hotels', ['category'])

    # 5. demo_stories
    if 'demo_stories' not in tables:
        op.create_table(
            'demo_stories',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('slug', sa.String(length=150), unique=True, nullable=False),
            sa.Column('title', sa.String(length=250), nullable=False),
            sa.Column('destination_slug', sa.String(length=100), nullable=False),
            sa.Column('destination_name', sa.String(length=150), nullable=False),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('summary', sa.Text(), nullable=False),
            sa.Column('body', sa.Text(), nullable=False),
            sa.Column('author', sa.String(length=100), nullable=False),
            sa.Column('read_time', sa.String(length=30), nullable=False),
            sa.Column('hero_image', sa.String(length=500), nullable=False),
            sa.Column('data_state', sa.String(length=50), server_default='DEMO_SEED', nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        )
        op.create_index('ix_demo_stories_slug', 'demo_stories', ['slug'], unique=True)
        op.create_index('ix_demo_stories_category', 'demo_stories', ['category'])


def downgrade() -> None:
    op.drop_table('demo_stories')
    op.drop_table('demo_hotels')
    op.drop_table('demo_food_places')
    op.drop_table('demo_attractions')
    op.drop_table('demo_destinations')
