'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  OptimizationProfile, StayPreference, FoodPreference,
  ActivityPreference, TripPlanRequest
} from '@/types';
import { getCurrentUser } from '@/services/auth';

export type PlannerStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TravellerProfile {
  id: string;
  name: string;
  ageGroup: '18-24' | '25-34' | '35-49' | '50+';
  pace: 'Relaxed' | 'Balanced' | 'Packed';
}

export type TripPersonality = 'Adventure' | 'Relaxed' | 'Culture' | 'Food' | 'Nature' | 'Mixed';

export interface PlannerState {
  stage: PlannerStage;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  maximumBudget: number;
  travellers: number;
  travellerProfiles: TravellerProfile[];
  
  // Trip Style & Personality
  personalities: TripPersonality[];
  travelPace: 'Relaxed' | 'Balanced' | 'Packed';
  mustInclude: string[];
  avoid: string[];

  // Transport & Preferences (Phase 2 Framework)
  profile: OptimizationProfile;
  stayPreference: StayPreference;
  foodPreference: FoodPreference;
  activityPreference: ActivityPreference;

  preferredModes: ('TRAIN' | 'BUS' | 'METRO' | 'LOCAL')[];
  maxTransfers: 'Any' | '≤3' | '≤2';
  allowOvernight: boolean;

  // Phase 3 Discovery Selections & Metadata
  selectedPlaces: string[];
  selectedDiscoveryPlaces: string[];
  foodPreferences: string[];
  dietPreference: 'Vegetarian' | 'Non-Vegetarian' | 'No Preference';
  departurePreference: 'Any' | 'Morning' | 'Afternoon' | 'Evening';
  travelComfort: 'Basic' | 'Standard' | 'Comfort';
  selectedRouteOption: 'BALANCED' | 'CHEAPEST' | 'FASTER';
}

export type PlannerAction =
  | { type: 'SET_STAGE'; payload: PlannerStage }
  | { type: 'SET_ORIGIN'; payload: string }
  | { type: 'SET_DESTINATION'; payload: string }
  | { type: 'SET_DEPARTURE_DATE'; payload: string }
  | { type: 'SET_RETURN_DATE'; payload: string }
  | { type: 'SET_MAXIMUM_BUDGET'; payload: number }
  | { type: 'SET_TRAVELLERS_COUNT'; payload: number }
  | { type: 'ADD_TRAVELLER_PROFILE'; payload: TravellerProfile }
  | { type: 'UPDATE_TRAVELLER_PROFILE'; payload: { id: string; profile: Partial<TravellerProfile> } }
  | { type: 'REMOVE_TRAVELLER_PROFILE'; payload: string }
  | { type: 'TOGGLE_PERSONALITY'; payload: TripPersonality }
  | { type: 'SET_TRAVEL_PACE'; payload: 'Relaxed' | 'Balanced' | 'Packed' }
  | { type: 'TOGGLE_MUST_INCLUDE'; payload: string }
  | { type: 'TOGGLE_AVOID'; payload: string }
  | { type: 'SET_PROFILE'; payload: OptimizationProfile }
  | { type: 'SET_STAY_PREFERENCE'; payload: StayPreference }
  | { type: 'SET_FOOD_PREFERENCE'; payload: FoodPreference }
  | { type: 'SET_ACTIVITY_PREFERENCE'; payload: ActivityPreference }
  | { type: 'TOGGLE_PREFERRED_MODE'; payload: 'TRAIN' | 'BUS' | 'METRO' | 'LOCAL' }
  | { type: 'SET_MAX_TRANSFERS'; payload: 'Any' | '≤3' | '≤2' }
  | { type: 'SET_ALLOW_OVERNIGHT'; payload: boolean }
  | { type: 'TOGGLE_SELECTED_PLACE'; payload: string }
  | { type: 'TOGGLE_DISCOVERY_PLACE'; payload: string }
  | { type: 'TOGGLE_FOOD_PREFERENCE'; payload: string }
  | { type: 'SET_DIET_PREFERENCE'; payload: 'Vegetarian' | 'Non-Vegetarian' | 'No Preference' }
  | { type: 'SET_DEPARTURE_PREFERENCE'; payload: 'Any' | 'Morning' | 'Afternoon' | 'Evening' }
  | { type: 'SET_TRAVEL_COMFORT'; payload: 'Basic' | 'Standard' | 'Comfort' }
  | { type: 'SET_ROUTE_OPTION'; payload: 'BALANCED' | 'CHEAPEST' | 'FASTER' }
  | { type: 'PREFILL_FROM_QUERY'; payload: Partial<PlannerState> };

const INITIAL_STATE: PlannerState = {
  stage: 1,
  origin: 'Sangli',
  destination: 'Old Manali',
  departureDate: '2026-12-12',
  returnDate: '2026-12-18',
  maximumBudget: 20000,
  travellers: 1,
  travellerProfiles: [
    { id: 'trv-1', name: 'Explorer 1', ageGroup: '25-34', pace: 'Balanced' }
  ],
  personalities: ['Adventure', 'Nature'],
  travelPace: 'Balanced',
  mustInclude: ['scenic places', 'local food'],
  avoid: ['too many transfers'],

  profile: 'BALANCED',
  stayPreference: 'STANDARD',
  foodPreference: 'BALANCED',
  activityPreference: 'MEDIUM',

  preferredModes: ['TRAIN', 'BUS'],
  maxTransfers: 'Any',
  allowOvernight: true,

  selectedPlaces: ['act_01', 'act_02', 'act_03'],
  selectedDiscoveryPlaces: ['disc_05'],
  foodPreferences: ['Local Cuisine', 'Café Hopping'],
  dietPreference: 'No Preference',
  departurePreference: 'Morning',
  travelComfort: 'Standard',
  selectedRouteOption: 'BALANCED'
};

const STORAGE_KEY = 'navix_planner_v2';

function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, stage: action.payload };
    case 'SET_ORIGIN':
      return { ...state, origin: action.payload };
    case 'SET_DESTINATION':
      return { ...state, destination: action.payload };
    case 'SET_DEPARTURE_DATE':
      return { ...state, departureDate: action.payload };
    case 'SET_RETURN_DATE':
      return { ...state, returnDate: action.payload };
    case 'SET_MAXIMUM_BUDGET':
      return { ...state, maximumBudget: action.payload };
    case 'SET_TRAVELLERS_COUNT': {
      const count = Math.max(1, Math.min(5, action.payload));
      const currentProfiles = [...state.travellerProfiles];
      if (currentProfiles.length < count) {
        for (let i = currentProfiles.length + 1; i <= count; i++) {
          currentProfiles.push({
            id: `trv-${i}`,
            name: `Traveller ${i}`,
            ageGroup: '25-34',
            pace: 'Balanced'
          });
        }
      } else if (currentProfiles.length > count) {
        currentProfiles.splice(count);
      }
      return { ...state, travellers: count, travellerProfiles: currentProfiles };
    }
    case 'UPDATE_TRAVELLER_PROFILE': {
      const updated = state.travellerProfiles.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload.profile } : p
      );
      return { ...state, travellerProfiles: updated };
    }
    case 'TOGGLE_PERSONALITY': {
      const exists = state.personalities.includes(action.payload);
      const next = exists
        ? state.personalities.filter((p) => p !== action.payload)
        : [...state.personalities, action.payload].slice(0, 3);
      return { ...state, personalities: next.length > 0 ? next : [action.payload] };
    }
    case 'SET_TRAVEL_PACE':
      return { ...state, travelPace: action.payload };
    case 'TOGGLE_MUST_INCLUDE': {
      const exists = state.mustInclude.includes(action.payload);
      const next = exists
        ? state.mustInclude.filter((m) => m !== action.payload)
        : [...state.mustInclude, action.payload];
      return { ...state, mustInclude: next };
    }
    case 'TOGGLE_AVOID': {
      const exists = state.avoid.includes(action.payload);
      const next = exists
        ? state.avoid.filter((a) => a !== action.payload)
        : [...state.avoid, action.payload];
      return { ...state, avoid: next };
    }
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, selectedRouteOption: action.payload };
    case 'SET_STAY_PREFERENCE':
      return { ...state, stayPreference: action.payload };
    case 'SET_FOOD_PREFERENCE':
      return { ...state, foodPreference: action.payload };
    case 'SET_ACTIVITY_PREFERENCE':
      return { ...state, activityPreference: action.payload };
    case 'TOGGLE_PREFERRED_MODE': {
      const exists = state.preferredModes.includes(action.payload);
      const next = exists
        ? state.preferredModes.filter((m) => m !== action.payload)
        : [...state.preferredModes, action.payload];
      return { ...state, preferredModes: next.length > 0 ? next : [action.payload] };
    }
    case 'SET_MAX_TRANSFERS':
      return { ...state, maxTransfers: action.payload };
    case 'SET_ALLOW_OVERNIGHT':
      return { ...state, allowOvernight: action.payload };
    case 'TOGGLE_SELECTED_PLACE': {
      const exists = state.selectedPlaces.includes(action.payload);
      const next = exists
        ? state.selectedPlaces.filter((p) => p !== action.payload)
        : [...state.selectedPlaces, action.payload];
      return { ...state, selectedPlaces: next };
    }
    case 'TOGGLE_DISCOVERY_PLACE': {
      const exists = state.selectedDiscoveryPlaces.includes(action.payload);
      const next = exists
        ? state.selectedDiscoveryPlaces.filter((p) => p !== action.payload)
        : [...state.selectedDiscoveryPlaces, action.payload];
      return { ...state, selectedDiscoveryPlaces: next };
    }
    case 'TOGGLE_FOOD_PREFERENCE': {
      const exists = state.foodPreferences.includes(action.payload);
      const next = exists
        ? state.foodPreferences.filter((f) => f !== action.payload)
        : [...state.foodPreferences, action.payload];
      return { ...state, foodPreferences: next };
    }
    case 'SET_DIET_PREFERENCE':
      return { ...state, dietPreference: action.payload };
    case 'SET_DEPARTURE_PREFERENCE':
      return { ...state, departurePreference: action.payload };
    case 'SET_TRAVEL_COMFORT':
      return { ...state, travelComfort: action.payload };
    case 'SET_ROUTE_OPTION':
      return { ...state, selectedRouteOption: action.payload, profile: action.payload };
    case 'PREFILL_FROM_QUERY':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface PlannerContextType {
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  getBackendPayload: () => TripPlanRequest;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(plannerReducer, INITIAL_STATE, (init) => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...init, ...JSON.parse(saved) };
        }
      } catch {
        // Fallback to initial
      }
    }
    return init;
  });

  // Prefill logged-in user name into Traveller 1 if default
  useEffect(() => {
    const user = getCurrentUser();
    if (user && state.travellerProfiles[0]?.name === 'Explorer 1') {
      dispatch({
        type: 'UPDATE_TRAVELLER_PROFILE',
        payload: { id: 'trv-1', profile: { name: user.name } }
      });
    }
  }, [state.travellerProfiles, dispatch]);

  // Save to sessionStorage on state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore quota errors
      }
    }
  }, [state]);

  const getBackendPayload = (): TripPlanRequest => {
    return {
      origin: state.origin,
      destination: state.destination,
      departure_date: state.departureDate,
      return_date: state.returnDate,
      travellers: state.travellers,
      maximum_budget: state.maximumBudget,
      profile: state.profile,
      stay_preference: state.stayPreference,
      food_preference: state.foodPreference,
      activity_preference: state.activityPreference,
      planner_preferences: {
        selected_activity_ids: state.selectedPlaces,
        trip_personalities: state.personalities,
        pace: state.travelPace.toUpperCase() as 'RELAXED' | 'BALANCED' | 'PACKED',
        must_include: state.mustInclude,
        avoid: state.avoid,
        food_preferences: state.foodPreferences,
        departure_preference: state.departurePreference,
        allow_overnight: state.allowOvernight
      }
    };
  };


  return (
    <PlannerContext.Provider value={{ state, dispatch, getBackendPayload }}>
      {children}
    </PlannerContext.Provider>
  );
};

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}
