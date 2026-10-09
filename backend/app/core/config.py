from enum import Enum
from pathlib import Path
from typing import List, Optional
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class EnvironmentOption(str, Enum):
    DEVELOPMENT = "DEVELOPMENT"
    TESTING = "TESTING"
    STAGING = "STAGING"
    PRODUCTION = "PRODUCTION"


class Settings(BaseSettings):
    """
    Centralized, strongly typed, environment-aware application configuration.
    Fails fast at application startup if required settings or secrets are invalid.
    """
    # Application Environment
    APP_ENV: str = Field(default="DEVELOPMENT", description="DEVELOPMENT | TESTING | STAGING | PRODUCTION")
    DEBUG: Optional[bool] = Field(default=None, description="Debug mode override")

    # PostgreSQL Database Settings
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5433
    DB_NAME: str = "Navix"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DATABASE_URL: Optional[str] = None

    # Security & JWT Authentication
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days (NAVIX V2 baseline)

    # CORS & Web Origin
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # Redis Infrastructure Settings
    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None
    REDIS_FAIL_OPEN: bool = True

    # Rate Limiting & Diagnostics
    RATE_LIMIT_ENABLED: bool = True
    LOG_LEVEL: str = "INFO"

    @model_validator(mode="after")
    def validate_and_normalize_configuration(self) -> "Settings":
        """
        Validates environment-aware constraints, secret strength, and infrastructure parameters.
        Fails fast at application startup without leaking secret values in error tracebacks.
        """
        # 1. Normalize and Validate APP_ENV
        env_upper = self.APP_ENV.strip().upper()
        allowed_envs = [e.value for e in EnvironmentOption]
        if env_upper not in allowed_envs:
            raise ValueError(
                f"Invalid APP_ENV '{self.APP_ENV}'. Allowed options are: {', '.join(allowed_envs)}"
            )
        self.APP_ENV = env_upper

        # 2. Set Default DEBUG Flag based on Environment if not explicitly overridden
        if self.DEBUG is None:
            self.DEBUG = self.APP_ENV in (EnvironmentOption.DEVELOPMENT.value, EnvironmentOption.TESTING.value)

        # 3. Validate SECRET_KEY Requirements
        if not self.SECRET_KEY or len(self.SECRET_KEY.strip()) < 32:
            raise ValueError(
                "SECRET_KEY environment variable is missing or insecure. "
                "It must be an explicitly configured string of at least 32 characters. "
                "Generate a key using: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )

        # In Staging and Production, reject development/placeholder secret keys
        if self.APP_ENV in (EnvironmentOption.STAGING.value, EnvironmentOption.PRODUCTION.value):
            lower_secret = self.SECRET_KEY.lower()
            insecure_keywords = ["navix_dev", "change_me", "your_secure_random", "secret_key_min_32"]
            if any(kw in lower_secret for kw in insecure_keywords):
                raise ValueError(
                    f"Insecure SECRET_KEY configured for {self.APP_ENV} environment. "
                    "Development default or placeholder secrets are strictly forbidden in staging/production."
                )

        # 4. Validate Database Configuration
        if not (1 <= self.DB_PORT <= 65535):
            raise ValueError(f"Invalid DB_PORT {self.DB_PORT}. Port must be between 1 and 65535.")

        if self.APP_ENV in (EnvironmentOption.STAGING.value, EnvironmentOption.PRODUCTION.value):
            if not self.DATABASE_URL and not self.DB_PASSWORD.strip():
                raise ValueError(
                    f"Database authentication password (DB_PASSWORD or DATABASE_URL) is required for {self.APP_ENV}."
                )

        # 5. Validate Redis Configuration
        if not (1 <= self.REDIS_PORT <= 65535):
            raise ValueError(f"Invalid REDIS_PORT {self.REDIS_PORT}. Port must be between 1 and 65535.")

        # 6. Validate CORS Origin in Production
        if self.APP_ENV == EnvironmentOption.PRODUCTION.value:
            if not self.FRONTEND_ORIGIN.startswith("https://"):
                raise ValueError(
                    f"FRONTEND_ORIGIN in PRODUCTION must use HTTPS protocol (got '{self.FRONTEND_ORIGIN}')."
                )

        return self

    @property
    def sync_database_url(self) -> str:
        """Construct PostgreSQL connection URL."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == EnvironmentOption.DEVELOPMENT.value

    @property
    def is_testing(self) -> bool:
        return self.APP_ENV == EnvironmentOption.TESTING.value

    @property
    def is_staging(self) -> bool:
        return self.APP_ENV == EnvironmentOption.STAGING.value

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == EnvironmentOption.PRODUCTION.value

    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), str(BACKEND_DIR / ".env.local")),
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Instantiate singleton settings instance (Path-aware)
settings = Settings()
