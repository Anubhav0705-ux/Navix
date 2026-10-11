import os
import ipaddress
import socket
import logging
from urllib.parse import urlparse
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.transport_platform import TransportRefreshLock, TransportIngestionRun
from app.transport_ingestion.manifest import TransportSourceManifest

logger = logging.getLogger(__name__)

# Approved domains for external data retrieval
ALLOWED_DOMAINS = {
    "data.gov.in",
    "www.data.gov.in",
    "otd.delhi.gov.in",
    "msrtc.maharashtra.gov.in",
    "www.dgca.gov.in",
    "localhost",
    "127.0.0.1"  # only permitted in test environments
}


class RefreshSecurityError(Exception):
    """Raised when an external refresh URL violates security policies."""
    pass


class RefreshLockError(Exception):
    """Raised when a refresh cannot proceed due to concurrency lock."""
    pass


class TransportRefreshManager:
    """
    Manages transport source refresh runs, locking, SSRF guards, and staging.
    """
    def __init__(self, db: Session, worker_id: str = "navix_worker_01"):
        self.db = db
        self.worker_id = worker_id
        self.manifest = TransportSourceManifest()

    def acquire_lock(self, source_id: str, lock_ttl_seconds: int = 300) -> bool:
        now = datetime.now(timezone.utc)
        lock = self.db.query(TransportRefreshLock).filter(
            TransportRefreshLock.source_id == source_id
        ).first()

        if lock:
            if lock.expires_at > now:
                logger.warning(f"Refresh lock for source '{source_id}' is held by '{lock.locked_by}' until {lock.expires_at}.")
                return False
            # Lock expired; reacquire
            lock.locked_at = now
            lock.locked_by = self.worker_id
            lock.expires_at = now + timedelta(seconds=lock_ttl_seconds)
        else:
            lock = TransportRefreshLock(
                source_id=source_id,
                locked_at=now,
                locked_by=self.worker_id,
                expires_at=now + timedelta(seconds=lock_ttl_seconds)
            )
            self.db.add(lock)

        self.db.commit()
        return True

    def release_lock(self, source_id: str) -> None:
        self.db.query(TransportRefreshLock).filter(
            TransportRefreshLock.source_id == source_id
        ).delete()
        self.db.commit()

    @staticmethod
    def validate_url_safety(url: str, allow_local_for_testing: bool = False) -> None:
        """
        Validates URL against SSRF and arbitrary network access:
        1. Scheme must be http or https
        2. Domain must not resolve to private RFC 1918 / loopback IPs (unless testing)
        3. Domain must match allowed domain list or ends with .gov.in
        """
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise RefreshSecurityError(f"Prohibited URL scheme: '{parsed.scheme}'. Only http/https permitted.")

        host = parsed.hostname
        if not host:
            raise RefreshSecurityError("URL has no valid hostname.")

        # Check allowed domains
        is_allowed = (
            host in ALLOWED_DOMAINS or
            host.endswith(".gov.in") or
            host.endswith(".nic.in")
        )
        if not is_allowed and not allow_local_for_testing:
            raise RefreshSecurityError(f"Domain '{host}' is not in the approved transport source allowlist.")

        # Resolve IP to check for private ranges
        try:
            ip_str = socket.gethostbyname(host)
            ip_obj = ipaddress.ip_address(ip_str)
            if not allow_local_for_testing and (ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local):
                raise RefreshSecurityError(f"Destination IP '{ip_str}' is within private/internal network range.")
        except socket.gaierror:
            # If DNS resolution fails, allow if domain check passed and let network request handle it
            pass

    def run_refresh(self, source_id: str) -> Dict[str, Any]:
        """
        Executes a controlled refresh for the specified source.
        """
        src = self.manifest.get_source(source_id)
        if not src:
            raise ValueError(f"Unknown source ID: '{source_id}'")

        if src.approval_status != "APPROVED":
            return {
                "source_id": source_id,
                "status": "REJECTED_UNAPPROVED_LICENSE",
                "message": f"Source has status '{src.approval_status}'. Automatic refresh is rejected."
            }

        if not self.acquire_lock(source_id):
            raise RefreshLockError(f"Concurrent refresh already in progress for source '{source_id}'.")

        try:
            # Transactional execution
            run = TransportIngestionRun(
                id=f"run_refresh_{source_id}_{int(datetime.utcnow().timestamp())}",
                source_id=source_id,
                status="RUNNING"
            )
            self.db.add(run)
            self.db.commit()

            # Execute refresh via appropriate adapter
            from app.transport_ingestion.adapters.rail_adapter import RailProviderAdapter
            from app.transport_ingestion.loader import TransportLoader

            adapter = RailProviderAdapter()
            raw = adapter.fetch()
            parsed = adapter.parse(raw)
            validated = adapter.validate(parsed)

            loader = TransportLoader(self.db)
            final_run = loader.load_services(src, validated)

            run.status = final_run.status
            run.records_read = final_run.records_read
            run.records_inserted = final_run.records_inserted
            run.records_updated = final_run.records_updated
            run.completed_at = datetime.now(timezone.utc)
            self.db.commit()

            return {
                "source_id": source_id,
                "status": final_run.status,
                "records_updated": final_run.records_updated,
                "records_inserted": final_run.records_inserted
            }
        except Exception as e:
            self.db.rollback()
            logger.error(f"Refresh failed for source '{source_id}': {e}", exc_info=True)
            return {
                "source_id": source_id,
                "status": "FAILED",
                "error": str(e)
            }
        finally:
            self.release_lock(source_id)
