"""
Central configuration — all values sourced from environment variables.
Pydantic-settings validates types and provides defaults.
"""
from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Application ──────────────────────────────────────────
    APP_NAME: str = "OEI Nexus API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # ── API ──────────────────────────────────────────────────
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "insecure-dev-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://oei:oei_password@localhost:5432/oei_nexus"
    DATABASE_URL_SYNC: str = "postgresql://oei:oei_password@localhost:5432/oei_nexus"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # ── Redis ────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 300  # 5 min default

    # ── CORS ─────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [o.strip() for o in v.split(",")]
        return v

    # ── Seed ─────────────────────────────────────────────────
    FIRST_SUPERUSER_EMAIL: str = "admin@oeinexus.org"
    FIRST_SUPERUSER_PASSWORD: str = "changeme123"

    # ── OEI Scoring ──────────────────────────────────────────
    OEI_SCORE_VERSION: str = "2.4"

    # ── Observability ────────────────────────────────────────
    SENTRY_DSN: Optional[str] = None

    # ── Production guards ─────────────────────────────────────
    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.is_production:
            if self.SECRET_KEY == "insecure-dev-key-change-in-prod":
                raise ValueError("SECRET_KEY must be changed for production")
            if self.FIRST_SUPERUSER_PASSWORD == "changeme123":
                raise ValueError("FIRST_SUPERUSER_PASSWORD must be changed for production")
            if self.DEBUG:
                raise ValueError("DEBUG must be False in production")
        return self

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
