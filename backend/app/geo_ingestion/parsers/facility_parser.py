from typing import List, Dict, Any
from app.geo_ingestion.normalizer import normalize_name, normalize_code
from app.geo_ingestion.identity import (
    generate_facility_id,
    generate_settlement_id,
    generate_provider_mapping_id
)
from app.geo_ingestion.validator import validate_coordinates, validate_entity_hierarchy


def parse_transit_facilities(raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Parses Railway Stations, Airports, Bus Terminals, and Metro Station facility records.
    Extracts provider mappings (IRCTC, IATA, ICAO, RED_BUS, etc.) cleanly.
    """
    parsed = []
    for item in raw_items:
        name = normalize_name(item.get("name", ""))
        fac_type = (item.get("facility_type") or "RAIL_STATION").upper()
        s_name = normalize_name(item.get("settlement_name", ""))
        settlement_id = item.get("settlement_id") or generate_settlement_id(s_name)

        code_ident = item.get("station_code") or item.get("iata_code") or item.get("bus_code") or name
        fac_id = item.get("facility_id") or generate_facility_id(fac_type, f"{s_name}_{code_ident}")

        lat = item.get("latitude")
        lon = item.get("longitude")

        coord_val = validate_coordinates(lat, lon)
        hierarchy_val = validate_entity_hierarchy(fac_id, name, settlement_id, require_parent=True)

        # Extract provider code mappings
        mappings = []
        if item.get("station_code"):
            st_code = normalize_code(item["station_code"])
            if st_code:
                mappings.append({
                    "mapping_id": generate_provider_mapping_id("INDIAN_RAILWAYS", st_code),
                    "provider_name": "INDIAN_RAILWAYS",
                    "provider_entity_id": st_code,
                    "navix_entity_type": "TransitFacility",
                    "navix_entity_id": fac_id,
                    "mapping_status": "VERIFIED"
                })

        if item.get("iata_code"):
            iata = normalize_code(item["iata_code"])
            if iata:
                mappings.append({
                    "mapping_id": generate_provider_mapping_id("IATA", iata),
                    "provider_name": "IATA",
                    "provider_entity_id": iata,
                    "navix_entity_type": "TransitFacility",
                    "navix_entity_id": fac_id,
                    "mapping_status": "VERIFIED"
                })

        if item.get("bus_code"):
            bus_code = normalize_code(item["bus_code"])
            if bus_code:
                mappings.append({
                    "mapping_id": generate_provider_mapping_id("RED_BUS", bus_code),
                    "provider_name": "RED_BUS",
                    "provider_entity_id": bus_code,
                    "navix_entity_type": "TransitFacility",
                    "navix_entity_id": fac_id,
                    "mapping_status": "VERIFIED"
                })

        parsed.append({
            "facility_id": fac_id,
            "settlement_id": settlement_id,
            "name": name,
            "facility_type": fac_type,
            "latitude": lat,
            "longitude": lon,
            "address": item.get("address"),
            "operator_name": item.get("operator_name"),
            "provider_mappings": mappings,
            "is_valid": coord_val.is_valid and hierarchy_val.is_valid,
            "quarantine_reasons": coord_val.quarantine_reasons + hierarchy_val.quarantine_reasons,
            "raw": item
        })

    return parsed
