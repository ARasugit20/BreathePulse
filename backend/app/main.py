from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.apis import analytics_router, sessions_router, users_router
from app.core.config import get_settings
from app.core.logging import get_logger, setup_logging
from app.db.database import engine
from app.db.models import Base, BreathingPattern

setup_logging()
logger = get_logger(__name__)
limiter = Limiter(key_func=get_remote_address, default_limits=[])

DEFAULT_PATTERNS = [
    {
        "slug": "box",
        "name": "Box Breathing",
        "description": "Equal 4-4-4-4 rhythm used by Navy SEALs to stay calm under pressure.",
        "inhale_seconds": 4,
        "hold_seconds": 4,
        "exhale_seconds": 4,
        "hold_after_exhale_seconds": 4,
        "cycles_default": 4,
    },
    {
        "slug": "4-7-8",
        "name": "4-7-8 Relaxing Breath",
        "description": "Dr. Weil's technique to reduce anxiety and help you fall asleep.",
        "inhale_seconds": 4,
        "hold_seconds": 7,
        "exhale_seconds": 8,
        "hold_after_exhale_seconds": 0,
        "cycles_default": 4,
    },
    {
        "slug": "wim-hof",
        "name": "Wim Hof Method",
        "description": (
            "Power breathing with deep inhales and relaxed exhales for energy and focus."
        ),
        "inhale_seconds": 2,
        "hold_seconds": 0,
        "exhale_seconds": 1,
        "hold_after_exhale_seconds": 15,
        "cycles_default": 3,
    },
]


async def seed_patterns() -> None:
    from sqlalchemy import select

    from app.db.database import async_session_factory

    async with async_session_factory() as session:
        for pattern_data in DEFAULT_PATTERNS:
            result = await session.execute(
                select(BreathingPattern).where(BreathingPattern.slug == pattern_data["slug"])
            )
            if result.scalar_one_or_none() is None:
                session.add(BreathingPattern(**pattern_data))
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("starting", environment=settings.environment)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await seed_patterns()
    yield
    await engine.dispose()
    logger.info("shutdown")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="BreathePulse API",
        description="Guided breathing sessions, wellness analytics, and HRV tracking",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "healthy", "service": "breathepulse-api"}

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("unhandled_exception", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    app.include_router(users_router, prefix="/api/v1")
    app.include_router(sessions_router, prefix="/api/v1")
    app.include_router(analytics_router, prefix="/api/v1")

    return app


app = create_app()
