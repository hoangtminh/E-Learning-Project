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
    public originalError?: any,
  ) {
    super(`API Error: ${statusCode}`);
    this.name = 'ApiError';
  }
}

let authToken: string | null = null;

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Use explicitly set authToken or fallback to the cookie
    const token = authToken || getCookie('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(API_URL + endpoint, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data;

    try {
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (e) {
      data = null;
    }

    if (response.ok) {
      return {
        success: true,
        data: data as T,
        status: response.status,
      };
    }

    throw new ApiError(response.status, data);
  } catch (error) {
    console.log('Error: ', error);
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.originalError?.message || error.message,
        status: error.statusCode,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
      status: 0,
    };
  }
}

export const apiGet = <T>(endpoint: string): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, { method: 'GET' });

export const apiPost = <T>(
  endpoint: string,
  body?: any,
): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = <T>(
  endpoint: string,
  body?: any,
): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = <T>(endpoint: string): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, { method: 'DELETE' });

export const apiPatch = <T>(
  endpoint: string,
  body?: any,
): Promise<ApiResponse<T>> =>
  apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
