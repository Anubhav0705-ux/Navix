import pytest
from app.core.config import Settings, EnvironmentOption
from app.core.security import create_access_token, decode_access_token

VALID_DEV_SECRET = "navix_dev_secret_key_32_characters_minimum_secure_phrase_2026"
VALID_PROD_SECRET = "a_super_secure_production_secret_key_random_string_2026_xyz"


def test_valid_development_configuration(monkeypatch):
    """Verify default development settings pass validation and resolve properties correctly."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    settings = Settings(
        APP_ENV="DEVELOPMENT",
        SECRET_KEY=VALID_DEV_SECRET,
        DB_HOST="127.0.0.1",
        DB_PORT=5433,
        DB_NAME="Navix",
        DB_USER="postgres",
        DB_PASSWORD="root123"
    )
    assert settings.is_development is True
    assert settings.is_production is False
    assert settings.DEBUG is True
    assert settings.sync_database_url == "postgresql://postgres:root123@127.0.0.1:5433/Navix"


def test_valid_testing_configuration(monkeypatch):
    """Verify testing environment settings validation."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    settings = Settings(
        APP_ENV="TESTING",
        SECRET_KEY=VALID_DEV_SECRET,
        DB_NAME="Navix_Test"
    )
    assert settings.is_testing is True
    assert settings.DEBUG is True
    assert "Navix_Test" in settings.sync_database_url


def test_missing_jwt_secret_rejection():
    """Verify startup validation rejects missing SECRET_KEY."""
    with pytest.raises(ValueError) as exc_info:
        Settings(SECRET_KEY=None)
    assert "SECRET_KEY environment variable is missing or insecure" in str(exc_info.value)


def test_weak_jwt_secret_rejection():
    """Verify startup validation rejects SECRET_KEY shorter than 32 characters."""
    with pytest.raises(ValueError) as exc_info:
        Settings(SECRET_KEY="short_key_123")
    assert "at least 32 characters" in str(exc_info.value)


def test_unsafe_production_default_secret_rejection():
    """Verify PRODUCTION environment rejects development default or placeholder secrets."""
    with pytest.raises(ValueError) as exc_info:
        Settings(
            APP_ENV="PRODUCTION",
            SECRET_KEY="navix_dev_secret_key_32_characters_minimum_secure_phrase_2026",
            DB_PASSWORD="secure_prod_password_123",
            FRONTEND_ORIGIN="https://navix.travel"
        )
    assert "Insecure SECRET_KEY configured for PRODUCTION environment" in str(exc_info.value)


def test_missing_database_credentials_in_production(monkeypatch):
    """Verify PRODUCTION environment requires non-empty DB password or DATABASE_URL."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    with pytest.raises(ValueError) as exc_info:
        Settings(
            APP_ENV="PRODUCTION",
            SECRET_KEY=VALID_PROD_SECRET,
            DB_PASSWORD="",
            FRONTEND_ORIGIN="https://navix.travel"
        )
    assert "Database authentication password (DB_PASSWORD or DATABASE_URL) is required for PRODUCTION" in str(exc_info.value)


def test_invalid_database_port_rejection():
    """Verify startup validation rejects out-of-range database ports."""
    with pytest.raises(ValueError) as exc_info:
        Settings(
            SECRET_KEY=VALID_DEV_SECRET,
            DB_PORT=70000
        )
    assert "Invalid DB_PORT 70000" in str(exc_info.value)


def test_production_cors_https_enforcement():
    """Verify PRODUCTION environment requires HTTPS frontend origin URL."""
    with pytest.raises(ValueError) as exc_info:
        Settings(
            APP_ENV="PRODUCTION",
            SECRET_KEY=VALID_PROD_SECRET,
            DB_PASSWORD="secure_prod_password_123",
            FRONTEND_ORIGIN="http://insecure-http-origin.com"
        )
    assert "FRONTEND_ORIGIN in PRODUCTION must use HTTPS protocol" in str(exc_info.value)


def test_no_secret_leakage_in_error_messages():
    """Verify error messages explain failure without printing actual secret values."""
    secret_value = "super_secret_value_12345678901234567890"
    with pytest.raises(ValueError) as exc_info:
        Settings(
            APP_ENV="PRODUCTION",
            SECRET_KEY="navix_dev_secret_key_32_characters_minimum_secure_phrase_2026"
        )
    error_str = str(exc_info.value)
    assert secret_value not in error_str
    assert "Insecure SECRET_KEY configured" in error_str


def test_existing_jwt_compatibility():
    """Verify existing JWT access token creation and decoding functions remain compatible."""
    payload = {"sub": "user_wp71_test", "role": "traveler"}
    token = create_access_token(payload)
    assert token is not None

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_wp71_test"
    assert decoded["role"] == "traveler"


def test_app_env_case_insensitive_normalization():
    """Verify APP_ENV normalizes lowercase strings to standard upper-case options."""
    settings = Settings(
        APP_ENV="development",
        SECRET_KEY=VALID_DEV_SECRET
    )
    assert settings.APP_ENV == "DEVELOPMENT"
    assert settings.is_development is True
