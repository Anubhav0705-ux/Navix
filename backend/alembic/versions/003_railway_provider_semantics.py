"""Railway Provider Semantics Migration (IRCTC -> INDIAN_RAILWAYS)

Revision ID: 003_railway_semantics
Revises: 002_search_indexes
Create Date: 2026-10-10 17:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_railway_semantics'
down_revision: Union[str, None] = '002_search_indexes'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Update check constraint to allow INDIAN_RAILWAYS
    op.execute("ALTER TABLE provider_mappings DROP CONSTRAINT IF EXISTS chk_provider_name;")
    op.execute(
        "ALTER TABLE provider_mappings ADD CONSTRAINT chk_provider_name "
        "CHECK (provider_name IN ('IRCTC', 'INDIAN_RAILWAYS', 'GTFS_RAIL', 'GTFS_BUS', 'RED_BUS', 'IATA', 'OSM'));"
    )

    # 2. Update existing railway station code provider mappings from IRCTC to INDIAN_RAILWAYS
    op.execute(
        "UPDATE provider_mappings SET provider_name = 'INDIAN_RAILWAYS' "
        "WHERE provider_name = 'IRCTC';"
    )


def downgrade() -> None:
    # 1. Revert provider_name back to IRCTC
    op.execute(
        "UPDATE provider_mappings SET provider_name = 'IRCTC' "
        "WHERE provider_name = 'INDIAN_RAILWAYS';"
    )

    # 2. Restore original check constraint
    op.execute("ALTER TABLE provider_mappings DROP CONSTRAINT IF EXISTS chk_provider_name;")
    op.execute(
        "ALTER TABLE provider_mappings ADD CONSTRAINT chk_provider_name "
        "CHECK (provider_name IN ('IRCTC', 'GTFS_RAIL', 'GTFS_BUS', 'RED_BUS', 'IATA', 'OSM'));"
    )
