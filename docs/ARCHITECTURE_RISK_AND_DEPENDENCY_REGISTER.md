# NAVIX — Architecture Risk & Dependency Register (V1)

> **Document Type**: Technical Risk Management & System Dependency Register  
> **Status**: Official Technical Design Specification (Phase 6C)  
> **Scope**: Prioritized Architectural Risks (P0–P3), Implementation Blockers, & Mitigation Strategies  
> **Safety Notice**: Design Specification Only — Zero Application Code Changes or Risk Execution Applied.

---

## 1. Executive Summary & Priority Classification

This register categorizes all identified architectural risks, technical dependencies, and implementation blockers across Phases 6A through 6B.5:
- **`P0` (Critical Blocker)**: Must be resolved prior to starting backend implementation of the affected subsystem.
- **`P1` (High Priority)**: Must be resolved prior to feature rollout in staging/production environments.
- **`P2` (Medium Priority)**: System optimization or operational improvement.
- **`P3` (Low Priority)**: Future enhancement or post-launch feature expansion.

---

## 2. Risk & Dependency Register Matrix

### 2.1 Critical Implementation Blockers (P0)

#### `RISK-P0-01`: Unlicensed Commercial Transport Data APIs (IRCTC / GDS Flights / Intercity Buses)
- **Document Reference**: [`DATA_PROVIDER_FEASIBILITY.md`](file:///c:/Users/anubh/OneDrive/Desktop/Navix/docs/DATA_PROVIDER_FEASIBILITY.md), Section 3.
- **Problem Description**: Real-time seat availability and booking fares for Indian Railways (IRCTC B2B API), domestic airlines (Amadeus/Skyscanner API), and intercity buses (RedBus API) require commercial licensing contracts and API credentials.
- **Consequence**: Full nationwide live booking search cannot be deployed without official provider data access.
- **Recommended Mitigation**: Implement Phase 8 using verified open public GTFS schedule feeds (e.g. Indian Railways open timetables, DMRC metro feeds, state RTC GTFS feeds) and synthetic fallback models while provider contracts are negotiated.
- **Affected Phase**: Phase 8 (National Data Ingestion) / Phase 9 (Provider Integration).
- **Dependency**: Legal data licensing contracts.

#### `RISK-P0-02`: PostgreSQL PostGIS Extension Provisioning & Spatial Database Setup
- **Document Reference**: [`POSTGIS_NATIONAL_DATA_MIGRATION_PLAN.md`](file:///c:/Users/anubh/OneDrive/Desktop/Navix/docs/POSTGIS_NATIONAL_DATA_MIGRATION_PLAN.md), Section 1.
- **Problem Description**: National geographic queries (`ST_DWithin`, GiST spatial indexes) require the `postgis` extension enabled on PostgreSQL 18.
- **Consequence**: Backend spatial hub resolution queries fail if PostGIS extension is absent on the production database.
- **Recommended Mitigation**: Include `CREATE EXTENSION IF NOT EXISTS postgis;` as the mandatory first step in Alembic Migration `0002_add_postgis_national_geo.py`.
- **Affected Phase**: Phase 7 (Infrastructure Setup) / Phase 8 (PostGIS Schema Setup).
- **Dependency**: PostgreSQL database superuser / extension creation privileges.

---

### 2.2 High Priority Rollout Risks (P1)

#### `RISK-P1-01`: PgBouncer Transaction Pooling vs. SQLAlchemy Prepared Statements
- **Document Reference**: [`CLOUD_INFRASTRUCTURE_ARCHITECTURE.md`](file:///c:/Users/anubh/OneDrive/Desktop/Navix/docs/CLOUD_INFRASTRUCTURE_ARCHITECTURE.md), Section 3.
- **Problem Description**: PgBouncer operating in transaction pooling mode assigns different server connections per transaction, causing server-side prepared statements to fail.
- **Consequence**: Intermittent database connection errors (`DuplicatePreparedStatementError` or `PreparedStatementDoesNotExist`) under high traffic load.
- **Recommended Mitigation**: Configure SQLAlchemy database engine with `connect_args={"prepare_threshold": None}` to explicitly disable server-side statement preparation when connecting through PgBouncer.
- **Affected Phase**: Phase 7 (Infrastructure Foundation).
- **Dependency**: SQLAlchemy database connection pooling configuration.

#### `RISK-P1-02`: Redis Rate Limiter Dependency & Outage Impact
- **Document Reference**: [`API_AUTHORIZATION_AND_ABUSE_PROTECTION.md`](file:///c:/Users/anubh/OneDrive/Desktop/Navix/docs/API_AUTHORIZATION_AND_ABUSE_PROTECTION.md), Section 3.
- **Problem Description**: If Redis becomes unavailable, rate-limiting middleware could cause total application failure if configured to fail closed on all endpoints.
- **Consequence**: Unintentional application outage during Redis maintenance.
- **Recommended Mitigation**: Enforce endpoint-specific degraded policies: Fail-closed for `/v1/auth/login` and `/v1/admin/*`; Fail-open with local worker concurrency caps for `/v1/routes/search` and `/v1/trips/plan`.
- **Affected Phase**: Phase 7 (Infrastructure Foundation) / Phase 9 (API Deployment).
- **Dependency**: Redis cluster deployment & middleware fallback logic.

---

### 2.3 Medium Priority Optimization Items (P2 & P3)

#### `RISK-P2-01`: Refresh Token Rotation Simultaneous Tab Race Condition
- **Document Reference**: [`AUTH_AND_SESSION_SECURITY_ARCHITECTURE.md`](file:///c:/Users/anubh/OneDrive/Desktop/Navix/docs/AUTH_AND_SESSION_SECURITY_ARCHITECTURE.md), Section 4.
- **Problem Description**: Multiple browser tabs attempting to refresh tokens simultaneously may trigger false-positive RTR security alerts if the second request uses the old token.
- **Consequence**: User sessions unexpectedly revoked during multi-tab browsing.
- **Recommended Mitigation**: Implement a 30-second rotation grace window in Redis (`TTL = 30s`) returning the cached new token pair for duplicate requests arriving within 30 seconds.
- **Affected Phase**: Phase 9 (Authentication Upgrades).

#### `RISK-P3-01`: Peak Festival Season Transit Availability Volatility
- **Document Reference**: [`NATIONAL_BUDGET_MODEL_V2.md`](file:///c:/Users/anubh/OneDrive/Desktop/Navix/docs/NATIONAL_BUDGET_MODEL_V2.md), Section 4.
- **Problem Description**: High seat demand during major Indian festivals (Diwali, Holi) causes rapid fare and seat availability drift.
- **Consequence**: Cached seat availability states become stale within hours.
- **Recommended Mitigation**: Reduce Redis availability cache TTL from 24 hours to 15 minutes during flagged peak travel dates.
- **Affected Phase**: Post-Launch Optimization (Phase 10).
