import { apiPost, apiGet } from './client';

export type AuthResponse = {
  accessToken: string;
  user: {
    userId: string;
    email: string;
    fullname: string | null;
    imageUrl: string | null | undefined;
  };
};

export async function register(payload: {
  email: string;
  password: string;
  fullName: string;
}) {
  return apiPost<AuthResponse>('/auth/register', payload);
}

export async function login(payload: { email: string; password: string }) {
  return apiPost<AuthResponse>('/auth/login', payload);
}

export async function getUser() {
  return apiGet<AuthResponse['user']>('/auth/me'); // Replace '/auth/me' with your actual endpoint
}

export const setTokenCookie = (token: string) => {
  // Set cookie to expire in 7 days (604800 seconds)
  document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
};

export const removeTokenCookie = () => {
  document.cookie =
    'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const getTokenCookie = () => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; access_token=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};
