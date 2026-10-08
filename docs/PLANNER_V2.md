# NAVIX — Planner Experience Architecture V2

> **Core Philosophy**: NAVIX is a constraint-based automatic travel planner. The user provides constraints, trip personality, and preferences. NAVIX automatically solves the route, transfers, stay, food, activities, and daily schedule under one total budget cap.

---

## 1. Stage Architecture (7 Stages)

| Stage | Name | Status | Description |
| :--- | :--- | :--- | :--- |
| **01** | `TRIP SETUP` | **Active (Phase 2)** | Origin, Destination, Dates, Budget Cap, Travellers & Profiles, Trip Personality, Travel Pace |
| **02** | `TRANSPORT` | **Active Shell (Phase 2)** | Transport Mode Choices (Train, Bus, Metro, Local Shuttles), Routing Profile & Transfer Preferences |
| **03** | `PLACES` | **Muted (Phase 3)** | Must-see attraction discovery & activity preferences |
| **04** | `FOOD` | **Muted (Phase 3)** | Dining style & regional food preferences |
| **05** | `STAY` | **Muted (Phase 3)** | Lodging tier & accommodation style choices |
| **06** | `AUTO PLAN` | **Active Execution** | Time-dependent A* search & DP Knapsack budget optimization solver execution |
| **07** | `REVIEW` | **Active Review** | Final multi-modal itinerary, budget receipt breakdown, Leaflet map, PDF export |

---

## 2. Frontend State Architecture & Persistence

State is managed cleanly via [`PlannerContext.tsx`](file:///c:/Users/anubh/OneDrive/Desktop/Navix/frontend/src/context/PlannerContext.tsx) using a `useReducer` architecture.

- **Persistence Key**: `sessionStorage.getItem('navix_planner_v2')`
- **Behavior**: Page refresh or navigation to stories/home does not destroy planning progress.

### State Schema Overview

```typescript
export interface PlannerState {
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  maximumBudget: number;
  travellers: number;
  travellerProfiles: TravellerProfile[];
  
  personalities: ('Adventure' | 'Relaxed' | 'Culture' | 'Food' | 'Nature' | 'Mixed')[];
  travelPace: 'Relaxed' | 'Balanced' | 'Packed';
  mustInclude: string[];
  avoid: string[];

  profile: 'CHEAPEST' | 'BALANCED' | 'FASTER';
  stayPreference: 'BUDGET' | 'STANDARD' | 'COMFORT';
  foodPreference: 'BASIC' | 'BALANCED' | 'FLEXIBLE';
  activityPreference: 'LOW' | 'MEDIUM' | 'HIGH';

  preferredModes: ('TRAIN' | 'BUS' | 'METRO' | 'LOCAL')[];
  maxTransfers: 'Any' | '≤3' | '≤2';
  allowOvernight: boolean;
}
```

---

## 3. Backend Compatibility Mapping

To maintain 100% backward and forward compatibility with the FastAPI backend endpoint `POST /api/v1/trips/plan`, `getBackendPayload()` extracts only the active schema fields:

```typescript
{
  origin,
  destination,
  departure_date: departureDate,
  return_date: returnDate,
  travellers,
  maximum_budget: maximumBudget,
  profile,
  stay_preference: stayPreference,
  food_preference: foodPreference,
  activity_preference: activityPreference
}
```

Additional Phase 2 UI metadata (traveller names/ages, trip personality chips, travel pace) are stored in the frontend planning workspace for future preference scoring.
