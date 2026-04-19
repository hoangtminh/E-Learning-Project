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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthenticated = request.cookies.has('access_token');
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(defaultMainRoute, request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
