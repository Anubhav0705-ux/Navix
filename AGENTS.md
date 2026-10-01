# AGENTS.md — Permanent Guidelines for NAVIX

## Project Overview
**NAVIX** is an algorithmic, budget-first multi-modal travel planner tailored for travellers starting from Tier-2 and Tier-3 Indian cities (e.g., Sangli → Old Manali). 
The core proposition is solving multi-modal routing subject to a **hard total trip budget constraint**:
$$\text{Total Trip Cost} \le \text{User Maximum Budget}$$

Cost includes transport, accommodation, food, activities, local transfers, and contingency buffers.

## Tech Stack
- **Frontend**: Next.js (App Router, TypeScript), Tailwind CSS, React Leaflet, OpenStreetMap, Lucide Icons.
- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic, PyJWT.
- **Database**: Existing PostgreSQL 18 + PostGIS (Port 5433, Database: `Navix`).
- **Algorithms**: Deterministic A* route search (Dijkstra fallback), Dynamic Programming / constrained optimization for budget allocation, deterministic layover validation.

## CRITICAL: Existing Database Rules
- **NEVER** drop, truncate, recreate, or rename existing tables (`users`, `travelers`, `admins`, `trips`, `transit_nodes`, `transit_schedules`, `transit_segments`, `budget_allocations`) or PostGIS objects (`spatial_ref_sys`, `geometry_columns`, `geography_columns`).
- **NEVER** delete seeded data or execute destructive schema migrations.
- Treat existing database data as authoritative and valuable.

## Core Algorithm Requirements
- Core route search and budget optimization **MUST BE DETERMINISTIC**.
- **DO NOT** use LLMs or probabilistic generators for route computation or budget allocation.
- Layovers between multi-modal transfers must be deterministically validated (min/max layover windows, station transfers).

## Feature Priorities
- **P0 (Must-Have)**: Route graph, A* route search, Layover validation, Budget optimizer, Planner form, Results page (Travel Command Center), Interactive map.
- **P1**: JWT Authentication, Saved trips, PDF itinerary export.
- **P2**: Admin management dashboard, UI polish.
*Rule: Never sacrifice P0 functionality for P1/P2 features.*

## UI & Design System Guidelines
- Design target: Premium travel-tech product ("Travel Command Center" aesthetic).
- Palette: Deep navy background/accents, travel teal highlights, sky-blue secondary accents, warm off-white background.
- Desktop layout: Left ~55% interactive journey timeline; Right ~45% interactive Leaflet map.
- Never use generic dashboard templates or raw card walls.

## Development Rules
1. **Inspect before editing**: Verify existing files and DB schemas before writing code.
2. **Secrets management**: Use `.env` for credentials; **NEVER** commit `.env` files.
3. **Viva Clarity**: Keep code structured cleanly and explainable for university defense.
4. **Verification**: Always test backend endpoints and frontend components before declaring success.
