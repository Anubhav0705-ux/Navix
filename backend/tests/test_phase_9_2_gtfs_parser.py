import io
import os
import zipfile
import pytest
from datetime import time, date

from app.transport_ingestion.gtfs.security import (
    validate_zip_archive, safe_extract_zip, GtfsSecurityError
)
from app.transport_ingestion.gtfs.time_utils import (
    parse_gtfs_time, format_gtfs_time
)
from app.transport_ingestion.gtfs.parser import GtfsScheduleParser, GtfsValidationError
from app.transport_ingestion.gtfs.adapter import GtfsProviderAdapter
from app.transport_ingestion.resolver import LocationResolver
from app.database.session import SessionLocal


class TestGtfsSecurity:
    """Verifies security controls for GTFS archives (Zip-slip and Zip-bomb protections)."""

    def test_zip_slip_rejection(self, tmp_path):
        """Rejects zip archives containing path traversal characters (../ or absolute paths)."""
        evil_zip_path = tmp_path / "evil_slip.zip"
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("../../etc/passwd", "root:x:0:0:")
            zf.writestr("stops.txt", "stop_id,stop_name\n1,Test\n")
        evil_zip_path.write_bytes(buf.getvalue())

        extract_dir = tmp_path / "extracted"
        with pytest.raises(GtfsSecurityError, match="Zip-slip path traversal attempt detected"):
            safe_extract_zip(str(evil_zip_path), str(extract_dir))

    def test_zip_bomb_ratio_rejection(self, tmp_path):
        """Rejects zip archives with suspicious compression ratios."""
        bomb_zip_path = tmp_path / "evil_ratio.zip"
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            # High compression ratio payload
            zf.writestr("huge.txt", "0" * (2 * 1024 * 1024))
        bomb_zip_path.write_bytes(buf.getvalue())

        with pytest.raises(GtfsSecurityError, match="Zip-bomb suspicious compression ratio"):
            validate_zip_archive(str(bomb_zip_path), max_compression_ratio=5.0)

    def test_safe_zip_extraction(self, tmp_path):
        """Allows extraction of a valid and safe zip archive."""
        safe_zip_path = tmp_path / "safe.zip"
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("agency.txt", "agency_id,agency_name,agency_url,agency_timezone\nDTC,DTC,http://dtc.delhi.gov.in,Asia/Kolkata\n")
            zf.writestr("stops.txt", "stop_id,stop_name,stop_lat,stop_lon\nS1,Stop 1,28.6,77.2\n")
        safe_zip_path.write_bytes(buf.getvalue())

        extract_dir = tmp_path / "extracted_safe"
        extracted_files = safe_extract_zip(str(safe_zip_path), str(extract_dir))
        assert any("agency.txt" in f for f in extracted_files)
        assert any("stops.txt" in f for f in extracted_files)
        assert (extract_dir / "agency.txt").exists()


class TestGtfsTimeUtils:
    """Verifies GTFS time normalization across midnight boundaries and service-day offsets."""

    def test_normal_time_parsing(self):
        t, offset = parse_gtfs_time("14:30:00")
        assert t == "14:30:00"
        assert offset == 0

        t2, offset2 = parse_gtfs_time("00:00:00")
        assert t2 == "00:00:00"
        assert offset2 == 0

        t3, offset3 = parse_gtfs_time("23:59:59")
        assert t3 == "23:59:59"
        assert offset3 == 0

    def test_gtfs_24_plus_hour_normalization(self):
        """GTFS allows 24:00:00 - 47:59:59 representing service on the following calendar days."""
        t, offset = parse_gtfs_time("24:15:00")
        assert t == "00:15:00"
        assert offset == 1

        t2, offset2 = parse_gtfs_time("26:40:00")
        assert t2 == "02:40:00"
        assert offset2 == 1

        t3, offset3 = parse_gtfs_time("48:30:00")
        assert t3 == "00:30:00"
        assert offset3 == 2

    def test_invalid_time_strings_rejection(self):
        with pytest.raises(ValueError):
            parse_gtfs_time("invalid:time")

        with pytest.raises(ValueError):
            parse_gtfs_time("-05:00:00")

        with pytest.raises(ValueError):
            parse_gtfs_time("12:65:00")  # Invalid minute

    def test_format_gtfs_time(self):
        assert format_gtfs_time("00:15:00", day_offset=1) == "24:15:00"
        assert format_gtfs_time("02:40:00", day_offset=1) == "26:40:00"
        assert format_gtfs_time("14:30:00", day_offset=0) == "14:30:00"


@pytest.fixture(scope="module")
def dtc_gtfs_path():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "transport", "gtfs", "dtc_delhi_gtfs.zip")
    assert os.path.exists(path), f"Fixture missing: {path}"
    return path


class TestGtfsFeedParser:
    """Verifies production GTFS Schedule parsing on the Delhi DTC fixture."""

    def test_parse_valid_dtc_feed(self, dtc_gtfs_path):
        parser = GtfsScheduleParser(dtc_gtfs_path)
        feed = parser.parse()

        assert len(feed.agencies) == 1
        assert feed.agencies[0]["agency_id"] == "DTC"
        assert feed.agencies[0]["agency_timezone"] == "Asia/Kolkata"

        assert len(feed.routes) == 2
        route_ids = {r["route_id"] for r in feed.routes}
        assert "RT_DTC_ISBT_MNL" in route_ids

        assert len(feed.stops) == 3
        stop_ids = {s["stop_id"] for s in feed.stops}
        assert "ST_DELHI_ISBT" in stop_ids
        assert "ST_DELHI_CP" in stop_ids
        assert "ST_OLD_MANALI" in stop_ids

        assert len(feed.trips) == 2
        trip_ids = {t["trip_id"] for t in feed.trips}
        assert "TRIP_DTC_MNL_01" in trip_ids
        assert "TRIP_DTC_505_01" in trip_ids

        assert len(feed.stop_times) == 5

        # Check calendar and calendar exceptions
        assert len(feed.calendars) == 1
        assert feed.calendars[0]["service_id"] == "CAL_DAILY"
        assert int(feed.calendars[0]["monday"]) == 1
        assert int(feed.calendars[0]["sunday"]) == 1

        assert len(feed.calendar_dates) == 2
        ex_types = {int(cd["exception_type"]) for cd in feed.calendar_dates}
        assert 2 in ex_types  # Holiday removed services (Republic Day & Independence Day)

    def test_missing_required_file_rejection(self, tmp_path):
        """Feed missing required stops.txt must raise GtfsValidationError."""
        bad_zip = tmp_path / "missing_stops.zip"
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("agency.txt", "agency_id,agency_name,agency_url,agency_timezone\nDTC,DTC,http://dtc.in,Asia/Kolkata\n")
            zf.writestr("routes.txt", "route_id,route_short_name,route_type\nR1,101,3\n")
        bad_zip.write_bytes(buf.getvalue())

        parser = GtfsScheduleParser(str(bad_zip))
        with pytest.raises(GtfsValidationError, match="Missing required GTFS files"):
            parser.parse()

    def test_referential_integrity_violation(self, tmp_path):
        """Stop time referencing nonexistent stop must fail validation."""
        bad_zip = tmp_path / "broken_fk.zip"
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("agency.txt", "agency_id,agency_name,agency_url,agency_timezone\nDTC,DTC,http://dtc.in,Asia/Kolkata\n")
            zf.writestr("routes.txt", "route_id,route_short_name,route_type\nR1,101,3\n")
            zf.writestr("stops.txt", "stop_id,stop_name,stop_lat,stop_lon\nS1,Stop 1,28.6,77.2\n")
            zf.writestr("trips.txt", "route_id,service_id,trip_id\nR1,S_ALL,T1\n")
            zf.writestr("stop_times.txt", "trip_id,arrival_time,departure_time,stop_id,stop_sequence\nT1,10:00:00,10:05:00,NONEXISTENT_STOP,1\n")
            zf.writestr("calendar.txt", "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nS_ALL,1,1,1,1,1,1,1,20260101,20261231\n")
        bad_zip.write_bytes(buf.getvalue())

        parser = GtfsScheduleParser(str(bad_zip))
        with pytest.raises(GtfsValidationError, match="references missing stop_id"):
            parser.parse()


class TestGtfsProviderAdapter:
    """Verifies that GtfsProviderAdapter normalizes GTFS feed trips into NAVIX platform entities."""

    def test_adapter_normalization_and_resolution(self, dtc_gtfs_path):
        db = SessionLocal()
        try:
            resolver = LocationResolver(db)
            adapter = GtfsProviderAdapter(feed_path=dtc_gtfs_path, resolver=resolver)
            normalized_services = adapter.parse()

            assert len(normalized_services) == 2
            s1 = next(s for s in normalized_services if "TRIP_DTC_MNL_01" in s.service_code)

            assert "ISBT" in s1.service_name
            assert s1.transport_mode == "BUS"
            assert s1.data_class == "SYNTHETIC_CONTRACT_FIXTURE"
            assert s1.data_state == "ESTIMATED"
            assert len(s1.calling_points) == 3

            # Stop sequences
            seqs = [cp.stop_sequence for cp in s1.calling_points]
            assert seqs == [1, 2, 3]

            # Geographic resolution verification
            cp_delhi_isbt = s1.calling_points[0]
            assert cp_delhi_isbt.facility_id == "fac_new_delhi_bs_del_isbt"

            cp_old_manali = s1.calling_points[2]
            assert cp_old_manali.facility_id == "fac_old_manali_bs_mnl"

            # Intermediate stop ST_DELHI_CP is intentionally not in Phase 8 seed and must be quarantined
            cp_cp = s1.calling_points[1]
            assert cp_cp.facility_id is None

            # Calendar exceptions present
            assert len(s1.calendar_dates) == 2
        finally:
            db.close()
