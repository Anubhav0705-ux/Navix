# NAVIX — V2 Backward Compatibility & Regression Preservation Matrix (V1)

> **Document Type**: Technical Compatibility Matrix & Regression Verification Specification  
> **Status**: Official Technical Design Specification (Phase 6C)  
> **Scope**: Preservation of Existing V2 Planner Workflows, APIs, Database Models, Maps, & Demonstration Data  
> **Safety Notice**: Design Specification Only — Zero Application Code Modifications or Regression Tests Executed.

---

## 1. Executive Summary & Compatibility Guarantees

NAVIX V2 is a fully functional, verified application. The Phase 6B architecture design establishes a nationwide multimodal platform while preserving **100% additive backward compatibility** with existing V2 features, database tables, and API contracts.

### Compatibility Status Classification
- **`DESIGN_COMPATIBLE`**: Architecturally designed to maintain complete backward compatibility without breaking existing interfaces.
- **`VERIFICATION_PENDING`**: Requires empirical execution of automated test suites during implementation phases before declaring final runtime status.

---

## 2. Comprehensive NAVIX V2 Feature Compatibility Matrix

| # | V2 Feature Component | Existing V2 Behavior | Proposed Architectural Evolution | Compatibility Risk | Required Adapter / Layer | Verification Status & Evidence Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Seven-Stage Planner Flow** | Multi-stage form collecting origin, dest, dates, budget, and preferences. | Preserved. Extends stage 2 with optional party composition and pace controls. | Low (Optional inputs only). | Form state schema extension in Next.js. | `DESIGN_COMPATIBLE` (Requires Next.js form state regression test). |
| **2** | **`/api/v1/trips/plan` API** | Accepts `WholeTripPlanRequest`, returns cost breakdown, route, & itinerary. | Preserved. Returns enhanced V2 expense ledgers & 4-state price evidence. | Low (Additive response fields). | Response Pydantic schema wrapper. | `DESIGN_COMPATIBLE` (Requires JSON API contract test). |
| **3** | **`/api/v1/routes/search` API** | Accepts origin/dest strings, returns A* route candidates. | Preserved. Resolves queries to `ResolvedLocationItem` via spatial index. | Low (Preserves endpoint signature). | Location string query resolver. | `DESIGN_COMPATIBLE` (Requires route payload verification). |
| **4** | **Authentication & User Data** | Password hashing via bcrypt, JWT bearer authentication. | Preserved. Adds optional HTTP-only `__Host-` cookies and RTR token rotation. | Low (Dual-transport cookie/bearer). | Dual-transport authentication middleware. | `DESIGN_COMPATIBLE` (Requires auth token login/refresh test). |
| **5** | **Saved Trips API (`/v1/saved-trips`)** | Stores user trip plans in PostgreSQL `trips` table. | Preserved. Adds additive JSONB columns (`party_composition_json`, `ledger_details_json`). | Low (Zero table drops or renames). | SQLAlchemy model JSONB mapping layer. | `DESIGN_COMPATIBLE` (Requires saved trip CRUD test). |
| **6** | **Database Schemas & Foreign Keys** | PostgreSQL tables (`users`, `trips`, `budget_allocations`, etc.). | Preserved. National tables added in parallel; V2 tables preserved. | Low (Expand-Migrate-Contract DAG). | Alembic Expand migration scripts. | `DESIGN_COMPATIBLE` (Requires migration up/down test). |
| **7** | **Legacy Budget Constraint** | Enforces $\text{total\_cost} = \text{transit} + \text{lodging} + \text{food} + \text{activities}$. | Preserved. National expense ledgers aggregate into legacy category columns. | Low (Monetary aggregation preserved). | Ledger aggregation service helper. | `DESIGN_COMPATIBLE` (Requires budget equality check). |
| **8** | **Sangli $\rightarrow$ Old Manali Demo Graph** | In-memory demo schedules (`app/data/demo_data.py`). | Preserved. Backfilled into national `transit_facilities` (`FAC_IN_IRCTC_SANGLI`). | Low (Deterministic ID backfill). | Alembic data backfill script `0003`. | `DESIGN_COMPATIBLE` (Requires demo graph routing test). |
| **9** | **Automatic Itinerary Scheduler** | Schedules daily events for Sangli $\rightarrow$ Old Manali trip. | Preserved. Generalizes to arbitrary cities, operating hours, and pace tiers. | Low (Extends activity pool logic). | Legacy `DailyItineraryItem` response adapter. | `DESIGN_COMPATIBLE` (Requires itinerary generation test). |
| **10** | **Leaflet Interactive Maps** | Renders route legs and activity pin markers. | Preserved. Returns GeoJSON coordinates for candidate routes and activities. | Low (Coordinate format unchanged). | GeoJSON feature collection formatter. | `DESIGN_COMPATIBLE` (Requires frontend map render test). |
| **11** | **PDF Itinerary Export** | Generates PDF itinerary report from saved trip data. | Preserved. Extends template with price evidence notices and detailed ledgers. | Low (Template enhancement only). | ReportLab / PDF generator adapter. | `DESIGN_COMPATIBLE` (Requires PDF export compilation test). |
| **12** | **Demo User & Admin Roles** | User and Admin role enforcement in `get_current_admin`. | Preserved. Standardizes RBAC dependencies across all `/api/v1/admin/*` endpoints. | Low (Extends FastAPI dependencies). | FastAPI RBAC security dependency. | `DESIGN_COMPATIBLE` (Requires role permission test). |

---

## 3. Regression Testing Requirements Prior to Implementation Approval

Before promoting Phase 7/8 code to production, the automated test harness (`test_infra_v2_regression.py`) must verify:
1. **Full Sangli $\rightarrow$ Old Manali Planner Execution**: Submit a standard 7-day, ₹20,000 budget request for Sangli to Old Manali; assert 100% output equality with V2 baseline.
2. **Saved Trip Persistence & Retrieval**: Create, read, and delete a saved trip; verify legacy database fields are populated correctly alongside additive JSONB metadata.
