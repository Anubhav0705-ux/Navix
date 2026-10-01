import { APIErrorDetail } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export class APIError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'APIError';
    this.code = code;
  }
}

export async function postApi<T>(endpoint: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData: { detail?: APIErrorDetail | string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Fallback if JSON parsing fails
      }

      if (errorData.detail && typeof errorData.detail === 'object') {
        throw new APIError(errorData.detail.code || 'HTTP_ERROR', errorData.detail.message || response.statusText);
      } else if (typeof errorData.detail === 'string') {
        throw new APIError('HTTP_ERROR', errorData.detail);
      } else {
        throw new APIError('HTTP_ERROR', `Server error (${response.status})`);
      }
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof APIError) {
      throw err;
    }
    throw new APIError('NETWORK_ERROR', err instanceof Error ? err.message : 'Failed to connect to NAVIX server.');
  }
}
