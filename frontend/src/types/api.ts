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

export interface PlannerPreferences {
  selected_activity_ids?: string[];
  trip_personalities?: string[];
  pace?: 'RELAXED' | 'BALANCED' | 'PACKED';
  must_include?: string[];
  avoid?: string[];
  food_preferences?: string[];
  departure_preference?: string;
  allow_overnight?: boolean;
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
  planner_preferences?: PlannerPreferences;
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

export type ItineraryEventType = 'TRANSIT' | 'TRANSFER' | 'CHECK_IN' | 'ACTIVITY' | 'MEAL' | 'LOCAL_TRANSFER' | 'FREE_TIME' | 'STAY';

export interface StructuredItineraryEvent {
  event_type: ItineraryEventType;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  cost: number;
  location?: string;
  category?: string;
  reason?: string;
  travel_minutes_before?: number;
}

export interface DailyItineraryItem {
  day_number: number;
  date: string;
  title: string;
  events: string[];
  structured_events?: StructuredItineraryEvent[];
  estimated_daily_spend: number;
  day_theme?: string;
  total_activity_minutes?: number;
  total_travel_minutes?: number;
  experience_score?: number;
}


export interface ItineraryIntelligenceMetrics {
  activities_scheduled: number;
  total_experience_utility: number;
  local_travel_minutes: number;
  free_time_hours: number;
  budget_utilization_percent: number;
  must_visits_included: number;
  must_visits_total: number;
  pace_label: string;
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
  itinerary_metrics?: ItineraryIntelligenceMetrics;
}

export interface APIErrorDetail {
  code: string;
  message: string;
}

// Phase 8 Location Search & Resolution Types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AdminContext {
  country_id: string;
  country_name: string;
  state_id?: string;
  state_name?: string;
  district_id?: string;
  district_name?: string;
  display_hierarchy: string;
}

export interface ProviderCodeMap {
  provider: string;
  code: string;
}

export interface LocationSearchResultItem {
  id: string;
  entity_type: 'SETTLEMENT' | 'TRANSIT_FACILITY' | 'LOCALITY' | 'POI' | string;
  name: string;
  canonical_name: string;
  display_name: string;
  matched_on: 'provider_code' | 'exact_canonical' | 'exact_alias' | 'prefix_canonical' | 'prefix_alias' | 'fuzzy' | string;
  matched_name?: string;
  score: number;
  settlement_id?: string;
  settlement_name?: string;
  admin_context?: AdminContext;
  facility_type?: 'RAIL_STATION' | 'AIRPORT' | 'BUS_TERMINAL' | 'METRO_STATION' | string;
  codes: ProviderCodeMap[];
  coordinates: Coordinates;
  coverage_status: 'COVERED' | 'PARTIAL' | 'UNCOVERED' | string;
  badge: string;
}

export interface LocationSearchResponse {
  query: string;
  total_matches: number;
  results: LocationSearchResultItem[];
}

export interface LocationDetailResponse {
  id: string;
  entity_type: string;
  name: string;
  canonical_name: string;
  coordinates: Coordinates;
  coverage_status: string;
  badge: string;
  admin_context?: AdminContext;
  settlement_id?: string;
  settlement_name?: string;
  facility_type?: string;
  is_multimodal?: boolean;
  operating_status?: string;
  population_tier?: number;
  aliases: Record<string, unknown>[];
  provider_mappings: Record<string, unknown>[];
}

export interface LocationCoverageResponse {
  location_id: string;
  name: string;
  entity_type: string;
  coverage_status: string;
  badge: string;
  details: string;
}

export interface TransportStopDetail {
  stop_sequence: number;
  facility_id?: string;
  stop_name: string;
  arrival_time: string;
  departure_time: string;
  day_offset: number;
}

export interface TransportFareDetail {
  id: string;
  fare_class: string;
  fare_status: string;
  amount?: number | null;
  currency: string;
  is_estimated: boolean;
}

export interface TransportSearchServiceCard {
  service_id: string;
  service_code: string;
  service_name: string;
  provider_id: string;
  provider_name: string;
  operator_name?: string;
  transport_mode: string;
  origin_facility_id: string;
  origin_facility_name: string;
  destination_facility_id: string;
  destination_facility_name: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  day_offset: number;
  intermediate_stops_count: number;
  intermediate_stops: TransportStopDetail[];
  fares: TransportFareDetail[];
  fare_status: string;
  availability_status: string;
  data_state: string;
  data_class: string;
  is_expired: boolean;
  operates_on_selected_date: boolean;
  delay_seconds: number;
  active_alerts_count: number;
  license: string;
  attribution: string;
}

export interface TransportSearchResult {
  origin_facility_id: string;
  destination_facility_id: string;
  travel_date?: string;
  total_services_found: number;
  services: TransportSearchServiceCard[];
}

export interface SourceCoverageResponse {
  total_services: number;
  verified_services_count: number;
  synthetic_fixtures_count: number;
  modes_breakdown: Record<string, number>;
  total_calling_points: number;
  resolved_facilities_count: number;
  quarantined_stops_count: number;
  total_sources: number;
  approved_sources_count: number;
  active_providers_count: number;
}

// Phase 10: Real Data Foundation & Trip Setup Types
export interface ExternalPlaceRef {
  provider: 'FOURSQUARE' | string;
  provider_place_id: string;
  display_name: string;
  formatted_address?: string;
  locality?: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  categories?: string[];
  data_state?: string;
}

export interface PlaceSearchResponse {
  query: string;
  total_matches: number;
  results: ExternalPlaceRef[];
  provider: string;
  cached?: boolean;
}

export interface TripSetupPayload {
  origin: ExternalPlaceRef;
  destination: ExternalPlaceRef;
  departure_date: string;
  return_date: string;
  travellers: number;
  maximum_budget: number;
  currency?: string;
  travel_style?: string;
  personalities?: string[];
  must_include?: string[];
  avoid?: string[];
}

export interface TripSetupDraftResponse {
  trip_id: string;
  origin: ExternalPlaceRef;
  destination: ExternalPlaceRef;
  departure_date: string;
  return_date: string;
  duration_days: number;
  duration_nights: number;
  travellers: number;
  maximum_budget: number;
  currency: string;
  travel_style: string;
  status: string;
  next_step: string;
  message: string;
  created_at: string;
}

export interface ProviderHealthItem {
  provider: string;
  status: 'READY' | 'MISSING_CREDENTIALS' | 'UNAUTHORIZED' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'SANDBOX_ONLY' | 'EVALUATION';
  environment: string;
  public_consumer_enabled: boolean;
  message: string;
  last_checked_at: string;
}

export interface ProviderHealthResponse {
  timestamp: string;
  providers: Record<string, ProviderHealthItem>;
}
