import time
import pytest
from app.transport_ingestion.gtfs_rt.models import (
    RtFeedMessage, RtTripUpdate, RtStopTimeUpdate,
    RtVehiclePosition, RtServiceAlert
)
from app.transport_ingestion.gtfs_rt.decoder import GtfsRtDecoder, GtfsRtDecodeError
from app.transport_ingestion.gtfs_rt.adapter import GtfsRtAdapter


class TestGtfsRtDecoder:
    """Verifies GTFS-Realtime decoder parsing, staleness detection, and error handling."""

    def test_json_feed_message_decoding(self):
        current_time = int(time.time())
        raw_feed = {
            "header": {
                "gtfs_realtime_version": "2.0",
                "timestamp": current_time,
                "incrementality": 0
            },
            "entity": [
                {
                    "id": "ent_01",
                    "trip_update": {
                        "trip": {
                            "trip_id": "TRIP_DEL_MNL_01",
                            "route_id": "DTC-EXPR-01",
                            "schedule_relationship": "SCHEDULED"
                        },
                        "stop_time_update": [
                            {
                                "stop_sequence": 2,
                                "stop_id": "ST_DELHI_CP",
                                "arrival": {"delay": 600},
                                "departure": {"delay": 600}
                            }
                        ]
                    }
                },
                {
                    "id": "ent_02",
                    "vehicle": {
                        "trip": {"trip_id": "TRIP_DEL_MNL_01"},
                        "position": {
                            "latitude": 28.6315,
                            "longitude": 77.2167,
                            "speed": 45.0
                        },
                        "timestamp": current_time
                    }
                },
                {
                    "id": "ent_03",
                    "alert": {
                        "active_period": [{"start": current_time - 3600, "end": current_time + 3600}],
                        "informed_entity": [{"route_id": "DTC-EXPR-01"}],
                        "header_text": {"translation": [{"text": "Monsoon delay warning"}]}
                    }
                }
            ]
        }

        decoder = GtfsRtDecoder()
        feed = decoder.decode(raw_feed)

        assert len(feed.trip_updates) == 1
        assert len(feed.vehicles) == 1
        assert len(feed.alerts) == 1

        # Check Trip Update
        tu = feed.trip_updates[0]
        assert tu.trip_id == "TRIP_DEL_MNL_01"
        assert len(tu.stop_time_updates) == 1
        assert tu.stop_time_updates[0].arrival_delay == 600

        # Check Vehicle Position
        vp = feed.vehicles[0]
        assert vp.trip_id == "TRIP_DEL_MNL_01"
        assert vp.latitude == 28.6315
        assert vp.longitude == 77.2167

        # Check Service Alert
        alert = feed.alerts[0]
        assert alert.header_text == "Monsoon delay warning"

    def test_stale_feed_detection(self):
        """Feeds with timestamp older than 1800 seconds must be classified as stale."""
        decoder = GtfsRtDecoder(max_feed_age_seconds=1800)

        # Stale timestamp: 2 hours ago
        stale_time = int(time.time()) - 7200
        feed_stale = decoder.decode({
            "header": {"gtfs_realtime_version": "2.0", "timestamp": stale_time},
            "entity": []
        })
        assert feed_stale.is_stale is True

        # Fresh timestamp: 10 seconds ago
        fresh_time = int(time.time()) - 10
        feed_fresh = decoder.decode({
            "header": {"gtfs_realtime_version": "2.0", "timestamp": fresh_time},
            "entity": []
        })
        assert feed_fresh.is_stale is False

    def test_entity_deduplication(self):
        """Feeds containing duplicate entity IDs must be deduplicated."""
        raw_feed = {
            "header": {"gtfs_realtime_version": "2.0", "timestamp": int(time.time())},
            "entity": [
                {"id": "duplicate_id", "trip_update": {"trip": {"trip_id": "T1"}}},
                {"id": "duplicate_id", "trip_update": {"trip": {"trip_id": "T1_REVISED"}}},
                {"id": "unique_id", "trip_update": {"trip": {"trip_id": "T2"}}}
            ]
        }
        decoder = GtfsRtDecoder()
        feed = decoder.decode(raw_feed)
        # Deduplicated: only the first duplicate_id plus unique_id
        assert len(feed.trip_updates) == 2
        trip_ids = [tu.trip_id for tu in feed.trip_updates]
        assert trip_ids == ["T1", "T2"]

    def test_malformed_feed_rejection(self):
        decoder = GtfsRtDecoder()
        with pytest.raises(GtfsRtDecodeError, match="Unsupported payload type"):
            decoder.decode(12345)


class TestGtfsRtAdapter:
    """Verifies that GtfsRtAdapter enforces authorization and truth-in-data."""

    def test_disabled_without_configuration(self):
        """Adapter without endpoint or fixture is not configured and fails safely."""
        adapter = GtfsRtAdapter()
        assert adapter.is_configured is False

        with pytest.raises(GtfsRtDecodeError, match="no authorized endpoint or fixture configured"):
            adapter.fetch_and_decode()

    def test_configured_with_fixture_payload(self):
        current_time = int(time.time())
        payload = {
            "header": {"gtfs_realtime_version": "2.0", "timestamp": current_time},
            "entity": [
                {
                    "id": "e_fix",
                    "trip_update": {"trip": {"trip_id": "T_FIX", "schedule_relationship": "SCHEDULED"}}
                }
            ]
        }
        adapter = GtfsRtAdapter(fixture_payload=payload)
        assert adapter.is_configured is True

        feed = adapter.fetch_and_decode()
        assert len(feed.trip_updates) == 1
        assert feed.trip_updates[0].trip_id == "T_FIX"

    def test_live_polling_requires_credentials(self):
        adapter = GtfsRtAdapter(endpoint_url="https://otd.delhi.gov.in/api/realtime")
        assert adapter.is_configured is True
        with pytest.raises(NotImplementedError, match="Live HTTP polling requires registered provider credentials"):
            adapter.fetch_and_decode()

    def test_trip_cancellation_and_delays(self):
        current_time = int(time.time())
        feed_data = {
            "header": {"gtfs_realtime_version": "2.0", "timestamp": current_time},
            "entity": [
                {
                    "id": "e_cancel",
                    "trip_update": {
                        "trip": {
                            "trip_id": "TRIP_CANCELLED",
                            "schedule_relationship": "CANCELED"
                        }
                    }
                }
            ]
        }
        decoder = GtfsRtDecoder()
        feed = decoder.decode(feed_data)
        assert feed.trip_updates[0].schedule_relationship == "CANCELED"
