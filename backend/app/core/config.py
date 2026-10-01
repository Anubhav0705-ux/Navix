from typing import Optional
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
