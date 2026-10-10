from typing import List, Dict, Any
from app.geo_ingestion.normalizer import normalize_name
from app.geo_ingestion.identity import generate_alias_id


def parse_location_aliases(raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Parses location aliases, transliterations, and alternate names.
    """
    parsed = []
    for item in raw_items:
        alias_text = normalize_name(item.get("alias_name", ""))
        entity_id = item.get("entity_id")
        entity_type = item.get("entity_type") or "Settlement"
        lang = (item.get("language_code") or "en").lower()
        alias_type = (item.get("alias_type") or "ALTERNATE").upper()

        if not alias_text or not entity_id:
            continue

        alias_id = item.get("alias_id") or generate_alias_id(entity_id, alias_text, lang)

        parsed.append({
            "alias_id": alias_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "alias_name": alias_text,
            "language_code": lang,
            "alias_type": alias_type,
            "is_primary": item.get("is_primary", False),
            "is_valid": True,
            "raw": item
        })

    return parsed
