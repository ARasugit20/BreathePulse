from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthUser
from app.db.models import User
from app.models.schemas import UserProfileUpdate


async def get_or_create_user(db: AsyncSession, auth_user: AuthUser) -> User:
    result = await db.execute(select(User).where(User.external_id == auth_user.id))
    user = result.scalar_one_or_none()
    if user:
        return user

    user = User(external_id=auth_user.id, email=auth_user.email)
    db.add(user)
    await db.flush()
    return user


async def update_user_profile(
    db: AsyncSession, user: User, update: UserProfileUpdate
) -> User:
    data = update.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(user, key, value)
    await db.flush()
    return user
