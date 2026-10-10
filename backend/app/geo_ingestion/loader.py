from dataclasses import dataclass, field
from decimal import Decimal
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from geoalchemy2.elements import WKTElement

from app.models.geo_administrative import Country, AdminDivision
from app.models.geo_settlement import Settlement, Locality
from app.models.geo_transit import TransitFacility, TransitStop
from app.models.geo_mapping import LocationAlias, ProviderLocationMapping, GeoProvenance, LegacyGeoMapping


@dataclass
class IngestionReport:
    dataset_id: str = ""
    received: int = 0
    accepted: int = 0
    updated: int = 0
    unchanged: int = 0
    rejected: int = 0
    quarantined: int = 0
    duplicates: int = 0
    errors: List[str] = field(default_factory=list)
    quarantined_records: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dataset_id": self.dataset_id,
            "received": self.received,
            "accepted": self.accepted,
            "updated": self.updated,
            "unchanged": self.unchanged,
            "rejected": self.rejected,
            "quarantined": self.quarantined,
            "duplicates": self.duplicates,
            "error_count": len(self.errors),
            "errors": self.errors[:10],  # Sample first 10
        }


class GeoBatchLoader:
    """
    Idempotent batch loader for NAVIX Phase 8 national geographic data ingestion.
    """

    def __init__(self, session: Session, dry_run: bool = False, batch_size: int = 200):
        self.session = session
        self.dry_run = dry_run
        self.batch_size = batch_size

    def load_country(self, parsed_country: Dict[str, Any], dataset_id: str) -> IngestionReport:
        report = IngestionReport(dataset_id=dataset_id, received=1)

        c_id = parsed_country["country_id"]
        existing = self.session.execute(
            select(Country).filter_by(country_id=c_id)
        ).scalar_one_or_none()

        if existing:
            existing.name = parsed_country["name"]
            existing.iso_code_2 = parsed_country["iso_code_2"]
            existing.iso_code_3 = parsed_country["iso_code_3"]
            report.updated += 1
            report.accepted += 1
        else:
            c = Country(
                country_id=c_id,
                iso_code_2=parsed_country["iso_code_2"],
                iso_code_3=parsed_country["iso_code_3"],
                name=parsed_country["name"],
                default_currency=parsed_country.get("currency_code", "INR"),
                default_timezone="Asia/Kolkata"
            )
            if not self.dry_run:
                self.session.add(c)
            report.accepted += 1

        if not self.dry_run:
            self.session.flush()
        return report

    def load_admin_divisions(self, divisions: List[Dict[str, Any]], dataset_id: str) -> IngestionReport:
        report = IngestionReport(dataset_id=dataset_id, received=len(divisions))

        # Sort divisions so parents (parent_division_id is None) are loaded before child divisions
        sorted_divisions = sorted(divisions, key=lambda d: 0 if d.get("parent_division_id") is None else 1)

        for item in sorted_divisions:
            if not item.get("is_valid"):
                report.quarantined += 1
                report.rejected += 1
                report.quarantined_records.append(item)
                continue

            div_id = item["division_id"]
            existing = self.session.execute(
                select(AdminDivision).filter_by(division_id=div_id)
            ).scalar_one_or_none()

            lat, lon = item.get("latitude"), item.get("longitude")
            geom = WKTElement(f"POINT({lon} {lat})", srid=4326) if (lat is not None and lon is not None) else None

            # Map division level to valid constraint string
            div_level = item["division_type"]
            if div_level == "UNION_TERRITORY":
                div_level = "UT"

            if existing:
                existing.name = item["name"]
                existing.division_level = div_level
                existing.code = item.get("code")
                report.updated += 1
            else:
                ad = AdminDivision(
                    division_id=div_id,
                    country_id=item["country_id"],
                    parent_division_id=item.get("parent_division_id"),
                    name=item["name"],
                    division_level=div_level,
                    code=item.get("code"),
                    boundary_polygon=geom
                )
                if not self.dry_run:
                    self.session.add(ad)
                    self.session.flush()  # Flush so parent ID exists for sub-divisions

            # Record Provenance
            if not self.dry_run:
                prov = GeoProvenance(
                    entity_type="AdminDivision",
                    entity_id=div_id,
                    data_source=dataset_id,
                    license_type="GODL-India/ODbL",
                    confidence_score=Decimal("1.00")
                )
                self.session.add(prov)

            report.accepted += 1

        if not self.dry_run:
            self.session.flush()
        return report

    def load_settlements(self, settlements: List[Dict[str, Any]], dataset_id: str) -> IngestionReport:
        report = IngestionReport(dataset_id=dataset_id, received=len(settlements))

        for item in settlements:
            if not item.get("is_valid"):
                report.quarantined += 1
                report.rejected += 1
                report.quarantined_records.append(item)
                continue

            s_id = item["settlement_id"]
            existing = self.session.execute(
                select(Settlement).filter_by(settlement_id=s_id)
            ).scalar_one_or_none()

            lat, lon = item["latitude"], item["longitude"]
            geom = WKTElement(f"POINT({lon} {lat})", srid=4326)

            tier_str = str(item.get("population_tier", "2"))
            tier_num = 2
            if "1" in tier_str: tier_num = 1
            elif "3" in tier_str: tier_num = 3
            elif "4" in tier_str: tier_num = 4

            if existing:
                existing.name = item["name"]
                existing.settlement_type = item["settlement_type"]
                existing.population_tier = tier_num
                existing.location = geom
                report.updated += 1
            else:
                stl = Settlement(
                    settlement_id=s_id,
                    admin_division_id=item["admin_division_id"],
                    name=item["name"],
                    settlement_type=item["settlement_type"],
                    population_tier=tier_num,
                    location=geom,
                    timezone="Asia/Kolkata",
                    coverage_status=item.get("coverage_status", "COVERED")
                )
                if not self.dry_run:
                    self.session.add(stl)

            if not self.dry_run:
                prov = GeoProvenance(
                    entity_type="Settlement",
                    entity_id=s_id,
                    data_source=dataset_id,
                    license_type="CC-BY-4.0/ODbL",
                    confidence_score=Decimal("1.00")
                )
                self.session.add(prov)

            report.accepted += 1

        if not self.dry_run:
            self.session.flush()
        return report

    def load_localities(self, localities: List[Dict[str, Any]], dataset_id: str) -> IngestionReport:
        report = IngestionReport(dataset_id=dataset_id, received=len(localities))

        for item in localities:
            if not item.get("is_valid"):
                report.quarantined += 1
                report.rejected += 1
                report.quarantined_records.append(item)
                continue

            loc_id = item["locality_id"]
            existing = self.session.execute(
                select(Locality).filter_by(locality_id=loc_id)
            ).scalar_one_or_none()

            lat, lon = item["latitude"], item["longitude"]
            geom = WKTElement(f"POINT({lon} {lat})", srid=4326)

            if existing:
                existing.name = item["name"]
                existing.pincode = item.get("pincode")
                existing.location = geom
                report.updated += 1
            else:
                loc = Locality(
                    locality_id=loc_id,
                    settlement_id=item["settlement_id"],
                    name=item["name"],
                    pincode=item.get("pincode"),
                    location=geom
                )
                if not self.dry_run:
                    self.session.add(loc)
                report.accepted += 1

        if not self.dry_run:
            self.session.flush()
        return report

    def load_transit_facilities(self, facilities: List[Dict[str, Any]], dataset_id: str) -> IngestionReport:
        report = IngestionReport(dataset_id=dataset_id, received=len(facilities))

        for item in facilities:
            if not item.get("is_valid"):
                report.quarantined += 1
                report.rejected += 1
                report.quarantined_records.append(item)
                continue

            fac_id = item["facility_id"]
            existing = self.session.execute(
                select(TransitFacility).filter_by(facility_id=fac_id)
            ).scalar_one_or_none()

            lat, lon = item["latitude"], item["longitude"]
            geom = WKTElement(f"POINT({lon} {lat})", srid=4326)

            if existing:
                existing.name = item["name"]
                existing.facility_type = item["facility_type"]
                existing.location = geom
                report.updated += 1
            else:
                fac = TransitFacility(
                    facility_id=fac_id,
                    settlement_id=item["settlement_id"],
                    name=item["name"],
                    facility_type=item["facility_type"],
                    location=geom,
                    is_multimodal=item.get("is_multimodal", False),
                    operating_status="ACTIVE"
                )
                if not self.dry_run:
                    self.session.add(fac)

            # Load provider mappings
            for pm in item.get("provider_mappings", []):
                prov_name = pm["provider_name"]
                ext_id = pm["provider_entity_id"]
                existing_map = self.session.execute(
                    select(ProviderLocationMapping).filter_by(
                        provider_name=prov_name,
                        provider_entity_id=ext_id
                    )
                ).scalar_one_or_none()

                if not existing_map and not self.dry_run:
                    pmap = ProviderLocationMapping(
                        facility_id=fac_id,
                        provider_name=prov_name,
                        provider_entity_id=ext_id,
                        is_primary=True
                    )
                    self.session.add(pmap)

            if not self.dry_run:
                prov = GeoProvenance(
                    entity_type="TransitFacility",
                    entity_id=fac_id,
                    data_source=dataset_id,
                    license_type="GODL-India/ODbL/PublicDomain",
                    confidence_score=Decimal("1.00")
                )
                self.session.add(prov)

            report.accepted += 1

        if not self.dry_run:
            self.session.flush()
        return report

    def load_aliases(self, aliases: List[Dict[str, Any]], dataset_id: str) -> IngestionReport:
        report = IngestionReport(dataset_id=dataset_id, received=len(aliases))

        for item in aliases:
            e_type = item["entity_type"].upper()
            if e_type not in ("SETTLEMENT", "TRANSIT_FACILITY", "POI"):
                e_type = "SETTLEMENT"

            a_type = item["alias_type"].upper()
            if a_type not in ("ALTERNATIVE_NAME", "HISTORICAL", "TRANSLITERATION", "COMMON_TYPO"):
                a_type = "ALTERNATIVE_NAME"

            existing = self.session.execute(
                select(LocationAlias).filter_by(
                    entity_type=e_type,
                    entity_id=item["entity_id"],
                    alias_name=item["alias_name"]
                )
            ).scalar_one_or_none()

            if existing:
                report.unchanged += 1
            else:
                alias = LocationAlias(
                    entity_type=e_type,
                    entity_id=item["entity_id"],
                    alias_name=item["alias_name"],
                    language_code=item.get("language_code", "en"),
                    alias_type=a_type
                )
                if not self.dry_run:
                    self.session.add(alias)
                report.accepted += 1

        if not self.dry_run:
            self.session.flush()
        return report

    def load_legacy_mappings(self, mappings: List[Dict[str, Any]]) -> IngestionReport:
        report = IngestionReport(dataset_id="legacy_mapping", received=len(mappings))
        for item in mappings:
            node_id = item["legacy_node_id"]
            existing = self.session.execute(
                select(LegacyGeoMapping).filter_by(legacy_node_id=node_id)
            ).scalar_one_or_none()

            if not existing and not self.dry_run:
                leg = LegacyGeoMapping(
                    legacy_node_id=node_id,
                    v1_facility_id=item.get("v1_facility_id"),
                    v1_settlement_id=item.get("v1_settlement_id")
                )
                self.session.add(leg)
                report.accepted += 1
            else:
                report.unchanged += 1

        if not self.dry_run:
            self.session.flush()
        return report
