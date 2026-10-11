import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Union

from app.transport_ingestion.gtfs_rt.models import (
    RtFeedMessage, RtTripUpdate, RtStopTimeUpdate,
    RtVehiclePosition, RtServiceAlert
)

logger = logging.getLogger(__name__)


class GtfsRtDecodeError(Exception):
    """Raised when a GTFS-Realtime message is malformed or unparseable."""
    pass


class GtfsRtDecoder:
    """
    Decodes GTFS-Realtime feed payloads with stale observation detection,
    entity deduplication, and malformed entity protection.
    """
    def __init__(self, max_feed_age_seconds: int = 1800):  # 30 minutes
        self.max_feed_age_seconds = max_feed_age_seconds

    def decode(self, payload: Union[bytes, str, Dict[str, Any]]) -> RtFeedMessage:
        if isinstance(payload, bytes):
            # Attempt JSON decode first; if fails, attempt binary protobuf representation
            try:
                text = payload.decode('utf-8')
                data = json.loads(text)
            except (UnicodeDecodeError, json.JSONDecodeError):
                data = self._decode_protobuf_fallback(payload)
        elif isinstance(payload, str):
            try:
                data = json.loads(payload)
            except json.JSONDecodeError as e:
                raise GtfsRtDecodeError(f"Invalid JSON string in GTFS-RT payload: {e}")
        elif isinstance(payload, dict):
            data = payload
        else:
            raise GtfsRtDecodeError(f"Unsupported payload type: {type(payload)}")

        return self._parse_feed_data(data)

    def _parse_feed_data(self, data: Dict[str, Any]) -> RtFeedMessage:
        header = data.get("header", {})
        ts_val = header.get("timestamp")
        
        now = datetime.now(timezone.utc)
        if ts_val:
            if isinstance(ts_val, (int, float)):
                feed_ts = datetime.fromtimestamp(ts_val, tz=timezone.utc)
            else:
                feed_ts = datetime.fromisoformat(str(ts_val).replace("Z", "+00:00"))
        else:
            feed_ts = now

        feed_age = (now - feed_ts).total_seconds()
        is_stale = feed_age > self.max_feed_age_seconds

        trip_updates = []
        vehicles = []
        alerts = []
        seen_entity_ids = set()

        for entity in data.get("entity", []):
            e_id = entity.get("id")
            if e_id and e_id in seen_entity_ids:
                continue  # Entity deduplication
            if e_id:
                seen_entity_ids.add(e_id)

            if entity.get("is_deleted", False):
                continue

            # 1. Trip Update
            if "trip_update" in entity:
                tu = entity["trip_update"]
                trip = tu.get("trip", {})
                t_id = trip.get("trip_id")
                if not t_id:
                    continue

                stop_updates = []
                max_delay = tu.get("delay", 0)
                for stu in tu.get("stop_time_update", []):
                    arr = stu.get("arrival", {})
                    dep = stu.get("departure", {})
                    arr_delay = arr.get("delay")
                    dep_delay = dep.get("delay")
                    if arr_delay is not None:
                        max_delay = arr_delay
                    elif dep_delay is not None:
                        max_delay = dep_delay

                    stop_updates.append(RtStopTimeUpdate(
                        stop_sequence=stu.get("stop_sequence"),
                        stop_id=stu.get("stop_id"),
                        arrival_delay=arr_delay,
                        departure_delay=dep_delay,
                        schedule_relationship=stu.get("schedule_relationship", "SCHEDULED")
                    ))

                trip_updates.append(RtTripUpdate(
                    trip_id=t_id,
                    route_id=trip.get("route_id"),
                    start_time=trip.get("start_time"),
                    start_date=trip.get("start_date"),
                    delay_seconds=int(max_delay),
                    schedule_relationship=trip.get("schedule_relationship", "SCHEDULED"),
                    stop_time_updates=stop_updates
                ))

            # 2. Vehicle Position
            elif "vehicle" in entity:
                veh = entity["vehicle"]
                pos = veh.get("position", {})
                lat = pos.get("latitude")
                lon = pos.get("longitude")
                if lat is not None and lon is not None:
                    vehicles.append(RtVehiclePosition(
                        trip_id=veh.get("trip", {}).get("trip_id"),
                        vehicle_id=veh.get("vehicle", {}).get("id"),
                        latitude=float(lat),
                        longitude=float(lon),
                        bearing=float(pos["bearing"]) if "bearing" in pos else None,
                        speed=float(pos["speed"]) if "speed" in pos else None,
                        timestamp=feed_ts
                    ))

            # 3. Alert
            elif "alert" in entity:
                alt = entity["alert"]
                h_text = ""
                d_text = None
                if isinstance(alt.get("header_text"), dict):
                    translations = alt["header_text"].get("translation", [])
                    if translations:
                        h_text = translations[0].get("text", "")
                elif isinstance(alt.get("header_text"), str):
                    h_text = alt["header_text"]

                if isinstance(alt.get("description_text"), dict):
                    translations = alt["description_text"].get("translation", [])
                    if translations:
                        d_text = translations[0].get("text", "")
                elif isinstance(alt.get("description_text"), str):
                    d_text = alt["description_text"]

                informed_service = None
                informed_entities = alt.get("informed_entity", [])
                if informed_entities:
                    informed_service = informed_entities[0].get("trip", {}).get("trip_id") or informed_entities[0].get("route_id")

                alerts.append(RtServiceAlert(
                    alert_id=e_id or "alert_default",
                    cause=alt.get("cause", "UNKNOWN_CAUSE"),
                    effect=alt.get("effect", "UNKNOWN_EFFECT"),
                    header_text=h_text or "Service Alert",
                    description_text=d_text,
                    informed_service_id=informed_service
                ))

        return RtFeedMessage(
            feed_timestamp=feed_ts,
            is_stale=is_stale,
            trip_updates=trip_updates,
            vehicles=vehicles,
            alerts=alerts
        )

    def _decode_protobuf_fallback(self, raw_bytes: bytes) -> Dict[str, Any]:
        """
        Fallback parser for raw protobuf bytes. If Google protobuf library
        is not available, raises GtfsRtDecodeError explaining requirements.
        """
        raise GtfsRtDecodeError(
            "Protobuf binary wire decoding requires Google Protocol Buffers compiler/library or JSON serialization."
        )
