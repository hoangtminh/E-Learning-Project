import { apiPost, apiGet } from './client';

export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role?: string;
  };
};

export async function register(payload: {
  email: string;
  password: string;
  fullName: string;
}) {
  return apiPost<AuthResponse>('/auth/register', payload, { credentials: 'include' });
}

export async function login(payload: { email: string; password: string; rememberMe?: boolean }) {
  return apiPost<AuthResponse>('/auth/login', payload, { credentials: 'include' });
}

export async function getUser() {
  return apiGet<AuthResponse['user']>('/auth/me');
}

/**
 * Calls POST /auth/refresh with credentials (sends the httpOnly refresh_token cookie).
 * Returns a new accessToken. The backend simultaneously rotates the refresh token cookie.
 */
export async function refreshTokenApi(): Promise<{ accessToken: string } | null> {
  try {
    const res = await fetch(
      (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080') + '/auth/refresh',
      {
        method: 'POST',
        credentials: 'include', // Sends the HttpOnly refresh_token cookie
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data as { accessToken: string };
  } catch {
    return null;
  }
}

/**
 * Calls POST /auth/logout — backend revokes the refresh token in DB and clears the cookie.
 */
export async function apiLogout(): Promise<void> {
  try {
    await fetch(
      (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080') + '/auth/logout',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch {
    // Silently ignore — we clear local state regardless
  }
}
