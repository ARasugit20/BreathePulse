from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthorizedUser
from app.db.database import get_db
from app.models.schemas import UserProfileResponse, UserProfileUpdate
from app.services.user_service import get_or_create_user, update_user_profile

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_profile(
    user: AuthorizedUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserProfileResponse:
    db_user = await get_or_create_user(db, user)
    return UserProfileResponse.model_validate(db_user)


@router.patch("/me", response_model=UserProfileResponse)
async def update_profile(
    update: UserProfileUpdate,
    user: AuthorizedUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserProfileResponse:
    db_user = await get_or_create_user(db, user)
    updated = await update_user_profile(db, db_user, update)
    return UserProfileResponse.model_validate(updated)
