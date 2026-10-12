import json
import pytest
from unittest.mock import patch, MagicMock

from app.schemas.providers import ProviderHealthStatus
from app.providers.base import (
    ProviderAuthError,
    ProviderRateLimitError,
    ProviderUnavailableError,
    ProviderTimeoutError,
    ProviderMalformedResponseError
)
from app.providers.foursquare import FoursquarePlaceProvider
from app.providers.transitland import TransitlandProvider
from app.providers.duffel import DuffelFlightProvider
from app.providers.hotelbeds import HotelbedsProvider
from app.providers.registry import ProviderRegistry


MOCK_FSQ_RESPONSE = {
    "results": [
        {
            "fsq_place_id": "fsq_manali_123",
            "name": "Manali",
            "latitude": 32.2396,
            "longitude": 77.1887,
            "location": {
                "locality": "Manali",
                "region": "Himachal Pradesh",
                "country": "IN",
                "formatted_address": "Manali, Himachal Pradesh, India"
            },
            "categories": [{"name": "Town"}, {"name": "Scenic Lookout"}]
        },
        {
            "fsq_place_id": "fsq_old_manali_456",
            "name": "Old Manali",
            "latitude": 32.2560,
            "longitude": 77.1788,
            "location": {
                "locality": "Old Manali",
                "region": "Himachal Pradesh",
                "country": "IN",
                "formatted_address": "Old Manali, Himachal Pradesh"
            },
            "categories": [{"name": "Village"}]
        }
    ]
}


def make_mock_response(status_code=200, json_data=None, text=""):
    mock = MagicMock()
    mock.status_code = status_code
    mock.text = text if text else (json.dumps(json_data) if json_data is not None else "")
    if json_data is not None:
        mock.json.return_value = json_data
    else:
        def raise_json_error():
            raise ValueError("No JSON object could be decoded")
        mock.json.side_effect = raise_json_error
    return mock


class TestFoursquarePlaceProvider:
    @patch("requests.get")
    def test_search_places_success(self, mock_get):
        mock_get.return_value = make_mock_response(200, MOCK_FSQ_RESPONSE)
        provider = FoursquarePlaceProvider(api_key="test_key_123")
        res = provider.search_places("Manali", limit=5)

        assert res.total_matches == 2
        assert res.provider == "FOURSQUARE"
        assert res.results[0].display_name == "Manali"
        assert res.results[0].provider_place_id == "fsq_manali_123"
        assert res.results[0].latitude == 32.2396
        assert res.results[0].longitude == 77.1887
        assert res.results[0].region == "Himachal Pradesh"
        assert "Town" in res.results[0].categories
        assert res.results[0].data_state == "REAL_PROVIDER_DATA"

    @patch("requests.get")
    def test_search_places_unicode_query(self, mock_get):
        mock_get.return_value = make_mock_response(200, MOCK_FSQ_RESPONSE)
        provider = FoursquarePlaceProvider(api_key="test_key_123")
        res = provider.search_places("मनाली", limit=2)
        assert res.total_matches == 2

    def test_search_empty_query(self):
        provider = FoursquarePlaceProvider(api_key="test_key_123")
        res = provider.search_places("   ")
        assert res.total_matches == 0
        assert len(res.results) == 0

    def test_missing_api_key_raises_auth_error(self):
        provider = FoursquarePlaceProvider(api_key=None)
        with pytest.raises(ProviderAuthError):
            provider.search_places("Delhi")

    @patch("requests.get")
    def test_foursquare_401_unauthorized(self, mock_get):
        mock_get.return_value = make_mock_response(401, {"message": "Invalid API key"})
        provider = FoursquarePlaceProvider(api_key="bad_key")
        with pytest.raises(ProviderAuthError):
            provider.search_places("Delhi")

    @patch("requests.get")
    def test_foursquare_429_rate_limited(self, mock_get):
        mock_get.return_value = make_mock_response(429, {"message": "Rate limit exceeded"})
        provider = FoursquarePlaceProvider(api_key="test_key")
        with pytest.raises(ProviderRateLimitError):
            provider.search_places("Mumbai")

    @patch("requests.get")
    def test_foursquare_500_unavailable(self, mock_get):
        mock_get.return_value = make_mock_response(500, text="Internal Server Error")
        provider = FoursquarePlaceProvider(api_key="test_key")
        with pytest.raises(ProviderUnavailableError):
            provider.search_places("Pune")

    @patch("requests.get")
    def test_foursquare_malformed_json(self, mock_get):
        mock = MagicMock()
        mock.status_code = 200
        mock.json.side_effect = ValueError("Invalid JSON")
        mock.text = "<html>Not JSON</html>"
        mock_get.return_value = mock

        provider = FoursquarePlaceProvider(api_key="test_key")
        with pytest.raises(ProviderMalformedResponseError):
            provider.search_places("Goa")

    @patch("requests.get")
    def test_foursquare_skips_items_missing_coordinates(self, mock_get):
        response_data = {
            "results": [
                {
                    "fsq_place_id": "valid_1",
                    "name": "Valid Place",
                    "latitude": 19.0760,
                    "longitude": 72.8777
                },
                {
                    "fsq_place_id": "invalid_no_coords",
                    "name": "Missing Coords Place"
                }
            ]
        }
        mock_get.return_value = make_mock_response(200, response_data)
        provider = FoursquarePlaceProvider(api_key="test_key")
        res = provider.search_places("Mumbai")
        assert res.total_matches == 1
        assert res.results[0].provider_place_id == "valid_1"


class TestTransitlandProvider:
    @patch("requests.get")
    def test_transitland_headers_and_success(self, mock_get):
        mock_get.return_value = make_mock_response(
            200,
            {"operators": [{"onestop_id": "o-tt-ir", "name": "Indian Railways"}]}
        )
        provider = TransitlandProvider(api_key="test_transitland_key")
        data = provider.fetch_sample_operators(limit=1)
        assert len(data["operators"]) == 1

        mock_get.assert_called_once()
        headers = mock_get.call_args[1].get("headers", {})
        assert headers.get("apikey") == "test_transitland_key"

    @patch("requests.get")
    def test_transitland_401_unauthorized(self, mock_get):
        mock_get.return_value = make_mock_response(401, text="Unauthorized")
        provider = TransitlandProvider(api_key="bad_key")
        with pytest.raises(ProviderAuthError):
            provider.fetch_sample_operators()

    @patch("requests.get")
    def test_transitland_health_check(self, mock_get):
        mock_get.return_value = make_mock_response(200, {"operators": [{"onestop_id": "o-1"}]})
        provider = TransitlandProvider(api_key="valid_key")
        health = provider.check_health()
        assert health.status == ProviderHealthStatus.READY
        assert health.public_consumer_enabled is False


class TestDuffelAndHotelbedsSandboxStatus:
    @patch("requests.get")
    def test_duffel_strictly_sandbox_only(self, mock_get):
        mock_get.return_value = make_mock_response(200, {"data": [{"name": "Air India"}]})
        provider = DuffelFlightProvider(access_token="duffel_test_token")
        health = provider.check_health()
        assert health.status == ProviderHealthStatus.SANDBOX_ONLY
        assert health.environment == "TEST"
        assert health.public_consumer_enabled is False

    @patch("requests.get")
    def test_hotelbeds_strictly_evaluation_and_cached(self, mock_get):
        mock_get.return_value = make_mock_response(200, {"status": "OK"})
        provider = HotelbedsProvider(api_key="test_key", secret="test_sec")
        health1 = provider.check_health()
        assert health1.status == ProviderHealthStatus.EVALUATION
        assert health1.environment == "EVALUATION"
        assert health1.public_consumer_enabled is False

        # Second call should be served from memory cache without new HTTP request
        health2 = provider.check_health()
        assert health2.status == ProviderHealthStatus.EVALUATION
        assert mock_get.call_count == 1  # Only 1 request made, quota saved!


class TestProviderRegistry:
    def test_registry_summary_structure(self):
        with patch.object(FoursquarePlaceProvider, "check_health") as fsq_mock, \
             patch.object(TransitlandProvider, "check_health") as tl_mock, \
             patch.object(DuffelFlightProvider, "check_health") as df_mock, \
             patch.object(HotelbedsProvider, "check_health") as hb_mock:

            from app.schemas.providers import ProviderHealth
            fsq_mock.return_value = ProviderHealth(
                provider="FOURSQUARE", status=ProviderHealthStatus.READY,
                environment="PRODUCTION", public_consumer_enabled=True, message="OK"
            )
            tl_mock.return_value = ProviderHealth(
                provider="TRANSITLAND", status=ProviderHealthStatus.READY,
                environment="PRODUCTION", public_consumer_enabled=False, message="OK"
            )
            df_mock.return_value = ProviderHealth(
                provider="DUFFEL", status=ProviderHealthStatus.SANDBOX_ONLY,
                environment="TEST", public_consumer_enabled=False, message="OK"
            )
            hb_mock.return_value = ProviderHealth(
                provider="HOTELBEDS", status=ProviderHealthStatus.EVALUATION,
                environment="EVALUATION", public_consumer_enabled=False, message="OK"
            )

            registry = ProviderRegistry()
            summary = registry.get_health_summary()
            assert "FOURSQUARE" in summary
            assert "TRANSITLAND" in summary
            assert "DUFFEL" in summary
            assert "HOTELBEDS" in summary
            assert summary["FOURSQUARE"].public_consumer_enabled is True
            assert summary["DUFFEL"].public_consumer_enabled is False
            assert summary["HOTELBEDS"].public_consumer_enabled is False
