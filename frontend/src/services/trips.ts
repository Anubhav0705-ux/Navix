import { postApi, getApi, deleteApi } from './api';
import { TripPlanRequest, TripPlanResult, RouteSearchResult } from '@/types';

export interface SavedTripItem {
  trip_id: string;
  origin: string;
  destination: string;
  travel_date: string;
  budget_cap: number;
  total_cost: number;
  remaining_budget: number;
  budget_status: string;
  created_at: string;
  plan: TripPlanResult;
}

export async function requestTripPlan(request: TripPlanRequest): Promise<TripPlanResult> {
  return postApi<TripPlanResult>('/api/v1/trips/plan', request);
}

export async function requestRouteSearch(request: {
  origin: string;
  destination: string;
  profile?: string;
  max_transport_budget?: number;
  departure_time?: string;
}): Promise<RouteSearchResult> {
  return postApi<RouteSearchResult>('/api/v1/routes/search', request);
}

export async function saveTrip(plan: TripPlanResult): Promise<{ status: string; trip_id: string; message: string }> {
  return postApi<{ status: string; trip_id: string; message: string }>('/api/v1/trips/saved', { plan });
}

export async function getSavedTrips(): Promise<SavedTripItem[]> {
  return getApi<SavedTripItem[]>('/api/v1/trips/saved');
}

export async function deleteSavedTrip(trip_id: string): Promise<{ status: string; message: string }> {
  return deleteApi<{ status: string; message: string }>(`/api/v1/trips/saved/${trip_id}`);
}
