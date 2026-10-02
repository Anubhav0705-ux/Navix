# NAVIX — Algorithmic Budget-First Multi-Modal Travel Planner

> **"Your budget. One complete journey."**

NAVIX is an algorithmic, budget-first multi-modal travel planner tailored for travellers starting from Tier-2 and Tier-3 Indian cities (e.g., **Sangli → Old Manali**). It solves complex multi-modal transit routing subject to a **hard total trip budget constraint**:

$$\text{Total Trip Cost} \le \text{User Maximum Budget}$$

Cost includes transport fares, accommodation, food, activities, local transfer shuttles, and contingency buffers.

---

## 🏗️ Architecture & Core Stack

- **Frontend**: Next.js (App Router, TypeScript), Tailwind CSS, React Leaflet, OpenStreetMap, Lucide Icons, jsPDF.
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2, PyJWT, Passlib (bcrypt).
- **Database**: PostgreSQL 18 + PostGIS extension.
- **Algorithms**:
  - **Deterministic A* Route Search**: Time-dependent multi-modal transit graph search with layover connection safety validation (`SAFE`, `TIGHT`, `INVALID`).
  - **Constrained Dynamic Programming Budget Allocator**: Knapsack-style accommodation, dining, and activity optimization under a strict total cost cap.

---

## 📁 Project Structure

```text
Navix/
├── AGENTS.md                   # Core project guidelines & database rules
├── DESIGN.md                   # UI design system & visual style specifications
├── README.md                   # Comprehensive project documentation & run guide
├── docs/                       # Technical architecture & engine documentation
│   ├── BUDGET_ENGINE.md        # Budget optimizer mathematical formulation
│   ├── DATABASE_SCHEMA.md      # PostgreSQL + PostGIS database schema
│   ├── DEMO_DATA.md            # Demo graph nodes & schedules mapping
│   ├── IMPLEMENTATION_PLAN.md  # Engineering implementation roadmap
│   └── ROUTING_ENGINE.md       # A* search & layover validation engine spec
├── backend/                    # Python FastAPI application
│   ├── app/
│   │   ├── algorithms/         # Deterministic A* search & DP budget engines
│   │   ├── api/v1/             # FastAPI API routers (auth, trips, routes, admin)
│   │   ├── core/               # Configuration & JWT security
│   │   ├── database/           # SQLAlchemy session & base model
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── seed/               # Idempotent demo graph seeding script
│   │   └── services/           # Trip planner orchestrator service
│   ├── tests/                  # Pytest test suite (44 passing tests)
│   └── requirements.txt        # Backend dependencies
└── frontend/                   # Next.js frontend application
    ├── src/
    │   ├── app/                # Next.js App Router pages
    │   ├── components/         # Reusable UI components & Interactive Map
    │   ├── lib/                # PDF export & trip storage helpers
    │   ├── services/           # API fetch client & authentication services
    │   └── types/              # TypeScript interface definitions
    ├── package.json
    └── next.config.ts
```

---

## ⚙️ Prerequisites & Setup

### 1. Database Requirements
- **PostgreSQL**: Version 18 with **PostGIS** extension.
- **Host**: `127.0.0.1`
- **Port**: `5433`
- **Database Name**: `Navix`

Ensure your PostgreSQL service is active on port 5433 with the `Navix` database created and PostGIS enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`).

### 2. Backend Environment Setup (`backend/.env`)
Create `backend/.env` (do not commit to Git):
```ini
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=Navix
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

FRONTEND_ORIGIN=http://localhost:3000
SECRET_KEY=your_jwt_secret_key
```

### 3. Frontend Environment Setup (`frontend/.env.local`)
Create `frontend/.env.local` (do not commit to Git):
```ini
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

---

## 🚀 Running the Application

### 1. Backend Setup & Run
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run idempotent demo data seed
python -m app.seed.seed_demo_data

# Run FastAPI backend dev server (Port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend endpoints:
- **API Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/health`
- **DB Health Check**: `http://127.0.0.1:8000/health/db`

### 2. Frontend Setup & Run
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server (Port 3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🧪 Testing & Verification

### Backend Tests
```bash
cd backend
.\.venv\Scripts\python.exe -m pytest
```
*Baseline: 44 passing unit & integration tests.*

### Frontend Verification & Production Build
```bash
cd frontend
npm run lint
npm run build
```

---

## 📍 Primary Demo Route & Data Disclaimer

- **Primary Demo Route**: Sangli → Miraj Junction → Delhi ISBT → Manali → Old Manali.
- **Dataset Notice**: NAVIX uses a curated, deterministic **Demo Transit Dataset** containing 9 transit nodes and 18 multi-modal transit schedules to demonstrate multi-modal A* routing, time-dependent transfer validation, and DP budget allocation.

---

## 🔐 Authentication & Roles

- **Traveler Role**: Standard user accounts capable of planning trips, saving generated itineraries to their profile, and viewing saved journeys.
- **Admin Role**: Administrative accounts with access to `/admin` dashboard for viewing transit nodes, schedules, user registries, and saved trip allocations.

---

## ⚠️ Known Limitations

1. **Demo Transit Graph**: Routing uses curated demo schedules rather than live API integrations with IRCTC or RedBus.
2. **Geographic Coverage**: Supported demo nodes are limited to Tier-2/Tier-3 corridor hubs (Sangli, Miraj, Pune, Mumbai, Delhi, Chandigarh, Manali, Old Manali).
3. **Map Visualization**: Node connections on the Leaflet map display topological hub-to-hub polylines rather than exact physical rail track / road polylines.
4. **No Direct Booking**: NAVIX generates budget-optimized itineraries but does not directly execute ticket purchases or payment processing.
