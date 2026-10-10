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

    # PostgreSQL Database Settings & Connection Pooling
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5433
    DB_NAME: str = "Navix"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DATABASE_URL: Optional[str] = None
    DB_POOL_SIZE: int = Field(default=10, ge=1, le=100, description="SQLAlchemy connection pool base size")
    DB_MAX_OVERFLOW: int = Field(default=10, ge=0, le=100, description="SQLAlchemy connection pool max overflow connections")
    DB_POOL_TIMEOUT: int = Field(default=30, ge=1, le=300, description="SQLAlchemy connection pool timeout in seconds")
    DB_POOL_RECYCLE: int = Field(default=1800, ge=60, le=7200, description="SQLAlchemy connection recycling time in seconds")
    DB_POOL_PRE_PING: bool = Field(default=True, description="Enable connection pre-ping health check before execution")
    DB_SSL_MODE: Optional[str] = Field(default=None, description="PostgreSQL SSL mode (disable, allow, prefer, require, verify-ca, verify-full)")
    ALLOW_LOCALHOST_DB: bool = Field(default=False, description="Explicit flag allowing localhost/127.0.0.1 database target in staging/production")

    # Security & JWT Authentication
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days (NAVIX V2 baseline)

    # CORS & Web Origin
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # Redis Infrastructure Settings & Connection Pooling
    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_DB: int = Field(default=0, ge=0, le=15, description="Redis database index")
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None
    REDIS_SSL: bool = Field(default=False, description="Enable SSL/TLS for Redis connections")
    REDIS_CONNECT_TIMEOUT: float = Field(default=2.0, ge=0.1, le=30.0, description="Redis connection timeout in seconds")
    REDIS_SOCKET_TIMEOUT: float = Field(default=2.0, ge=0.1, le=30.0, description="Redis socket read/write timeout in seconds")
    REDIS_MAX_CONNECTIONS: int = Field(default=50, ge=1, le=500, description="Redis connection pool max connections")
    REDIS_KEY_PREFIX: str = Field(default="navix", description="Redis key namespace prefix")
    REDIS_FAIL_OPEN: bool = Field(default=True, description="Fail open on Redis failure for search/planning endpoints")
    ALLOW_LOCALHOST_REDIS: bool = Field(default=False, description="Explicit flag allowing localhost/127.0.0.1 Redis target in staging/production")
    TRUSTED_PROXIES: List[str] = Field(default_factory=lambda: ["127.0.0.1", "::1"], description="List of trusted reverse proxy IP addresses")

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

        # 4. Validate Redis & CORS Configuration
        if not (1 <= self.REDIS_PORT <= 65535):
            raise ValueError(f"Invalid REDIS_PORT {self.REDIS_PORT}. Port must be between 1 and 65535.")

        if self.APP_ENV in (EnvironmentOption.STAGING.value, EnvironmentOption.PRODUCTION.value):
            if not self.ALLOW_LOCALHOST_REDIS and ("REDIS_HOST" in self.model_fields_set or "REDIS_URL" in self.model_fields_set):
                redis_check = self.REDIS_HOST.lower()
                if self.REDIS_URL:
                    redis_check = self.REDIS_URL.lower()
                if "127.0.0.1" in redis_check or "localhost" in redis_check:
                    raise ValueError(
                        f"Redis host in {self.APP_ENV} environment cannot target localhost/127.0.0.1 "
                        "without explicit ALLOW_LOCALHOST_REDIS=True override."
                    )

        if self.APP_ENV == EnvironmentOption.PRODUCTION.value:
            if not self.FRONTEND_ORIGIN.startswith("https://"):
                raise ValueError(
                    f"FRONTEND_ORIGIN in PRODUCTION must use HTTPS protocol (got '{self.FRONTEND_ORIGIN}')."
                )

        # 5. Validate Database Configuration & SSL Settings
        if not (1 <= self.DB_PORT <= 65535):
            raise ValueError(f"Invalid DB_PORT {self.DB_PORT}. Port must be between 1 and 65535.")

        if self.DB_SSL_MODE:
            allowed_ssl_modes = ["disable", "allow", "prefer", "require", "verify-ca", "verify-full"]
            if self.DB_SSL_MODE.lower() not in allowed_ssl_modes:
                raise ValueError(
                    f"Invalid DB_SSL_MODE '{self.DB_SSL_MODE}'. Allowed options are: {', '.join(allowed_ssl_modes)}"
                )
            self.DB_SSL_MODE = self.DB_SSL_MODE.lower()

        if self.APP_ENV == EnvironmentOption.PRODUCTION.value and not self.DB_SSL_MODE:
            self.DB_SSL_MODE = "require"

        if self.APP_ENV in (EnvironmentOption.STAGING.value, EnvironmentOption.PRODUCTION.value):
            if not self.DATABASE_URL and not self.DB_PASSWORD.strip():
                raise ValueError(
                    f"Database authentication password (DB_PASSWORD or DATABASE_URL) is required for {self.APP_ENV}."
                )

            if not self.ALLOW_LOCALHOST_DB and ("DB_HOST" in self.model_fields_set or "DATABASE_URL" in self.model_fields_set):
                host_check = self.DB_HOST.lower()
                if self.DATABASE_URL:
                    host_check = self.DATABASE_URL.lower()
                if "127.0.0.1" in host_check or "localhost" in host_check:
                    raise ValueError(
                        f"Database host in {self.APP_ENV} environment cannot target localhost/127.0.0.1 "
                        "without explicit ALLOW_LOCALHOST_DB=True override."
                    )

            if self.DATABASE_URL:
                db_url_lower = self.DATABASE_URL.lower()
                if not (db_url_lower.startswith("postgresql://") or db_url_lower.startswith("postgresql+psycopg2://") or db_url_lower.startswith("postgres://")):
                    raise ValueError(
                        f"Invalid DATABASE_URL scheme for {self.APP_ENV}. Only PostgreSQL connections are permitted."
                    )

        if self.APP_ENV == EnvironmentOption.TESTING.value and self.DATABASE_URL:
            db_url_lower = self.DATABASE_URL.lower()
            remote_indicators = [".rds.amazonaws.com", ".aivencloud.com", ".supabase.co", ".cockroachlabs.cloud"]
            if any(ind in db_url_lower for ind in remote_indicators):
                raise ValueError(
                    "TESTING environment cannot target remote production database hosts. "
                    "Use isolated local test databases."
                )

        return self

    @property
    def sync_database_url(self) -> str:
        """Construct PostgreSQL connection URL with optional SSL mode configuration."""
        if self.DATABASE_URL:
            url = self.DATABASE_URL
        else:
            url = f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

        if self.DB_SSL_MODE and "sslmode=" not in url:
            sep = "&" if "?" in url else "?"
            url = f"{url}{sep}sslmode={self.DB_SSL_MODE}"
        return url

    @property
    def redis_connection_url(self) -> str:
        """Construct Redis connection URL."""
        if self.REDIS_URL:
            return self.REDIS_URL
        scheme = "rediss" if self.REDIS_SSL else "redis"
        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"{scheme}://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

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
