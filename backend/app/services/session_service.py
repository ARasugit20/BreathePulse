from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import BreathingPattern, BreathingSession, User
from app.models.schemas import SessionCreate


async def get_pattern_by_slug(db: AsyncSession, slug: str) -> BreathingPattern | None:
    result = await db.execute(select(BreathingPattern).where(BreathingPattern.slug == slug))
    return result.scalar_one_or_none()


async def create_session(
    db: AsyncSession, user: User, data: SessionCreate
) -> BreathingSession:
    pattern = await get_pattern_by_slug(db, data.pattern_slug)
    if not pattern:
        raise ValueError(f"Unknown pattern: {data.pattern_slug}")

    session = BreathingSession(
        user_id=user.id,
        pattern_id=pattern.id,
        pattern_slug=data.pattern_slug,
        duration_seconds=data.duration_seconds,
        cycles_completed=data.cycles_completed,
        avg_heart_rate=data.avg_heart_rate,
        hrv_ms=data.hrv_ms,
        notes=data.notes,
    )
    db.add(session)
    await db.flush()
    return session


async def list_user_sessions(
    db: AsyncSession, user_id: str, limit: int = 50
) -> list[BreathingSession]:
    result = await db.execute(
        select(BreathingSession)
        .where(BreathingSession.user_id == user_id)
        .order_by(BreathingSession.completed_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_session_by_id(
    db: AsyncSession, user_id: str, session_id: str
) -> BreathingSession | None:
    result = await db.execute(
        select(BreathingSession).where(
            BreathingSession.id == session_id,
            BreathingSession.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def delete_session(db: AsyncSession, session: BreathingSession) -> None:
    await db.delete(session)
    await db.flush()
