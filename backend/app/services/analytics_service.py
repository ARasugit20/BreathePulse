from collections import defaultdict
from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import BreathingSession, User
from app.models.schemas import AnalyticsSummary, DailyGoalProgress, HrvTrendPoint, WeeklyStats


def _compute_streak(session_dates: list[date]) -> tuple[int, int]:
    if not session_dates:
        return 0, 0

    unique_dates = sorted(set(session_dates), reverse=True)
    today = date.today()

    current = 0
    if unique_dates[0] == today or unique_dates[0] == today - timedelta(days=1):
        expected = unique_dates[0]
        for d in unique_dates:
            if d == expected:
                current += 1
                expected -= timedelta(days=1)
            elif d < expected:
                break

    longest = 0
    streak = 1
    sorted_asc = sorted(unique_dates)
    for i in range(1, len(sorted_asc)):
        if sorted_asc[i] - sorted_asc[i - 1] == timedelta(days=1):
            streak += 1
        else:
            longest = max(longest, streak)
            streak = 1
    longest = max(longest, streak)

    return current, longest


async def get_analytics_summary(db: AsyncSession, user: User) -> AnalyticsSummary:
    user_id = user.id
    result = await db.execute(
        select(BreathingSession).where(BreathingSession.user_id == user_id)
    )
    sessions = list(result.scalars().all())

    total_sessions = len(sessions)
    total_minutes = sum(s.duration_seconds for s in sessions) / 60

    session_dates = [s.completed_at.date() for s in sessions]
    current_streak, longest_streak = _compute_streak(session_dates)

    hrv_values = [s.hrv_ms for s in sessions if s.hrv_ms is not None]
    avg_hrv = sum(hrv_values) / len(hrv_values) if hrv_values else None

    pattern_breakdown: dict[str, int] = defaultdict(int)
    for s in sessions:
        pattern_breakdown[s.pattern_slug] += 1

    weekly: dict[str, dict[str, float]] = defaultdict(lambda: {"sessions": 0, "minutes": 0.0})
    for i in range(7):
        day = date.today() - timedelta(days=6 - i)
        weekly[day.isoformat()] = {"sessions": 0, "minutes": 0.0}

    for s in sessions:
        day_key = s.completed_at.date().isoformat()
        if day_key in weekly:
            weekly[day_key]["sessions"] += 1
            weekly[day_key]["minutes"] += s.duration_seconds / 60

    weekly_stats = [
        WeeklyStats(day=day, sessions=int(data["sessions"]), total_minutes=data["minutes"])
        for day, data in sorted(weekly.items())
    ]

    days_with_sessions = len({s.completed_at.date() for s in sessions})
    consistency_score = round((days_with_sessions / 7) * 100, 1) if sessions else 0.0

    hrv_sessions = [s for s in sessions if s.hrv_ms is not None]
    hrv_trend = [
        HrvTrendPoint(
            date=s.completed_at.date().isoformat(),
            hrv_ms=s.hrv_ms,  # type: ignore[arg-type]
            session_id=s.id,
        )
        for s in sorted(hrv_sessions, key=lambda x: x.completed_at)[-14:]
    ]

    today = date.today()

    def _local_date(dt: datetime) -> date:
        if dt.tzinfo is None:
            return dt.date()
        return dt.astimezone().date()

    today_minutes = sum(
        s.duration_seconds / 60 for s in sessions if _local_date(s.completed_at) == today
    )
    goal = user.daily_goal_minutes
    percent = min(round((today_minutes / goal) * 100, 1), 100) if goal > 0 else 0

    return AnalyticsSummary(
        total_sessions=total_sessions,
        total_minutes=round(total_minutes, 1),
        current_streak=current_streak,
        longest_streak=longest_streak,
        consistency_score=consistency_score,
        avg_hrv_ms=round(avg_hrv, 1) if avg_hrv else None,
        weekly_stats=weekly_stats,
        pattern_breakdown=dict(pattern_breakdown),
        hrv_trend=hrv_trend,
        daily_goal=DailyGoalProgress(
            goal_minutes=goal,
            completed_minutes=round(today_minutes, 1),
            percent_complete=percent,
            goal_met=today_minutes >= goal,
        ),
    )
