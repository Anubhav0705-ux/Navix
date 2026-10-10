"""Location Search Trigram & Provider Code Indexes

Revision ID: 002_search_indexes
Revises: 001_national_geo
Create Date: 2026-10-10 16:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_search_indexes'
down_revision: Union[str, None] = '001_national_geo'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. GIN Trigram Indexes for Fast Substring and Fuzzy Matching on Settlements & Facilities
    op.execute("CREATE INDEX IF NOT EXISTS idx_settlements_name_trgm ON settlements USING gin (name gin_trgm_ops);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_transit_fac_name_trgm ON transit_facilities USING gin (name gin_trgm_ops);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_localities_name_trgm ON localities USING gin (name gin_trgm_ops);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_poi_name_trgm ON points_of_interest USING gin (name gin_trgm_ops);")

    # 2. B-Tree Index on provider_entity_id for fast station/airport code lookup
    op.create_index('idx_provider_map_entity_id', 'provider_mappings', ['provider_entity_id'])


def downgrade() -> None:
    op.drop_index('idx_provider_map_entity_id', table_name='provider_mappings')
    op.execute("DROP INDEX IF EXISTS idx_poi_name_trgm;")
    op.execute("DROP INDEX IF EXISTS idx_localities_name_trgm;")
    op.execute("DROP INDEX IF EXISTS idx_transit_fac_name_trgm;")
    op.execute("DROP INDEX IF EXISTS idx_settlements_name_trgm;")
