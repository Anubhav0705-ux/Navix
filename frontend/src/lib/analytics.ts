/**
 * NAVIX Privacy-Safe First-Party Analytics Client
 * Dispatches non-identifying event telemetry using anonymous session identifiers.
 * Strictly avoids capturing PII, passwords, authentication tokens, or form payloads.
 */

export type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'EXPLORE_SEARCH'
  | 'DESTINATION_VIEW'
  | 'PLANNER_STARTED'
  | 'PLANNER_COMPLETED'
  | 'TRIP_SAVED'
  | 'TRIP_DELETED'
  | 'STORY_VIEW';

function getOrCreateAnonymousSessionId(): string {
  if (typeof window === 'undefined') return 'server_session_placeholder';
  try {
    let sessId = sessionStorage.getItem('navix_anon_session_id');
    if (!sessId) {
      sessId = `anon_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      sessionStorage.setItem('navix_anon_session_id', sessId);
    }
    return sessId;
  } catch {
    return `anon_${Math.random().toString(36).substring(2, 12)}`;
  }
}

export function trackEvent(
  eventType: AnalyticsEventType,
  metadata: Record<string, string | number | boolean> = {},
  route?: string
) {
  if (typeof window === 'undefined') return;

  try {
    const anonymous_session_id = getOrCreateAnonymousSessionId();
    const currentRoute = route || window.location.pathname;

    // Filter metadata to avoid any accidental key leaks
    const safeMeta: Record<string, string | number | boolean> = {};
    for (const [key, val] of Object.entries(metadata)) {
      const k = key.toLowerCase();
      if (
        !k.includes('password') &&
        !k.includes('token') &&
        !k.includes('jwt') &&
        !k.includes('secret') &&
        !k.includes('email') &&
        !k.includes('phone') &&
        !k.includes('auth')
      ) {
        safeMeta[key] = typeof val === 'string' ? val.slice(0, 100) : val;
      }
    }

    fetch('/api/v1/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        route: currentRoute,
        anonymous_session_id,
        metadata: safeMeta,
      }),
    }).catch(() => {
      // Non-blocking fail-safe
    });
  } catch {
    // Fail safe
  }
}
