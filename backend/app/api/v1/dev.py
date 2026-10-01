from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import get_db

dev_router = APIRouter(prefix="/dev", tags=["Developer Inspection"])


@dev_router.get("/db-summary")
def get_db_summary(db: Session = Depends(get_db)):
    """
    Read-only developer summary endpoint.
    Returns non-sensitive table counts from the existing Navix database.
    """
    tables = [
        "users",
        "travelers",
        "admins",
        "trips",
        "transit_nodes",
        "transit_schedules",
        "transit_segments",
        "budget_allocations"
    ]

    summary = []
    for table in tables:
        count = db.execute(text(f'SELECT count(*) FROM "{table}"')).scalar()
        summary.append({
            "table": table,
            "row_count": count
        })

    db_name = db.execute(text("SELECT current_database();")).scalar()
    return {
        "database": db_name,
        "tables": summary
    }
