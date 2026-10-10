import sys
import re
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from contextvars import ContextVar

from app.core.config import settings

# ContextVar for request correlation across async/sync task execution
request_id_ctx: ContextVar[str] = ContextVar("request_id_ctx", default="-")

# Regex pattern for sensitive field redacting
SENSITIVE_PATTERNS = [
    (r'(?i)Bearer\s+[a-zA-Z0-9\-_=]+\.[a-zA-Z0-9\-_=]+\.?[a-zA-Z0-9\-_=]*', r'Bearer [REDACTED]'),
    (r'(postgresql(?:\+[a-zA-Z0-9]+)?://[^:]+:)([^@]+)(@.+)', r'\1[REDACTED]\3'),
    (r'(rediss?://[^:]*:)([^@]+)(@.+)', r'\1[REDACTED]\3'),
    (r'(?i)("?(?:password|hashed_password|secret|secret_key|jwt|access_token|refresh_token|token|authorization|cookie)"?\s*[:=]\s*)"?[^"&\s,;]+"?', r'\1"[REDACTED]"'),
]


def mask_sensitive_data(text_str: str) -> str:
    """Masks sensitive values (passwords, JWTs, inline connection credentials, authorization tokens) in strings."""
    if not text_str or not isinstance(text_str, str):
        return str(text_str)
    res = text_str
    for pattern, repl in SENSITIVE_PATTERNS:
        res = re.sub(pattern, repl, res)
    return res


class StructuredJSONFormatter(logging.Formatter):
    """Production-grade structured JSON log formatter for AWS CloudWatch and log aggregation ingestors."""
    def format(self, record: logging.LogRecord) -> str:
        req_id = request_id_ctx.get("-")
        if req_id == "-" and hasattr(record, "request_id"):
            req_id = getattr(record, "request_id")

        log_data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "service": "navix-api",
            "environment": settings.APP_ENV,
            "request_id": req_id,
            "message": mask_sensitive_data(record.getMessage())
        }

        # Include optional request metadata if provided on LogRecord
        for key in ["method", "path", "status_code", "duration_ms", "client_ip"]:
            if hasattr(record, key):
                val = getattr(record, key)
                log_data[key] = mask_sensitive_data(str(val)) if isinstance(val, str) else val

        if record.exc_info:
            log_data["exception"] = mask_sensitive_data(self.formatException(record.exc_info))

        return json.dumps(log_data)


class ConsoleFormatter(logging.Formatter):
    """Readable log formatter for local development and testing environments."""
    def format(self, record: logging.LogRecord) -> str:
        req_id = request_id_ctx.get("-")
        if req_id == "-" and hasattr(record, "request_id"):
            req_id = getattr(record, "request_id")

        time_str = datetime.now(timezone.utc).strftime("%H:%M:%S")
        msg = mask_sensitive_data(record.getMessage())

        extra_parts = []
        for key in ["method", "path", "status_code", "duration_ms"]:
            if hasattr(record, key):
                extra_parts.append(f"{key}={getattr(record, key)}")
        extra_str = f" ({', '.join(extra_parts)})" if extra_parts else ""

        formatted = f"[{time_str}] [{record.levelname}] [req:{req_id}] [{record.name}]: {msg}{extra_str}"
        if record.exc_info:
            formatted += f"\n{mask_sensitive_data(self.formatException(record.exc_info))}"
        return formatted


def configure_logging():
    """
    Initializes root and navix application loggers.
    Uses StructuredJSONFormatter in PRODUCTION/STAGING or ConsoleFormatter in DEVELOPMENT/TESTING.
    """
    log_level_name = getattr(settings, "LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove pre-existing handlers to prevent duplicate output
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    if settings.is_production or getattr(settings, "LOG_FORMAT", "").lower() == "json":
        handler.setFormatter(StructuredJSONFormatter())
    else:
        handler.setFormatter(ConsoleFormatter())

    root_logger.addHandler(handler)

    # Configure specific framework loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(log_level)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)  # Prevent verbose SQL leaks
