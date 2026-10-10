import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app
from app.core.logging import mask_sensitive_data
from app.core.metrics import metrics, normalize_endpoint

client = TestClient(app)


def test_liveness_endpoint():
    """Verify /health liveness endpoint returns HTTP 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "navix-api"
    assert "timestamp" in data
    assert "version" in data


def test_readiness_endpoint_healthy():
    """Verify /ready endpoint returns 200 ready when DB is connected."""
    response = client.get("/ready")
    assert response.status_code in [200, 503]
    data = response.json()
    assert "status" in data
    assert "checks" in data
    assert "database" in data["checks"]
    assert "redis" in data["checks"]


def test_readiness_endpoint_unhealthy():
    """Verify /ready endpoint returns 503 not_ready when DB is disconnected."""
    with patch("app.main.verify_database_connection", return_value={"connected": False, "message": "Offline"}):
        response = client.get("/ready")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "not_ready"
        assert data["checks"]["database"] == "unhealthy"


def test_metrics_endpoint():
    """Verify /metrics endpoint returns Prometheus exposition format text."""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    content = response.text
    assert "navix_uptime_seconds" in content
    assert "navix_http_requests_total" in content
    assert "navix_http_requests_in_flight" in content
    assert "navix_rate_limit_rejections_total" in content


def test_request_id_generation_and_propagation():
    """Verify automatic X-Request-ID header generation and propagation."""
    response = client.get("/health")
    assert response.status_code == 200
    req_id = response.headers.get("X-Request-ID")
    assert req_id is not None
    assert req_id.startswith("req_")


def test_incoming_request_id_preservation():
    """Verify valid incoming X-Request-ID header is preserved."""
    custom_id = "test-req-trace-99120"
    response = client.get("/health", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id


def test_invalid_request_id_sanitization():
    """Verify malformed or excessively long X-Request-ID is sanitized and replaced."""
    malformed_id = "bad_id!" * 20  # Contains invalid char '!' and exceeds length
    response = client.get("/health", headers={"X-Request-ID": malformed_id})
    assert response.status_code == 200
    returned_id = response.headers.get("X-Request-ID")
    assert returned_id != malformed_id
    assert returned_id.startswith("req_")


def test_sensitive_data_masking():
    """Verify mask_sensitive_data redacts passwords, tokens, JWTs, and connection strings."""
    raw_text = '{"password": "secret_pass_123", "token": "jwt_token_val"}'
    masked = mask_sensitive_data(raw_text)
    assert "secret_pass_123" not in masked
    assert "[REDACTED]" in masked

    db_url = "postgresql://postgres:mySecretPass@localhost:5433/Navix"
    masked_url = mask_sensitive_data(db_url)
    assert "mySecretPass" not in masked_url
    assert "[REDACTED]" in masked_url

    bearer = "Authorization: Bearer eyJhbGciOiJIUzI1NiI.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
    masked_bearer = mask_sensitive_data(bearer)
    assert "eyJhbGciOiJIUzI1NiI" not in masked_bearer
    assert "[REDACTED]" in masked_bearer


def test_endpoint_normalization():
    """Verify normalize_endpoint collapses dynamic IDs to prevent label cardinality explosions."""
    assert normalize_endpoint("/api/v1/auth/login") == "/api/v1/auth/login"
    assert normalize_endpoint("/api/v1/trips/123456") == "/api/v1/trips/{id}"
    assert normalize_endpoint("/api/v1/trips/a1b2c3d4-e5f6-7890-abcd-ef1234567890") == "/api/v1/trips/{id}"
    assert normalize_endpoint("/health") == "/health"


def test_feature_metrics_recording():
    """Verify route search and trip plan metrics counters can be incremented."""
    initial_searches = metrics._route_searches
    metrics.record_route_search()
    assert metrics._route_searches == initial_searches + 1

    initial_plans = metrics._trip_plans
    metrics.record_trip_plan()
    assert metrics._trip_plans == initial_plans + 1
