import json
import logging
from typing import Optional, Any, Dict
from app.core.config import settings
from app.core.redis import redis_manager

logger = logging.getLogger("navix.cache")


class RedisCacheManager:
    """
    Namespaced cache manager for travel metadata, locations, and published timetables.
    Preserves Phase 6B.2 data provenance contracts and freshness metadata.
    """
    def __init__(self, key_prefix: Optional[str] = None):
        self.prefix = key_prefix or settings.REDIS_KEY_PREFIX

    def build_cache_key(self, domain: str, key: str, version: str = "v1") -> str:
        """Constructs namespaced key: navix:cache:<domain>:<version>:<key>"""
        clean_domain = domain.strip().lower()
        clean_key = key.strip()
        return f"{self.prefix}:cache:{clean_domain}:{version}:{clean_key}"

    async def get_json(self, domain: str, key: str, version: str = "v1") -> Optional[Dict[str, Any]]:
        """Retrieves and deserializes JSON cache payload."""
        client = redis_manager.get_async_client()
        if client is None:
            return None

        cache_key = self.build_cache_key(domain, key, version)
        try:
            val = await client.get(cache_key)
            if val:
                data = json.loads(val)
                # Inject provenance metadata
                if isinstance(data, dict):
                    data["_cache_metadata"] = {
                        "freshness": "CACHED_VALID",
                        "source_authority": "CACHED_STORE",
                        "is_live_inventory": False
                    }
                return data
        except Exception as e:
            logger.warning(f"Cache get error for key '{cache_key}': {str(e)}")

        return None

    async def set_json(self, domain: str, key: str, value: Dict[str, Any], ttl_seconds: int = 300, version: str = "v1") -> bool:
        """Serializes and stores JSON payload with TTL."""
        client = redis_manager.get_async_client()
        if client is None:
            return False

        cache_key = self.build_cache_key(domain, key, version)
        try:
            payload = json.dumps(value)
            await client.set(cache_key, payload, ex=ttl_seconds)
            return True
        except Exception as e:
            logger.warning(f"Cache set error for key '{cache_key}': {str(e)}")
            return False

    async def delete(self, domain: str, key: str, version: str = "v1") -> bool:
        """Invalidates a single cache key."""
        client = redis_manager.get_async_client()
        if client is None:
            return False

        cache_key = self.build_cache_key(domain, key, version)
        try:
            res = await client.delete(cache_key)
            return res > 0
        except Exception as e:
            logger.warning(f"Cache delete error for key '{cache_key}': {str(e)}")
            return False


cache_manager = RedisCacheManager()
