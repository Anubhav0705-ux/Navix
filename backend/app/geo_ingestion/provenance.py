from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.geo_ingestion.identity import generate_provenance_id


def build_geo_provenance(
    entity_type: str,
    entity_id: str,
    dataset_id: str,
    source_name: str,
    license_type: str,
    source_entity_id: Optional[str] = None,
    confidence_score: float = 1.0,
    verification_state: str = "VERIFIED",
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Constructs a GeoProvenance record dictionary adhering to NAVIX Phase 8 provenance contracts.
    """
    prov_id = generate_provenance_id(entity_id, dataset_id)

    return {
        "provenance_id": prov_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "dataset_id": dataset_id,
        "source_name": source_name,
        "license_type": license_type,
        "source_entity_id": source_entity_id or entity_id,
        "confidence_score": confidence_score,
        "verification_state": verification_state,
        "imported_at": datetime.now(timezone.utc),
        "notes": notes
    }
