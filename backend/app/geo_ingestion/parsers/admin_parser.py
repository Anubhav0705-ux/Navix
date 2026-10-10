from typing import List, Dict, Any
from app.geo_ingestion.normalizer import normalize_name, normalize_code
from app.geo_ingestion.identity import generate_country_id, generate_admin_div_id, generate_district_id
from app.geo_ingestion.validator import validate_coordinates, validate_entity_hierarchy


def parse_country_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parses country raw data into Country model dict.
    """
    iso2 = (raw.get("iso2") or "IN").upper()
    iso3 = (raw.get("iso3") or "IND").upper()
    name = normalize_name(raw.get("name") or "India")
    country_id = generate_country_id(iso2)

    return {
        "country_id": country_id,
        "name": name,
        "iso_code_2": iso2,
        "iso_code_3": iso3,
        "currency_code": raw.get("currency_code") or "INR",
        "is_active": raw.get("is_active", True)
    }


def parse_admin_divisions(raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Parses state, UT, and district division records.
    """
    parsed = []
    for item in raw_items:
        div_type = (item.get("division_type") or "STATE").upper()
        state_code = item.get("state_code") or item.get("code") or "MH"
        name = normalize_name(item.get("name", ""))
        parent_id = item.get("parent_division_id")

        if div_type in ("STATE", "UNION_TERRITORY", "UT"):
            div_id = generate_admin_div_id(state_code)
            parent_id = None
        else:
            # District or Sub-District
            div_id = generate_district_id(state_code, name)
            if not parent_id:
                parent_id = generate_admin_div_id(state_code)

        code = normalize_code(item.get("code") or state_code)
        lat = item.get("latitude")
        lon = item.get("longitude")

        is_top_level = div_type in ("STATE", "UNION_TERRITORY", "UT")
        coord_val = validate_coordinates(lat, lon)
        hierarchy_val = validate_entity_hierarchy(div_id, name, parent_id, require_parent=not is_top_level)

        parsed.append({
            "division_id": div_id,
            "country_id": generate_country_id("IN"),
            "parent_division_id": parent_id,
            "name": name,
            "division_type": div_type,
            "code": code,
            "latitude": lat if coord_val.is_valid else None,
            "longitude": lon if coord_val.is_valid else None,
            "boundary_wkt": item.get("boundary_wkt"),
            "is_valid": hierarchy_val.is_valid and (coord_val.is_valid or lat is None),
            "quarantine_reasons": coord_val.quarantine_reasons + hierarchy_val.quarantine_reasons,
            "raw": item
        })

    return parsed
