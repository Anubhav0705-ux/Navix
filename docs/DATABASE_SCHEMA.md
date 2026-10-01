# Navix Existing Database Documentation

> **Safety Notice**: This document reflects the authoritative, pre-existing PostgreSQL database schema for NAVIX. No schema modifications, migrations, or data alterations were executed.

---

## Environment
- **PostgreSQL Version**: PostgreSQL 18.6
- **PostGIS Status**: Installed (Extension `postgis` v3.6.2, `plpgsql` v1.0)
- **Database Name**: `Navix`
- **Database User**: `postgres`
- **Application GIS Usage**: None. (Latitude and longitude are stored as `DOUBLE PRECISION` in `transit_nodes`).
- **PostGIS System Objects**: `spatial_ref_sys`, `geometry_columns`, `geography_columns` present in schema.

---

## Tables Overview

Total Application Tables: **8**

| Table Name | Row Count | Primary Key | Description / Purpose |
| --- | --- | --- | --- |
| `users` | 4 | `user_id` | Core user identity records (Role: `traveler`, `admin`) |
| `travelers` | 2 | `traveler_id` | Profile extension for travelers (FK to `users.user_id`) |
| `admins` | 1 | `admin_id` | Profile extension for system admins (FK to `users.user_id`) |
| `trips` | 2 | `trip_id` | Trip metadata & hard budget cap constraint per traveler |
| `transit_nodes` | 2 | `node_id` | Physical stations/hubs (latitude/longitude, city) |
| `transit_schedules` | 1 | `schedule_id` | Master timetable schedules managed by admins |
| `transit_segments` | 1 | `segment_id` | Chosen trip transit leg details (FK to `trips`, `transit_nodes`) |
| `budget_allocations` | 1 | `allocation_id` | Cost breakdown per category (Transit, Lodging, Food, Activities, Total) |

---

## Detailed Table Schemas

### 1. `users`
- **Row Count**: 4
- **Purpose**: Stores base user account details.

| Column | Type | Nullable | Default | Key |
| --- | --- | --- | --- | --- |
| `user_id` | `VARCHAR(50)` | No | None | PK |
| `name` | `VARCHAR(100)` | No | None | - |
| `email` | `VARCHAR(100)` | No | None | - |
| `role` | `VARCHAR(20)` | No | None | - |

- **Foreign Keys**: None
- **Sample Roles**: `traveler`, `admin`

---

### 2. `travelers`
- **Row Count**: 2
- **Purpose**: Extends `users` table for traveler preferences.

| Column | Type | Nullable | Default | Key |
| --- | --- | --- | --- | --- |
| `traveler_id` | `VARCHAR(50)` | No | None | PK, FK to `users.user_id` |
| `preferences` | `TEXT` | Yes | None | - |

- **Foreign Keys**:
  - `fk_traveler_user`: `traveler_id` → `users.user_id`

---

### 3. `admins`
- **Row Count**: 1
- **Purpose**: Extends `users` table for admin departments.

| Column | Type | Nullable | Default | Key |
| --- | --- | --- | --- | --- |
| `admin_id` | `VARCHAR(50)` | No | None | PK, FK to `users.user_id` |
| `department` | `VARCHAR(100)` | No | None | - |

- **Foreign Keys**:
  - `fk_admin_user`: `admin_id` → `users.user_id`

---

### 4. `trips`
- **Row Count**: 2
- **Purpose**: Represents user planned trip requests with origin, destination, travel date, and maximum budget constraint.

| Column | Type | Nullable | Default | Key |
| --- | --- | --- | --- | --- |
| `trip_id` | `VARCHAR(50)` | No | None | PK |
| `traveler_id` | `VARCHAR(50)` | No | None | FK to `travelers.traveler_id` |
| `origin` | `VARCHAR(100)` | No | None | - |
| `destination` | `VARCHAR(100)` | No | None | - |
| `travel_date` | `DATE` | No | None | - |
| `budget_cap` | `NUMERIC(10, 2)` | No | None | - |

- **Foreign Keys**:
  - `fk_trip_traveler`: `traveler_id` → `travelers.traveler_id`
- **Indexes**: `idx_trips_traveler` on (`traveler_id`)

---

### 5. `transit_nodes`
- **Row Count**: 2
- **Purpose**: Transit hubs/stations (e.g. Sangli Station, Pune Central).

| Column | Type | Nullable | Default | Key |
| --- | --- | --- | --- | --- |
| `node_id` | `VARCHAR(50)` | No | None | PK |
| `node_name` | `VARCHAR(150)` | No | None | - |
| `city` | `VARCHAR(100)` | No | None | - |
| `latitude` | `DOUBLE PRECISION` | No | None | - |
| `longitude` | `DOUBLE PRECISION` | No | None | - |

- **Foreign Keys**: None

---

### 6. `transit_schedules`
- **Row Count**: 1
- **Purpose**: Master transit timetable graph edges available for route search algorithms.

| Column | Type | Nullable | Default | Key |
| --- | --- | --- | --- | --- |
| `schedule_id` | `VARCHAR(50)` | No | None | PK |
| `admin_id` | `VARCHAR(50)` | No | None | FK to `admins.admin_id` |
| `source_node_id` | `VARCHAR(50)` | No | None | FK to `transit_nodes.node_id` |
| `dest_node_id` | `VARCHAR(50)` | No | None | FK to `transit_nodes.node_id` |
| `provider` | `VARCHAR(100)` | No | None | - |
| `departure_time` | `TIMESTAMP` | No | None | - |
| `arrival_time` | `TIMESTAMP` | No | None | - |
| `base_cost` | `NUMERIC(10, 2)` | No | None | - |

- **Foreign Keys**:
  - `fk_schedule_admin`: `admin_id` → `admins.admin_id`
  - `fk_schedule_source`: `source_node_id` → `transit_nodes.node_id`
  - `fk_schedule_dest`: `dest_node_id` → `transit_nodes.node_id`
- **Indexes**: `idx_schedules_graph` on (`source_node_id`, `dest_node_id`)

---

### 7. `transit_segments`
- **Row Count**: 1
- **Purpose**: Specific itinerary leg instance linked to an executed trip itinerary.

| Column | Type | Nullable | Default | Key |
| --- | --- | --- | --- | --- |
| `segment_id` | `VARCHAR(50)` | No | None | PK |
| `trip_id` | `VARCHAR(50)` | No | None | FK to `trips.trip_id` |
| `source_node_id` | `VARCHAR(50)` | No | None | FK to `transit_nodes.node_id` |
| `dest_node_id` | `VARCHAR(50)` | No | None | FK to `transit_nodes.node_id` |
| `mode_type` | `VARCHAR(50)` | No | None | - |
| `provider_name` | `VARCHAR(100)` | No | None | - |
| `departure_time` | `TIMESTAMP` | No | None | - |
| `arrival_time` | `TIMESTAMP` | No | None | - |
| `cost` | `NUMERIC(10, 2)` | No | None | - |

- **Foreign Keys**:
  - `fk_segment_trip`: `trip_id` → `trips.trip_id`
  - `fk_segment_source`: `source_node_id` → `transit_nodes.node_id`
  - `fk_segment_dest`: `dest_node_id` → `transit_nodes.node_id`
- **Indexes**: `idx_segments_trip` on (`trip_id`)

---

### 8. `budget_allocations`
- **Row Count**: 1
- **Purpose**: Monetary allocation output generated by the budget optimizer.

| Column | Type | Nullable | Default | Key |
| --- | --- | --- | --- | --- |
| `allocation_id` | `VARCHAR(50)` | No | None | PK |
| `trip_id` | `VARCHAR(50)` | No | None | FK to `trips.trip_id` |
| `transit_cost` | `NUMERIC(10, 2)` | Yes | `0.00` | - |
| `lodging_cost` | `NUMERIC(10, 2)` | Yes | `0.00` | - |
| `food_cost` | `NUMERIC(10, 2)` | Yes | `0.00` | - |
| `activities_cost` | `NUMERIC(10, 2)` | Yes | `0.00` | - |
| `total_cost` | `NUMERIC(10, 2)` | No | None | - |

- **Foreign Keys**:
  - `fk_budget_trip`: `trip_id` → `trips.trip_id`

---

## Gap Analysis

Comparison of current PostgreSQL database schema against target NAVIX architecture:

| Component / Feature | Current Schema Status | Classification | Notes & Gap Description |
| --- | --- | --- | --- |
| **User Identity & Roles** | Present (`users`, `travelers`, `admins`) | `PARTIAL` | Missing password hash, salt, and JWT session metadata columns required for authentication. |
| **Trips & Constraints** | Present (`trips`) | `EXISTS` | Stores origin, destination, travel_date, and budget_cap. May need status/title fields later. |
| **Transit Nodes / Graph** | Present (`transit_nodes`) | `EXISTS` | Stores node name, city, latitude, and longitude. |
| **Transit Schedules** | Present (`transit_schedules`) | `PARTIAL` | Stores source/dest, provider, departure/arrival timestamps, base_cost. Missing transport mode type (e.g. Train, Bus, Flight) on schedule level. |
| **Transit Segments** | Present (`transit_segments`) | `EXISTS` | Maps trip legs with mode_type, provider, times, and leg cost. |
| **Budget Allocations** | Present (`budget_allocations`) | `EXISTS` | Categorized costs for transit, lodging, food, activities, total. |
| **Accommodation Options** | None | `MISSING` | No dedicated table for hotel/stay catalog data. Lodging cost is computed dynamically or aggregated. |
| **Food Options** | None | `MISSING` | No dedicated food catalog table; costs handled in `budget_allocations`. |
| **Activities / Attractions** | None | `MISSING` | No activities catalog table; costs handled in `budget_allocations`. |
| **PostGIS Spatial Queries** | PostGIS extension active, but no `geometry`/`geography` columns in app tables | `NEEDS REVIEW` | `transit_nodes` uses float lat/long. If spatial radius searches are needed, ST_SetSRID/ST_MakePoint can be used dynamically or spatial columns added in future migrations. |
