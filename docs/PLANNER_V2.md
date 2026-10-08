# NAVIX — Planner Experience Architecture V2

> **Core Philosophy**: NAVIX is a constraint-based automatic travel planner. The user provides constraints, trip personality, and preferences. NAVIX automatically solves the route, transfers, stay, food, activities, and daily schedule under one total budget cap.

---

## 1. Stage Architecture (7 Stages)

| Stage | Name | Status | Description |
| :--- | :--- | :--- | :--- |
| **01** | `TRIP SETUP` | **Active (Phase 2)** | Origin, Destination, Dates, Budget Cap, Travellers & Profiles, Trip Personality, Travel Pace |
| **02** | `TRANSPORT` | **Active Discovery (Phase 3)** | Multi-modal candidate routes (Balanced, Cheapest, Faster), Layover Safety windows, Mode Filters |
| **03** | `PLACES` | **Active Discovery (Phase 3)** | Optimizer-backed activities vs discovery-only guide entries, Category filters & personality sorting |
| **04** | `FOOD` | **Active Discovery (Phase 3)** | Functional budget dining tiers (Basic, Balanced, Flexible) & Himachali culinary inspiration guide |
| **05** | `STAY` | **Active Discovery (Phase 3)** | Accommodation tiers (Budget, Standard, Comfort), rate/night calculator & trip workspace summary |
| **06** | `AUTO PLAN` | **Active Intelligence (Phase 4)** | Automatic Time-Dependent Scheduler & Experience Utility Maximizer (01-05 auto timeline generator) |
| **07** | `REVIEW` | **Active Review (Phase 5 Target)** | Final multi-modal itinerary, budget receipt breakdown, Leaflet map, PDF export |

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

  selectedPlaces: string[];
  selectedDiscoveryPlaces: string[];
  foodPreferences: string[];
  dietPreference: 'Vegetarian' | 'Non-Vegetarian' | 'No Preference';
  departurePreference: 'Any' | 'Morning' | 'Afternoon' | 'Evening';
  travelComfort: 'Basic' | 'Standard' | 'Comfort';
  selectedRouteOption: 'BALANCED' | 'CHEAPEST' | 'FASTER';
}
```

---

## 3. Backend Compatibility Mapping

To maintain 100% backward and forward compatibility with the FastAPI backend endpoint `POST /api/v1/trips/plan`, `getBackendPayload()` formats:

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
  activity_preference: activityPreference,
  planner_preferences: {
    selected_activity_ids: selectedPlaces,
    trip_personalities: personalities,
    pace: travelPace.toUpperCase(),
    must_include: mustInclude,
    avoid,
    food_preferences: foodPreferences,
    departure_preference: departurePreference,
    allow_overnight: allowOvernight
  }
}
```

