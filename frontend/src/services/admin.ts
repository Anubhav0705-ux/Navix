import { getApi } from './api';

export interface AdminNode {
  node_id: string;
  name: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

export interface AdminSchedule {
  schedule_id: string;
  provider: string;
  source_node_id: string;
  dest_node_id: string;
  departure_time: string;
  arrival_time: string;
  base_cost: number;
}

export interface AdminUser {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminTrip {
  trip_id: string;
  traveler_id: string;
  origin: string;
  destination: string;
  travel_date: string;
  budget_cap: number;
}

export async function fetchAdminNodes(): Promise<AdminNode[]> {
  return getApi<AdminNode[]>('/api/v1/admin/nodes');
}

export async function fetchAdminSchedules(): Promise<AdminSchedule[]> {
  return getApi<AdminSchedule[]>('/api/v1/admin/schedules');
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  return getApi<AdminUser[]>('/api/v1/admin/users');
}

export async function fetchAdminTrips(): Promise<AdminTrip[]> {
  return getApi<AdminTrip[]>('/api/v1/admin/trips');
}
