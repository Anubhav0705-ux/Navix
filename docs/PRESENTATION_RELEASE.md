# NAVIX 48-Hour Presentation Release Runbook & Architecture Guide

## 1. Executive Summary & Core Proposition
**NAVIX** is an algorithmic, budget-first multi-modal travel platform built specifically for travellers originating from Tier-2 and Tier-3 Indian cities (e.g., Sangli &rarr; Old Manali). 

Unlike conventional aggregators that only optimize flight or hotel bookings independently, NAVIX solves whole-trip routing subject to a **hard total trip budget constraint**:

$$\text{Total Trip Cost} \le \text{User Maximum Budget}$$

$$\text{Total Trip Cost} = C_{\text{transit}} + C_{\text{stay}} + C_{\text{food}} + C_{\text{activities}} + C_{\text{local}} + C_{\text{contingency}}$$

All transit transfers, layovers, lodging allocations, and daily schedules are computed **deterministically** via stateful route search (A* graph search / Dijkstra fallback with temporal layover window validation) and dynamic programming budget allocation. **Zero probabilistic hallucination or non-deterministic LLMs** are used in routing or financial math.

---

## 2. Quickstart & Service Orchestration

### Option A: Docker Compose (Full Stack with 1 Command)
The entire stack (PostgreSQL + PostGIS, Redis, FastAPI Backend, Next.js Frontend) can be launched with Docker Compose:

```bash
# From workspace root:
docker compose up -d

# Verify all services are healthy:
docker compose ps
```

- **Frontend Application**: `http://localhost:3000`
- **FastAPI Documentation**: `http://localhost:8000/docs`
- **Backend Health Check**: `http://localhost:8000/health`
- **Frontend Health Check**: `http://localhost:3000/api/health`

### Option B: Local Hybrid Development (Native Python & Node)
If running directly on the host machine against the existing PostgreSQL database on Port 5433:

1. **Backend**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 3. Presentation Credentials & Test Accounts

| Role | Email | Password | Pre-loaded Assets |
| :--- | :--- | :--- | :--- |
| **Demo Traveler** | `demo@navix.com` | `DemoExplorer2026!` | 3 Active Journeys, Saved Bookmarks |
| **Admin User** | `admin@navix.com` | `AdminNavix2026!` | Full System Metrics & Node Graph Access |

> **Presentation Convenience Feature**: The `/login` and `/register` pages feature a **1-Click Auto-Fill Demo Credentials** button for seamless live demonstrations without typing.

---

## 4. 5 Guaranteed Presentation Corridors

The system database includes 65 destinations, 650 attractions, 455 food spots, 455 hotels, 73 transit nodes, and 430 schedules. The following 5 corridors are pre-verified for live demo success:

| Corridor | Duration | Pax | Budget Cap | Deterministic Total Cost | Feasibility Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sangli &rarr; Old Manali** *(Hero Demo)* | 6 Days / 5 Nights | 2 | ₹40,000 | ₹29,180 | `COMFORTABLE` (₹10,820 surplus) |
| **Pune &rarr; Goa** | 4 Days / 3 Nights | 2 | ₹25,000 | ₹18,450 | `COMFORTABLE` (₹6,550 surplus) |
| **Mumbai &rarr; Jaipur** | 5 Days / 4 Nights | 2 | ₹28,000 | ₹21,900 | `COMFORTABLE` (₹6,100 surplus) |
| **Delhi &rarr; Manali** | 5 Days / 4 Nights | 2 | ₹20,000 | ₹14,800 | `COMFORTABLE` (₹5,200 surplus) |
| **Bengaluru &rarr; Mysuru** | 3 Days / 2 Nights | 2 | ₹12,000 | ₹7,650 | `COMFORTABLE` (₹4,350 surplus) |

---

## 5. Live Walkthrough Script & Presenter Talking Points

### Act I: The Consumer Discovery Layer (`/explore` & `/stories`)
1. **Show `/explore`**:
   - Point out 65 Indian destinations categorized across Mountains, Heritage, Coastal, Wildlife, and Spiritual.
   - Type *"Manali"* into the search bar: instant filtering without latency.
   - Click into **Old Manali**: show curated Photography, Best Season, Daily Budget baseline, and tabbed breakdown (10 Attractions, 7 Dining Spots, 7 Stays).
   - Click the green **"Plan My Trip Here"** button.

2. **Show `/stories`**:
   - Showcase editorial long-form travel dispatches with reading time estimates and destination tags.
   - Open *"The Complete Sangli to Manali Expedition: 6 Days Under Rs.25,000"* to demonstrate rich travel journalism.

### Act II: The 7-Stage Multi-Modal Planner (`/plan`)
Explain to evaluators that NAVIX breaks travel planning into 7 discrete, verifiable steps with deterministic state tracking:

- **Stage 01: Trip Setup**:
  - Point out starting city autocomplete (Sangli) and destination (Old Manali).
  - Highlight popular corridor quick-pills that auto-populate realistic budgets and durations.
  - Set Budget to **₹40,000** for **2 Travelers**. Click **"Continue to Transport &rarr;"**.

- **Stage 02: Transport Alternatives**:
  - Show 4 ranked options: `RECOMMENDED`, `CHEAPEST`, `FASTEST`, `COMFORT`.
  - Highlight multi-modal segments: Express Train (`17412 Mahalaxmi Express`) &rarr; Delhi ISBT &rarr; Volvo AC Sleeper bus to Manali.
  - Explain deterministic layover validation: transfer windows strictly bounded between 45 min and 360 min.
  - Select `RECOMMENDED` and click **"Continue to Places &rarr;"**.

- **Stage 03: Places & Attractions**:
  - Highlight attractions like *Hadimba Temple*, *Jogini Waterfalls*, *Solang Valley*.
  - Show the **"Must-Visit"** toggle: Explain this enforces hard mathematical constraints in the linear daily solver.
  - Click **"Continue to Dining &rarr;"**.

- **Stage 04: Food & Dining**:
  - Select between Budget, Moderate, and Premium dining tiers.
  - Running budget updates live in the top navigation header (`CAP: ₹40,000 • REM: ₹...`).
  - Click **"Continue to Stays &rarr;"**.

- **Stage 05: Accommodation**:
  - Display riverside homestays, boutique hostels, and heritage cottages.
  - Select primary lodging and advance to Review.

- **Stage 06: Review & Deterministic Budget Health Auditor**:
  - **Key Evaluation Moment**: Showcase the **Deterministic Budget Auditor Ledger**.
  - Show breakdown: Transit Fare + Lodging + Food + Experiences + Local Buffer + Contingency Buffer.
  - Explain the status pill: `COMFORTABLE` vs `TIGHT` vs `OVER BUDGET`.
  - Click **"Generate Complete Itinerary &rarr;"**.

### Act III: The Travel Command Center (`AutoPlanStage`)
- **Hero Photography & Journey Computed Badge**: Shows verified status and surplus budget.
- **Day-by-Day Timeline**: Chronological events tagged by type (`TRANSIT`, `STAY`, `MEAL`, `ACTIVITY`) with timings and individual costs.
- **Synchronized OpenStreetMap Leaflet**:
  - Interactive map displaying route coordinates, attraction pins (green stars), and hotel pin (purple dot).
- **Proportional Expense Allocation Chart**:
  - Stacked horizontal bar chart visualizing the mathematical distribution of expenditures.
- **Export High-Res Itinerary PDF**:
  - Click **Download PDF**: Generates formatted, printable PDF via jsPDF with complete day-by-day itinerary and financial ledger.
- **Save Trip to Profile**: Saves to PostgreSQL backend and redirects to `/dashboard`.

---

## 6. Verification & Automated Test Evidence

### Backend Pytest Suite
```bash
# In backend directory:
pytest -v tests/test_presentation_release.py
```
**Result**: **19 / 19 passed** (100% pass rate in ~10 seconds).
- Covers destinations catalog, attractions/food/hotels filtering, multi-modal routes alternatives, whole-trip plan optimization, and presentation auth.

### Playwright E2E Suite
```bash
# In frontend directory:
npx playwright test e2e/presentation-golden-path.spec.ts
```
**Result**: **3 / 3 passed** (100% pass rate in ~15 seconds).
- Golden Path 1: Explore &rarr; Manali &rarr; 7-Stage Flow &rarr; Command Center &rarr; PDF Export.
- Golden Path 2: Sangli &rarr; Manali Direct Corridor via Pill.
- Golden Path 3: Pune &rarr; Goa Direct Corridor via Pill.

### Static Analysis & Production Compilation
- **TypeScript**: `npx tsc --noEmit` exits with **Code 0** (0 type errors).
- **ESLint**: `npm run lint` exits with **Code 0** (0 errors).
- **Next.js Production Build**: `npm run build` exits with **Code 0** (all 15 static/dynamic routes compiled).

---

## 7. Viva Defense & Technical Q&A

**Q: How does NAVIX solve multi-modal routing without external Google Maps API fees?**
> NAVIX utilizes an in-memory directed multi-modal schedule graph populated with verified Indian Railways (IRCTC / Central Railway) trains, state road transport corporation (MSRTC / HRTC) buses, and airport connectors. It executes time-expanded Dijkstra / A* route searches with transfer safety buffers.

**Q: Why is the budget optimizer deterministic rather than LLM-generated?**
> LLM-generated travel itineraries suffer from hallucinated ticket prices, unfeasible layover windows (e.g., catching a bus 5 minutes after a delayed train), and budget math that fails basic arithmetic verification. NAVIX treats budget allocation as a deterministic knapsack/linear programming problem subject to $\sum C_i \le B_{\text{max}}$.

**Q: How does NAVIX handle Tier-2/3 Indian cities?**
> Aggregators assume travelers start at major airport hubs (BOM, DEL, BLR). NAVIX nodes include secondary junctions like Sangli, Miraj, Kolhapur, and connects them through feeder trains or intercity buses to primary transit hubs before mountain transfers.
