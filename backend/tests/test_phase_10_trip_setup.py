import pytest
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.redis import redis_manager
from app.database.session import SessionLocal
from app.models.trip import Trip


client = TestClient(app)

TODAY = date.today()
FUTURE_START = TODAY + timedelta(days=10)
FUTURE_END = TODAY + timedelta(days=16)

VALID_ORIGIN = {
    "provider": "FOURSQUARE",
    "provider_place_id": "fsq_sangli_01",
    "display_name": "Sangli",
    "latitude": 16.8524,
    "longitude": 74.5815,
    "country": "IN",
    "region": "Maharashtra"
}

VALID_DESTINATION = {
    "provider": "FOURSQUARE",
    "provider_place_id": "fsq_manali_02",
    "display_name": "Manali",
    "latitude": 32.2396,
    "longitude": 77.1887,
    "country": "IN",
    "region": "Himachal Pradesh"
}


class TestTripSetupValidation:
    def test_valid_trip_setup_draft_creation(self):
        payload = {
            "origin": VALID_ORIGIN,
            "destination": VALID_DESTINATION,
            "departure_date": FUTURE_START.isoformat(),
            "return_date": FUTURE_END.isoformat(),
            "travellers": 2,
            "maximum_budget": "25000.00",
            "currency": "INR",
            "travel_style": "BALANCED"
        }

        mock_redis = MagicMock()
        with patch.object(redis_manager, "get_sync_client", return_value=mock_redis):
            response = client.post("/api/v1/trips/setup", json=payload)
            assert response.status_code == 201
            data = response.json()

            assert data["trip_id"].startswith("trip_setup_")
            assert data["origin"]["provider_place_id"] == "fsq_sangli_01"
            assert data["destination"]["provider_place_id"] == "fsq_manali_02"
            assert data["duration_days"] == 7
            assert data["duration_nights"] == 6
            assert data["travellers"] == 2
            assert float(data["maximum_budget"]) == 25000.0
            assert data["status"] == "DRAFT"
            assert data["next_step"] == "TRANSPORTATION"

    def test_same_origin_and_destination_rejected(self):
        payload = {
            "origin": VALID_ORIGIN,
            "destination": VALID_ORIGIN,  # Same location
            "departure_date": FUTURE_START.isoformat(),
            "return_date": FUTURE_END.isoformat(),
            "travellers": 1,
            "maximum_budget": "15000.00"
        }
        response = client.post("/api/v1/trips/setup", json=payload)
        assert response.status_code == 422
        assert "distinct" in str(response.json()).lower() or "identical" in str(response.json()).lower()

    def test_past_departure_date_rejected(self):
        past_date = TODAY - timedelta(days=2)
        payload = {
            "origin": VALID_ORIGIN,
            "destination": VALID_DESTINATION,
            "departure_date": past_date.isoformat(),
            "return_date": FUTURE_END.isoformat(),
            "travellers": 1,
            "maximum_budget": "15000.00"
        }
        response = client.post("/api/v1/trips/setup", json=payload)
        assert response.status_code == 422
        assert "past" in str(response.json()).lower()

    def test_return_before_departure_rejected(self):
        payload = {
            "origin": VALID_ORIGIN,
            "destination": VALID_DESTINATION,
            "departure_date": (TODAY + timedelta(days=15)).isoformat(),
            "return_date": (TODAY + timedelta(days=10)).isoformat(),
            "travellers": 1,
            "maximum_budget": "15000.00"
        }
        response = client.post("/api/v1/trips/setup", json=payload)
        assert response.status_code == 422
        assert "before departure" in str(response.json()).lower()

    def test_duration_exceeding_30_days_rejected(self):
        payload = {
            "origin": VALID_ORIGIN,
            "destination": VALID_DESTINATION,
            "departure_date": FUTURE_START.isoformat(),
            "return_date": (FUTURE_START + timedelta(days=35)).isoformat(),
            "travellers": 1,
            "maximum_budget": "50000.00"
        }
        response = client.post("/api/v1/trips/setup", json=payload)
        assert response.status_code == 422
        assert "30 days" in str(response.json()).lower()

    def test_zero_or_excessive_travellers_rejected(self):
        # 0 travellers
        p0 = {
            "origin": VALID_ORIGIN,
            "destination": VALID_DESTINATION,
            "departure_date": FUTURE_START.isoformat(),
            "return_date": FUTURE_END.isoformat(),
            "travellers": 0,
            "maximum_budget": "10000.00"
        }
        r0 = client.post("/api/v1/trips/setup", json=p0)
        assert r0.status_code == 422

        # 25 travellers
        p25 = dict(p0, travellers=25)
        r25 = client.post("/api/v1/trips/setup", json=p25)
        assert r25.status_code == 422

    def test_negative_or_zero_budget_rejected(self):
        p_zero = {
            "origin": VALID_ORIGIN,
            "destination": VALID_DESTINATION,
            "departure_date": FUTURE_START.isoformat(),
            "return_date": FUTURE_END.isoformat(),
            "travellers": 1,
            "maximum_budget": "0.00"
        }
        r_zero = client.post("/api/v1/trips/setup", json=p_zero)
        assert r_zero.status_code == 422

        p_neg = dict(p_zero, maximum_budget="-500.00")
        r_neg = client.post("/api/v1/trips/setup", json=p_neg)
        assert r_neg.status_code == 422

    def test_missing_provider_place_id_rejected(self):
        invalid_origin = dict(VALID_ORIGIN)
        invalid_origin["provider_place_id"] = ""
        payload = {
            "origin": invalid_origin,
            "destination": VALID_DESTINATION,
            "departure_date": FUTURE_START.isoformat(),
            "return_date": FUTURE_END.isoformat(),
            "travellers": 1,
            "maximum_budget": "10000.00"
        }
        response = client.post("/api/v1/trips/setup", json=payload)
        assert response.status_code == 422

    def test_invalid_coordinates_rejected(self):
        invalid_origin = dict(VALID_ORIGIN, latitude=120.0)  # Latitude must be <= 90
        payload = {
            "origin": invalid_origin,
            "destination": VALID_DESTINATION,
            "departure_date": FUTURE_START.isoformat(),
            "return_date": FUTURE_END.isoformat(),
            "travellers": 1,
            "maximum_budget": "10000.00"
        }
        response = client.post("/api/v1/trips/setup", json=payload)
        assert response.status_code == 422

    def test_draft_retrieval_and_404(self):
        mock_redis = MagicMock()
        stored = {}
        mock_redis.get.side_effect = lambda k: stored.get(k)
        mock_redis.set.side_effect = lambda k, v, ex=None: stored.update({k: v})

        with patch.object(redis_manager, "get_sync_client", return_value=mock_redis):
            # Create draft
            payload = {
                "origin": VALID_ORIGIN,
                "destination": VALID_DESTINATION,
                "departure_date": FUTURE_START.isoformat(),
                "return_date": FUTURE_END.isoformat(),
                "travellers": 2,
                "maximum_budget": "20000.00"
            }
            create_resp = client.post("/api/v1/trips/setup", json=payload)
            assert create_resp.status_code == 201
            draft_id = create_resp.json()["trip_id"]

            # Retrieve draft
            get_resp = client.get(f"/api/v1/trips/setup/{draft_id}")
            assert get_resp.status_code == 200
            assert get_resp.json()["trip_id"] == draft_id
            assert get_resp.json()["origin"]["display_name"] == "Sangli"

            # Non-existent draft
            not_found_resp = client.get("/api/v1/trips/setup/non_existent_draft_999")
            assert not_found_resp.status_code == 404


class TestTripModelBackwardCompatibility:
    def test_existing_legacy_trips_load_without_phase10_fields(self):
        """
        Verify that pre-Phase 10 trips (which have null provider/coordinates)
        continue to load and deserialize seamlessly without errors.
        """
        try:
            with SessionLocal() as db:
                legacy_trip = db.query(Trip).filter(Trip.trip_id == "trip_test_01").first()
                if legacy_trip:
                    assert legacy_trip.origin == "Sangli"
                    assert legacy_trip.destination == "Old Manali"
                    # Phase 10 fields should be None / null without causing ORM error
                    assert legacy_trip.origin_provider is None or isinstance(legacy_trip.origin_provider, str)
                    assert legacy_trip.origin_place_id is None or isinstance(legacy_trip.origin_place_id, str)
        except Exception as e:
            pytest.fail(f"Legacy trip compatibility query failed: {e}")
