"""Add asset, task, claim and fix relationship column

Revision ID: eaa40dcab394
Revises: f30006197b82
Create Date: 2026-09-26 13:08:13.452527

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eaa40dcab394'
down_revision: Union[str, Sequence[str], None] = 'f30006197b82'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'assets',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('case_id', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('institution', sa.String(), nullable=False),
        sa.Column('identifier', sa.String(), nullable=True),
        sa.Column('masked_identifier', sa.String(), nullable=True),
        sa.Column('estimated_value', sa.Float(), nullable=True),
        sa.Column('nominee_status', sa.String(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('evidence_document_id', sa.String(), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('recommended_action', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id']),
        sa.ForeignKeyConstraint(['evidence_document_id'], ['documents.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('case_id', sa.String(), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('priority', sa.String(), nullable=True),
        sa.Column('assigned_to', sa.String(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id']),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'claims',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('institution', sa.String(), nullable=False),
        sa.Column('reference_number', sa.String(), nullable=True),
        sa.Column('submission_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('next_followup', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id']),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('cases', schema=None) as batch_op:
        batch_op.add_column(sa.Column('relationship_to_deceased', sa.String(), nullable=False, server_default='Family'))
        batch_op.drop_column('relationship')


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('cases', schema=None) as batch_op:
        batch_op.add_column(sa.Column('relationship', sa.VARCHAR(), nullable=False, server_default='Family'))
        batch_op.drop_column('relationship_to_deceased')
    op.drop_table('claims')
    op.drop_table('tasks')
    op.drop_table('assets')
