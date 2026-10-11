import os
import yaml
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, model_validator


class TransportSourceRecord(BaseModel):
    source_id: str
    transport_mode: str
    operator_name: str
    source_name: str
    source_url: Optional[str] = None
    authority: Optional[str] = None
    publisher: Optional[str] = None
    license: str
    authentication_required: bool = False
    access_method: str = "STATIC_FILE_INGESTION"
    format: str = "JSON"
    geographic_coverage: str = "NATIONAL_INDIA"
    schedule_available: bool = True
    route_available: bool = True
    stop_available: bool = True
    fare_available: bool = False
    availability_available: bool = False
    data_state: str = "STATIC"
    data_class: str = "REAL_SOURCE_DERIVED"
    refresh_frequency: str = "MONTHLY"
    attribution: str
    license_evidence_url: Optional[str] = None
    redistribution_allowed: bool = False
    last_verified_at: Optional[str] = None
    source_last_updated_at: Optional[str] = None
    fields_available: List[str] = []
    ingestion_status: str  # APPROVED, REQUIRES_LICENSE_REVIEW, REQUIRES_CREDENTIALS, REQUIRES_PROVIDER_AGREEMENT, UNAVAILABLE, REJECTED
    approval_status: Optional[str] = None
    reason: str
    rejection_reason: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "mode" in data and "transport_mode" not in data:
                data["transport_mode"] = data["mode"]
            if "operator" in data and "operator_name" not in data:
                data["operator_name"] = data["operator"]
            if "publisher" in data and "authority" not in data:
                data["authority"] = data["publisher"]
            if "exact_url" in data and "source_url" not in data:
                data["source_url"] = data["exact_url"]
            if "approval_status" in data and "ingestion_status" not in data:
                data["ingestion_status"] = data["approval_status"]
            if "rejection_reason" in data and "reason" not in data:
                data["reason"] = data["rejection_reason"]
            # Synchronize both ways
            data["publisher"] = data.get("authority") or data.get("publisher")
            data["approval_status"] = data.get("ingestion_status") or data.get("approval_status")
            data["rejection_reason"] = data.get("reason") or data.get("rejection_reason")
        return data


class TransportSourceManifest:
    def __init__(self, manifest_path: Optional[str] = None):
        if manifest_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            manifest_path = os.path.join(base_dir, "data", "transport", "source_manifest.yaml")
        self.manifest_path = manifest_path
        self.sources: Dict[str, TransportSourceRecord] = {}
        self.load()

    def load(self) -> None:
        if not os.path.exists(self.manifest_path):
            raise FileNotFoundError(f"Transport source manifest not found at: {self.manifest_path}")

        with open(self.manifest_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        for src_raw in data.get("sources", []):
            record = TransportSourceRecord(**src_raw)
            self.sources[record.source_id] = record

    def get_source(self, source_id: str) -> Optional[TransportSourceRecord]:
        return self.sources.get(source_id)

    def list_approved_sources(self) -> List[TransportSourceRecord]:
        return [s for s in self.sources.values() if s.ingestion_status == "APPROVED"]


TransportSourceSpec = TransportSourceRecord
