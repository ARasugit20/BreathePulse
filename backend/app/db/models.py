import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    daily_goal_minutes: Mapped[int] = mapped_column(Integer, default=10)
    preferred_pattern: Mapped[str] = mapped_column(String(50), default="box")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    sessions: Mapped[list["BreathingSession"]] = relationship(back_populates="user")


class BreathingPattern(Base):
    __tablename__ = "breathing_patterns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    inhale_seconds: Mapped[int] = mapped_column(Integer)
    hold_seconds: Mapped[int] = mapped_column(Integer)
    exhale_seconds: Mapped[int] = mapped_column(Integer)
    hold_after_exhale_seconds: Mapped[int] = mapped_column(Integer, default=0)
    cycles_default: Mapped[int] = mapped_column(Integer, default=4)

    sessions: Mapped[list["BreathingSession"]] = relationship(back_populates="pattern")


class BreathingSession(Base):
    __tablename__ = "breathing_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    pattern_id: Mapped[str] = mapped_column(String(36), ForeignKey("breathing_patterns.id"))
    pattern_slug: Mapped[str] = mapped_column(String(50))
    duration_seconds: Mapped[int] = mapped_column(Integer)
    cycles_completed: Mapped[int] = mapped_column(Integer)
    avg_heart_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    hrv_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="sessions")
    pattern: Mapped["BreathingPattern"] = relationship(back_populates="sessions")
