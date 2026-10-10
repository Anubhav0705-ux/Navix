import os
import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.geo_ingestion.manifest import load_source_manifest
from app.geo_ingestion.loader import GeoBatchLoader, IngestionReport
from app.geo_ingestion.parsers.admin_parser import parse_country_record, parse_admin_divisions
from app.geo_ingestion.parsers.settlement_parser import parse_settlements, parse_localities
from app.geo_ingestion.parsers.facility_parser import parse_transit_facilities
from app.geo_ingestion.parsers.alias_parser import parse_location_aliases


def run_national_ingestion(
    session: Session,
    data_file_path: Optional[str] = None,
    dry_run: bool = False,
    limit: Optional[int] = None
) -> Dict[str, Any]:
    """
    Executes the reproducible National Indian Geographic Data Ingestion Pipeline.
    """
    manifest = load_source_manifest()
    loader = GeoBatchLoader(session=session, dry_run=dry_run)

    if data_file_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        data_file_path = os.path.join(base_dir, "data", "geo", "national", "india_national_geo_data.json")

    if not os.path.exists(data_file_path):
        raise FileNotFoundError(f"National geographic data file not found at: {data_file_path}")

    with open(data_file_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    reports = []

    # 1. Ingest Country & Admin Divisions
    c_raw = raw_data.get("country", {})
    parsed_country = parse_country_record(c_raw)
    rep_country = loader.load_country(parsed_country, dataset_id="src_in_lgd_admin")
    reports.append(rep_country.to_dict())

    admin_raw = raw_data.get("admin_divisions", [])
    if limit:
        admin_raw = admin_raw[:limit]
    parsed_admin = parse_admin_divisions(admin_raw)
    rep_admin = loader.load_admin_divisions(parsed_admin, dataset_id="src_in_lgd_admin")
    reports.append(rep_admin.to_dict())

    # 2. Ingest Settlements & Localities
    settle_raw = raw_data.get("settlements", [])
    if limit:
        settle_raw = settle_raw[:limit]
    parsed_settlements = parse_settlements(settle_raw)
    rep_settle = loader.load_settlements(parsed_settlements, dataset_id="src_in_settlements")
    reports.append(rep_settle.to_dict())

    loc_raw = raw_data.get("localities", [])
    if limit:
        loc_raw = loc_raw[:limit]
    parsed_loc = parse_localities(loc_raw)
    rep_loc = loader.load_localities(parsed_loc, dataset_id="src_in_settlements")
    reports.append(rep_loc.to_dict())

    # 3. Ingest Transit Facilities (Rail, Airport, Bus)
    fac_raw = raw_data.get("facilities", [])
    if limit:
        fac_raw = fac_raw[:limit]
    parsed_fac = parse_transit_facilities(fac_raw)
    rep_fac = loader.load_transit_facilities(parsed_fac, dataset_id="src_in_railway_stations")
    reports.append(rep_fac.to_dict())

    # 4. Ingest Location Aliases
    alias_raw = raw_data.get("aliases", [])
    if limit:
        alias_raw = alias_raw[:limit]
    parsed_aliases = parse_location_aliases(alias_raw)
    rep_alias = loader.load_aliases(parsed_aliases, dataset_id="src_in_settlements")
    reports.append(rep_alias.to_dict())

    # 5. Ingest Legacy Geo Mappings
    legacy_raw = raw_data.get("legacy_mappings", [])
    rep_legacy = loader.load_legacy_mappings(legacy_raw)
    reports.append(rep_legacy.to_dict())

    total_received = sum(r["received"] for r in reports)
    total_accepted = sum(r["accepted"] for r in reports)
    total_updated = sum(r["updated"] for r in reports)
    total_quarantined = sum(r["quarantined"] for r in reports)

    return {
        "status": "COMPLETED",
        "dry_run": dry_run,
        "manifest_version": manifest.version,
        "summary": {
            "total_received": total_received,
            "total_accepted": total_accepted,
            "total_updated": total_updated,
            "total_quarantined": total_quarantined,
        },
        "reports": reports
    }
