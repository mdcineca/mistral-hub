"""Extension of core model

Revision ID: 82af248b1e6d
Revises: bce4b674857e
Create Date: 2020-04-06 06:11:35.322746

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "82af248b1e6d"
down_revision = "bce4b674857e"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("external_accounts")
    # op.add_column('schedule', sa.Column('time_delta', sa.Interval(), nullable=True))
    op.add_column("token", sa.Column("location", sa.String(length=256), nullable=True))
    op.alter_column(
        "token",
        "creation",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
    )
    op.alter_column(
        "token",
        "expiration",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
    )
    op.alter_column(
        "token",
        "last_access",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
    )
    op.add_column("user", sa.Column("privacy_accepted", sa.Boolean(), nullable=True))
    op.alter_column(
        "user",
        "first_login",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
    )
    op.alter_column(
        "user",
        "last_login",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
    )
    op.alter_column(
        "user",
        "last_password_change",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "user",
        "last_password_change",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=True,
    )
    op.alter_column(
        "user",
        "last_login",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=True,
    )
    op.alter_column(
        "user",
        "first_login",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=True,
    )
    op.drop_column("user", "privacy_accepted")
    op.alter_column(
        "token",
        "last_access",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=True,
    )
    op.alter_column(
        "token",
        "expiration",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=True,
    )
    op.alter_column(
        "token",
        "creation",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=True,
    )
    op.drop_column("token", "location")
    # op.drop_column('schedule', 'time_delta')
    op.create_table(
        "external_accounts",
        sa.Column(
            "username", sa.VARCHAR(length=60), autoincrement=False, nullable=False
        ),
        sa.Column(
            "account_type", sa.VARCHAR(length=16), autoincrement=False, nullable=True
        ),
        sa.Column("token", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column("refresh_token", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column(
            "token_expiration",
            postgresql.TIMESTAMP(),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column("email", sa.VARCHAR(length=255), autoincrement=False, nullable=True),
        sa.Column(
            "certificate_cn", sa.VARCHAR(length=255), autoincrement=False, nullable=True
        ),
        sa.Column("certificate_dn", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column("proxyfile", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column(
            "description", sa.VARCHAR(length=255), autoincrement=False, nullable=True
        ),
        sa.Column("user_id", sa.INTEGER(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"], ["user.id"], name="external_accounts_user_id_fkey"
        ),
        sa.PrimaryKeyConstraint("username", name="external_accounts_pkey"),
    )
    # ### end Alembic commands ###
