import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that protects the /auth/refresh endpoint.
 * Uses the 'jwt-refresh' Passport strategy which reads
 * the refresh token from the HttpOnly cookie.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
