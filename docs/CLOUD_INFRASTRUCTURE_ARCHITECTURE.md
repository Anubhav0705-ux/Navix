# NAVIX — Cloud Infrastructure & Deployment Architecture Specification

> **Document Type**: Technical Cloud Architecture & Hosting Specification  
> **Status**: Official Technical Design Specification (Phase 6B.5 — Final Corrections Pass)  
> **Scope**: Next.js Edge Hosting, FastAPI Container Topology, Managed PostgreSQL/PostGIS, PgBouncer Pooler & Redis Failure Policies  
> **Safety Notice**: Design Specification Only — Zero Application Code, Infrastructure Provisioning, or Cloud Execution Applied.

---

## 1. Executive Summary & Production Topology

NAVIX is designed as a commercially viable, production-grade deployment architecture. To optimize network latency across India, all compute and database resources are provisioned in the **India Region (`ap-south-1` Mumbai)**.

```mermaid
flowchart TD
    User[Traveler Browser / Mobile App] --> CDN[Cloudflare Edge CDN / WAF]
    CDN --> NextFrontend[Next.js App Router Frontend\n(Vercel / AWS Amplify)]
    
    subgraph IndiaRegion[AWS ap-south-1 / Render India Region]
        NextFrontend -->|API Proxy Rewrite /api/v1/*| ALB[Application Load Balancer]
        ALB --> FastApiCluster[FastAPI ASGI Container Cluster\n(AWS ECS Fargate / Render)]
        
        FastApiCluster --> PgBouncer[PgBouncer Transaction Pooler]
        PgBouncer --> PostgresDB[(Managed PostgreSQL 18 + PostGIS\nAWS RDS / Aiven)]
        
        FastApiCluster --> RedisCluster[(Managed Redis Cluster\nElastiCache / Redis Cloud)]
    end
```

---

## 2. Component Hosting Infrastructure & Unverified Objective Disclosures

### Performance & Latency Disclosures
All latency metrics (e.g. $<25\text{ ms}$ network latency) and monthly hosting cost estimates (~$120/month) are explicitly reclassified as **PROPOSED UNVERIFIED TARGET BENCHMARK OBJECTIVES**.

Latency is decomposed into four distinct measurement tiers:
1. *Network Latency*: Client to CDN / Load Balancer ($15\text{--}35\text{ ms}$).
2. *Backend Compute Latency*: FastAPI routing engine computation ($50\text{--}300\text{ ms}$).
3. *Database Query Latency*: PostgreSQL / PostGIS execution ($5\text{--}15\text{ ms}$).
4. *User-Perceived Response Time*: Total end-to-end round trip ($100\text{--}400\text{ ms}$).

---

## 3. Database Connection Pooling (PgBouncer & SQLAlchemy Setup)

### 3.1 PgBouncer Transaction Pooling Mode
PgBouncer is configured in **Transaction Pooling Mode** (`pool_mode = transaction`) to support high client concurrency (500 client connections) mapped to a compact PostgreSQL backend pool (50 server connections).

### 3.2 SQLAlchemy Compatibility Obligation
Because PgBouncer transaction pooling assigns a different PostgreSQL server connection for each transaction, server-side prepared statements can fail if assigned across connections.  
- **SQLAlchemy Engine Requirement**: SQLAlchemy engine configuration MUST disable client-side prepared statement caching when connecting through PgBouncer in transaction mode:
  ```python
  # SQLAlchemy PgBouncer Transaction Mode Engine Contract
  engine = create_engine(
      settings.sync_database_url,
      pool_size=20,
      max_overflow=10,
      connect_args={"prepare_threshold": None} # Disables server-side statement preparation
  )
  ```

---

## 4. Redis Failure Policies & Admission Control Safeguards

To prevent backend CPU exhaustion or external API quota depletion during Redis outages:

| Endpoint Category | Redis Capability | Behavior During Redis Outage | Admission Control Safeguard |
| :--- | :--- | :--- | :--- |
| **Auth (`/api/v1/auth/login`)** | Auth rate limiting | **FAIL CLOSED** | Rejects login requests to protect against brute-force attacks. |
| **Refresh (`/api/v1/auth/refresh`)** | RTR JTI Blocklist | **FALLBACK TO DB** | Queries PostgreSQL `token_blocklist` table directly. |
| **Route Search (`/api/v1/routes/*`)** | Rate limiting | **BOUNDED LOCAL FALLBACK** | Fails open with log warning; enforces local in-memory worker concurrency cap (max 20 concurrent searches). |
| **Trip Planning (`/api/v1/trips/plan`)** | Rate limiting | **BOUNDED LOCAL FALLBACK** | Fails open with log warning; enforces local worker concurrency cap. |
| **Locations (`/api/v1/locations/*`)** | Autocomplete rate limiting | **FAIL OPEN** | Permits autocomplete requests. |

---

## 5. Hosting Option Comparison Matrix

| Option | Architecture Complexity | Target Monthly Cost (Unverified)* | Target Network Latency (Unverified)* | Selection Status |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel + AWS RDS + ElastiCache + ECS** | Medium | ~$120 / month | $<25\text{ ms}$ (Mumbai) | **PROPOSED TARGET STACK** |
| **Hetzner Cloud + Self-Hosted Postgres** | High | ~$45 / month | $>120\text{ ms}$ (EU) | Rejected (High India latency) |
| **Full Kubernetes (EKS)** | Very High | ~$350 / month | $<25\text{ ms}$ (Mumbai) | Rejected (Over-engineered for launch) |

*\*Note: Latency and cost metrics represent unverified target benchmark objectives for vendor evaluation.*
