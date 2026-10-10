"""Phase 8.1 National PostGIS Geographic Schema Foundation

Revision ID: 001_national_geo
Revises: 
Create Date: 2026-10-10 14:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography

# revision identifiers, used by Alembic.
revision: str = '001_national_geo'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable PostGIS & pg_trgm extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

    # 2. Table: countries
    op.create_table(
        'countries',
        sa.Column('country_id', sa.String(length=10), nullable=False),
        sa.Column('iso_code_2', sa.String(length=2), nullable=False),
        sa.Column('iso_code_3', sa.String(length=3), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('default_currency', sa.String(length=3), server_default='INR', nullable=False),
        sa.Column('default_timezone', sa.String(length=50), server_default='Asia/Kolkata', nullable=False),
        sa.PrimaryKeyConstraint('country_id'),
        sa.UniqueConstraint('iso_code_2'),
        sa.UniqueConstraint('iso_code_3')
    )

    # 3. Table: admin_divisions
    op.create_table(
        'admin_divisions',
        sa.Column('division_id', sa.String(length=50), nullable=False),
        sa.Column('country_id', sa.String(length=10), nullable=False),
        sa.Column('parent_division_id', sa.String(length=50), nullable=True),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('division_level', sa.String(length=30), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=True),
        sa.Column('boundary_polygon', Geography(geometry_type='POLYGON', srid=4326), nullable=True),
        sa.CheckConstraint("division_level IN ('STATE', 'UT', 'DISTRICT', 'SUB_DISTRICT')", name='chk_admin_div_level'),
        sa.ForeignKeyConstraint(['country_id'], ['countries.country_id']),
        sa.ForeignKeyConstraint(['parent_division_id'], ['admin_divisions.division_id']),
        sa.PrimaryKeyConstraint('division_id')
    )
    op.create_index('idx_admin_div_country', 'admin_divisions', ['country_id'])
    op.create_index('idx_admin_div_parent', 'admin_divisions', ['parent_division_id'])

    # 4. Table: settlements
    op.create_table(
        'settlements',
        sa.Column('settlement_id', sa.String(length=50), nullable=False),
        sa.Column('admin_division_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('settlement_type', sa.String(length=30), nullable=False),
        sa.Column('population_tier', sa.Integer(), nullable=True),
        sa.Column('location', Geography(geometry_type='POINT', srid=4326), nullable=False),
        sa.Column('timezone', sa.String(length=50), server_default='Asia/Kolkata', nullable=False),
        sa.Column('coverage_status', sa.String(length=20), server_default='UNCOVERED', nullable=False),
        sa.CheckConstraint("settlement_type IN ('METRO', 'CITY', 'TOWN', 'VILLAGE')", name='chk_settlement_type'),
        sa.CheckConstraint('population_tier BETWEEN 1 AND 4', name='chk_population_tier'),
        sa.CheckConstraint("coverage_status IN ('COVERED', 'UNCOVERED', 'PARTIAL')", name='chk_settlement_coverage'),
        sa.ForeignKeyConstraint(['admin_division_id'], ['admin_divisions.division_id']),
        sa.PrimaryKeyConstraint('settlement_id')
    )
    op.create_index('idx_settlements_admin', 'settlements', ['admin_division_id'])
    op.create_index('idx_settlements_coverage', 'settlements', ['coverage_status'])

    # 5. Table: localities
    op.create_table(
        'localities',
        sa.Column('locality_id', sa.String(length=50), nullable=False),
        sa.Column('settlement_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('location', Geography(geometry_type='POINT', srid=4326), nullable=False),
        sa.Column('pincode', sa.String(length=10), nullable=True),
        sa.ForeignKeyConstraint(['settlement_id'], ['settlements.settlement_id']),
        sa.PrimaryKeyConstraint('locality_id')
    )
    op.create_index('idx_localities_settlement', 'localities', ['settlement_id'])

    # 6. Table: transit_facilities
    op.create_table(
        'transit_facilities',
        sa.Column('facility_id', sa.String(length=50), nullable=False),
        sa.Column('settlement_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('facility_type', sa.String(length=30), nullable=False),
        sa.Column('location', Geography(geometry_type='POINT', srid=4326), nullable=False),
        sa.Column('is_multimodal', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('operating_status', sa.String(length=20), server_default='ACTIVE', nullable=False),
        sa.CheckConstraint("facility_type IN ('RAIL_STATION', 'BUS_TERMINAL', 'AIRPORT', 'METRO_STATION', 'MULTIMODAL_HUB')", name='chk_facility_type'),
        sa.CheckConstraint("operating_status IN ('ACTIVE', 'TEMPORARY_CLOSED', 'PLANNED')", name='chk_operating_status'),
        sa.ForeignKeyConstraint(['settlement_id'], ['settlements.settlement_id']),
        sa.PrimaryKeyConstraint('facility_id')
    )
    op.create_index('idx_transit_fac_settlement', 'transit_facilities', ['settlement_id'])
    op.create_index('idx_transit_fac_type', 'transit_facilities', ['facility_type'])

    # 7. Table: transit_stops
    op.create_table(
        'transit_stops',
        sa.Column('stop_id', sa.String(length=50), nullable=False),
        sa.Column('facility_id', sa.String(length=50), nullable=False),
        sa.Column('stop_name', sa.String(length=100), nullable=False),
        sa.Column('stop_code', sa.String(length=30), nullable=True),
        sa.Column('location', Geography(geometry_type='POINT', srid=4326), nullable=True),
        sa.ForeignKeyConstraint(['facility_id'], ['transit_facilities.facility_id']),
        sa.PrimaryKeyConstraint('stop_id')
    )
    op.create_index('idx_transit_stops_facility', 'transit_stops', ['facility_id'])

    # 8. Table: points_of_interest
    op.create_table(
        'points_of_interest',
        sa.Column('poi_id', sa.String(length=50), nullable=False),
        sa.Column('settlement_id', sa.String(length=50), nullable=False),
        sa.Column('locality_id', sa.String(length=50), nullable=True),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('location', Geography(geometry_type='POINT', srid=4326), nullable=False),
        sa.Column('estimated_visit_minutes', sa.Integer(), server_default='90', nullable=False),
        sa.Column('base_ticket_cost', sa.Numeric(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.CheckConstraint("category IN ('Culture', 'Adventure', 'Nature', 'Heritage', 'Sightseeing', 'Wellness')", name='chk_poi_category'),
        sa.CheckConstraint('estimated_visit_minutes > 0', name='chk_poi_visit_duration'),
        sa.CheckConstraint('base_ticket_cost >= 0', name='chk_poi_ticket_cost'),
        sa.ForeignKeyConstraint(['locality_id'], ['localities.locality_id']),
        sa.ForeignKeyConstraint(['settlement_id'], ['settlements.settlement_id']),
        sa.PrimaryKeyConstraint('poi_id')
    )
    op.create_index('idx_poi_category', 'points_of_interest', ['category'])
    op.create_index('idx_poi_settlement', 'points_of_interest', ['settlement_id'])

    # 9. Table: accommodations
    op.create_table(
        'accommodations',
        sa.Column('accommodation_id', sa.String(length=50), nullable=False),
        sa.Column('settlement_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('tier', sa.String(length=20), nullable=False),
        sa.Column('cost_per_night', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('location', Geography(geometry_type='POINT', srid=4326), nullable=False),
        sa.CheckConstraint("tier IN ('Budget', 'Standard', 'Comfort')", name='chk_acc_tier'),
        sa.CheckConstraint('cost_per_night > 0', name='chk_acc_cost'),
        sa.ForeignKeyConstraint(['settlement_id'], ['settlements.settlement_id']),
        sa.PrimaryKeyConstraint('accommodation_id')
    )
    op.create_index('idx_acc_settlement', 'accommodations', ['settlement_id'])

    # 10. Table: location_aliases
    op.create_table(
        'location_aliases',
        sa.Column('alias_id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('entity_type', sa.String(length=30), nullable=False),
        sa.Column('entity_id', sa.String(length=50), nullable=False),
        sa.Column('alias_name', sa.String(length=200), nullable=False),
        sa.Column('language_code', sa.String(length=10), server_default='en', nullable=False),
        sa.Column('alias_type', sa.String(length=30), server_default='ALTERNATIVE_NAME', nullable=False),
        sa.CheckConstraint("alias_type IN ('ALTERNATIVE_NAME', 'HISTORICAL', 'TRANSLITERATION', 'COMMON_TYPO')", name='chk_alias_type'),
        sa.CheckConstraint("entity_type IN ('SETTLEMENT', 'TRANSIT_FACILITY', 'POI')", name='chk_alias_entity_type'),
        sa.PrimaryKeyConstraint('alias_id')
    )
    op.create_index('idx_aliases_lookup', 'location_aliases', ['entity_type', 'entity_id'])
    op.execute("CREATE INDEX idx_aliases_trgm ON location_aliases USING gin (alias_name gin_trgm_ops);")

    # 11. Table: provider_mappings
    op.create_table(
        'provider_mappings',
        sa.Column('mapping_id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('facility_id', sa.String(length=50), nullable=False),
        sa.Column('provider_name', sa.String(length=50), nullable=False),
        sa.Column('provider_entity_id', sa.String(length=100), nullable=False),
        sa.Column('is_primary', sa.Boolean(), server_default='true', nullable=False),
        sa.CheckConstraint("provider_name IN ('IRCTC', 'GTFS_RAIL', 'GTFS_BUS', 'RED_BUS', 'IATA', 'OSM')", name='chk_provider_name'),
        sa.ForeignKeyConstraint(['facility_id'], ['transit_facilities.facility_id']),
        sa.PrimaryKeyConstraint('mapping_id'),
        sa.UniqueConstraint('provider_name', 'provider_entity_id', name='uq_provider_mapping')
    )
    op.create_index('idx_provider_map_facility', 'provider_mappings', ['facility_id'])

    # 12. Table: geo_provenance
    op.create_table(
        'geo_provenance',
        sa.Column('provenance_id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('entity_type', sa.String(length=30), nullable=False),
        sa.Column('entity_id', sa.String(length=50), nullable=False),
        sa.Column('data_source', sa.String(length=100), nullable=False),
        sa.Column('license_type', sa.String(length=50), nullable=False),
        sa.Column('imported_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('last_verified_at', sa.DateTime(), nullable=True),
        sa.Column('confidence_score', sa.Numeric(precision=3, scale=2), server_default='1.00', nullable=False),
        sa.CheckConstraint('confidence_score BETWEEN 0.00 AND 1.00', name='chk_provenance_confidence'),
        sa.PrimaryKeyConstraint('provenance_id')
    )

    # 13. Table: legacy_geo_mapping
    op.create_table(
        'legacy_geo_mapping',
        sa.Column('legacy_node_id', sa.String(length=50), nullable=False),
        sa.Column('v1_facility_id', sa.String(length=50), nullable=True),
        sa.Column('v1_settlement_id', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['v1_facility_id'], ['transit_facilities.facility_id']),
        sa.ForeignKeyConstraint(['v1_settlement_id'], ['settlements.settlement_id']),
        sa.PrimaryKeyConstraint('legacy_node_id')
    )


def downgrade() -> None:
    op.drop_table('legacy_geo_mapping')
    op.drop_table('geo_provenance')
    op.drop_index('idx_provider_map_facility', table_name='provider_mappings')
    op.drop_table('provider_mappings')
    op.execute("DROP INDEX IF EXISTS idx_aliases_trgm;")
    op.drop_index('idx_aliases_lookup', table_name='location_aliases')
    op.drop_table('location_aliases')
    op.drop_index('idx_acc_settlement', table_name='accommodations')
    op.drop_table('accommodations')
    op.drop_index('idx_poi_settlement', table_name='points_of_interest')
    op.drop_index('idx_poi_category', table_name='points_of_interest')
    op.drop_table('points_of_interest')
    op.drop_index('idx_transit_stops_facility', table_name='transit_stops')
    op.drop_table('transit_stops')
    op.drop_index('idx_transit_fac_type', table_name='transit_facilities')
    op.drop_index('idx_transit_fac_settlement', table_name='transit_facilities')
    op.drop_table('transit_facilities')
    op.drop_index('idx_localities_settlement', table_name='localities')
    op.drop_table('localities')
    op.drop_index('idx_settlements_coverage', table_name='settlements')
    op.drop_index('idx_settlements_admin', table_name='settlements')
    op.drop_table('settlements')
    op.drop_index('idx_admin_div_parent', table_name='admin_divisions')
    op.drop_index('idx_admin_div_country', table_name='admin_divisions')
    op.drop_table('admin_divisions')
    op.drop_table('countries')
