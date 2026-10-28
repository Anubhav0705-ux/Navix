"""Privacy-Safe First-Party Analytics Schema

Revision ID: 009_privacy_safe_analytics
Revises: 008_password_reset_requests
Create Date: 2026-10-22 17:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '009_privacy_safe_analytics'
down_revision: Union[str, None] = '008_password_reset_requests'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'analytics_events' not in tables:
        op.create_table(
            'analytics_events',
            sa.Column('id', sa.String(length=50), primary_key=True),
            sa.Column('event_type', sa.String(length=50), nullable=False),
            sa.Column('route', sa.String(length=255), nullable=True),
            sa.Column('anonymous_session_id', sa.String(length=64), nullable=False),
            sa.Column('safe_metadata', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
        )
        op.create_index('ix_analytics_events_event_type', 'analytics_events', ['event_type'])
        op.create_index('ix_analytics_events_created_at', 'analytics_events', ['created_at'])
        op.create_index('ix_analytics_events_anonymous_session_id', 'analytics_events', ['anonymous_session_id'])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'analytics_events' in tables:
        op.drop_index('ix_analytics_events_anonymous_session_id', table_name='analytics_events')
        op.drop_index('ix_analytics_events_created_at', table_name='analytics_events')
        op.drop_index('ix_analytics_events_event_type', table_name='analytics_events')
        op.drop_table('analytics_events')
