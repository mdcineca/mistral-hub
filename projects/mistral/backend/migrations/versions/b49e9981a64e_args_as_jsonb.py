"""args as jsonb

Revision ID: b49e9981a64e
Revises: 6a109a54d7bc
Create Date: 2020-11-30 16:06:36.815835

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "b49e9981a64e"
down_revision = "6a109a54d7bc"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("request", sa.Column("opendata", sa.Boolean(), nullable=True))
    op.alter_column(
        "request",
        "args",
        existing_type=sa.VARCHAR(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        existing_nullable=False,
        postgresql_using="args::json",
    )
    op.alter_column(
        "schedule",
        "args",
        existing_type=sa.VARCHAR(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        existing_nullable=True,
        postgresql_using="args::json",
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "schedule",
        "args",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sa.VARCHAR(),
        existing_nullable=True,
        postgresql_using="args::varchar",
    )
    op.alter_column(
        "request",
        "args",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sa.VARCHAR(),
        existing_nullable=False,
        postgresql_using="args::varchar",
    )
    op.drop_column("request", "opendata")
    # ### end Alembic commands ###