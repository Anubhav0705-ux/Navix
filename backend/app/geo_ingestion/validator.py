from typing import Optional, List, Tuple
from dataclasses import dataclass, field


# Bounding Box for India Territorial Coverage (including islands & extreme points)
INDIA_LAT_MIN = 6.0
INDIA_LAT_MAX = 37.5
INDIA_LON_MIN = 68.0
INDIA_LON_MAX = 97.5


@dataclass
class ValidationResult:
    is_valid: bool = True
    quarantine_reasons: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


def validate_coordinates(lat: Optional[float], lon: Optional[float]) -> ValidationResult:
    """
    Validates lat/lon coordinates for geographic validity and India bounding box coverage.
    """
    res = ValidationResult()

    if lat is None or lon is None:
        res.is_valid = False
        res.quarantine_reasons.append("MISSING_COORDINATES")
        return res

    # Check basic coordinate range limits
    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
        res.is_valid = False
        res.errors.append(f"INVALID_COORDINATE_BOUNDS: lat={lat}, lon={lon}")
        return res

    # Null Island check
    if abs(lat) < 0.0001 and abs(lon) < 0.0001:
        res.is_valid = False
        res.quarantine_reasons.append("NULL_ISLAND_COORDINATE")
        return res

    # India Bounding Box check
    if not (INDIA_LAT_MIN <= lat <= INDIA_LAT_MAX) or not (INDIA_LON_MIN <= lon <= INDIA_LON_MAX):
        res.is_valid = False
        res.quarantine_reasons.append(f"OUTSIDE_INDIA_BOUNDING_BOX: lat={lat}, lon={lon}")
        return res

    return res


def validate_entity_hierarchy(
    entity_id: str,
    entity_name: str,
    parent_id: Optional[str] = None,
    require_parent: bool = False
) -> ValidationResult:
    """
    Validates mandatory entity naming and parent hierarchy relationships.
    """
    res = ValidationResult()

    if not entity_id or not entity_id.strip():
        res.is_valid = False
        res.errors.append("MISSING_ENTITY_ID")

    if not entity_name or not entity_name.strip():
        res.is_valid = False
        res.errors.append("MISSING_ENTITY_NAME")

    if require_parent and (not parent_id or not parent_id.strip()):
        res.is_valid = False
        res.quarantine_reasons.append("MISSING_PARENT_HIERARCHY")

    return res
