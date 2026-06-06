import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.auth import DEV_USER, get_current_user
from app.db.database import get_db
from app.db.models import Base, BreathingPattern
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

DEFAULT_PATTERNS = [
    {
        "id": str(uuid.uuid4()),
        "slug": "box",
        "name": "Box Breathing",
        "description": "Equal rhythm",
        "inhale_seconds": 4,
        "hold_seconds": 4,
        "exhale_seconds": 4,
        "hold_after_exhale_seconds": 4,
        "cycles_default": 4,
    },
    {
        "id": str(uuid.uuid4()),
        "slug": "4-7-8",
        "name": "4-7-8",
        "description": "Relaxing",
        "inhale_seconds": 4,
        "hold_seconds": 7,
        "exhale_seconds": 8,
        "hold_after_exhale_seconds": 0,
        "cycles_default": 4,
    },
    {
        "id": str(uuid.uuid4()),
        "slug": "wim-hof",
        "name": "Wim Hof",
        "description": "Power breathing",
        "inhale_seconds": 2,
        "hold_seconds": 0,
        "exhale_seconds": 1,
        "hold_after_exhale_seconds": 15,
        "cycles_default": 3,
    },
]


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with test_session_factory() as session:
        for pattern in DEFAULT_PATTERNS:
            session.add(BreathingPattern(**pattern))
        await session.commit()

    yield

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with test_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def override_get_user():
    return DEV_USER


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_user


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
