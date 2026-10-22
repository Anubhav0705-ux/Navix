import os
import pytest
from pydantic import ValidationError
from app.core.config import Settings
from app.core.security import hash_password, verify_password
from app.database.session import SessionLocal
from app.models.user import User
from app.models.admin import Admin
from app.seed.seed_demo_data import seed_data, DEFAULT_ADMIN_ID


class TestDemoAdminBootstrapConfig:
    def test_demo_admin_password_loaded_from_env(self, monkeypatch):
        test_pw = "CustomSecureEnvPassword2026!X"
        monkeypatch.setenv("NAVIX_DEMO_ADMIN_PASSWORD", test_pw)
        s = Settings(
            APP_ENV="DEVELOPMENT",
            SECRET_KEY="x" * 32,
            NAVIX_DEMO_ADMIN_PASSWORD=test_pw
        )
        assert s.NAVIX_DEMO_ADMIN_PASSWORD == test_pw

    def test_staging_and_production_reject_demo_admin_password(self):
        # Staging must reject
        with pytest.raises(ValidationError) as exc_staging:
            Settings(
                APP_ENV="STAGING",
                SECRET_KEY="x" * 32,
                NAVIX_DEMO_ADMIN_PASSWORD="ValidCustomAdminPassword123!"
            )
        assert "NAVIX_DEMO_ADMIN_PASSWORD is not permitted in STAGING" in str(exc_staging.value)

        # Production must reject
        with pytest.raises(ValidationError) as exc_prod:
            Settings(
                APP_ENV="PRODUCTION",
                SECRET_KEY="x" * 32,
                FRONTEND_ORIGIN="https://navix.travel",
                DB_SSL_MODE="require",
                NAVIX_DEMO_ADMIN_PASSWORD="ValidCustomAdminPassword123!"
            )
        assert "NAVIX_DEMO_ADMIN_PASSWORD is not permitted in PRODUCTION" in str(exc_prod.value)

    @pytest.mark.parametrize("insecure_pw", [
        "admin",
        "admin123",
        "password",
        "password123",
        "123456",
        "navix",
        "navix123",
        "adminpassword123!",
        "navixadmin2026!",
        "short",
        "1234567"
    ])
    def test_unsafe_demo_admin_passwords_rejected(self, insecure_pw):
        with pytest.raises(ValidationError) as exc:
            Settings(
                APP_ENV="DEVELOPMENT",
                SECRET_KEY="x" * 32,
                NAVIX_DEMO_ADMIN_PASSWORD=insecure_pw
            )
        assert "Unsafe NAVIX_DEMO_ADMIN_PASSWORD rejected" in str(exc.value)

    def test_secret_password_never_logged(self):
        from app.core.logging import mask_sensitive_data
        secret_test_pw = "SuperSecretAdminPassword123!"
        log_str = f"System bootstrap: NAVIX_DEMO_ADMIN_PASSWORD={secret_test_pw}"
        masked = mask_sensitive_data(log_str)
        assert secret_test_pw not in masked
        assert "[REDACTED]" in masked


class TestDemoAdminBootstrapSeeding:
    def test_seed_data_hashes_and_synchronizes_demo_admin_password(self, monkeypatch):
        test_bootstrap_pw = "BootstrapTestAdmin2026!VerifiedKey"

        # Capture original hash for clean test isolation
        db_init = SessionLocal()
        orig_hash = None
        try:
            adm_init = db_init.query(User).filter(User.user_id == DEFAULT_ADMIN_ID).first()
            if adm_init:
                orig_hash = adm_init.password_hash
        finally:
            db_init.close()

        monkeypatch.setenv("NAVIX_DEMO_ADMIN_PASSWORD", test_bootstrap_pw)

        # Execute seed
        result = seed_data()
        assert "destinations" in result or isinstance(result, dict)

        # Verify database admin user credentials
        db = SessionLocal()
        try:
            admin_user = db.query(User).filter(User.user_id == DEFAULT_ADMIN_ID).first()
            assert admin_user is not None
            assert admin_user.role == "admin"
            assert verify_password(test_bootstrap_pw, admin_user.password_hash) is True
            # Old hardcoded passwords must not verify
            assert verify_password("AdminPassword123!", admin_user.password_hash) is False
            assert verify_password("NavixAdmin2026!", admin_user.password_hash) is False
        finally:
            if orig_hash:
                admin_user.password_hash = orig_hash
                db.commit()
            db.close()
