import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "anubhav@example.com", "password": "Password123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "anubhav@example.com"


def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "anubhav@example.com", "password": "WrongPassword!"}
    )
    assert response.status_code == 401


def test_register_and_profile():
    import uuid
    random_email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": random_email, "password": "Password123!"}
    )
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    token = reg_data["access_token"]

    # Test GET /me
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == random_email


def test_admin_access():
    # Login admin
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@navix.com", "password": "AdminPassword123!"}
    )
    assert login_resp.status_code == 200
    admin_token = login_resp.json()["access_token"]

    # Fetch admin nodes
    nodes_resp = client.get(
        "/api/v1/admin/nodes",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert nodes_resp.status_code == 200
    assert len(nodes_resp.json()) >= 9
