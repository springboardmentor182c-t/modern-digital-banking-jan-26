"""add AI budget columns and prediction alert type

Revision ID: b8f3a1c42d9e
Revises: a7c712025dea
Create Date: 2026-04-10 18:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b8f3a1c42d9e'
down_revision = 'a7c712025dea'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add AI budget tracking columns to budgets table
    op.add_column('budgets', sa.Column('is_ai_generated', sa.Boolean(), nullable=True, server_default=sa.false()))
    op.add_column('budgets', sa.Column('confidence_score', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('budgets', 'confidence_score')
    op.drop_column('budgets', 'is_ai_generated')
