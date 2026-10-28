import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User
from app.models.traveler import Traveler
from app.models.admin import Admin
from app.models.trip import Trip
from app.models.password_reset import PasswordResetRequest
from app.core.security import hash_password, create_access_token

client = TestClient(app)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_traveler(db_session: Session):
    email = "trav_recovery_test@navix.com"
    user = db_session.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            user_id="usr_test_rec_01",
            name="Recovery Test Traveler",
            email=email,
            role="traveler",
            password_hash=hash_password("InitialPassword123!")
        )
        db_session.add(user)
        traveler = Traveler(traveler_id=user.user_id)
        db_session.add(traveler)
        db_session.commit()
        db_session.refresh(user)
    else:
        user.password_hash = hash_password("InitialPassword123!")
        db_session.commit()
    yield user


@pytest.fixture
def test_admin(db_session: Session):
    email = "admin_recovery_test@navix.com"
    admin_user = db_session.query(User).filter(User.email == email).first()
    if not admin_user:
        admin_user = User(
            user_id="usr_test_adm_01",
            name="Recovery Test Admin",
            email=email,
            role="admin",
            password_hash=hash_password("AdminSecurePassword123!")
        )
        db_session.add(admin_user)
        admin_record = Admin(admin_id=admin_user.user_id, department="Security Operations")
        db_session.add(admin_record)
        db_session.commit()
        db_session.refresh(admin_user)
    yield admin_user


class TestAntiBotAndRegistration:
    def test_registration_honeypot_rejection(self):
        res = client.post("/api/v1/auth/register", json={
            "name": "Bot Traveler",
            "email": "bot@example.com",
            "password": "Password123!",
            "hp_field": "automated_bot_input"
        })
        assert res.status_code == 400
        assert res.json()["detail"]["code"] == "BOT_DETECTED"

    def test_login_honeypot_rejection(self):
        res = client.post("/api/v1/auth/login", json={
            "email": "demo@navix.com",
            "password": "DemoExplorer2026!",
            "hp_field": "automated_bot_input"
        })
        assert res.status_code == 400
        assert res.json()["detail"]["code"] == "BOT_DETECTED"

    def test_registration_weak_password_rejected(self):
        res = client.post("/api/v1/auth/register", json={
            "name": "Short Pass User",
            "email": "short_pw_test@example.com",
            "password": "short"
        })
        assert res.status_code == 422 or res.status_code == 400


class TestManualPasswordRecoveryWorkflow:
    def test_forgot_password_generic_response_non_existent(self):
        res = client.post("/api/v1/auth/forgot-password", json={
            "identifier": "completely_non_existent_account@example.com"
        })
        assert res.status_code == 200
        assert "submitted" in res.json()["message"].lower()

    def test_forgot_password_honeypot_silent_drop(self, db_session: Session):
        res = client.post("/api/v1/auth/forgot-password", json={
            "identifier": "demo@navix.com",
            "hp_field": "bot_crawler_probe"
        })
        assert res.status_code == 200
        assert "submitted" in res.json()["message"].lower()

    def test_end_to_end_manual_password_recovery(self, db_session: Session, test_traveler: User, test_admin: User):
        # 1. Clean existing reset requests for test user
        db_session.query(PasswordResetRequest).filter(PasswordResetRequest.user_id == test_traveler.user_id).delete()
        db_session.commit()

        # 2. Traveler submits forgot-password request
        req_res = client.post("/api/v1/auth/forgot-password", json={
            "identifier": test_traveler.email
        })
        assert req_res.status_code == 200

        # Verify record in DB
        reset_record = db_session.query(PasswordResetRequest).filter(
            PasswordResetRequest.user_id == test_traveler.user_id,
            PasswordResetRequest.status == "PENDING"
        ).first()
        assert reset_record is not None
        req_id = reset_record.request_id

        # 3. Unauthorized access to admin resets
        # Guest receives 401
        assert client.get("/api/v1/admin/password-resets").status_code == 401
        # Traveler receives 403
        traveler_token = create_access_token({"sub": test_traveler.user_id, "role": test_traveler.role})
        assert client.get(
            "/api/v1/admin/password-resets",
            headers={"Authorization": f"Bearer {traveler_token}"}
        ).status_code == 403

        # 4. Admin lists requests
        admin_token = create_access_token({"sub": test_admin.user_id, "role": test_admin.role})
        admin_list = client.get(
            "/api/v1/admin/password-resets",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert admin_list.status_code == 200
        items = admin_list.json()
        assert any(item["request_id"] == req_id for item in items)

        # 5. Admin approves reset request
        approve_res = client.post(
            f"/api/v1/admin/password-resets/{req_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert approve_res.status_code == 200
        appr_data = approve_res.json()
        temp_pw = appr_data["temporary_password"]
        assert temp_pw.startswith("NX-")

        # 6. Traveler logs in with temporary password
        login_res = client.post("/api/v1/auth/login", json={
            "email": test_traveler.email,
            "password": temp_pw
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["must_change_password"] is True
        temp_jwt = login_data["access_token"]

        # 7. Attempt to access regular protected endpoint with temporary token is blocked!
        blocked_res = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {temp_jwt}"}
        )
        assert blocked_res.status_code == 403
        assert blocked_res.json()["detail"]["code"] == "PASSWORD_CHANGE_REQUIRED"

        # 8. Set new permanent password
        new_pw = "BrandNewSecurePass2026!"
        set_res = client.post(
            "/api/v1/auth/set-new-password",
            headers={"Authorization": f"Bearer {temp_jwt}"},
            json={
                "new_password": new_pw,
                "confirm_password": new_pw
            }
        )
        assert set_res.status_code == 200
        set_data = set_res.json()
        assert set_data["must_change_password"] is False
        new_jwt = set_data["access_token"]

        # 9. Normal access is restored with new token
        me_res = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {new_jwt}"}
        )
        assert me_res.status_code == 200
        assert me_res.json()["email"] == test_traveler.email

        # 10. Temporary password cannot be reused
        reused_res = client.post("/api/v1/auth/login", json={
            "email": test_traveler.email,
            "password": temp_pw
        })
        assert reused_res.status_code == 401

        # 11. Old password cannot be used
        old_res = client.post("/api/v1/auth/login", json={
            "email": test_traveler.email,
            "password": "InitialPassword123!"
        })
        assert old_res.status_code == 401

        # 12. New password works for standard login
        final_login = client.post("/api/v1/auth/login", json={
            "email": test_traveler.email,
            "password": new_pw
        })
        assert final_login.status_code == 200
        assert final_login.json()["must_change_password"] is False


class TestChangePasswordAndAccountDeletion:
    def test_logged_in_password_change(self, test_traveler: User):
        token = create_access_token({"sub": test_traveler.user_id, "role": test_traveler.role})

        # Wrong current password fails
        res_wrong = client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": "WrongPassword123!",
                "new_password": "NewUpdatedPassword123!",
                "confirm_password": "NewUpdatedPassword123!"
            }
        )
        assert res_wrong.status_code == 400
        assert res_wrong.json()["detail"]["code"] == "INCORRECT_CURRENT_PASSWORD"

    def test_account_deletion_flow(self, db_session: Session):
        # Create a disposable user for deletion
        del_user_id = "usr_disposable_del_01"
        del_email = "disposable_user@navix.com"
        existing = db_session.query(User).filter(User.user_id == del_user_id).first()
        if existing:
            db_session.delete(existing)
            db_session.commit()

        user = User(
            user_id=del_user_id,
            name="Disposable User",
            email=del_email,
            role="traveler",
            password_hash=hash_password("DisposablePass123!")
        )
        db_session.add(user)
        db_session.add(Traveler(traveler_id=user.user_id))
        db_session.commit()

        token = create_access_token({"sub": user.user_id, "role": user.role})

        # 1. Invalid confirmation text
        res_bad_conf = client.post(
            "/api/v1/auth/delete-account",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "password": "DisposablePass123!",
                "confirmation_text": "no"
            }
        )
        assert res_bad_conf.status_code == 400

        # 2. Invalid password
        res_bad_pw = client.post(
            "/api/v1/auth/delete-account",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "password": "IncorrectPassword123!",
                "confirmation_text": "DELETE"
            }
        )
        assert res_bad_pw.status_code == 400

        # 3. Successful deletion
        res_ok = client.post(
            "/api/v1/auth/delete-account",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "password": "DisposablePass123!",
                "confirmation_text": "DELETE"
            }
        )
        assert res_ok.status_code == 200

        # Verify user is gone from database
        check_user = db_session.query(User).filter(User.user_id == del_user_id).first()
        assert check_user is None

        # 4. Token referencing deleted account must be rejected on protected endpoints
        res_deleted_token = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res_deleted_token.status_code == 401
        assert "no longer exists" in res_deleted_token.json()["detail"]
