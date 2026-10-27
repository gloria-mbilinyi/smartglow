"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-27 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Categories Table
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=True)
    op.create_index(op.f('ix_categories_slug'), 'categories', ['slug'], unique=True)

    # 2. Ingredients Table
    op.create_table(
        'ingredients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('scientific_name', sa.String(length=200), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('safety_rating', sa.String(length=50), nullable=True),
        sa.Column('is_active_ingredient', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ingredients_id'), 'ingredients', ['id'], unique=False)
    op.create_index(op.f('ix_ingredients_name'), 'ingredients', ['name'], unique=True)

    # 3. Products Table
    op.create_table(
        'products',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('subtitle', sa.String(length=255), nullable=True),
        sa.Column('slug', sa.String(length=220), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('reviews_count', sa.Integer(), nullable=True),
        sa.Column('skin_types', sa.JSON(), nullable=True),
        sa.Column('skin_concerns', sa.JSON(), nullable=True),
        sa.Column('key_ingredients_list', sa.JSON(), nullable=True),
        sa.Column('all_ingredients', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('benefits', sa.JSON(), nullable=True),
        sa.Column('usage', sa.Text(), nullable=True),
        sa.Column('volume', sa.String(length=60), nullable=True),
        sa.Column('stock_count', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('tag', sa.String(length=80), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)
    op.create_index(op.f('ix_products_name'), 'products', ['name'], unique=False)
    op.create_index(op.f('ix_products_slug'), 'products', ['slug'], unique=True)
    op.create_index(op.f('ix_products_category_id'), 'products', ['category_id'], unique=False)

    # 4. Product Ingredients Association Table
    op.create_table(
        'product_ingredients',
        sa.Column('product_id', sa.String(length=64), nullable=False),
        sa.Column('ingredient_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['ingredient_id'], ['ingredients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('product_id', 'ingredient_id'),
    )

    # 5. Orders Table
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_number', sa.String(length=50), nullable=False),
        sa.Column('customer_name', sa.String(length=150), nullable=False),
        sa.Column('customer_phone', sa.String(length=50), nullable=False),
        sa.Column('delivery_address', sa.String(length=255), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('postal_code', sa.String(length=30), nullable=False),
        sa.Column('payment_method', sa.String(length=80), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=False),
        sa.Column('shipping_cost', sa.Float(), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_orders_id'), 'orders', ['id'], unique=False)
    op.create_index(op.f('ix_orders_order_number'), 'orders', ['order_number'], unique=True)

    # 6. Order Items Table
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.String(length=64), nullable=True),
        sa.Column('product_name', sa.String(length=200), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('total_price', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_order_items_id'), 'order_items', ['id'], unique=False)
    op.create_index(op.f('ix_order_items_order_id'), 'order_items', ['order_id'], unique=False)


def downgrade() -> None:
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('product_ingredients')
    op.drop_table('products')
    op.drop_table('ingredients')
    op.drop_table('categories')
