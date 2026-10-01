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

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('navix_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function fetchApi<T>(endpoint: string, method: string = 'GET', body?: unknown): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: getAuthHeaders(),
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

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

export async function postApi<T>(endpoint: string, body: unknown): Promise<T> {
  return fetchApi<T>(endpoint, 'POST', body);
}

export async function getApi<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, 'GET');
}

export async function deleteApi<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, 'DELETE');
}
