from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthorizedUser
from app.db.database import get_db
from app.db.models import BreathingPattern
from app.models.schemas import (
    BreathingPatternResponse,
    SessionCreate,
    SessionResponse,
)
from app.services.session_service import (
    create_session,
    delete_session,
    get_session_by_id,
    list_user_sessions,
)
from app.services.user_service import get_or_create_user

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/patterns", response_model=list[BreathingPatternResponse])
async def list_patterns(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[BreathingPatternResponse]:
    result = await db.execute(select(BreathingPattern).order_by(BreathingPattern.name))
    patterns = result.scalars().all()
    return [BreathingPatternResponse.model_validate(p) for p in patterns]


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    user: AuthorizedUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = 50,
) -> list[SessionResponse]:
    db_user = await get_or_create_user(db, user)
    sessions = await list_user_sessions(db, db_user.id, limit=limit)
    return [SessionResponse.model_validate(s) for s in sessions]


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_breathing_session(
    data: SessionCreate,
    user: AuthorizedUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SessionResponse:
    db_user = await get_or_create_user(db, user)
    try:
        session = await create_session(db, db_user, data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return SessionResponse.model_validate(session)


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    user: AuthorizedUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SessionResponse:
    db_user = await get_or_create_user(db, user)
    session = await get_session_by_id(db, db_user.id, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return SessionResponse.model_validate(session)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_session(
    session_id: str,
    user: AuthorizedUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    db_user = await get_or_create_user(db, user)
    session = await get_session_by_id(db, db_user.id, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    await delete_session(db, session)
