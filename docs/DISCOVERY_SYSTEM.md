# NAVIX — Travel Discovery System Architecture (Phase 3)

> **Core Principle**: NAVIX provides budget-aware interactive discovery across Transport, Places, Food, and Stay while maintaining strict data honesty and deterministic optimization integrity.

---

## 1. Data Honesty & Model Boundaries

To prevent misleading recommendations while offering rich visual discovery, NAVIX strictly separates:

### A. Optimizer-Backed Data (Source of Truth)
- Directly influences mathematical DP knapsack allocation and A* route computation.
- **Transport**: Deterministic transit schedules in database (`sch_101` to `sch_114`), layover safety windows ($\ge 30$ min).
- **Places**: Activity options in `backend/app/data/activities.py` (`act_01` to `act_04`).
- **Food**: Hard budget dining tiers (`BASIC` ₹300/day, `BALANCED` ₹700/day, `FLEXIBLE` ₹1,200/day).
- **Stay**: Hard budget lodging tiers (`BUDGET` ₹500/night, `STANDARD` ₹1,500/night, `COMFORT` ₹3,000/night).

### B. Curated Discovery-Only Guide Entries
- Visual inspiration & destination guide metadata that do **not** mutate backend optimizer costs unless integrated.
- Clearly labeled in the UI as `CURATED DISCOVERY GUIDE · DISCOVERY ONLY`.
- Examples: Vashisht Hot Springs (`disc_05`), Naggar Castle (`disc_06`), Mall Road Stroll (`disc_07`), Gulaba Meadows (`disc_08`).

---

## 2. Discovery Stage Architecture

### Stage 02: Transport Selection
- **Multi-Modal Route Options**:
  - `Option A (BALANCED)`: Sangli → Miraj → Delhi → Manali (~36h, ₹2,190) — *Goa Express + HRTC Volvo Bus*.
  - `Option B (CHEAPEST)`: Sangli → Pune → Delhi → Manali (~44h, ₹2,190) — *Jhelum Express + Sleeper Bus*.
  - `Option C (FASTER)`: Sangli → Mumbai → Delhi → Chandigarh → Manali (~38h, ₹4,050) — *Rajdhani + Vande Bharat + Deluxe Bus*.
- **Mode Filters**: Train, Bus, City Metro, Local Cab/Shuttle.
- **Constraints**: Layover safety validation ($\ge 30\text{ min}$ requirement) with explicit connection status tags (`SAFE Connection`).

### Stage 03: Places & Experiences
- **Category Filters**: `ALL`, `NATURE`, `CULTURE`, `ADVENTURE`, `WELLNESS`, `HERITAGE`, `FREE`, `UNDER ₹500`.
- **Personalization Sorting**: Automatically re-orders attraction cards based on Stage 01 trip personality selection (`Nature`, `Adventure`, `Culture`, etc.).
- **Selection State**: Tracks `selectedPlaces` (optimizer) and `selectedDiscoveryPlaces` (guide notes).

### Stage 04: Food & Dining Allocation
- **Functional Tier Selectors**:
  - `BASIC`: ₹300/day/person (Dhabas, Maggi, Thalis).
  - `BALANCED`: ₹700/day/person (Old Manali cafés, River Trout, Regional dishes).
  - `FLEXIBLE`: ₹1,200/day/person (Multi-course gourmet cafés, artisanal pizza & coffee).
- **Editorial Culinary Cards**: Traditional Himachali Dham, Grilled River Trout, Hot Siddu with Ghee, Riverside Café Hopping.

### Stage 05: Stay & Accommodation
- **Lodging Tiers**:
  - `BUDGET`: Old Manali Backpacker Hostel / Homestay (₹500/night · ₹3,000 total for 6 nights).
  - `STANDARD`: Manali Riverside Guest House (₹1,500/night · ₹9,000 total for 6 nights).
  - `COMFORT`: Himalayan Boutique Heritage Hotel (₹3,000/night · ₹18,000 total for 6 nights).
- **Selection Summary**: Live breakdown of configured route, places count, dining tier, and lodging rate under the total budget cap.

---

## 3. Session Persistence & Navigation
- All discovery selections persist in `sessionStorage` under `navix_planner_v2`.
- Top stage navigation bar allows jumping seamlessly between Stages 01, 02, 03, 04, and 05 without losing state.
