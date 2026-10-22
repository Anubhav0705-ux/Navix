import { postApi } from './api';
import { UserResponse, TokenResponse } from '@/types';

const TOKEN_KEY = 'navix_auth_token';
const USER_KEY = 'navix_auth_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

let cachedRawUser: string | null = null;
let cachedParsedUser: UserResponse | null = null;

export function getCurrentUser(): UserResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    cachedRawUser = null;
    cachedParsedUser = null;
    return null;
  }
  if (raw === cachedRawUser && cachedParsedUser !== null) {
    return cachedParsedUser;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedRawUser = raw;
    cachedParsedUser = parsed;
    return parsed;
  } catch {
    cachedRawUser = null;
    cachedParsedUser = null;
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getCurrentUser();
}

export function subscribeAuth(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('navix-auth-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('navix-auth-change', callback);
    window.removeEventListener('storage', callback);
  };
}

export function setSession(token: string, user: UserResponse): void {
  if (typeof window === 'undefined') return;
  const rawUser = JSON.stringify(user);
  cachedRawUser = rawUser;
  cachedParsedUser = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, rawUser);
  window.dispatchEvent(new Event('navix-auth-change'));
}

export function logoutSession(): void {
  if (typeof window === 'undefined') return;
  cachedRawUser = null;
  cachedParsedUser = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('navix-auth-change'));
}

export async function loginUser(email: string, password: string, hp_field?: string): Promise<TokenResponse> {
  const data = await postApi<TokenResponse>('/api/v1/auth/login', { email, password, hp_field });
  if (!data.must_change_password) {
    setSession(data.access_token, data.user);
  } else {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem('navix_temp_auth', 'true');
    }
  }
  return data;
}

export async function registerUser(name: string, email: string, password: string, hp_field?: string): Promise<TokenResponse> {
  const data = await postApi<TokenResponse>('/api/v1/auth/register', { name, email, password, hp_field });
  setSession(data.access_token, data.user);
  return data;
}

export async function requestPasswordReset(identifier: string, hp_field?: string): Promise<{ message: string }> {
  return postApi<{ message: string }>('/api/v1/auth/forgot-password', { identifier, hp_field });
}

export async function setNewPassword(new_password: string, confirm_password: string): Promise<TokenResponse> {
  const data = await postApi<TokenResponse>('/api/v1/auth/set-new-password', { new_password, confirm_password });
  if (typeof window !== 'undefined') {
    localStorage.removeItem('navix_temp_auth');
  }
  setSession(data.access_token, data.user);
  return data;
}

export async function changePassword(current_password: string, new_password: string, confirm_password: string): Promise<{ message: string }> {
  return postApi<{ message: string }>('/api/v1/auth/change-password', { current_password, new_password, confirm_password });
}

export async function deleteAccount(password: string, confirmation_text: string): Promise<{ message: string }> {
  const data = await postApi<{ message: string }>('/api/v1/auth/delete-account', { password, confirmation_text });
  logoutSession();
  return data;
}
