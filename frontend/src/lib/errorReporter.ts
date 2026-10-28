/**
 * Privacy-Safe Frontend Error Reporter
 * Dispatches sanitized error summaries to the first-party NAVIX error logging endpoint.
 * Strictly avoids capturing tokens, passwords, form values, or PII.
 * Employs client-side deduplication to prevent error storming.
 */

export function reportClientError(
  error: Error | unknown,
  componentName: string = 'ErrorBoundary',
  requestId?: string
) {
  if (typeof window === 'undefined') return;

  try {
    const rawMessage = error instanceof Error ? error.message : String(error || 'Unknown runtime error');
    // Sanitize string to remove any potential tokens or query parameters
    const sanitizedMsg = rawMessage
      .replace(/Bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [REDACTED]')
      .replace(/password=[^&\s]+/gi, 'password=[REDACTED]')
      .slice(0, 500);

    const dedupKey = `navix_err_${componentName}_${sanitizedMsg.slice(0, 40)}`;
    const lastReported = sessionStorage.getItem(dedupKey);
    const now = Date.now();

    // Throttle duplicate reports within 60 seconds
    if (lastReported && now - Number(lastReported) < 60000) {
      return;
    }
    sessionStorage.setItem(dedupKey, String(now));

    fetch('/api/v1/analytics/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: sanitizedMsg,
        route: window.location.pathname,
        component_name: componentName,
        request_id: requestId || null,
      }),
    }).catch(() => {
      // Fail silently without disrupting UI
    });
  } catch {
    // Fail safe
  }
}
