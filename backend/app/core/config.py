import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartGlow API"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Configuration
    DATABASE_URL: Optional[str] = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "smartglow_user"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "smartglow_db"

    # Security & JWT Configuration
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "smartglow_dev_super_secret_jwt_key_2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    LOW_STOCK_THRESHOLD: int = 25

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        extra="ignore",
        case_sensitive=True,
    )

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.ENVIRONMENT == "test":
            return "sqlite:///:memory:"

        if self.DATABASE_URL:
            # Normalize postgres:// to postgresql://
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            # If asyncpg in URL but running synchronous engine, normalize to postgresql://
            if url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
            return url

        # If PostgreSQL credentials are provided, construct PostgreSQL URI
        if self.POSTGRES_PASSWORD:
            return (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )

        # Fallback to local SQLite for development when PostgreSQL is not connected
        return "sqlite:///./smartglow_dev.db"


settings = Settings()
