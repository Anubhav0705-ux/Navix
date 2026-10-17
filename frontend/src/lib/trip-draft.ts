/**
 * NAVIX Trip Draft & Safe Return Navigation Helper
 *
 * Provides safe client-side persistence for non-sensitive trip draft parameters
 * when an unauthenticated guest starts planning, and enforces strict open-redirect
 * prevention upon authentication.
 */

export interface TripDraft {
  version: 1;
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  travellers?: string | number;
  budget?: string | number;
  travelStyle?: string;
  returnTo?: string;
  createdAt: number;
  expiresAt: number;
}

const DRAFT_STORAGE_KEY = 'navix_trip_draft_v1';
const DRAFT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Persists non-sensitive trip setup intent before redirecting guest to login.
 */
export function saveTripDraft(params: {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  travellers?: string | number;
  budget?: string | number;
  travelStyle?: string;
  returnTo?: string;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const draft: TripDraft = {
      version: 1,
      origin: params.origin?.trim() || '',
      destination: params.destination?.trim() || '',
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      travellers: params.travellers,
      budget: params.budget,
      travelStyle: params.travelStyle,
      returnTo: params.returnTo ? sanitizeReturnUrl(params.returnTo) : undefined,
      createdAt: Date.now(),
      expiresAt: Date.now() + DRAFT_TTL_MS,
    };

    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Fail gracefully if sessionStorage is restricted or full
  }
}

/**
 * Retrieves and validates the stored trip draft.
 * Automatically discards malformed or expired drafts.
 */
export function getTripDraft(): TripDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<TripDraft>;
    if (!parsed || parsed.version !== 1) {
      clearTripDraft();
      return null;
    }

    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      clearTripDraft();
      return null;
    }

    // Must have at least a destination or origin to be considered a valid draft
    if (!parsed.origin && !parsed.destination) {
      clearTripDraft();
      return null;
    }

    return parsed as TripDraft;
  } catch {
    clearTripDraft();
    return null;
  }
}

/**
 * Clears the temporary trip draft from storage.
 */
export function clearTripDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Fallback
  }
}

/**
 * Strict internal URL sanitizer to prevent open-redirect vulnerabilities.
 * Ensures the destination is an allowable internal route on NAVIX.
 */
export function sanitizeReturnUrl(url: string | null | undefined, fallback: string = '/dashboard'): string {
  if (!url || typeof url !== 'string') return fallback;

  const trimmed = url.trim();

  // Reject protocol-relative or external URLs (starts with // or contains ://)
  if (trimmed.startsWith('//') || trimmed.includes('://')) {
    return fallback;
  }

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return fallback;
  }

  // Must begin with a single forward slash
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  // Parse path without query to validate destination route
  const pathOnly = trimmed.split('?')[0].split('#')[0];

  const allowedPrefixes = [
    '/plan',
    '/dashboard',
    '/explore',
    '/stories',
    '/trip/result',
    '/admin',
    '/'
  ];

  const isAllowed = allowedPrefixes.some((prefix) => {
    if (prefix === '/') return pathOnly === '/';
    return pathOnly === prefix || pathOnly.startsWith(prefix + '/');
  });

  if (!isAllowed) {
    return fallback;
  }

  // Prevent redirect loops back to auth pages
  if (pathOnly === '/login' || pathOnly === '/register') {
    return fallback;
  }

  return trimmed;
}
