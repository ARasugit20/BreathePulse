from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthorizedUser
from app.db.database import get_db
from app.models.schemas import AnalyticsSummary
from app.services.analytics_service import get_analytics_summary
from app.services.user_service import get_or_create_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def analytics_summary(
    user: AuthorizedUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AnalyticsSummary:
    db_user = await get_or_create_user(db, user)
    return await get_analytics_summary(db, db_user.id)
