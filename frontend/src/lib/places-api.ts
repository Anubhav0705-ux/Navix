import {
  PlaceSearchResponse,
  TripSetupPayload,
  TripSetupDraftResponse,
  ProviderHealthResponse
} from '@/types';


const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = rawBase.endsWith('/api/v1')
  ? rawBase.substring(0, rawBase.length - '/api/v1'.length)
  : rawBase.replace(/\/+$/, '');

export interface PlaceSearchOptions {
  lat?: number;
  lon?: number;
  limit?: number;
  signal?: AbortSignal;
}

export class PlaceSearchError extends Error {
  code: string;
  constructor(message: string, code: string = 'SEARCH_ERROR') {
    super(message);
    this.name = 'PlaceSearchError';
    this.code = code;
  }
}

/**
 * Searches real places and destinations using Foursquare Places API.
 * Adheres strictly to NAVIX Truth-in-Data:
 * - Real provider results only.
 * - Never silently falls back to synthetic or seed data.
 * - Surfaces clear provider errors if rate-limited or temporarily unavailable.
 */
export async function searchPlaces(
  query: string,
  options: PlaceSearchOptions = {}
): Promise<PlaceSearchResponse> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return {
      query: trimmed,
      total_matches: 0,
      results: [],
      provider: 'FOURSQUARE',
      cached: false
    };
  }

  const params = new URLSearchParams({ q: trimmed });
  if (options.lat !== undefined && options.lon !== undefined) {
    params.append('lat', options.lat.toString());
    params.append('lon', options.lon.toString());
  }
  if (options.limit !== undefined) {
    params.append('limit', options.limit.toString());
  }

  const url = `${API_BASE_URL}/api/v1/places/search?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: options.signal
    });

    if (res.status === 429) {
      throw new PlaceSearchError(
        'Location search is temporarily rate limited. Please try again shortly.',
        'PROVIDER_RATE_LIMITED'
      );
    }

    if (res.status === 503) {
      throw new PlaceSearchError(
        'Location search is temporarily unavailable.',
        'PROVIDER_UNAVAILABLE'
      );
    }

    if (!res.ok) {
      let errorMsg = 'Location search is temporarily unavailable.';
      try {
        const errorJson = await res.json();
        if (errorJson?.detail?.message) {
          errorMsg = errorJson.detail.message;
        } else if (typeof errorJson?.detail === 'string') {
          errorMsg = errorJson.detail;
        }
      } catch {
        // Use default errorMsg
      }
      throw new PlaceSearchError(errorMsg, `HTTP_${res.status}`);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof PlaceSearchError) {
      throw err;
    }
    if ((err as Error)?.name === 'AbortError') {
      throw err;
    }
    throw new PlaceSearchError(
      'Location search is temporarily unavailable.',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Validates and creates a Step 1 Trip Setup draft on the backend.
 */
export async function createTripSetupDraft(
  payload: TripSetupPayload
): Promise<TripSetupDraftResponse> {
  const url = `${API_BASE_URL}/api/v1/trips/setup`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let errorDetail = 'Trip setup validation failed.';
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return await res.json();
}

/**
 * Fetches external provider health statuses for Dev/Admin inspection.
 */
export async function fetchPlacesHealth(): Promise<ProviderHealthResponse> {
  const url = `${API_BASE_URL}/api/v1/places/health`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Provider health check failed (${res.status})`);
  }
  return await res.json();
}
