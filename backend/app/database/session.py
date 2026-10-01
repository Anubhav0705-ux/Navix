from typing import Generator, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Create SQLAlchemy engine lazily for PostgreSQL connection
engine = create_engine(
    settings.sync_database_url,
    pool_pre_ping=True,
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
    """
    if not settings.DB_PASSWORD and not settings.DATABASE_URL:
        return {
            "connected": False,
            "message": "Database credentials not configured in backend/.env"
        }

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database(), current_user;"))
            row = result.fetchone()
            if row:
                return {
                    "connected": True,
                    "database": row[0],
                    "user": row[1],
                    "message": f"Successfully connected to PostgreSQL database '{row[0]}' as '{row[1]}'"
                }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Database connection error: {str(e)}"
        }

    return {"connected": False, "message": "Unknown connection state"}
