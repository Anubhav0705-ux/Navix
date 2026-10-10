import time
import re
import threading
from typing import Dict, Tuple


def normalize_endpoint(path: str) -> str:
    """
    Normalizes HTTP request paths to bounded endpoint categories.
    Prevents high-cardinality metric label explosions caused by raw dynamic parameters.
    """
    if not path:
        return "/unknown"

    # Known fixed endpoints
    if path in ["/health", "/health/db", "/health/redis", "/ready", "/metrics", "/docs", "/openapi.json"]:
        return path

    cleaned = re.sub(r'/[0-9a-fA-F\-]{8,}', '/{id}', path)
    cleaned = re.sub(r'/[0-9]+', '/{id}', cleaned)

    # API V1 path collapse
    if cleaned.startswith("/api/v1/auth/login"):
        return "/api/v1/auth/login"
    if cleaned.startswith("/api/v1/auth/register"):
        return "/api/v1/auth/register"
    if cleaned.startswith("/api/v1/routes/search"):
        return "/api/v1/routes/search"
    if cleaned.startswith("/api/v1/trips/plan"):
        return "/api/v1/trips/plan"
    if cleaned.startswith("/api/v1/trips/{id}"):
        return "/api/v1/trips/{id}"
    if cleaned == "/api/v1/trips":
        return "/api/v1/trips"
    if cleaned.startswith("/api/v1/locations"):
        return "/api/v1/locations"
    if cleaned.startswith("/api/v1/admin"):
        return "/api/v1/admin"

    return cleaned


class MetricsCollector:
    """
    Thread-safe, lightweight, zero-dependency application metrics collector.
    Exposes metrics formatted according to standard Prometheus exposition specifications.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self.start_time: float = time.time()

        # Metrics storage
        self._requests_total: Dict[Tuple[str, str, int], int] = {}
        self._request_duration_sum: Dict[Tuple[str, str], float] = {}
        self._request_duration_count: Dict[Tuple[str, str], int] = {}
        self._requests_in_flight: int = 0

        self._errors_total: Dict[int, int] = {}
        self._rate_limit_rejections: Dict[str, int] = {}

        self._redis_failures: int = 0
        self._db_failures: int = 0

        self._route_searches: int = 0
        self._trip_plans: int = 0

    def record_request(self, method: str, path: str, status_code: int, duration_seconds: float):
        """Records completed HTTP request metrics."""
        norm_path = normalize_endpoint(path)
        with self._lock:
            req_key = (method.upper(), norm_path, status_code)
            self._requests_total[req_key] = self._requests_total.get(req_key, 0) + 1

            dur_key = (method.upper(), norm_path)
            self._request_duration_sum[dur_key] = self._request_duration_sum.get(dur_key, 0.0) + duration_seconds
            self._request_duration_count[dur_key] = self._request_duration_count.get(dur_key, 0) + 1

            if status_code >= 400:
                self._errors_total[status_code] = self._errors_total.get(status_code, 0) + 1

    def increment_in_flight(self):
        """Increments active in-flight request gauge."""
        with self._lock:
            self._requests_in_flight += 1

    def decrement_in_flight(self):
        """Decrements active in-flight request gauge."""
        with self._lock:
            self._requests_in_flight = max(0, self._requests_in_flight - 1)

    def record_rate_limit_rejection(self, policy: str):
        """Records 429 rate limit rejection event."""
        with self._lock:
            self._rate_limit_rejections[policy] = self._rate_limit_rejections.get(policy, 0) + 1

    def record_redis_failure(self):
        """Records Redis connection or operation failure."""
        with self._lock:
            self._redis_failures += 1

    def record_db_failure(self):
        """Records PostgreSQL connection or query failure."""
        with self._lock:
            self._db_failures += 1

    def record_route_search(self):
        """Records A* route search execution."""
        with self._lock:
            self._route_searches += 1

    def record_trip_plan(self):
        """Records whole-trip planner execution."""
        with self._lock:
            self._trip_plans += 1

    def get_uptime_seconds(self) -> float:
        """Returns total application uptime in seconds."""
        return round(time.time() - self.start_time, 2)

    def generate_prometheus_metrics(self) -> str:
        """Generates Prometheus-formatted metrics output (text/plain; version=0.0.4)."""
        lines = []

        # Uptime Metric
        lines.append("# HELP navix_uptime_seconds Total application uptime in seconds.")
        lines.append("# TYPE navix_uptime_seconds gauge")
        lines.append(f"navix_uptime_seconds {self.get_uptime_seconds()}")
        lines.append("")

        # In-Flight Requests
        lines.append("# HELP navix_http_requests_in_flight Active in-flight HTTP requests.")
        lines.append("# TYPE navix_http_requests_in_flight gauge")
        with self._lock:
            lines.append(f"navix_http_requests_in_flight {self._requests_in_flight}")
        lines.append("")

        # Total HTTP Requests
        lines.append("# HELP navix_http_requests_total Total HTTP requests processed.")
        lines.append("# TYPE navix_http_requests_total counter")
        with self._lock:
            for (method, endpoint, status_code), count in sorted(self._requests_total.items()):
                lines.append(f'navix_http_requests_total{{method="{method}",endpoint="{endpoint}",status="{status_code}"}} {count}')
        lines.append("")

        # Request Duration Sum & Count
        lines.append("# HELP navix_http_request_duration_seconds_sum Sum of HTTP request durations in seconds.")
        lines.append("# TYPE navix_http_request_duration_seconds_sum counter")
        with self._lock:
            for (method, endpoint), dur_sum in sorted(self._request_duration_sum.items()):
                lines.append(f'navix_http_request_duration_seconds_sum{{method="{method}",endpoint="{endpoint}"}} {dur_sum:.6f}')
        lines.append("")

        lines.append("# HELP navix_http_request_duration_seconds_count Count of HTTP request durations measured.")
        lines.append("# TYPE navix_http_request_duration_seconds_count counter")
        with self._lock:
            for (method, endpoint), dur_count in sorted(self._request_duration_count.items()):
                lines.append(f'navix_http_request_duration_seconds_count{{method="{method}",endpoint="{endpoint}"}} {dur_count}')
        lines.append("")

        # HTTP Errors
        lines.append("# HELP navix_http_errors_total Total HTTP error responses.")
        lines.append("# TYPE navix_http_errors_total counter")
        with self._lock:
            for status_code, count in sorted(self._errors_total.items()):
                lines.append(f'navix_http_errors_total{{status="{status_code}"}} {count}')
        lines.append("")

        # Rate Limit Rejections
        lines.append("# HELP navix_rate_limit_rejections_total Total rate-limit 429 rejections.")
        lines.append("# TYPE navix_rate_limit_rejections_total counter")
        with self._lock:
            for policy, count in sorted(self._rate_limit_rejections.items()):
                lines.append(f'navix_rate_limit_rejections_total{{policy="{policy}"}} {count}')
        lines.append("")

        # Infrastructure Failures
        lines.append("# HELP navix_redis_failures_total Total Redis connection/operation failures.")
        lines.append("# TYPE navix_redis_failures_total counter")
        with self._lock:
            lines.append(f"navix_redis_failures_total {self._redis_failures}")
        lines.append("")

        lines.append("# HELP navix_database_failures_total Total database connection/query failures.")
        lines.append("# TYPE navix_database_failures_total counter")
        with self._lock:
            lines.append(f"navix_database_failures_total {self._db_failures}")
        lines.append("")

        # Core Feature Counts
        lines.append("# HELP navix_route_searches_total Total A* route search executions.")
        lines.append("# TYPE navix_route_searches_total counter")
        with self._lock:
            lines.append(f"navix_route_searches_total {self._route_searches}")
        lines.append("")

        lines.append("# HELP navix_trip_plans_total Total whole-trip planner executions.")
        lines.append("# TYPE navix_trip_plans_total counter")
        with self._lock:
            lines.append(f"navix_trip_plans_total {self._trip_plans}")
        lines.append("")

        return "\n".join(lines)


# Singleton instance
metrics = MetricsCollector()
