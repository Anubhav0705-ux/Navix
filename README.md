# NAVIX — Algorithmic Budget-First Route Planning

> **"Your budget. One complete journey."**

NAVIX is a constraint-based multi-modal travel planner primarily targeted at travellers starting from Tier-2 and Tier-3 Indian cities (e.g. Sangli → Old Manali). 

It optimizes multi-modal transit (local transport, trains, interstate buses, metros) and budget allocations (transport, accommodation, food, activities, contingency) subject to a strict maximum total trip budget constraint.

## Tech Stack
- **Frontend**: Next.js, TypeScript, App Router, Tailwind CSS, React Leaflet, OpenStreetMap, Lucide Icons
- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic, PyJWT
- **Database**: PostgreSQL 18 + PostGIS
- **Routing Engine**: Deterministic A* Route Search + Constrained Dynamic Programming Budget Optimizer

## Project Structure
```
Navix/
├── AGENTS.md
├── README.md
├── .gitignore
├── docs/
│   └── IMPLEMENTATION_PLAN.md
├── frontend/
└── backend/
```

## Documentation
- See [`AGENTS.md`](AGENTS.md) for core engineering rules and architecture decisions.
- See [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the phased implementation roadmap.
