import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from '../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
    fullName: string | null;
  };
};

type RefreshRequest = Request & {
  user: {
    userId: string;
    email: string;
    fullName: string | null;
    rawToken: string;
    rememberMe?: boolean;
  };
};

// 7 days in milliseconds — must match JWT_REFRESH_EXPIRES
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  private setRefreshCookie(res: Response, token: string, rememberMe?: boolean) {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/auth', // Only sent to /auth/* routes
    };

    if (rememberMe) {
      cookieOptions.maxAge = REFRESH_COOKIE_MAX_AGE_MS;
    }

    res.cookie('refresh_token', token, cookieOptions);
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie('refresh_token', { path: '/auth' });
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken, false);

    // Never expose the refresh token in the response body
    const { refreshToken: _, ...safeResult } = result;
    return safeResult;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken, result.rememberMe);

    const { refreshToken: _, rememberMe: __, ...safeResult } = result;
    return safeResult;
  }

  /**
   * Silent refresh endpoint.
   * Protected by JwtRefreshGuard (reads HttpOnly cookie).
   * Returns a new accessToken and rotates the refresh token cookie.
   */
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, rawToken, rememberMe } = req.user;
    const tokens = await this.authService.refresh(userId, rawToken, rememberMe);

    this.setRefreshCookie(res, tokens.refreshToken, rememberMe);

    return { accessToken: tokens.accessToken };
  }

  /**
   * Logout: revokes the current refresh token in DB and clears the cookie.
   */
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, rawToken } = req.user;
    await this.authService.logout(userId, rawToken);
    this.clearRefreshCookie(res);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers(@Request() req: any, @Query('search') search?: string) {
    const currentUserId = req.user?.userId || req.user?.sub;
    return this.authService.searchUsers(search || '', currentUserId);
  }
}
