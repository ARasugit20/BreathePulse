from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    external_id: str
    email: str | None
    display_name: str | None
    daily_goal_minutes: int
    preferred_pattern: str
    created_at: datetime


class UserProfileUpdate(BaseModel):
    display_name: str | None = Field(None, max_length=100)
    daily_goal_minutes: int | None = Field(None, ge=1, le=120)
    preferred_pattern: str | None = Field(None, pattern=r"^(box|4-7-8|wim-hof)$")


class BreathingPatternResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    description: str
    inhale_seconds: int
    hold_seconds: int
    exhale_seconds: int
    hold_after_exhale_seconds: int
    cycles_default: int


class SessionCreate(BaseModel):
    pattern_slug: str = Field(..., pattern=r"^(box|4-7-8|wim-hof)$")
    duration_seconds: int = Field(..., ge=30, le=3600)
    cycles_completed: int = Field(..., ge=1, le=100)
    avg_heart_rate: float | None = Field(None, ge=30, le=220)
    hrv_ms: float | None = Field(None, ge=0, le=300)
    notes: str | None = Field(None, max_length=500)


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    pattern_slug: str
    duration_seconds: int
    cycles_completed: int
    avg_heart_rate: float | None
    hrv_ms: float | None
    notes: str | None
    completed_at: datetime


class WeeklyStats(BaseModel):
    day: str
    sessions: int
    total_minutes: float


class AnalyticsSummary(BaseModel):
    total_sessions: int
    total_minutes: float
    current_streak: int
    longest_streak: int
    consistency_score: float
    avg_hrv_ms: float | None
    weekly_stats: list[WeeklyStats]
    pattern_breakdown: dict[str, int]
