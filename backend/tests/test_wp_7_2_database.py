import pytest
from pydantic import ValidationError
from app.core.config import Settings, EnvironmentOption
from app.database.session import mask_database_credentials, verify_database_connection, engine


def test_database_config_default_pool_settings():
    """Verify default database pooling configuration parameters."""
    s = Settings(SECRET_KEY="a_very_secure_test_secret_key_32_chars_min")
    assert s.DB_POOL_SIZE == 10
    assert s.DB_MAX_OVERFLOW == 10
    assert s.DB_POOL_TIMEOUT == 30
    assert s.DB_POOL_RECYCLE == 1800
    assert s.DB_POOL_PRE_PING is True
    assert s.DB_SSL_MODE is None
    assert s.ALLOW_LOCALHOST_DB is False


def test_database_pool_settings_range_validation():
    """Verify bounds enforcement for connection pool parameters."""
    with pytest.raises(ValidationError) as exc:
        Settings(
            SECRET_KEY="a_very_secure_test_secret_key_32_chars_min",
            DB_POOL_SIZE=0
        )
    assert "DB_POOL_SIZE" in str(exc.value)

    with pytest.raises(ValidationError) as exc:
        Settings(
            SECRET_KEY="a_very_secure_test_secret_key_32_chars_min",
            DB_MAX_OVERFLOW=500
        )
    assert "DB_MAX_OVERFLOW" in str(exc.value)


def test_staging_production_localhost_guardrail():
    """Verify staging and production reject localhost DB hosts without explicit ALLOW_LOCALHOST_DB override."""
    with pytest.raises(ValueError) as exc:
        Settings(
            APP_ENV="PRODUCTION",
            SECRET_KEY="a_very_secure_production_secret_key_32_chars_min",
            FRONTEND_ORIGIN="https://navix.travel",
            DB_HOST="127.0.0.1",
            DB_PASSWORD="ValidProductionPassword123!",
            ALLOW_LOCALHOST_DB=False
        )
    assert "cannot target localhost/127.0.0.1" in str(exc.value)

    # With explicit ALLOW_LOCALHOST_DB=True override for testing
    s = Settings(
        APP_ENV="PRODUCTION",
        SECRET_KEY="a_very_secure_production_secret_key_32_chars_min",
        FRONTEND_ORIGIN="https://navix.travel",
        DB_HOST="127.0.0.1",
        DB_PASSWORD="ValidProductionPassword123!",
        ALLOW_LOCALHOST_DB=True
    )
    assert s.ALLOW_LOCALHOST_DB is True


def test_production_ssl_mode_default_and_validation():
    """Verify production defaults DB_SSL_MODE to require and validates valid modes."""
    s_prod = Settings(
        APP_ENV="PRODUCTION",
        SECRET_KEY="a_very_secure_production_secret_key_32_chars_min",
        FRONTEND_ORIGIN="https://navix.travel",
        DB_HOST="db.production.internal",
        DB_PASSWORD="ValidProductionPassword123!"
    )
    assert s_prod.DB_SSL_MODE == "require"
    assert "sslmode=require" in s_prod.sync_database_url

    with pytest.raises(ValueError) as exc:
        Settings(
            SECRET_KEY="a_very_secure_test_secret_key_32_chars_min",
            DB_SSL_MODE="insecure_mode"
        )
    assert "Invalid DB_SSL_MODE" in str(exc.value)


def test_testing_remote_database_guardrail():
    """Verify TESTING environment blocks accidental targeting of remote production databases."""
    with pytest.raises(ValueError) as exc:
        Settings(
            APP_ENV="TESTING",
            SECRET_KEY="a_very_secure_test_secret_key_32_chars_min",
            DATABASE_URL="postgresql://user:pass@production-db.rds.amazonaws.com:5432/Navix"
        )
    assert "cannot target remote production database hosts" in str(exc.value)


def test_database_url_scheme_validation():
    """Verify STAGING and PRODUCTION reject non-PostgreSQL connection schemes."""
    with pytest.raises(ValueError) as exc:
        Settings(
            APP_ENV="STAGING",
            SECRET_KEY="a_very_secure_staging_secret_key_32_chars_min",
            DATABASE_URL="sqlite:///temp.db",
            ALLOW_LOCALHOST_DB=True
        )
    assert "Only PostgreSQL connections are permitted" in str(exc.value)


def test_mask_database_credentials():
    """Verify credential masking strips inline passwords from database URLs and error strings."""
    url = "postgresql://postgres:mySecretPassword123@db.internal.navix.travel:5432/Navix"
    masked = mask_database_credentials(url)
    assert "mySecretPassword123" not in masked
    assert "[REDACTED]" in masked
    assert masked.startswith("postgresql://postgres:[REDACTED]@db.internal.navix.travel:5432/Navix")

    # Driver-specific scheme
    url_driver = "postgresql+psycopg2://admin:super_secret_p@ss@10.0.1.50:5433/NavixDB"
    masked_driver = mask_database_credentials(url_driver)
    assert "super_secret_p@ss" not in masked_driver
    assert "[REDACTED]" in masked_driver


def test_engine_pooling_configuration():
    """Verify live SQLAlchemy engine retains pool settings."""
    assert engine.pool.size() == 10
    assert engine.pool._max_overflow == 10
    assert engine.pool._recycle == 1800
    assert engine.pool._pre_ping is True


def test_live_database_connection_verification():
    """Verify read-only connection check behavior for database health endpoint in both online and offline contexts."""
    health = verify_database_connection()
    assert "connected" in health
    assert "message" in health
    if health["connected"]:
        assert health["user"] == "postgres"
        assert health["engine_driver"] == "psycopg2"
        assert health["pool_size"] == 10
    else:
        assert "Database connection error" in health["message"] or "credentials not configured" in health["message"]
