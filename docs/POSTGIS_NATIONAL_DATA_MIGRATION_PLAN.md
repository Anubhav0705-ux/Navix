# NAVIX — PostGIS National Data Migration & Ingestion Plan

> **Document Type**: Technical Geospatial Database & Ingestion Blueprint  
> **Status**: Official Technical Design Specification (Phase 6B.5 — Final Corrections Pass)  
> **Scope**: PostGIS Schema Migration, Namespaced Identity Mapping, Global Coordinate Validation, GTFS Timezones & Partition Swaps  
> **Safety Notice**: Design Specification Only — Zero Application Code, PostgreSQL Mutations, or Data Ingestion Executed.

---

## 1. Executive Summary & PostGIS Infrastructure Requirements

NAVIX relies on PostGIS for spatial resolution of travel origin and destination endpoints. This plan details the migration of national geographic structures, GTFS timetable ingestion pipelines, and spatial indexing.

### PostGIS System Requirements
- PostgreSQL Extension: `postgis` (v3.4+).
- Spatial Reference System: WGS 84 (`SRID 4326`).
- Datatype Standard: `Geography(Point, 4326)` for exact spherical distance calculations in meters without planar projection distortion.

---

## 2. Global Coordinate Range Validation & Island/Border Support

### 2.1 Elimination of Rigid Rectangular Bounding Box Restrictions
Previous proposals applied a rigid coordinate bounding box ($6.0\le \text{lat} \le 37.5$, $68.0 \le \text{lon} \le 97.5$). **This logic is corrected** because it falsely excluded Lakshadweep, Andaman & Nicobar islands, legitimate international transit gateways (e.g. Kathmandu, Dubai transfer hubs), and remote border transit points.

### 2.2 Corrected Spatial Validation Rules
1. **Global WGS 84 Range Check**:
   Inputs must satisfy valid global geographic bounds:
   $$-90.0 \le \text{latitude} \le 90.0 \quad \text{AND} \quad -180.0 \le \text{longitude} \le 180.0$$
2. **Authoritative Country Boundary Classification**:
   Regional attribution (`country_code = 'IN'`) is determined by evaluating PostGIS spatial containment (`ST_Contains`) against authoritative versioned country boundary multipolygons, rather than arbitrary bounding rectangles.
3. **Quarantine Separation**:
   - `MALFORMED_COORDINATES`: Invalid float numbers or coordinates outside global WGS 84 bounds (Quarantined in `invalid_schedules`).
   - `UNCOVERED_REGION`: Geographically valid locations outside active transit feed coverage areas (Registered in `settlements` with `coverage_status = 'UNCOVERED'`).

---

## 3. Namespaced Facility Identity & Provider Mapping Architecture

To prevent identifier collisions across multiple transport providers and support international expansion, facility identities use **Namespaced Primary Keys**:

$$\text{facility\_id} = \text{FAC\_} \parallel \text{country\_code} \parallel \text{\_} \parallel \text{provider\_id} \parallel \text{\_} \parallel \text{normalized\_code}$$

- *Examples*: `FAC_IN_IRCTC_NDLS`, `FAC_IN_GTFS_10294`, `FAC_IN_AIR_BOM`.

### 3.1 `provider_mappings` Table
Bidirectional mappings between external provider station codes and internal `facility_id` instances are stored with unique constraints:

```sql
CREATE TABLE provider_mappings (
    mapping_id VARCHAR(50) PRIMARY KEY,
    facility_id VARCHAR(50) NOT NULL REFERENCES transit_facilities(facility_id),
    provider_id VARCHAR(50) NOT NULL,
    provider_facility_code VARCHAR(100) NOT NULL,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_provider_facility UNIQUE (provider_id, provider_facility_code)
);
```

---

## 4. GTFS Timezone & Service-Day Semantics

1. **Agency-Local Timezone Conversion**:
   GTFS stop times are specified in agency local time (e.g., `Asia/Kolkata` IST, UTC+5:30). Departure and arrival timestamps are converted to explicit UTC instants (`TIMESTAMP WITH TIME ZONE`).
2. **Timestamps Exceeding 24:00:00**:
   GTFS times like `25:30:00` (01:30 AM on the day following service date) are parsed deterministically:
   $$\text{day\_offset} = \text{seconds\_since\_midnight} \mathbin{/\!/} 86400$$
   $$\text{actual\_service\_date} = \text{service\_date} + \text{timedelta}(\text{days} = \text{day\_offset})$$
   $$\text{time\_of\_day} = \text{seconds\_since\_midnight} \pmod{86400}$$
   *Rule*: Service timestamps MUST NOT be derived by naively adding timetable offsets to UTC midnight.

---

## 5. Dataset Publication & Partition Swap Disclosures

Schedule datasets are staged in versioned partitions (`schedules_v2026_10_09`). Switching active schedule pointers requires acquiring an exclusive table lock on parent tables during `ALTER TABLE ... ATTACH PARTITION`. 

*Disclosure*: Partition swaps are qualified as **dependent on PostgreSQL lock acquisition timeouts (`lock_timeout = '5s'`)**, and are evaluated as target operational capabilities to be verified during Phase 6B.5 test executions.
