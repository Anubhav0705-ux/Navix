"""Password Reset Requests Schema (Admin-Assisted Recovery)

Revision ID: 008_password_reset_requests
Revises: 007_demo_catalog_foundation
Create Date: 2026-10-21 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '008_password_reset_requests'
down_revision: Union[str, None] = '007_demo_catalog_foundation'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    has_users = False
    if 'users' in tables:
        cols = [c['name'] for c in inspector.get_columns('users')]
        has_users = 'user_id' in cols

    user_fk = [sa.ForeignKey('users.user_id', ondelete='CASCADE')] if has_users else []
    admin_fk = [sa.ForeignKey('users.user_id', ondelete='SET NULL')] if has_users else []

    if 'password_reset_requests' not in tables:
        op.create_table(
            'password_reset_requests',
            sa.Column('request_id', sa.String(length=50), primary_key=True),
            sa.Column('user_id', sa.String(length=50), *user_fk, nullable=False),
            sa.Column('requested_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('status', sa.String(length=20), server_default='PENDING', nullable=False),
            sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('reviewed_by_admin_id', sa.String(length=50), *admin_fk, nullable=True),
            sa.Column('temporary_password_hash', sa.String(length=255), nullable=True),
            sa.Column('temporary_password_expires_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('admin_notes', sa.Text(), nullable=True)
        )
        op.create_index('ix_password_reset_requests_user_id', 'password_reset_requests', ['user_id'])
        op.create_index('ix_password_reset_requests_status', 'password_reset_requests', ['status'])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'password_reset_requests' in tables:
        op.drop_index('ix_password_reset_requests_status', table_name='password_reset_requests')
        op.drop_index('ix_password_reset_requests_user_id', table_name='password_reset_requests')
        op.drop_table('password_reset_requests')
