"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-06

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("external_id", sa.String(128), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("display_name", sa.String(100), nullable=True),
        sa.Column("daily_goal_minutes", sa.Integer(), server_default="10"),
        sa.Column("preferred_pattern", sa.String(50), server_default="box"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_external_id", "users", ["external_id"], unique=True)

    op.create_table(
        "breathing_patterns",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("slug", sa.String(50), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("inhale_seconds", sa.Integer(), nullable=False),
        sa.Column("hold_seconds", sa.Integer(), nullable=False),
        sa.Column("exhale_seconds", sa.Integer(), nullable=False),
        sa.Column("hold_after_exhale_seconds", sa.Integer(), server_default="0"),
        sa.Column("cycles_default", sa.Integer(), server_default="4"),
    )
    op.create_index("ix_breathing_patterns_slug", "breathing_patterns", ["slug"], unique=True)

    op.create_table(
        "breathing_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "pattern_id",
            sa.String(36),
            sa.ForeignKey("breathing_patterns.id"),
            nullable=False,
        ),
        sa.Column("pattern_slug", sa.String(50), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("cycles_completed", sa.Integer(), nullable=False),
        sa.Column("avg_heart_rate", sa.Float(), nullable=True),
        sa.Column("hrv_ms", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_breathing_sessions_user_id", "breathing_sessions", ["user_id"])


def downgrade() -> None:
    op.drop_table("breathing_sessions")
    op.drop_table("breathing_patterns")
    op.drop_table("users")
