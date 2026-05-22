import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the routes that unauthenticated users can access
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/resources',
  '/pathway',
  '/community',
  '/courses',
];
const authRoutes = ['/login', '/register'];

// Define the default route to redirect authenticated users to
const defaultMainRoute = '/dashboard';

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasCookie = request.cookies.has('access_token');
  const token = request.cookies.get('access_token')?.value;
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  let isValid = false;

  if (hasCookie && token) {
    const payload = decodeJwt(token);
    if (payload && typeof payload === 'object') {
      // Check JWT expiration (exp is in seconds)
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        isValid = true;
      }
    }
  }

  // If not authenticated (or token is invalid) and trying to access a protected route
  if (!isValid && !isPublicRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (hasCookie) {
      response.cookies.delete('access_token');
    }
    return response;
  }

  // If authenticated (valid token) and trying to access login/register
  if (isValid && isAuthRoute) {
    return NextResponse.redirect(new URL(defaultMainRoute, request.url));
  }

  // If token is invalid but accessing a public route, clear the stale cookie
  if (hasCookie && !isValid) {
    const response = NextResponse.next();
    response.cookies.delete('access_token');
    return response;
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
