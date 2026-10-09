import time
import uuid
import logging
import asyncio
from typing import Optional, Tuple, Dict, Any
from dataclasses import dataclass
from contextlib import asynccontextmanager
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.redis import redis_manager

logger = logging.getLogger("navix.ratelimiter")

# Atomic Sliding Window Lua Script
# KEYS[1]: Rate limit Redis key
# ARGV[1]: Current UTC timestamp (float)
# ARGV[2]: Window duration in seconds (float)
# ARGV[3]: Maximum allowed requests (int)
# ARGV[4]: Unique request identifier member (string)
SLIDING_WINDOW_LUA_SCRIPT = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
local clear_before = now - window

-- Remove expired timestamp entries outside the sliding window
redis.call('ZREMRANGEBYSCORE', key, '-inf', clear_before)

-- Count active requests within current window
local current_count = redis.call('ZCARD', key)

if current_count < limit then
    -- Admit request: add current request timestamp and set window TTL
    redis.call('ZADD', key, now, member)
    redis.call('EXPIRE', key, math.ceil(window) + 1)
    local remaining = limit - (current_count + 1)
    return {1, remaining, 0, limit}
else
    -- Reject request: find oldest request timestamp to calculate accurate Retry-After
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retry_after = math.ceil(window)
    if #oldest >= 2 then
        local oldest_ts = tonumber(oldest[2])
        retry_after = math.max(1, math.ceil(oldest_ts + window - now))
    end
    return {0, 0, retry_after, limit}
end
"""


@dataclass
class RateLimitPolicy:
    name: str
    max_requests: int
    window_seconds: int
    fail_open: bool = True
    local_concurrency_limit: Optional[int] = None


# Configurable endpoint rate limit policies
POLICIES: Dict[str, RateLimitPolicy] = {
    "auth": RateLimitPolicy(
        name="auth",
        max_requests=5,
        window_seconds=60,
        fail_open=False  # Security endpoints FAIL CLOSED on Redis outage in production
    ),
    "routes": RateLimitPolicy(
        name="routes",
        max_requests=10,
        window_seconds=60,
        fail_open=True,
        local_concurrency_limit=20  # Bounded local concurrency fallback
    ),
    "trips": RateLimitPolicy(
        name="trips",
        max_requests=10,
        window_seconds=60,
        fail_open=True,
        local_concurrency_limit=20
    ),
    "locations": RateLimitPolicy(
        name="locations",
        max_requests=60,
        window_seconds=60,
        fail_open=True
    ),
    "default": RateLimitPolicy(
        name="default",
        max_requests=100,
        window_seconds=60,
        fail_open=True
    )
}

# Local in-memory worker concurrency semaphores for heavy route/trip searches
LOCAL_SEMAPHORES: Dict[str, asyncio.Semaphore] = {
    "routes": asyncio.Semaphore(20),
    "trips": asyncio.Semaphore(20)
}


def extract_client_ip(request: Request) -> str:
    """
    Safely extracts client IP address, checking X-Forwarded-For headers only
    if request comes from a trusted reverse proxy IP. Prevents IP spoofing.
    Handles IPv4 and IPv6 addresses.
    """
    client_host = request.client.host if request.client else "127.0.0.1"
    
    # Check if request comes from a trusted proxy
    if client_host in settings.TRUSTED_PROXIES:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Take the rightmost untrusted IP from the X-Forwarded-For chain
            ips = [ip.strip() for ip in forwarded.split(",")]
            for ip in reversed(ips):
                if ip not in settings.TRUSTED_PROXIES:
                    return ip
    return client_host


def build_rate_limit_key(policy_name: str, client_ip: str, user_id: Optional[str] = None) -> str:
    """
    Builds strict rate limit key.
    Anonymous requests use IP identity (eliminates User-Agent limit bypass).
    Authenticated requests use verified User ID identity.
    """
    prefix = settings.REDIS_KEY_PREFIX
    if user_id:
        identifier = f"user:{user_id}"
    else:
        identifier = f"ip:{client_ip}"
    return f"{prefix}:ratelimit:{policy_name}:{identifier}"


class DistributedRateLimiter:
    """
    Atomic Redis Lua-backed Sliding Window Rate Limiter.
    Guarantees zero-race-condition admission, precise Retry-After calculations,
    and fast circuit breaker fallbacks during outages.
    """
    def __init__(self):
        self._lua_script = None

    async def check_rate_limit(
        self,
        request: Request,
        policy_name: str = "default",
        user_id: Optional[str] = None
    ) -> Tuple[bool, int, int, int]:
        """
        Executes atomic Lua script on Redis server to check rate limit.
        Returns: (is_allowed, remaining_requests, retry_after_seconds, limit)
        """
        if not settings.RATE_LIMIT_ENABLED:
            return True, 999, 0, 999

        policy = POLICIES.get(policy_name, POLICIES["default"])
        client_ip = extract_client_ip(request)
        redis_key = build_rate_limit_key(policy.name, client_ip, user_id)
        
        now = time.time()
        req_member = f"{now}:{uuid.uuid4().hex}"

        client = redis_manager.get_async_client()
        if client is None:
            return self._handle_redis_degraded(policy)

        try:
            # Execute atomic Lua script on Redis server
            res = await client.eval(
                SLIDING_WINDOW_LUA_SCRIPT,
                1,
                redis_key,
                str(now),
                str(policy.window_seconds),
                str(policy.max_requests),
                req_member
            )
            
            allowed = bool(res[0])
            remaining = int(res[1])
            retry_after = int(res[2])
            limit = int(res[3])

            if not allowed:
                logger.warning(
                    f"Rate limit exceeded for policy '{policy_name}' on key '{redis_key}'. "
                    f"Retry after: {retry_after}s"
                )

            return allowed, remaining, retry_after, limit

        except Exception as e:
            redis_manager.trigger_circuit_breaker()
            logger.warning(f"Redis Lua rate limiter exception ({policy_name}): {str(e)}")
            return self._handle_redis_degraded(policy)

    def _handle_redis_degraded(self, policy: RateLimitPolicy) -> Tuple[bool, int, int, int]:
        """Handles rate limiting decisions when Redis cluster is unreachable or circuit broken."""
        if (settings.is_development or settings.is_testing) and not policy.fail_open:
            logger.warning(
                f"Redis rate limiter unavailable for SECURITY policy '{policy.name}' in {settings.APP_ENV} mode. "
                "Failing OPEN for local development/testing."
            )
            return True, policy.max_requests, 0, policy.max_requests

        if not policy.fail_open:
            logger.error(f"Redis rate limiter unavailable for SECURITY policy '{policy.name}'. Failing CLOSED.")
            return False, 0, policy.window_seconds, policy.max_requests

        logger.warning(f"Redis rate limiter unavailable for policy '{policy.name}'. Failing OPEN with local fallback.")
        return True, policy.max_requests, 0, policy.max_requests


rate_limiter = DistributedRateLimiter()


@asynccontextmanager
async def acquire_concurrency_guard(policy_name: str = "routes", timeout: float = 5.0):
    """
    Async context manager enforcing in-memory worker concurrency caps during route/trip searches.
    Acquires semaphore before processing, releases in finally block, and times out after timeout seconds.
    """
    sem = LOCAL_SEMAPHORES.get(policy_name)
    if sem is None:
        yield
        return

    try:
        acquired = await asyncio.wait_for(sem.acquire(), timeout=timeout)
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server busy: local search concurrency limit reached. Please retry in a few seconds."
        )

    try:
        yield
    finally:
        sem.release()
