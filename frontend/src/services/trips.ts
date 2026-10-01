import { postApi } from './api';
import { TripPlanRequest, TripPlanResult, RouteSearchResult } from '@/types';

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
