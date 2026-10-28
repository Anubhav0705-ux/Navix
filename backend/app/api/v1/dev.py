from typing import Optional, List, Dict, Any
import json
from pathlib import Path
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import get_db
from app.core.config import settings
from app.core.security import get_current_admin
from app.models.user import User

dev_router = APIRouter(prefix="/dev", tags=["Developer Inspection"])


def _assert_dev_mode():
    """Ensure developer inspection endpoints are forbidden in production and staging."""
    if settings.is_production or settings.is_staging:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "DEV_ENDPOINTS_DISABLED", "message": "Developer inspection endpoints are disabled in production and staging."}
        )

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
AUTHORITATIVE_CATALOG_FILE = (
    (BASE_DIR / "data" / "authoritative_media_catalog.json")
    if (BASE_DIR / "data" / "authoritative_media_catalog.json").exists()
    else (BASE_DIR / "backend" / "data" / "authoritative_media_catalog.json")
)
MANIFEST_FILE = (
    (BASE_DIR / "frontend" / "src" / "lib" / "mediaManifest.json")
    if (BASE_DIR / "frontend" / "src" / "lib" / "mediaManifest.json").exists()
    else (BASE_DIR.parent / "frontend" / "src" / "lib" / "mediaManifest.json")
)


class ApproveRequest(BaseModel):
    entity_id: str
    status: str = "approved"  # approved | rejected | review_needed


@dev_router.get("/db-summary")
def get_db_summary(db: Session = Depends(get_db)):
    """
    Read-only developer summary endpoint.
    Returns non-sensitive table counts from the existing Navix database.
    """
    _assert_dev_mode()
    tables = [
        "users",
        "travelers",
        "admins",
        "trips",
        "transit_nodes",
        "transit_schedules",
        "transit_segments",
        "budget_allocations",
        "demo_destinations",
        "demo_stories",
        "demo_attractions",
        "demo_food_places",
        "demo_hotels"
    ]

    summary = []
    for table in tables:
        try:
            count = db.execute(text(f'SELECT count(*) FROM "{table}"')).scalar()
            summary.append({
                "table": table,
                "row_count": count
            })
        except Exception:
            pass

    db_name = db.execute(text("SELECT current_database();")).scalar()
    return {
        "database": db_name,
        "tables": summary
    }


@dev_router.get("/media-catalog")
def get_media_catalog(
    entity_type: Optional[str] = Query(None, description="Filter by entity type (destination, story, attraction, food, stay)"),
    search: Optional[str] = Query(None, description="Search term in entityName or destination"),
    status: Optional[str] = Query(None, description="Filter by review status (approved, review_needed, rejected)"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    """
    Internal photo-review interface endpoint.
    Serves authoritative catalog records with full metadata, dimensions, license, and verification status.
    """
    _assert_dev_mode()
    items = []
    if AUTHORITATIVE_CATALOG_FILE.exists():
        try:
            with open(AUTHORITATIVE_CATALOG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                items = data.get("items", []) if isinstance(data, dict) else data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read catalog: {e}")
    elif MANIFEST_FILE.exists():
        try:
            with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
                raw_m = json.load(f)
                items = list(raw_m.values())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read manifest: {e}")

    # Compute URL usage for duplicate warnings
    url_counts: Dict[str, int] = {}
    for it in items:
        p = it.get("pathOrUrl") or it.get("webPath") or ""
        if p:
            url_counts[p] = url_counts.get(p, 0) + 1

    # Filter
    filtered = []
    for it in items:
        etype = it.get("entityType") or it.get("category", "")
        if entity_type and entity_type.lower() != "all" and etype.lower() != entity_type.lower():
            continue

        st = it.get("reviewStatus", "approved")
        if status and status.lower() != "all" and st.lower() != status.lower():
            continue

        if search:
            s_lower = search.lower()
            name = (it.get("entityName") or it.get("title") or it.get("entityId") or "").lower()
            dest = (it.get("destination") or it.get("destinationId") or "").lower()
            if s_lower not in name and s_lower not in dest:
                continue

        # Add duplicate warning metadata
        p = it.get("pathOrUrl") or it.get("webPath") or ""
        item_copy = dict(it)
        item_copy["duplicate_count"] = url_counts.get(p, 1)
        item_copy["has_duplicate"] = url_counts.get(p, 1) > 1
        filtered.append(item_copy)

    total = len(filtered)
    start = (page - 1) * limit
    paginated = filtered[start : start + limit]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": paginated
    }


@dev_router.get("/media-audit")
def get_media_audit():
    """
    Comprehensive media audit across all entities.
    Returns entity counts, unique image count, duplicate count, and verification status.
    """
    _assert_dev_mode()
    items = []
    if AUTHORITATIVE_CATALOG_FILE.exists():
        try:
            with open(AUTHORITATIVE_CATALOG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                items = data.get("items", []) if isinstance(data, dict) else data
        except Exception:
            pass

    # Category breakdown
    by_type: Dict[str, List[Dict[str, Any]]] = {}
    for it in items:
        t = it.get("entityType") or it.get("category", "other")
        by_type.setdefault(t, []).append(it)

    # Duplicates & unique URLs
    urls = [it.get("pathOrUrl") or it.get("webPath") for it in items if (it.get("pathOrUrl") or it.get("webPath"))]
    unique_urls = set(urls)
    local_count = sum(1 for u in urls if u.startswith("/media/") or u.startswith("/home/"))

    type_stats = {}
    for t, t_items in by_type.items():
        t_urls = [it.get("pathOrUrl") or it.get("webPath") for it in t_items]
        type_stats[t] = {
            "total": len(t_items),
            "unique": len(set(t_urls)),
            "duplicates": len(t_items) - len(set(t_urls)),
            "exact_verified": sum(1 for it in t_items if "exact" in it.get("geographicVerification", "") or it.get("classification") == "exact")
        }

    return {
        "total_assets": len(items),
        "unique_images": len(unique_urls),
        "total_duplicated": len(items) - len(unique_urls),
        "local_assets": local_count,
        "remote_urls": len(urls) - local_count,
        "by_entity_type": type_stats
    }


@dev_router.post("/media-catalog/approve")
def approve_media_item(
    req: ApproveRequest,
    current_admin: User = Depends(get_current_admin)
):
    """Allows internal reviewer to approve/reject an entity image candidate."""
    _assert_dev_mode()
    from app.services.media_pipeline import media_pipeline
    if req.entity_id in media_pipeline.catalog:
        media_pipeline.catalog[req.entity_id]["reviewStatus"] = req.status
        media_pipeline.save_state()
        return {"status": "ok", "entity_id": req.entity_id, "reviewStatus": req.status}
    raise HTTPException(status_code=404, detail="Entity not found in catalog")


@dev_router.post("/media-catalog/export")
def export_media_manifest(
    current_admin: User = Depends(get_current_admin)
):
    """Exports authoritative catalog to frontend manifests and synchronizes database."""
    _assert_dev_mode()
    from app.services.media_pipeline import media_pipeline
    media_pipeline.sync_manifests()
    media_pipeline.sync_media_resolver()
    media_pipeline.sync_demo_data()
    d_cnt, s_cnt = media_pipeline.sync_database()
    return {
        "status": "ok",
        "destinations_synced": d_cnt,
        "stories_synced": s_cnt,
        "total_assets": len(media_pipeline.catalog)
    }
