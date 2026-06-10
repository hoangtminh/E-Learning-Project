const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public originalError?: unknown,
  ) {
    super(`API Error: ${statusCode}`);
    this.name = 'ApiError';
  }
}

let authToken: string | null = null;

if (typeof window !== 'undefined') {
  const match = document.cookie.split('; ').find((r) => r.startsWith('access_token='));
  if (match) {
    authToken = match.split('=')[1];
  }
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      // Set access_token cookie (expires in 15 minutes, matching token lifespan)
      document.cookie = `access_token=${token}; path=/; max-age=900; SameSite=Lax`;
    } else {
      // Clear access_token cookie
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  }
};

export const getAuthToken = () => authToken;

// ── Silent-refresh state machine ─────────────────────────
// Prevents parallel refresh calls when multiple requests 401 simultaneously.

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function notifySubscribers(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  try {
    const res = await fetch(API_URL + '/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Sends the HttpOnly refresh_token cookie
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newToken: string = data?.accessToken;
    if (!newToken) return null;

    setAuthToken(newToken);
    return newToken;
  } catch {
    return null;
  }
}

// ── Core request function ────────────────────────────────

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const doRequest = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(API_URL + endpoint, {
      ...options,
      headers,
      credentials: (options.credentials as RequestCredentials) ?? 'include',
    });
  };

  try {
    let response = await doRequest(authToken);

    // ── Silent refresh on 401 ──────────────────────────
    if (response.status === 401) {
      // Skip refresh for auth endpoints themselves to avoid loops
      if (
        endpoint === '/auth/refresh' ||
        endpoint === '/auth/login' ||
        endpoint === '/auth/logout'
      ) {
        throw new ApiError(401, { message: 'Unauthorized' });
      }

      if (isRefreshing) {
        // Another request is already refreshing — wait for it
        const newToken = await new Promise<string | null>((resolve) => {
          subscribeTokenRefresh(resolve);
        });

        if (newToken) {
          response = await doRequest(newToken);
        } else {
          throw new ApiError(401, { message: 'Session expired' });
        }
      } else {
        isRefreshing = true;
        const newToken = await attemptTokenRefresh();
        isRefreshing = false;
        notifySubscribers(newToken);

        if (newToken) {
          response = await doRequest(newToken);
        } else {
          throw new ApiError(401, { message: 'Session expired. Please log in again.' });
        }
      }
    }

    // ── Parse response ─────────────────────────────────
    const contentType = response.headers.get('content-type');
    let data: unknown;

    try {
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch {
      data = null;
    }

    if (response.ok) {
      return { success: true, data: data as T, status: response.status };
    }

    throw new ApiError(response.status, data);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error:
          (error.originalError as { message?: string })?.message ??
          error.message,
        status: error.statusCode,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message, status: 0 };
  }
}

// ── Convenience methods ──────────────────────────────────

export const apiGet = <T>(endpoint: string): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, { method: 'GET' });

export const apiPost = <T>(
  endpoint: string,
  body?: unknown,
  init?: Partial<RequestInit>,
): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    ...(init as RequestInit),
  });

export const apiPut = <T>(
  endpoint: string,
  body?: unknown,
): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = <T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPatch = <T>(
  endpoint: string,
  body?: unknown,
): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
