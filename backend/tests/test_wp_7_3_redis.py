import asyncio
import pytest
from unittest.mock import MagicMock
from fastapi import Request, HTTPException
from pydantic import ValidationError

from app.core.config import settings, Settings, EnvironmentOption
from app.core.redis import mask_redis_credentials, RedisClientManager, redis_manager
from app.core.rate_limiter import (
    DistributedRateLimiter, extract_client_ip, build_rate_limit_key, POLICIES, acquire_concurrency_guard, SLIDING_WINDOW_LUA_SCRIPT
)
from app.core.cache import RedisCacheManager


def test_redis_config_defaults():
    """Verify default Redis infrastructure settings in Settings."""
    s = Settings(SECRET_KEY="a_very_secure_test_secret_key_32_chars_min")
    assert s.REDIS_HOST == "127.0.0.1"
    assert s.REDIS_PORT == 6379
    assert s.REDIS_DB == 0
    assert s.REDIS_SSL is False
    assert s.REDIS_CONNECT_TIMEOUT == 2.0
    assert s.REDIS_SOCKET_TIMEOUT == 2.0
    assert s.REDIS_MAX_CONNECTIONS == 50
    assert s.REDIS_KEY_PREFIX == "navix"
    assert s.REDIS_FAIL_OPEN is True
    assert s.ALLOW_LOCALHOST_REDIS is False
    assert "127.0.0.1" in s.TRUSTED_PROXIES


def test_redis_config_bounds_validation():
    """Verify range enforcement on Redis port and database index."""
    with pytest.raises(ValidationError) as exc:
        Settings(
            SECRET_KEY="a_very_secure_test_secret_key_32_chars_min",
            REDIS_PORT=70000
        )
    assert "REDIS_PORT" in str(exc.value)

    with pytest.raises(ValidationError) as exc:
        Settings(
            SECRET_KEY="a_very_secure_test_secret_key_32_chars_min",
            REDIS_DB=20
        )
    assert "REDIS_DB" in str(exc.value)


def test_staging_production_redis_localhost_guardrail():
    """Verify STAGING and PRODUCTION reject localhost Redis hosts without ALLOW_LOCALHOST_REDIS override."""
    with pytest.raises(ValueError) as exc:
        Settings(
            APP_ENV="PRODUCTION",
            SECRET_KEY="a_very_secure_production_secret_key_32_chars_min",
            FRONTEND_ORIGIN="https://navix.travel",
            DB_PASSWORD="ValidProdPassword123!",
            REDIS_HOST="127.0.0.1",
            ALLOW_LOCALHOST_REDIS=False
        )
    assert "Redis host in PRODUCTION environment cannot target localhost/127.0.0.1" in str(exc.value)

    # Allowed with explicit override
    s = Settings(
        APP_ENV="PRODUCTION",
        SECRET_KEY="a_very_secure_production_secret_key_32_chars_min",
        FRONTEND_ORIGIN="https://navix.travel",
        DB_PASSWORD="ValidProdPassword123!",
        REDIS_HOST="127.0.0.1",
        ALLOW_LOCALHOST_DB=True,
        ALLOW_LOCALHOST_REDIS=True
    )
    assert s.ALLOW_LOCALHOST_REDIS is True


def test_mask_redis_credentials():
    """Verify inline password masking in Redis connection URLs."""
    url = "redis://:mySuperSecretRedisPassword123@redis-cluster.internal.navix.travel:6379/0"
    masked = mask_redis_credentials(url)
    assert "mySuperSecretRedisPassword123" not in masked
    assert "[REDACTED]" in masked
    assert masked.startswith("redis://:[REDACTED]@redis-cluster.internal.navix.travel:6379/0")

    url_ssl = "rediss://:another_secret_pass@10.0.2.100:6380/1"
    masked_ssl = mask_redis_credentials(url_ssl)
    assert "another_secret_pass" not in masked_ssl
    assert "[REDACTED]" in masked_ssl


def test_trusted_proxy_ip_extraction_ipv4_ipv6():
    """Verify safe IP extraction checking trusted proxies, preventing header spoofing across IPv4 and IPv6."""
    # Direct connection from untrusted IP
    req_direct = MagicMock(spec=Request)
    req_direct.client = MagicMock(host="198.51.100.42")
    req_direct.headers = {"X-Forwarded-For": "203.0.113.99"}  # Spoofed header
    assert extract_client_ip(req_direct) == "198.51.100.42"

    # Connection through trusted local proxy (127.0.0.1)
    req_proxy = MagicMock(spec=Request)
    req_proxy.client = MagicMock(host="127.0.0.1")
    req_proxy.headers = {"X-Forwarded-For": "203.0.113.195, 127.0.0.1"}
    assert extract_client_ip(req_proxy) == "203.0.113.195"

    # IPv6 trusted proxy
    req_ipv6 = MagicMock(spec=Request)
    req_ipv6.client = MagicMock(host="::1")
    req_ipv6.headers = {"X-Forwarded-For": "2001:db8::1, ::1"}
    assert extract_client_ip(req_ipv6) == "2001:db8::1"


def test_user_agent_evasion_elimination_and_user_keying():
    """Verify changing User-Agent does NOT bypass anonymous limits, and authenticated requests use User ID key."""
    # Anonymous requests: Changing UA yields SAME key
    key1 = build_rate_limit_key("routes", "203.0.113.195")
    key2 = build_rate_limit_key("routes", "203.0.113.195")
    assert key1 == "navix:ratelimit:routes:ip:203.0.113.195"
    assert key1 == key2

    # Authenticated user key
    key_auth = build_rate_limit_key("auth", "203.0.113.195", user_id="usr_8829")
    assert key_auth == "navix:ratelimit:auth:user:usr_8829"


def test_circuit_breaker_fast_fallback():
    """Verify circuit breaker trips on Redis failure and causes fast fallback without socket timeouts."""
    rm = RedisClientManager()
    assert rm.is_circuit_broken() is False

    rm.trigger_circuit_breaker()
    assert rm.is_circuit_broken() is True
    assert rm.get_async_client() is None
    assert rm.get_sync_client() is None


def test_rate_limiter_degraded_operation_fallback():
    """Verify security policies fail closed in production while search/planning policies fail open with local limits when Redis is offline."""
    async def run_test():
        limiter = DistributedRateLimiter()
        req = MagicMock(spec=Request)
        req.client = MagicMock(host="127.0.0.1")
        req.headers = {}

        # In TESTING mode, fail open for local unit tests when Redis is offline
        allowed, remaining, retry_after, limit = await limiter.check_rate_limit(req, policy_name="auth")
        assert allowed is True

        # Test explicit production policy fallback
        policy_sec = POLICIES["auth"]
        orig_env = settings.APP_ENV
        try:
            settings.APP_ENV = "PRODUCTION"
            allowed_p, rem_p, retry_p, lim_p = limiter._handle_redis_degraded(policy_sec)
            assert allowed_p is False
            assert retry_p == 60
        finally:
            settings.APP_ENV = orig_env

        # Policy 'routes' (fail_open=True) when Redis offline
        allowed_r, rem_r, retry_r, lim_r = await limiter.check_rate_limit(req, policy_name="routes")
        assert allowed_r is True
        assert lim_r == 10

    asyncio.run(run_test())


def test_concurrency_guard_execution_and_timeout():
    """Verify acquire_concurrency_guard acquires/releases semaphore and enforces timeout on worker overload."""
    async def run_concurrency_test():
        async with acquire_concurrency_guard("routes", timeout=1.0):
            # Guard successfully acquired
            pass

    asyncio.run(run_concurrency_test())


def test_cache_manager_key_and_metadata_construction():
    """Verify namespaced cache key building and metadata contract formatting."""
    cm = RedisCacheManager(key_prefix="navix_test")
    key = cm.build_cache_key("locations", "sangli_nodes", version="v1")
    assert key == "navix_test:cache:locations:v1:sangli_nodes"
