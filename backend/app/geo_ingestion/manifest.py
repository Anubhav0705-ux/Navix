import os
import yaml
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class DatasetSourceMeta(BaseModel):
    dataset_id: str
    source_name: str
    source_url: str
    license: str
    attribution: str
    source_version: str
    expected_format: str
    imported_entity_types: List[str]
    status: str
    notes: Optional[str] = None


class SourceManifest(BaseModel):
    version: str
    updated_at: str
    datasets: List[DatasetSourceMeta]
    blocked_sources: List[Dict[str, str]]


def load_source_manifest(manifest_path: Optional[str] = None) -> SourceManifest:
    """
    Loads and validates the NAVIX Geographic Source Manifest.
    """
    if manifest_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        manifest_path = os.path.join(base_dir, "data", "geo", "source_manifest.yaml")

    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"Geographic source manifest not found at: {manifest_path}")

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    return SourceManifest(**data)
