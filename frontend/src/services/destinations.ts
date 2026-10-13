import { getApi, postApi } from './api';

export interface DestinationSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  categories: string[];
  description: string;
  ideal_duration: string;
  best_season: string;
  daily_budget: number;
  hero_image: string;
  rating: number;
  popularity_score: number;
  data_state: string;
}

export interface AttractionItem {
  id: string;
  destination_id: string;
  destination_slug: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  rating: number;
  visit_duration_minutes: number;
  entry_fee: number;
  opening_time: string;
  closing_time: string;
  description: string;
  image: string;
  recommended_score: number;
  data_state: string;
  price_state: string;
}

export interface FoodPlaceItem {
  id: string;
  destination_id: string;
  destination_slug: string;
  name: string;
  cuisine: string;
  dietary: string;
  rating: number;
  cost_for_two: number;
  opening_hours: string;
  latitude: number;
  longitude: number;
  speciality: string;
  image: string;
  data_state: string;
  price_state: string;
}

export interface HotelItem {
  id: string;
  destination_id: string;
  destination_slug: string;
  name: string;
  category: string;
  price_per_night: number;
  rating: number;
  room_type: string;
  amenities: string[];
  latitude: number;
  longitude: number;
  image: string;
  availability: boolean;
  data_state: string;
  price_state: string;
}

export interface DestinationDetail extends DestinationSummary {
  attractions: AttractionItem[];
  food_places: FoodPlaceItem[];
  hotels: HotelItem[];
}

export interface DestinationListResponse {
  total: number;
  page: number;
  limit: number;
  items: DestinationSummary[];
}

export interface TransportAlternative {
  id: string;
  label: 'RECOMMENDED' | 'CHEAPEST' | 'FASTEST' | 'COMFORT' | 'LOWEST TRANSFERS';
  profile: string;
  summary: {
    total_transport_cost: number;
    total_elapsed_minutes: number;
    total_travel_minutes: number;
    total_layover_minutes: number;
    number_of_segments: number;
    number_of_transfers: number;
    algorithm_used: string;
    data_source: string;
  };
  segments: Array<{
    schedule_id: string;
    source_node_id: string;
    source_node_name: string;
    source_city: string;
    dest_node_id: string;
    dest_node_name: string;
    dest_city: string;
    provider: string;
    transport_mode: string;
    departure_time: string;
    arrival_time: string;
    duration_minutes: number;
    cost: number;
    layover_before_minutes?: number;
    transfer_status?: string;
  }>;
  modes: string[];
  operators: string[];
  departure_time: string;
  arrival_time: string;
  transfers: number;
  total_cost: number;
  duration_minutes: number;
}

export interface AlternativesResponse {
  origin: string;
  destination: string;
  alternatives: TransportAlternative[];
}

export async function getDestinations(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<DestinationListResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit || 60));

  const qs = query.toString();
  return getApi<DestinationListResponse>(`/api/v1/destinations${qs ? `?${qs}` : ''}`);
}

export async function getDestinationDetail(slug: string): Promise<DestinationDetail> {
  return getApi<DestinationDetail>(`/api/v1/destinations/${encodeURIComponent(slug)}`);
}

export async function getDestinationAttractions(slug: string): Promise<AttractionItem[]> {
  return getApi<AttractionItem[]>(`/api/v1/destinations/${encodeURIComponent(slug)}/attractions`);
}

export async function getDestinationFood(slug: string): Promise<FoodPlaceItem[]> {
  return getApi<FoodPlaceItem[]>(`/api/v1/destinations/${encodeURIComponent(slug)}/food`);
}

export async function getDestinationHotels(slug: string): Promise<HotelItem[]> {
  return getApi<HotelItem[]>(`/api/v1/destinations/${encodeURIComponent(slug)}/hotels`);
}

export async function getTransportAlternatives(
  origin: string,
  destination: string,
  departureTime?: string
): Promise<AlternativesResponse> {
  return postApi<AlternativesResponse>('/api/v1/routes/alternatives', {
    origin,
    destination,
    departure_time: departureTime || '2026-10-26T06:00:00'
  });
}
