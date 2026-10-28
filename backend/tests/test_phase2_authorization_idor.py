import os
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.user import User
from app.models.traveler import Traveler
from app.models.trip import Trip
from app.models.budget_allocation import BudgetAllocation
from app.models.analytics import AnalyticsEvent
from app.core.security import hash_password, create_access_token
from app.core.config import settings

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_auth_users():
    """Setup User A (Traveler), User B (Traveler), and Admin."""
    db = SessionLocal()
    user_a_id = f"usr_test_a_{uuid.uuid4().hex[:6]}"
    user_b_id = f"usr_test_b_{uuid.uuid4().hex[:6]}"
    admin_id = f"usr_test_admin_{uuid.uuid4().hex[:6]}"

    user_a = User(
        user_id=user_a_id,
        name="Traveler Alpha",
        email=f"alpha_{uuid.uuid4().hex[:4]}@navix.test",
        role="traveler",
        password_hash=hash_password("NavixTestPassword2026!")
    )
    user_b = User(
        user_id=user_b_id,
        name="Traveler Beta",
        email=f"beta_{uuid.uuid4().hex[:4]}@navix.test",
        role="traveler",
        password_hash=hash_password("NavixTestPassword2026!")
    )
    admin_user = User(
        user_id=admin_id,
        name="Admin Ops",
        email=f"admin_{uuid.uuid4().hex[:4]}@navix.test",
        role="admin",
        password_hash=hash_password("NavixTestAdmin2026!SecureKey")
    )
    db.add_all([user_a, user_b, admin_user])
    db.flush()

    traveler_a = Traveler(traveler_id=user_a_id)
    traveler_b = Traveler(traveler_id=user_b_id)
    db.add_all([traveler_a, traveler_b])
    db.commit()

    token_a = create_access_token({"sub": user_a.user_id, "role": "traveler"})
    token_b = create_access_token({"sub": user_b.user_id, "role": "traveler"})
    token_admin = create_access_token({"sub": admin_user.user_id, "role": "admin"})

    db.close()

    yield {
        "user_a_id": user_a_id,
        "token_a": token_a,
        "user_b_id": user_b_id,
        "token_b": token_b,
        "admin_id": admin_id,
        "token_admin": token_admin,
    }

    # Teardown
    db = SessionLocal()
    db.query(Trip).filter(Trip.traveler_id.in_([user_a_id, user_b_id])).delete(synchronize_session=False)
    db.query(Traveler).filter(Traveler.traveler_id.in_([user_a_id, user_b_id])).delete(synchronize_session=False)
    db.query(User).filter(User.user_id.in_([user_a_id, user_b_id, admin_id])).delete(synchronize_session=False)
    db.commit()
    db.close()


class TestIdorAndOwnershipSecurity:
    """Verifies that user-owned resources cannot be accessed or mutated across users."""

    def test_idor_trip_isolation(self, setup_auth_users):
        ctx = setup_auth_users
        token_a = ctx["token_a"]
        token_b = ctx["token_b"]
        token_admin = ctx["token_admin"]
        user_a_id = ctx["user_a_id"]

        # 1. Generate real trip plan and save it for User A via API
        from datetime import date
        from decimal import Decimal
        from app.schemas.trip_planner import TripPlanRequest
        from app.services.trip_planner_service import generate_complete_trip_plan

        db = SessionLocal()
        req = TripPlanRequest(
            origin="Sangli",
            destination="Goa",
            departure_date=date(2026, 11, 1),
            return_date=date(2026, 11, 3),
            travellers=1,
            maximum_budget=Decimal("15000.00")
        )
        plan_res = generate_complete_trip_plan(db, req)
        db.close()

        save_resp = client.post(
            "/api/v1/trips/saved",
            json={"plan": plan_res.model_dump(mode="json")},
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert save_resp.status_code == 200, save_resp.text
        trip_a_id = save_resp.json()["trip_id"]

        # 2. User A can retrieve their own trip
        resp_a = client.get(
            f"/api/v1/trips/saved/{trip_a_id}",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp_a.status_code == 200, resp_a.text
        assert resp_a.json()["trip_id"] == trip_a_id

        # 3. User B attempts to GET User A's trip -> MUST be 403 Forbidden
        resp_b_get = client.get(
            f"/api/v1/trips/saved/{trip_a_id}",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        assert resp_b_get.status_code == 403, "User B must not be able to read User A's trip"
        assert resp_b_get.json()["detail"]["code"] == "FORBIDDEN"

        # 4. User B attempts to DELETE User A's trip -> MUST be 403 Forbidden
        resp_b_delete = client.delete(
            f"/api/v1/trips/saved/{trip_a_id}",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        assert resp_b_delete.status_code == 403, "User B must not be able to delete User A's trip"

        # 5. User B lists trips -> Trip A must NOT appear
        resp_b_list = client.get(
            "/api/v1/trips/saved",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        assert resp_b_list.status_code == 200
        trip_ids_for_b = [t["trip_id"] for t in resp_b_list.json()]
        assert trip_a_id not in trip_ids_for_b

        # 6. Admin CAN inspect the trip
        resp_admin = client.get(
            f"/api/v1/trips/saved/{trip_a_id}",
            headers={"Authorization": f"Bearer {token_admin}"}
        )
        assert resp_admin.status_code == 200

        # 7. User A deletes their own trip -> 200 OK
        resp_a_delete = client.delete(
            f"/api/v1/trips/saved/{trip_a_id}",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert resp_a_delete.status_code == 200


class TestRoleBasedAccessControl:
    """Verifies Guest vs Traveler vs Admin boundary enforcement."""

    def test_guest_forbidden_from_protected_endpoints(self):
        # Saved trips require authentication
        assert client.get("/api/v1/trips/saved").status_code == 401
        assert client.get("/api/v1/trips/saved/trp_nonexistent").status_code == 401
        assert client.delete("/api/v1/trips/saved/trp_nonexistent").status_code == 401
        # Auth profile requires authentication
        assert client.get("/api/v1/auth/me").status_code == 401
        # Admin endpoints require authentication
        assert client.get("/api/v1/admin/users").status_code == 401
        assert client.get("/api/v1/admin/analytics").status_code == 401

    def test_traveler_forbidden_from_admin_endpoints(self, setup_auth_users):
        token_a = setup_auth_users["token_a"]
        headers = {"Authorization": f"Bearer {token_a}"}

        # Traveler attempting admin operations
        assert client.get("/api/v1/admin/users", headers=headers).status_code == 403
        assert client.get("/api/v1/admin/schedules", headers=headers).status_code == 403
        assert client.get("/api/v1/admin/nodes", headers=headers).status_code == 403
        assert client.get("/api/v1/admin/trips", headers=headers).status_code == 403
        assert client.get("/api/v1/admin/password-resets", headers=headers).status_code == 403
        assert client.get("/api/v1/admin/analytics", headers=headers).status_code == 403
        assert client.post("/api/v1/admin/password-resets/pwr_dummy/approve", headers=headers).status_code == 403
        assert client.post("/api/v1/admin/password-resets/pwr_dummy/reject", headers=headers).status_code == 403

    def test_admin_allowed_on_admin_endpoints(self, setup_auth_users):
        token_admin = setup_auth_users["token_admin"]
        headers = {"Authorization": f"Bearer {token_admin}"}

        resp_analytics = client.get("/api/v1/admin/analytics", headers=headers)
        assert resp_analytics.status_code == 200
        data = resp_analytics.json()
        assert "total_planner_starts" in data
        assert "planner_completion_rate" in data
        assert "popular_destinations" in data


class TestDevEndpointsEnvironmentGuard:
    """Verifies that developer inspection/mutation endpoints are protected and forbidden in production."""

    def test_dev_mutations_require_admin(self, setup_auth_users):
        token_traveler = setup_auth_users["token_a"]
        # Traveler cannot call media-catalog/export or approve
        assert client.post(
            "/api/v1/dev/media-catalog/approve",
            json={"entity_id": "test", "status": "approved"},
            headers={"Authorization": f"Bearer {token_traveler}"}
        ).status_code == 403

        assert client.post(
            "/api/v1/dev/media-catalog/export",
            headers={"Authorization": f"Bearer {token_traveler}"}
        ).status_code == 403

    def test_dev_endpoints_forbidden_in_production(self, monkeypatch):
        # Simulate PRODUCTION environment
        monkeypatch.setattr(settings, "APP_ENV", "PRODUCTION")

        resp_summary = client.get("/api/v1/dev/db-summary")
        assert resp_summary.status_code == 403
        assert resp_summary.json()["detail"]["code"] == "DEV_ENDPOINTS_DISABLED"

        resp_cat = client.get("/api/v1/dev/media-catalog")
        assert resp_cat.status_code == 403

        resp_audit = client.get("/api/v1/dev/media-audit")
        assert resp_audit.status_code == 403


class TestSecurityHeadersAndPayloadBounds:
    """Verifies response security headers, request ID propagation, and payload bounds."""

    def test_security_headers_present(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        # Correlation header
        assert "X-Request-ID" in resp.headers
        assert resp.headers["X-Request-ID"].startswith("req_")
        # Standard security headers
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "DENY"
        assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"

    def test_custom_request_id_propagated(self):
        custom_id = "test-custom-trace-uuid-12345"
        resp = client.get("/health", headers={"X-Request-ID": custom_id})
        assert resp.status_code == 200
        assert resp.headers.get("X-Request-ID") == custom_id

    def test_oversized_payload_rejected(self):
        # Attempt to post a payload with Content-Length > 5MB
        oversized_headers = {"Content-Length": str(6 * 1024 * 1024)}
        resp = client.post("/api/v1/routes/search", content=b"x" * 10, headers=oversized_headers)
        assert resp.status_code == 413
        assert "exceeds maximum allowed limit" in resp.json()["detail"]


class TestPrivacySafeAnalytics:
    """Verifies first-party analytics validation, PII filtering, and error ingestion."""

    def test_valid_analytics_event_ingestion(self):
        payload = {
            "event_type": "PAGE_VIEW",
            "route": "/explore",
            "anonymous_session_id": "anon_session_test_12345678",
            "metadata": {
                "category": "Mountains",
                "page": 1
            }
        }
        resp = client.post("/api/v1/analytics/events", json=payload)
        assert resp.status_code == 201
        assert resp.json()["status"] == "ok"
        assert resp.json()["event_id"].startswith("evt_")

    def test_invalid_event_type_rejected(self):
        payload = {
            "event_type": "ARBITRARY_INJECTION_EVENT",
            "anonymous_session_id": "anon_session_test_12345678"
        }
        resp = client.post("/api/v1/analytics/events", json=payload)
        assert resp.status_code == 422

    def test_sensitive_metadata_keys_scrubbed(self):
        payload = {
            "event_type": "DESTINATION_VIEW",
            "route": "/destinations/manali",
            "anonymous_session_id": "anon_session_test_12345678",
            "metadata": {
                "destination": "Manali",
                "password": "SecretPassword123!",
                "token": "sensitive_jwt_token_here",
                "user_id": "usr_should_not_be_here"
            }
        }
        resp = client.post("/api/v1/analytics/events", json=payload)
        assert resp.status_code == 201

        # Check DB to confirm sensitive keys were scrubbed before write
        db = SessionLocal()
        event = db.query(AnalyticsEvent).filter(AnalyticsEvent.id == resp.json()["event_id"]).first()
        assert event is not None
        assert "password" not in event.safe_metadata
        assert "token" not in event.safe_metadata
        assert event.safe_metadata.get("destination") == "Manali"
        db.delete(event)
        db.commit()
        db.close()

    def test_client_error_reporting(self):
        payload = {
            "message": "Leaflet map layer failed to load tile",
            "route": "/plan",
            "component_name": "TripMapLeaflet",
            "request_id": "req_sample_12345"
        }
        resp = client.post("/api/v1/analytics/errors", json=payload)
        assert resp.status_code == 201
        assert resp.json()["status"] == "ok"
