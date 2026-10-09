import re
from typing import Generator, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings


def mask_database_credentials(text_str: str) -> str:
    """Masks inline passwords in PostgreSQL connection URLs and error strings."""
    if not text_str:
        return text_str
    # Match postgresql://user:password@host:port/db patterns
    pattern = r"(postgresql(?:\+[a-zA-Z0-9]+)?://[^:]+:)([^@]+)(@.+)"
    return re.sub(pattern, r"\1[REDACTED]\3", text_str)


# Create SQLAlchemy engine with strongly-typed pool parameters
engine = create_engine(
    settings.sync_database_url,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing SQLAlchemy database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_database_connection() -> Dict[str, Any]:
    """
    Perform a safe, read-only connectivity check.
    Does NOT modify database schemas or data.
    Sanitizes database credentials in outputs and error tracebacks.
    """
    if not settings.DB_PASSWORD and not settings.DATABASE_URL:
        return {
            "connected": False,
            "message": "Database credentials not configured in backend/.env"
        }

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database(), current_user, version();"))
            row = result.fetchone()
            if row:
                db_name, db_user, db_version = row[0], row[1], row[2]
                is_postgis = False
                try:
                    gis_res = conn.execute(text("SELECT PostGIS_Version();")).scalar()
                    if gis_res:
                        is_postgis = True
                except Exception:
                    pass

                return {
                    "connected": True,
                    "database": db_name,
                    "user": db_user,
                    "engine_driver": engine.driver,
                    "pool_size": settings.DB_POOL_SIZE,
                    "max_overflow": settings.DB_MAX_OVERFLOW,
                    "pool_pre_ping": settings.DB_POOL_PRE_PING,
                    "postgis_enabled": is_postgis,
                    "message": f"Successfully connected to PostgreSQL database '{db_name}' as user '{db_user}'"
                }
    except Exception as e:
        sanitized_error = mask_database_credentials(str(e))
        return {
            "connected": False,
            "message": f"Database connection error: {sanitized_error}"
        }

    return {"connected": False, "message": "Unknown connection state"}
