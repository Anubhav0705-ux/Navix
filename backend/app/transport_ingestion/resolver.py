from typing import Optional, Dict
from sqlalchemy.orm import Session
from app.models.geo_mapping import ProviderLocationMapping, LocationAlias
from app.models.geo_transit import TransitFacility
from app.transport_ingestion.contracts import ResolvedMappingResult


class LocationResolver:
    MODE_COMPATIBLE_TYPES = {
        "RAIL": {"RAIL_STATION", "METRO_STATION", "INTERMODAL_HUB"},
        "FLIGHT": {"AIRPORT", "INTERMODAL_HUB"},
        "AIR": {"AIRPORT", "INTERMODAL_HUB"},
        "BUS": {"BUS_TERMINAL", "BUS_STOP", "INTERMODAL_HUB"},
        "METRO": {"METRO_STATION", "RAIL_STATION", "INTERMODAL_HUB"},
    }

    def __init__(self, db: Session):
        self.db = db
        self._provider_cache: Dict[str, str] = {}
        self._code_to_facilities: Dict[str, str] = {}
        self._facility_cache: Dict[str, str] = {}
        self._facility_types: Dict[str, str] = {}
        self._alias_cache: Dict[str, str] = {}
        self._build_caches()

    def _build_caches(self) -> None:
        # Cache provider mappings and cross-provider code index
        pm_rows = self.db.query(ProviderLocationMapping).all()
        for pm in pm_rows:
            key = f"{pm.provider_name}:{pm.provider_entity_id}".upper()
            self._provider_cache[key] = pm.facility_id
            self._code_to_facilities[pm.provider_entity_id.upper()] = pm.facility_id

        # Cache facility IDs, names, and types
        fac_rows = self.db.query(TransitFacility).all()
        for fac in fac_rows:
            self._facility_cache[fac.facility_id.upper()] = fac.facility_id
            self._facility_cache[fac.name.upper()] = fac.facility_id
            self._facility_types[fac.facility_id.upper()] = fac.facility_type.upper() if fac.facility_type else ""

        # Cache aliases
        alias_rows = self.db.query(LocationAlias).filter(LocationAlias.entity_type == "TRANSIT_FACILITY").all()
        for al in alias_rows:
            if al.entity_id:
                self._alias_cache[al.alias_name.upper()] = al.entity_id

    def is_facility_mode_compatible(self, facility_id: str, mode: Optional[str]) -> bool:
        """Checks if a given facility ID matches the expected transport mode."""
        if not mode or not facility_id:
            return True
        fac_type = self._facility_types.get(facility_id.upper(), "")
        allowed = self.MODE_COMPATIBLE_TYPES.get(mode.upper())
        if not allowed or not fac_type:
            return True
        return fac_type in allowed

    def resolve_stop(
        self,
        provider_code_system: str,
        stop_code: Optional[str],
        stop_name: str,
        mode: Optional[str] = None
    ) -> ResolvedMappingResult:
        FORBIDDEN_SYNTHETIC = {"FAC_SLI_RAIL", "FAC_MRJ_RAIL"}

        # Infer mode from provider_code_system if not explicitly passed
        if not mode and provider_code_system:
            sys_upper = provider_code_system.upper()
            if "RAIL" in sys_upper or sys_upper in ("INDIAN_RAILWAYS", "IRCTC"):
                mode = "RAIL"
            elif sys_upper in ("IATA", "ICAO", "DGCA") or "FLIGHT" in sys_upper or "AIR" in sys_upper:
                mode = "FLIGHT"
            elif sys_upper in ("RED_BUS", "MSRTC", "HRTC") or "BUS" in sys_upper:
                mode = "BUS"

        candidate_fac_id: Optional[str] = None
        method: str = "UNRESOLVED"
        confidence: float = 0.0

        # 1. Try Provider Mapping by code system + stop code
        if stop_code:
            pm_key = f"{provider_code_system}:{stop_code}".upper()
            if pm_key in self._provider_cache:
                fac_id = self._provider_cache[pm_key]
                if fac_id.upper() not in FORBIDDEN_SYNTHETIC:
                    candidate_fac_id = fac_id
                    method = "EXACT_PROVIDER_MAPPING"
                    confidence = 1.0

            # 1b. Check cross-provider code index (to detect cross-mode conflicts)
            if not candidate_fac_id and stop_code.upper() in self._code_to_facilities:
                fac_id = self._code_to_facilities[stop_code.upper()]
                if fac_id.upper() not in FORBIDDEN_SYNTHETIC:
                    candidate_fac_id = fac_id
                    method = "CROSS_PROVIDER_CODE"
                    confidence = 0.9

            # 2. Try Exact Facility ID match
            if not candidate_fac_id and stop_code.upper() in self._facility_cache:
                fac_id = self._facility_cache[stop_code.upper()]
                if fac_id.upper() not in FORBIDDEN_SYNTHETIC:
                    candidate_fac_id = fac_id
                    method = "EXACT_CODE"
                    confidence = 1.0

        # 3. Try Facility Name Match
        if not candidate_fac_id:
            clean_name = stop_name.strip().upper()
            if clean_name in self._facility_cache:
                fac_id = self._facility_cache[clean_name]
                if fac_id.upper() not in FORBIDDEN_SYNTHETIC:
                    candidate_fac_id = fac_id
                    method = "EXACT_CODE"
                    confidence = 1.0

        # 4. Try Location Alias Match
        if not candidate_fac_id:
            clean_name = stop_name.strip().upper()
            if clean_name in self._alias_cache:
                fac_id = self._alias_cache[clean_name]
                if fac_id.upper() not in FORBIDDEN_SYNTHETIC:
                    candidate_fac_id = fac_id
                    method = "ALIAS_MATCH"
                    confidence = 0.85

        # 5. Entity Mode Compatibility Check
        if candidate_fac_id:
            fac_type = self._facility_types.get(candidate_fac_id.upper(), "")
            if mode:
                allowed = self.MODE_COMPATIBLE_TYPES.get(mode.upper())
                if allowed and fac_type and fac_type not in allowed:
                    return ResolvedMappingResult(
                        method="REJECTED_MODE_MISMATCH",
                        confidence=0.0,
                        facility_id=None,
                        facility_type=fac_type,
                        review_state="UNRESOLVED",
                        error_code="FACILITY_MODE_MISMATCH"
                    )

            return ResolvedMappingResult(
                method=method,
                confidence=confidence,
                facility_id=candidate_fac_id,
                facility_type=fac_type,
                review_state="VERIFIED",
                error_code=None
            )

        # 6. Fallback: Unresolved
        return ResolvedMappingResult(
            method="UNRESOLVED",
            confidence=0.0,
            facility_id=None,
            facility_type=None,
            review_state="UNRESOLVED",
            error_code=None
        )
