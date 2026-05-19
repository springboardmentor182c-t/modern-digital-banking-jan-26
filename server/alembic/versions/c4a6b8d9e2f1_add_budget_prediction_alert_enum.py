"""add budget prediction alert enum value

Revision ID: c4a6b8d9e2f1
Revises: b8f3a1c42d9e
Create Date: 2026-05-19 19:02:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'c4a6b8d9e2f1'
down_revision = 'b8f3a1c42d9e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE alerttype ADD VALUE IF NOT EXISTS 'budget_prediction'")


def downgrade() -> None:
    # PostgreSQL does not support dropping enum values directly.
    pass
