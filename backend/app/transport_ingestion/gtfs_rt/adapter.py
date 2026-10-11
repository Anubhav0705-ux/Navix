from typing import Optional, Dict, Any, Union
from app.transport_ingestion.gtfs_rt.decoder import GtfsRtDecoder, GtfsRtDecodeError
from app.transport_ingestion.gtfs_rt.models import RtFeedMessage


class GtfsRtAdapter:
    """
    Adapter for GTFS-Realtime feeds.
    Enforces NAVIX truth-in-data principles:
    - Realtime is disabled by default unless an authorized provider feed is explicitly configured.
    - Missing realtime data does NOT mean on-time.
    - Stale realtime feeds are flagged and never treated as live.
    """
    def __init__(
        self,
        endpoint_url: Optional[str] = None,
        api_key: Optional[str] = None,
        fixture_payload: Optional[Union[bytes, str, Dict[str, Any]]] = None
    ):
        self.endpoint_url = endpoint_url
        self.api_key = api_key
        self.fixture_payload = fixture_payload
        self.decoder = GtfsRtDecoder()

    @property
    def is_configured(self) -> bool:
        return bool(self.endpoint_url or self.fixture_payload)

    def is_enabled(self) -> bool:
        return self.is_configured

    def get_status(self) -> Dict[str, Any]:
        if not self.is_configured:
            return {"status": "DISABLED", "reason": "CREDENTIALS_REQUIRED"}
        return {"status": "CONFIGURED", "endpoint": self.endpoint_url}

    def fetch_and_decode(self) -> RtFeedMessage:
        if not self.is_configured:
            raise GtfsRtDecodeError(
                "GTFS-Realtime feed is disabled: no authorized endpoint or fixture configured."
            )

        if self.fixture_payload is not None:
            return self.decoder.decode(self.fixture_payload)

        # In production, actual authorized endpoint fetching would happen here with safe HTTP client
        raise NotImplementedError("Live HTTP polling requires registered provider credentials.")
