"""phase 5 accounts and orders

Revision ID: 002_phase5_accounts_and_orders
Revises: 001_initial_schema
Create Date: 2026-10-28 09:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_phase5_accounts_and_orders'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('role', sa.String(length=30), nullable=False, server_default='customer'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('skin_type', sa.String(length=50), nullable=True, server_default='All'),
        sa.Column('skin_concerns', sa.JSON(), nullable=True),
        sa.Column('sensitivity_level', sa.String(length=50), nullable=True, server_default='Moderate'),
        sa.Column('known_allergens', sa.JSON(), nullable=True),
        sa.Column('preferred_routine', sa.String(length=50), nullable=True, server_default='Clean Botanical'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. Add user_id to orders using batch mode for SQLite & PostgreSQL compatibility
    with op.batch_alter_table('orders') as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_orders_user_id', ['user_id'], unique=False)
        batch_op.create_foreign_key(
            'fk_orders_user_id_users',
            'users',
            ['user_id'],
            ['id'],
            ondelete='SET NULL',
        )


def downgrade() -> None:
    with op.batch_alter_table('orders') as batch_op:
        batch_op.drop_constraint('fk_orders_user_id_users', type_='foreignkey')
        batch_op.drop_index('ix_orders_user_id')
        batch_op.drop_column('user_id')
    op.drop_table('users')
