from typing import Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings read from environment variables or .env file."""
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5433
    DB_NAME: str = "Navix"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    
    DATABASE_URL: Optional[str] = None
    SECRET_KEY: Optional[str] = None

    @model_validator(mode="after")
    def validate_secret_key(self) -> "Settings":
        """Ensure SECRET_KEY is explicitly configured and sufficiently strong (min 32 chars)."""
        if not self.SECRET_KEY or len(self.SECRET_KEY.strip()) < 32:
            raise ValueError(
                "SECRET_KEY environment variable is missing or insecure. "
                "It must be an explicitly configured string of at least 32 characters. "
                "Generate a key using: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )
        return self

    @property
    def sync_database_url(self) -> str:
        """Construct PostgreSQL connection URL."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

