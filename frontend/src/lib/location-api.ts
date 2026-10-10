import {
  LocationSearchResponse,
  LocationDetailResponse,
  LocationCoverageResponse
} from '@/types';

const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = rawBase.endsWith('/api/v1')
  ? rawBase.substring(0, rawBase.length - '/api/v1'.length)
  : rawBase.replace(/\/+$/, '');

export interface LocationSearchOptions {
  type?: 'SETTLEMENT' | 'TRANSIT_FACILITY' | 'LOCALITY' | 'POI';
  facilityType?: 'RAIL_STATION' | 'AIRPORT' | 'BUS_TERMINAL' | 'METRO_STATION';
  limit?: number;
  signal?: AbortSignal;
}

/**
 * Searches locations (settlements, transit facilities, aliases, station/airport codes)
 * using the NAVIX Phase 8 Location Search API.
 */
export async function searchLocations(
  query: string,
  options: LocationSearchOptions = {}
): Promise<LocationSearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query: '', total_matches: 0, results: [] };
  }

  const params = new URLSearchParams({ q: trimmed });
  if (options.type) params.append('type', options.type);
  if (options.facilityType) params.append('facility_type', options.facilityType);
  if (options.limit) params.append('limit', options.limit.toString());

  const url = `${API_BASE_URL}/api/v1/locations/search?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: options.signal
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown server error');
    throw new Error(`Location search request failed (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Resolves a canonical location detail by its NAVIX entity ID (e.g. stl_sangli, fac_sangli_sli).
 */
export async function getLocationDetail(
  locationId: string,
  signal?: AbortSignal
): Promise<LocationDetailResponse | null> {
  if (!locationId) return null;

  const url = `${API_BASE_URL}/api/v1/locations/${encodeURIComponent(locationId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Location detail fetch failed (${res.status})`);
  }

  return res.json();
}

/**
 * Fetches routing coverage status for a specified location.
 */
export async function getLocationCoverage(
  locationId: string,
  signal?: AbortSignal
): Promise<LocationCoverageResponse | null> {
  if (!locationId) return null;

  const url = `${API_BASE_URL}/api/v1/locations/${encodeURIComponent(locationId)}/coverage`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Coverage fetch failed (${res.status})`);

  return res.json();
}
