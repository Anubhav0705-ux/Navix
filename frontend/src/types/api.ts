export type OptimizationProfile = 'CHEAPEST' | 'BALANCED' | 'FASTER';
export type StayPreference = 'BUDGET' | 'STANDARD' | 'COMFORT';
export type FoodPreference = 'BASIC' | 'BALANCED' | 'FLEXIBLE';
export type ActivityPreference = 'LOW' | 'MEDIUM' | 'HIGH';
export type BudgetStatus = 'COMFORTABLE' | 'TIGHT' | 'EXCEEDED';
export type TransferStatus = 'SAFE' | 'TIGHT' | 'INVALID';
export type TransportMode = 'LOCAL' | 'TRAIN' | 'BUS' | 'METRO' | 'OTHER';

export interface UserResponse {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface TripPlanRequest {
  origin: string;
  destination: string;
  departure_date: string; // YYYY-MM-DD
  return_date: string;    // YYYY-MM-DD
  travellers: number;
  maximum_budget: number;
  profile: OptimizationProfile;
  stay_preference: StayPreference;
  food_preference: FoodPreference;
  activity_preference: ActivityPreference;
}

export interface RouteSegmentResult {
  schedule_id: string;
  source_node_id: string;
  source_node_name: string;
  source_city: string;
  dest_node_id: string;
  dest_node_name: string;
  dest_city: string;
  provider: string;
  transport_mode: TransportMode;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  cost: number;
  layover_before_minutes: number;
  transfer_status: TransferStatus;
}

export interface RouteSummary {
  total_transport_cost: number;
  total_elapsed_minutes: number;
  total_travel_minutes: number;
  total_layover_minutes: number;
  number_of_segments: number;
  number_of_transfers: number;
  algorithm_used: string;
  data_source: string;
}

export interface RouteSearchResult {
  origin: string;
  destination: string;
  profile: OptimizationProfile;
  segments: RouteSegmentResult[];
  summary: RouteSummary;
}

export interface SelectedStay {
  tier: string;
  name: string;
  cost_per_night: number;
  nights: number;
  total_cost: number;
  description: string;
}

export interface SelectedFood {
  tier: string;
  name: string;
  cost_per_day: number;
  days: number;
  total_cost: number;
  description: string;
}

export interface SelectedActivity {
  id: string;
  name: string;
  category: string;
  cost_per_person: number;
  total_cost: number;
  description: string;
}

export interface CostBreakdown {
  maximum_budget: number;
  transport_cost: number;
  accommodation_cost: number;
  food_cost: number;
  activities_cost: number;
  local_transport_cost: number;
  contingency_buffer: number;
  total_trip_cost: number;
  remaining_budget: number;
  budget_status: BudgetStatus;
}

export interface DailyItineraryItem {
  day_number: number;
  date: string;
  title: string;
  events: string[];
  estimated_daily_spend: number;
}

export interface TripPlanResult {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
  travellers: number;
  days: number;
  nights: number;
  profile: OptimizationProfile;
  data_source: string;
  route_summary: RouteSummary;
  route_segments: RouteSegmentResult[];
  stay: SelectedStay;
  food: SelectedFood;
  activities: SelectedActivity[];
  cost_breakdown: CostBreakdown;
  daily_itinerary: DailyItineraryItem[];
  decision_explanations: string[];
}

export interface APIErrorDetail {
  code: string;
  message: string;
}
