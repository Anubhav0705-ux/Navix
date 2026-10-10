import re
import time
import logging
from typing import Dict, Any, Optional
import redis.asyncio as aioredis
import redis

from app.core.config import settings
from app.core.metrics import metrics

logger = logging.getLogger("navix.redis")


def mask_redis_credentials(text_str: str) -> str:
    """Masks inline passwords in Redis connection URLs and error tracebacks."""
    if not text_str:
        return text_str
    # Match redis://:password@host:port or rediss://:password@host:port
    pattern = r"(rediss?://[^:]*:)([^@]+)(@.+)"
    return re.sub(pattern, r"\1[REDACTED]\3", text_str)


class RedisClientManager:
    """
    Centralized, environment-aware Redis client lifecycle manager.
    Supports asynchronous and synchronous connection pooling, health checks, circuit breakers, and secret masking.
    Fails open or closed according to endpoint sensitivity without crashing local development.
    """
    def __init__(self):
        self._async_client: Optional[aioredis.Redis] = None
        self._sync_client: Optional[redis.Redis] = None
        self._is_available: Optional[bool] = None
        self._circuit_broken_until: float = 0.0
        self.circuit_cooldown_seconds: float = 10.0

    def trigger_circuit_breaker(self):
        """Trips connection circuit breaker for cooldown period to prevent latency degradation during outages."""
        metrics.record_redis_failure()
        self._circuit_broken_until = time.time() + self.circuit_cooldown_seconds
        self._is_available = False

    def is_circuit_broken(self) -> bool:
        """Returns True if Redis circuit breaker is currently tripped and cooling down."""
        return time.time() < self._circuit_broken_until

    def get_async_client(self) -> Optional[aioredis.Redis]:
        """Returns initialized async Redis client instance, or None if unreachable/circuit broken."""
        if self.is_circuit_broken():
            return None

        if self._async_client is None:
            try:
                self._async_client = aioredis.from_url(
                    settings.redis_connection_url,
                    socket_connect_timeout=settings.REDIS_CONNECT_TIMEOUT,
                    socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                    max_connections=settings.REDIS_MAX_CONNECTIONS,
                    decode_responses=True
                )
            except Exception as e:
                self.trigger_circuit_breaker()
                sanitized_err = mask_redis_credentials(str(e))
                logger.warning(f"Failed to initialize async Redis client: {sanitized_err}")
                return None
        return self._async_client

    def get_sync_client(self) -> Optional[redis.Redis]:
        """Returns initialized sync Redis client instance, or None if unreachable/circuit broken."""
        if self.is_circuit_broken():
            return None

        if self._sync_client is None:
            try:
                self._sync_client = redis.from_url(
                    settings.redis_connection_url,
                    socket_connect_timeout=settings.REDIS_CONNECT_TIMEOUT,
                    socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                    max_connections=settings.REDIS_MAX_CONNECTIONS,
                    decode_responses=True
                )
            except Exception as e:
                self.trigger_circuit_breaker()
                sanitized_err = mask_redis_credentials(str(e))
                logger.warning(f"Failed to initialize sync Redis client: {sanitized_err}")
                return None
        return self._sync_client

    async def verify_connection_async(self, include_diagnostics: bool = False) -> Dict[str, Any]:
        """
        Executes an asynchronous PING to test Redis connectivity.
        When include_diagnostics is False, returns minimal non-sensitive status.
        When include_diagnostics is True, includes server metadata and connection info for internal inspection.
        """
        client = self.get_async_client()
        if client is None:
            if not include_diagnostics:
                return {"status": "unhealthy", "service": "redis"}
            return {
                "connected": False,
                "circuit_broken": self.is_circuit_broken(),
                "fail_open": settings.REDIS_FAIL_OPEN,
                "message": "Redis client initialization failed or Redis is not configured."
            }

        try:
            pong = await client.ping()
            if pong:
                self._is_available = True
                self._circuit_broken_until = 0.0
                if not include_diagnostics:
                    return {"status": "healthy", "service": "redis"}

                info = {}
                try:
                    info = await client.info("server")
                except Exception:
                    pass

                return {
                    "connected": True,
                    "circuit_broken": False,
                    "fail_open": settings.REDIS_FAIL_OPEN,
                    "redis_version": info.get("redis_version", "unknown"),
                    "sanitized_url": mask_redis_credentials(settings.redis_connection_url),
                    "key_prefix": settings.REDIS_KEY_PREFIX,
                    "message": "Successfully connected to Redis cluster."
                }
        except Exception as e:
            self.trigger_circuit_breaker()
            sanitized_err = mask_redis_credentials(str(e))
            logger.warning(f"Redis ping check failed: {sanitized_err}")
            if not include_diagnostics:
                return {"status": "unhealthy", "service": "redis"}
            return {
                "connected": False,
                "circuit_broken": True,
                "fail_open": settings.REDIS_FAIL_OPEN,
                "message": f"Redis connection error: {sanitized_err}"
            }

        if not include_diagnostics:
            return {"status": "unhealthy", "service": "redis"}
        return {"connected": False, "circuit_broken": self.is_circuit_broken(), "fail_open": settings.REDIS_FAIL_OPEN, "message": "Unknown Redis state."}

    def verify_connection_sync(self) -> Dict[str, Any]:
        """Synchronous connectivity check for diagnostics and health endpoints."""
        client = self.get_sync_client()
        if client is None:
            return {
                "connected": False,
                "circuit_broken": self.is_circuit_broken(),
                "fail_open": settings.REDIS_FAIL_OPEN,
                "message": "Redis client initialization failed or Redis is not configured."
            }

        try:
            pong = client.ping()
            if pong:
                self._is_available = True
                self._circuit_broken_until = 0.0
                return {
                    "connected": True,
                    "circuit_broken": False,
                    "fail_open": settings.REDIS_FAIL_OPEN,
                    "sanitized_url": mask_redis_credentials(settings.redis_connection_url),
                    "message": "Successfully connected to Redis cluster."
                }
        except Exception as e:
            self.trigger_circuit_breaker()
            sanitized_err = mask_redis_credentials(str(e))
            return {
                "connected": False,
                "circuit_broken": True,
                "fail_open": settings.REDIS_FAIL_OPEN,
                "message": f"Redis connection error: {sanitized_err}"
            }

        return {"connected": False, "circuit_broken": self.is_circuit_broken(), "fail_open": settings.REDIS_FAIL_OPEN, "message": "Unknown Redis state."}

    async def close(self):
        """Closes all initialized async and sync connection pools gracefully."""
        if self._async_client is not None:
            try:
                await self._async_client.aclose()
            except Exception:
                pass
            self._async_client = None

        if self._sync_client is not None:
            try:
                self._sync_client.close()
            except Exception:
                pass
            self._sync_client = None


# Singleton instance
redis_manager = RedisClientManager()


async def verify_redis_connection(include_diagnostics: bool = False) -> Dict[str, Any]:
    """Helper function to verify Redis connection state asynchronously."""
    return await redis_manager.verify_connection_async(include_diagnostics=include_diagnostics)
