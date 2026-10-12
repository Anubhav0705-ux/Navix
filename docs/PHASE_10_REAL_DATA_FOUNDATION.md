# Phase 10: Real Data Foundation & Real Trip Setup

## 1. Executive Summary & Objective

In **Phase 10**, NAVIX underwent an architectural transformation from a seed-driven prototype into a **real-data travel planning platform**.

Prior to Phase 10, trip planning defaulted to synthetic seed values (`Sangli` to `Old Manali`) with hardcoded routes. Phase 10 establishes the **Real Data Foundation** and **Real Trip Setup (Stage 1 of the 7-stage planner)**, anchoring journey requests in real external provider identities and coordinates.

### Non-Negotiable Product Rule: Zero Synthetic Data in Consumer Experience
> **Strict Truth-in-Data Invariant**: Under no circumstance may synthetic, mock, or Phase 8 seed data appear in the consumer planning experience. If an external data provider is rate-limited, unreachable, or fails, NAVIX must surface a truthful error state (*"Location search is temporarily unavailable. Live location resolution is required for truthful multi-modal planning."*). NAVIX will **never** silently fall back to synthetic database rows.

---

## 2. External Provider Architecture & Status Matrix

Phase 10 connects four external travel data providers, managed deterministically via `ProviderRegistry`:

| Provider | Purpose | Environment | Status | Consumer Enabled | API Version / Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Foursquare Places** | Real place search, geocoding & autocomplete | Production | `READY` | **YES** | v2025-06-17; 60 req/min rate limit, Redis cache |
| **Transitland** | Multi-operator transit feeds & discovery | Production | `READY` | NO (Discovery Only) | v2 REST API; real operator registry |
| **Duffel Flights** | Flight offers & multi-city routing | Test / Sandbox | `SANDBOX_ONLY` | NO | Duffel v2 API; restricted to test data class |
| **Hotelbeds** | Accommodation inventory & hotel search | Evaluation | `EVALUATION` | NO | Test base URL; evaluation status verified |

### Provider Registry & Health Probe
All providers are registered in `backend/app/providers/registry.py` and exposed via:
- `GET /api/v1/places/health`
- Individual provider status checks (`probe_health()`) executed asynchronously with structured status objects (`ProviderHealthStatus`).

---

## 3. Place Search & Trip Setup Specifications

### 3.1. Place Search Service (`GET /api/v1/places/search`)
- **Query Normalization**: Trims whitespace, validates minimum 2-character query length.
- **Redis Caching**: Key format `navix:places:foursquare:{normalized_query}` with a 24-hour TTL (`86400s`).
- **Error Bubbling**: HTTP 429 and 503 from Foursquare are immediately passed through to the consumer with truthful error responses (`LOCATION_SEARCH_RATE_LIMITED`, `LOCATION_SEARCH_UNAVAILABLE`).
- **Data State**: Every search result item contains `data_state: "REAL_PROVIDER_DATA"`, Foursquare `provider_place_id`, formatted address, locality, region, country, and precise latitude/longitude.

### 3.2. Trip Setup Draft Persistence (`POST /api/v1/trips/setup`)
- Validates constraints deterministically:
  - Departure date cannot be in the past.
  - Return date cannot be earlier than departure date.
  - Total trip duration cannot exceed 30 days.
  - Origin and destination must be distinct places (`origin.provider_place_id != destination.provider_place_id` and distinct names).
  - Maximum budget must be positive (> 0).
  - Travellers must be between 1 and 20.
- Persists draft to the `trips` table with new provider provenance columns:
  - `origin_provider`, `origin_place_id`, `origin_lat`, `origin_lon`
  - `destination_provider`, `destination_place_id`, `destination_lat`, `destination_lon`
  - `return_date`, `travellers`, `travel_style`
- Returns HTTP 201 with unique `trip_id`, `status: "DRAFT"`, `duration_days`, `duration_nights`, and `next_step: "TRANSPORTATION"`.

---

## 4. Database Migration 006

- **Revision**: `006_real_trip_setup_foundation.py`
- **Revises**: `005_gtfs_and_refresh_foundation`
- **Scope**: Adds columns to `trips` table with complete idempotency and backwards-compatibility for existing trips. Tolerates fresh disposable DB runs where `trips` table is created cleanly.
- **Zero-Downtime**: All newly added columns are nullable.

---

## 5. Frontend Architecture & User Experience

### 5.1. PlaceAutocomplete Component
- Location search input with 280ms debounce.
- Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape).
- Clear button with text and place state invalidation.
- Selected place card displaying exact coordinates (`lat.toFixed(4)°, lon.toFixed(4)°`) and provider badge (`Foursquare Places`).
- Strict truth-in-data error state when provider is offline or rate-limited.

### 5.2. TripSetupStage (Planner Stage 1)
- Replaced hardcoded default values (`Sangli`, `Old Manali`) with clean unselected state.
- Dynamic duration calculation (`DURATION CALCULATOR: X DAYS • Y NIGHTS`).
- Visual validation warning banner (`trip-setup-warning-banner`) when origin equals destination.
- Disabled Continue button state until both origin and destination are valid external places.
- Stage 2 Transport handoff banner displaying confirmed Step 1 origin and destination.

---

## 6. Verification & Test Evidence

### 6.1. Backend Pytest Suite
- `15 passed` in `test_phase_10_providers.py`
- `9 passed` in `test_phase_10_places_search.py`
- `11 passed` in `test_phase_10_trip_setup.py`
- **Full Backend Suite**: **228 passed**, 0 failed in 23.8s.

### 6.2. Playwright E2E Suite
- `7 passed` in `phase10-trip-setup.spec.ts` (Phase 10 real data trip setup flows)
- `12 passed` in `location-autocomplete.spec.ts`
- `3 passed` in `transport-data.spec.ts`
- `6 passed` in `transport-discovery.spec.ts`
- **Total E2E Tests**: **28 passed**, 0 failed in 27.1s.

### 6.3. Docker Compose Stack Verification
- Containers `navix-backend`, `navix-frontend`, and `navix-redis` built and healthy.
- Redis caching verified live.
- Cold start restart verified cleanly.

### 6.4. Dual Disposable PostGIS Database Runs
- **Run 1 (`navixtest_p10_run1`)**: Created fresh DB, ran Alembic `001 -> 006`, executed 228 tests, dropped cleanly (Exit 0).
- **Run 2 (`navixtest_p10_run2`)**: Re-ran full lifecycle from scratch, 228 tests passed, dropped cleanly (Exit 0).
