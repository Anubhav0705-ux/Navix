from typing import List, Dict, Any
from app.geo_ingestion.normalizer import normalize_name, normalize_pincode
from app.geo_ingestion.identity import generate_settlement_id, generate_locality_id, generate_admin_div_id, generate_district_id
from app.geo_ingestion.validator import validate_coordinates, validate_entity_hierarchy


def parse_settlements(raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Parses Indian city, town, and village settlement records.
    """
    parsed = []
    for item in raw_items:
        name = normalize_name(item.get("name", ""))
        settlement_type = (item.get("settlement_type") or "CITY").upper()
        state_code = item.get("state_code", "MH")
        district_name = item.get("district_name")

        settlement_id = item.get("settlement_id") or generate_settlement_id(name)
        admin_div_id = item.get("admin_division_id")
        if not admin_div_id:
            if district_name:
                admin_div_id = generate_district_id(state_code, district_name)
            else:
                admin_div_id = generate_admin_div_id(state_code)

        lat = item.get("latitude")
        lon = item.get("longitude")

        coord_val = validate_coordinates(lat, lon)
        hierarchy_val = validate_entity_hierarchy(settlement_id, name, admin_div_id, require_parent=True)

        parsed.append({
            "settlement_id": settlement_id,
            "admin_division_id": admin_div_id,
            "name": name,
            "settlement_type": settlement_type,
            "population_tier": item.get("population_tier") or "Tier_2",
            "population": item.get("population"),
            "latitude": lat,
            "longitude": lon,
            "coverage_status": item.get("coverage_status") or "COVERED",
            "is_valid": coord_val.is_valid and hierarchy_val.is_valid,
            "quarantine_reasons": coord_val.quarantine_reasons + hierarchy_val.quarantine_reasons,
            "raw": item
        })

    return parsed


def parse_localities(raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Parses sub-city locality / neighborhood records.
    """
    parsed = []
    for item in raw_items:
        s_name = normalize_name(item.get("settlement_name", ""))
        l_name = normalize_name(item.get("name", ""))
        loc_id = item.get("locality_id") or generate_locality_id(s_name, l_name)
        settlement_id = item.get("settlement_id") or generate_settlement_id(s_name)

        lat = item.get("latitude")
        lon = item.get("longitude")
        pincode = normalize_pincode(item.get("pincode"))

        coord_val = validate_coordinates(lat, lon)
        hierarchy_val = validate_entity_hierarchy(loc_id, l_name, settlement_id, require_parent=True)

        parsed.append({
            "locality_id": loc_id,
            "settlement_id": settlement_id,
            "name": l_name,
            "locality_type": item.get("locality_type") or "SUBURB",
            "pincode": pincode,
            "latitude": lat,
            "longitude": lon,
            "is_valid": coord_val.is_valid and hierarchy_val.is_valid,
            "quarantine_reasons": coord_val.quarantine_reasons + hierarchy_val.quarantine_reasons,
            "raw": item
        })

    return parsed
