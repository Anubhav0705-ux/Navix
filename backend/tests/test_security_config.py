import pytest
from app.core.config import Settings
from app.core.security import create_access_token, decode_access_token


def test_missing_secret_key_raises_error():
    """Verify missing SECRET_KEY raises ValueError at startup/validation."""
    with pytest.raises(ValueError) as exc_info:
        Settings(SECRET_KEY=None)
    assert "SECRET_KEY environment variable is missing or insecure" in str(exc_info.value)


def test_short_secret_key_raises_error():
    """Verify short SECRET_KEY (<32 chars) raises ValueError."""
    with pytest.raises(ValueError) as exc_info:
        Settings(SECRET_KEY="short_insecure_key_123")
    assert "at least 32 characters" in str(exc_info.value)


def test_valid_secret_key_accepts():
    """Verify valid SECRET_KEY (>=32 chars) passes validation."""
    valid_key = "a_very_strong_secure_key_that_is_at_least_32_characters_long"
    config = Settings(SECRET_KEY=valid_key)
    assert config.SECRET_KEY == valid_key


def test_jwt_token_generation_and_decoding():
    """Verify access token creation and decoding with valid secret key."""
    payload = {"sub": "user_test_123", "role": "traveler"}
    token = create_access_token(payload)
    assert token is not None

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_test_123"
    assert decoded["role"] == "traveler"
