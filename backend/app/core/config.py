from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"
    log_level: str = "INFO"
    database_url: str = "postgresql+asyncpg://breathepulse:breathepulse@localhost:5432/breathepulse"
    database_url_sync: str = "postgresql://breathepulse:breathepulse@localhost:5432/breathepulse"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    supabase_url: str | None = None
    supabase_jwt_secret: str | None = None
    rate_limit: str = "60/minute"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def auth_enabled(self) -> bool:
        return bool(self.supabase_jwt_secret)


@lru_cache
def get_settings() -> Settings:
    return Settings()
