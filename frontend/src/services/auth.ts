import { postApi } from './api';
import { UserResponse, TokenResponse } from '@/types';

const TOKEN_KEY = 'navix_auth_token';
const USER_KEY = 'navix_auth_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): UserResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token: string, user: UserResponse): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logoutSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const data = await postApi<TokenResponse>('/api/v1/auth/login', { email, password });
  setSession(data.access_token, data.user);
  return data;
}

export async function registerUser(name: string, email: string, password: string): Promise<TokenResponse> {
  const data = await postApi<TokenResponse>('/api/v1/auth/register', { name, email, password });
  setSession(data.access_token, data.user);
  return data;
}
