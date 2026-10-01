# NAVIX — Implementation Roadmap

## Overview
Phased implementation plan for **NAVIX** (Algorithmic Budget-First Route Planning).

---

### Phase 0 — Foundation
- [x] Inspect development environment and tool versions (Git, Node, Python, pip, psql).
- [x] Establish Git repository and project structure (`docs/`, `frontend/`, `backend/`).
- [x] Create root configuration (`AGENTS.md`, `.gitignore`, `README.md`, `IMPLEMENTATION_PLAN.md`).

### Phase 1 — Frontend & Backend Setup
- [ ] Initialize Next.js project with TypeScript, Tailwind CSS, App Router in `frontend/`.
- [ ] Initialize Python environment and FastAPI application in `backend/`.
- [ ] Configure environment variable handling (`.env.example` in both directories).

### Phase 2 — Existing Database Inspection + ORM Mapping
- [ ] Inspect existing PostgreSQL schema tables (`transit_nodes`, `transit_schedules`, `transit_segments`, etc.) in read-only mode.
- [ ] Build SQLAlchemy ORM models matching existing table definitions.
- [ ] Implement database connection session management with safety guards against schema modification.

### Phase 3 — Routing & Transfer Validation
- [ ] Construct multi-modal route graph from transit nodes, segments, and schedules.
- [ ] Implement deterministic A* algorithm with multi-criteria heuristic (time + cost + transfer penalty).
- [ ] Implement fallback Dijkstra algorithm for verification.
- [ ] Build deterministic layover validation engine (minimum transfer windows, hub connections).

### Phase 4 — Budget Optimizer
- [ ] Implement budget allocation engine (transport vs. stay vs. food vs. activity vs. buffer).
- [ ] Enforce hard total budget constraint ($\text{Total Cost} \le \text{User Budget}$).
- [ ] Integrate dynamic programming / constrained optimization for category allocation.

### Phase 5 — API Integration
- [ ] Create FastAPI endpoints: `/api/v1/health`, `/api/v1/plan`, `/api/v1/routes`, `/api/v1/nodes`.
- [ ] Connect API routes to A* planner engine and budget optimizer.
- [ ] Return structured JSON payloads compatible with frontend travel timeline and Leaflet map rendering.

### Phase 6 — Landing Page & Design System
- [ ] Build design system tokens (deep navy, travel teal, sky blue, typography, card components).
- [ ] Implement high-converting landing page ("Your budget. One complete journey.").

### Phase 7 — Planner Interface
- [ ] Construct interactive route planning form (Origin, Destination, Maximum Budget, Travel Dates, Preferences).
- [ ] Add Tier-2/Tier-3 city autocomplete and quick-select presets (e.g. Sangli → Old Manali).

### Phase 8 — Trip Result & Interactive Map ("Travel Command Center")
- [ ] Build split desktop view (55% timeline / 45% Leaflet map).
- [ ] Implement synchronized timeline steps with map markers and route polylines.
- [ ] Render budget breakdown breakdown card (Transport, Stay, Food, Activity, Contingency).

### Phase 9 — Authentication & Trip Persistence
- [ ] Implement JWT authentication (User register, login, profile).
- [ ] Build saved trips functionality using existing `trips` table.

### Phase 10 — PDF Export & Admin Management
- [ ] Generate downloadable PDF itinerary.
- [ ] Build optional admin view for transit schedule management.

### Final — QA & Viva Demonstration
- [ ] End-to-end testing of Sangli → Old Manali demo journey under budget constraint.
- [ ] Validate algorithm execution accuracy without hardcoded route hacks.
