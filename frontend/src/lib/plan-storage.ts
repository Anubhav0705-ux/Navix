import { TripPlanResult } from '@/types';

const STORAGE_KEY = 'navix_active_trip_plan';

export function saveTripPlan(plan: TripPlanResult): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // Fallback if sessionStorage is full or unavailable
    }
  }
}

export function getTripPlan(): TripPlanResult | null {
  if (typeof window !== 'undefined') {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as TripPlanResult;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function clearTripPlan(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Fallback
    }
  }
}
