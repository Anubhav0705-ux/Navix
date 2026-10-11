import os
import csv
import io
import zipfile
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

from app.transport_ingestion.gtfs.security import validate_zip_archive
from app.transport_ingestion.gtfs.time_utils import parse_gtfs_time


class GtfsValidationError(Exception):
    """Raised when GTFS data fails semantic validation."""
    pass


@dataclass
class GtfsFeedData:
    agencies: List[Dict[str, str]] = field(default_factory=list)
    routes: List[Dict[str, str]] = field(default_factory=list)
    trips: List[Dict[str, str]] = field(default_factory=list)
    stops: List[Dict[str, str]] = field(default_factory=list)
    stop_times: List[Dict[str, Any]] = field(default_factory=list)
    calendars: List[Dict[str, Any]] = field(default_factory=list)
    calendar_dates: List[Dict[str, Any]] = field(default_factory=list)
    frequencies: List[Dict[str, Any]] = field(default_factory=list)
    transfers: List[Dict[str, Any]] = field(default_factory=list)
    feed_info: Optional[Dict[str, str]] = None
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


class GtfsScheduleParser:
    REQUIRED_FILES = {"agency.txt", "routes.txt", "trips.txt", "stops.txt", "stop_times.txt"}

    def __init__(self, source_path: str):
        self.source_path = source_path
        self.is_zip = zipfile.is_zipfile(source_path) if os.path.isfile(source_path) else False

    def parse(self) -> GtfsFeedData:
        feed = GtfsFeedData()

        if self.is_zip:
            validate_zip_archive(self.source_path)
            with zipfile.ZipFile(self.source_path, 'r') as zf:
                filenames = {os.path.basename(n): n for n in zf.namelist()}
                missing = self.REQUIRED_FILES - set(filenames.keys())
                if missing:
                    raise GtfsValidationError(f"Missing required GTFS files: {sorted(list(missing))}")

                feed.agencies = self._parse_csv_content(zf.read(filenames["agency.txt"]))
                feed.routes = self._parse_csv_content(zf.read(filenames["routes.txt"]))
                feed.trips = self._parse_csv_content(zf.read(filenames["trips.txt"]))
                feed.stops = self._parse_csv_content(zf.read(filenames["stops.txt"]))
                feed.stop_times = self._parse_stop_times(self._parse_csv_content(zf.read(filenames["stop_times.txt"])))

                if "calendar.txt" in filenames:
                    feed.calendars = self._parse_csv_content(zf.read(filenames["calendar.txt"]))
                if "calendar_dates.txt" in filenames:
                    feed.calendar_dates = self._parse_csv_content(zf.read(filenames["calendar_dates.txt"]))
                if "frequencies.txt" in filenames:
                    feed.frequencies = self._parse_csv_content(zf.read(filenames["frequencies.txt"]))
                if "transfers.txt" in filenames:
                    feed.transfers = self._parse_csv_content(zf.read(filenames["transfers.txt"]))
                if "feed_info.txt" in filenames:
                    info_rows = self._parse_csv_content(zf.read(filenames["feed_info.txt"]))
                    if info_rows:
                        feed.feed_info = info_rows[0]
        else:
            if not os.path.isdir(self.source_path):
                raise FileNotFoundError(f"GTFS source directory not found: {self.source_path}")

            files = set(os.listdir(self.source_path))
            missing = self.REQUIRED_FILES - files
            if missing:
                raise GtfsValidationError(f"Missing required GTFS files: {sorted(list(missing))}")

            feed.agencies = self._read_file(os.path.join(self.source_path, "agency.txt"))
            feed.routes = self._read_file(os.path.join(self.source_path, "routes.txt"))
            feed.trips = self._read_file(os.path.join(self.source_path, "trips.txt"))
            feed.stops = self._read_file(os.path.join(self.source_path, "stops.txt"))
            feed.stop_times = self._parse_stop_times(self._read_file(os.path.join(self.source_path, "stop_times.txt")))

            cal_path = os.path.join(self.source_path, "calendar.txt")
            if os.path.exists(cal_path):
                feed.calendars = self._read_file(cal_path)

            cal_dates_path = os.path.join(self.source_path, "calendar_dates.txt")
            if os.path.exists(cal_dates_path):
                feed.calendar_dates = self._read_file(cal_dates_path)

            freq_path = os.path.join(self.source_path, "frequencies.txt")
            if os.path.exists(freq_path):
                feed.frequencies = self._read_file(freq_path)

            trans_path = os.path.join(self.source_path, "transfers.txt")
            if os.path.exists(trans_path):
                feed.transfers = self._read_file(trans_path)

            info_path = os.path.join(self.source_path, "feed_info.txt")
            if os.path.exists(info_path):
                info_rows = self._read_file(info_path)
                if info_rows:
                    feed.feed_info = info_rows[0]

        self._validate_feed_integrity(feed)
        return feed

    def _read_file(self, path: str) -> List[Dict[str, str]]:
        with open(path, "rb") as f:
            return self._parse_csv_content(f.read())

    def _parse_csv_content(self, raw_bytes: bytes) -> List[Dict[str, str]]:
        text = raw_bytes.decode("utf-8-sig", errors="replace")
        reader = csv.DictReader(io.StringIO(text))
        rows = []
        for row in reader:
            clean_row = {k.strip(): (v.strip() if v is not None else "") for k, v in row.items() if k is not None}
            rows.append(clean_row)
        return rows

    def _parse_stop_times(self, raw_stop_times: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        parsed = []
        for row in raw_stop_times:
            item = dict(row)
            # Parse times with 24+ hour support
            arr_norm, arr_day = parse_gtfs_time(row.get("arrival_time", "00:00:00"))
            dep_norm, dep_day = parse_gtfs_time(row.get("departure_time", "00:00:00"))

            item["arrival_time"] = arr_norm
            item["departure_time"] = dep_norm
            item["day_offset"] = max(arr_day, dep_day)
            item["stop_sequence"] = int(row.get("stop_sequence", 0))
            item["pickup_type"] = int(row.get("pickup_type", 0) or 0)
            item["drop_off_type"] = int(row.get("drop_off_type", 0) or 0)
            parsed.append(item)
        return parsed

    def _validate_feed_integrity(self, feed: GtfsFeedData) -> None:
        route_ids = {r.get("route_id") for r in feed.routes}
        stop_ids = {s.get("stop_id") for s in feed.stops}
        trip_ids = {t.get("trip_id") for t in feed.trips}

        # Check trips referencing existing routes
        for t in feed.trips:
            r_id = t.get("route_id")
            if r_id not in route_ids:
                raise GtfsValidationError(f"Trip '{t.get('trip_id')}' references missing route_id '{r_id}'.")

        # Check stop_times referencing existing trips and stops
        for st in feed.stop_times:
            t_id = st.get("trip_id")
            s_id = st.get("stop_id")
            if t_id not in trip_ids:
                raise GtfsValidationError(f"Stop time references missing trip_id '{t_id}'.")
            if s_id not in stop_ids:
                raise GtfsValidationError(f"Stop time references missing stop_id '{s_id}'.")
