# NAVIX — Authorization & API Abuse Protection Architecture Specification

> **Document Type**: Technical Authorization & Application Hardening Architecture  
> **Status**: Official Technical Design Specification (Phase 6B.4 — Final Corrections Pass)  
> **Scope**: OBAC/RBAC Access Control, IDOR Mitigations, Rate Limiting, NAT IP Protection & Redis Fail-Open Safeguards  
> **Safety Notice**: Design Specification Only — Zero Application Code, PostgreSQL Mutations, or Dependencies Applied.

---

## 1. Executive Summary & Authorization Philosophy

The **NAVIX Authorization & Abuse Protection Architecture** secures API endpoints against unauthorized data access, privilege escalation, and production resource exhaustion. 

It enforces **Server-Side Ownership Verification (OBAC)** to eliminate Insecure Direct Object Reference (IDOR) vulnerabilities, **Role-Based Access Control (RBAC)** for administrative routes, and a multi-tier **Redis Token-Bucket Rate Limiter with Fail-Open Safeguards** to protect compute-intensive algorithms.

```mermaid
flowchart TD
    Req[Incoming HTTP Request] --> ProxyCheck[Trusted Reverse Proxy IP Parsing]
    ProxyCheck --> RateLimiter{Redis Token Bucket Rate Limiter}
    
    RateLimiter -- Redis Outage --> FailOpen[Fail-Open Warning Log & Permit Request]
    RateLimiter -- Bucket Exhausted --> 429[429 Too Many Requests + Retry-After Header]
    RateLimiter -- Allowed --> AuthCheck{JWT / Session Auth Dependency}
    
    AuthCheck -- Unauthenticated & Protected --> 401[401 Unauthorized]
    AuthCheck -- Authenticated --> AccessCheck{Server-Side OBAC Check}
    
    AccessCheck -- Admin Endpoint & Role != ADMIN --> 403[403 Forbidden]
    AccessCheck -- Resource Owner != current_user.user_id --> 403[403 Forbidden (IDOR Blocked)]
    AccessCheck -- Permitted --> Handler[Execute Service & Return Response]
```

---

## 2. Server-Side Ownership Verification & IDOR Prevention

### 2.1 Deny-by-Default Authorization Rule
All resource access decisions rely **exclusively on verified server-side identity** (`current_user.user_id` extracted from validated JWT or session cookie). Client-supplied `user_id` payload fields are strictly ignored for authorization.

### 2.2 OBAC Implementation Pattern
```python
# Design Schema Dependency (FastAPI OBAC Contract)
def verify_trip_ownership(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Trip:
    """Enforces Ownership-Based Access Control (OBAC) on saved trips."""
    trip = db.query(Trip).filter(Trip.trip_id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Requested trip plan not found")
    
    # Server-Side Ownership Check (Deny-by-Default)
    if trip.user_id != current_user.user_id and current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to access or modify this saved trip"
        )
    return trip
```

---

## 3. Configurable Rate Limiting & Abuse Prevention Policies

### 3.1 Rate Limit Starting Policy Configuration
All rate limit numbers below represent **CONFIGURABLE STARTING POLICIES**, subject to adjustment based on production traffic monitoring:

| Endpoint Category | Bucket Scope Key | Configurable Starting Policy | Exceeded Status Code & Headers |
| :--- | :--- | :--- | :--- |
| **Authentication (`/api/v1/auth/*`)** | Trusted IP + User-Agent | **5 requests / minute** | `429 Too Many Requests` (Header: `Retry-After: 60`) |
| **Route Search (`/api/v1/routes/search`)** | User ID (Auth) / Composite IP (Anon) | **10 requests / minute** | `429 Too Many Requests` (Header: `Retry-After: 30`) |
| **Trip Planning (`/api/v1/trips/plan`)** | User ID (Auth) / Composite IP (Anon) | **10 requests / minute** | `429 Too Many Requests` (Header: `Retry-After: 30`) |
| **Location Search (`/api/v1/locations/*`)** | Composite IP | **60 requests / minute** | `429 Too Many Requests` (Header: `Retry-After: 10`) |
| **General API Endpoints** | User ID / Composite IP | **100 requests / minute** | `429 Too Many Requests` (Header: `Retry-After: 60`) |

### 3.2 NAT Public IP Protection & Trusted Proxy Parsing
- **Shared NAT IP Handling**: To prevent locking out multiple legitimate users behind a single corporate or mobile NAT IP, rate limit bucket keys combine client IP with user session ID (`IP:User_ID`) or hashed User-Agent (`IP:UserAgent_Hash`).
- **Trusted Proxy Validation**: `X-Forwarded-For` header parsing is accepted **only if the immediate connection originates from a configured trusted proxy IP** (e.g., Cloudflare, Nginx ingress controller), preventing IP spoofing attacks.

### 3.3 Redis Outage Fail-Open Safeguard
If the Redis rate-limiting cluster becomes unreachable or fails:
- The rate-limiting middleware logs a critical alert (`"REDIS_RATE_LIMITER_UNAVAILABLE"`).
- The limiter **fails open**, allowing legitimate user requests to proceed to backend services rather than causing a total application outage.

---

## 4. Resource Protection & Idempotency Controls

1. **Request Payload Size Cap**: FastAPI middleware rejects payloads exceeding **2 MB** with `413 Payload Too Large`.
2. **Gateway Execution Timeouts**:
   - Location Search: **3.0 seconds** max timeout.
   - Multimodal Routing & Trip Planning: **15.0 seconds** max timeout.
   - Timeout returns `504 Gateway Timeout`.
3. **Idempotency Key Verification (`Idempotency-Key`)**:
   State-changing mutation requests (`POST /api/v1/trips/save`) accept an optional HTTP header `Idempotency-Key: <UUID>`. Cached responses in Redis are returned for duplicate transmissions within 24 hours.

---

## 5. External Provider Circuit Breakers

To isolate backend services from external provider API slowdowns or outages (e.g. IRCTC, Amadeus, RedBus):
- **Failure Threshold**: 5 consecutive HTTP 5xx errors or timeouts within 60 seconds trips circuit to `OPEN`.
- **Open Circuit Duration**: 30 seconds. Calls return cached timetable fallback estimates without waiting for external timeouts.
- **Half-Open Recovery**: Sends a single probe request after 30 seconds to restore `CLOSED` state if successful.
