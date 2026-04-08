const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (data as { message?: string | string[] }).message ?? 'Request failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return data as T;
}

export async function register(payload: {
  email: string;
  password: string;
  fullName: string;
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthResponse>(response);
}

export async function login(payload: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthResponse>(response);
}
