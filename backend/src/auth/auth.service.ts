import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

type AccessPayload = {
  sub: string;
  email: string;
  fullName: string | null;
};

const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken({ sub: user.id, email: user.email, fullName: user.fullName }),
      this.signRefreshToken({ sub: user.id, email: user.email, fullName: user.fullName }),
    ]);

    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        role: true,
        isSuspended: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isSuspended) {
      throw new UnauthorizedException(
        'Tài khoản đang bị khóa, vui lòng liên hệ quản trị viên hệ thống',
      );
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: AccessPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken({ ...payload, rememberMe: dto.rememberMe }),
    ]);

    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      rememberMe: dto.rememberMe,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  // ── Refresh ─────────────────────────────────────────────

  /**
   * Refresh Token Rotation:
   * 1. Find token record by hash in DB
   * 2. Verify it is not revoked and not expired
   * 3. Revoke old token
   * 4. Issue new access + refresh token pair
   * 5. Store new refresh token hash
   */
  async refresh(userId: string, rawToken: string, rememberMe?: boolean) {
    const tokenHash = this.hashToken(rawToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.userId !== userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      // Token reuse detected — revoke all tokens for this user as precaution
      await this.revokeAllUserTokens(userId);
      throw new UnauthorizedException(
        'Refresh token already used. Please log in again.',
      );
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired. Please log in again.');
    }

    // Verify user is still active
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true, isSuspended: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.isSuspended) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa.');
    }

    const payload: AccessPayload = {
      sub: userId,
      email: user.email,
      fullName: user.fullName,
    };

    // Revoke old token and issue new pair atomically
    const [accessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken({ ...payload, rememberMe }),
    ]);

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId,
          tokenHash: this.hashToken(newRefreshToken),
          expiresAt: this.refreshExpiresAt(),
        },
      }),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, rawToken: string) {
    const tokenHash = this.hashToken(rawToken);

    await this.prisma.refreshToken
      .updateMany({
        where: { userId, tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => {
        // Silently ignore — token may already be revoked
      });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      },
    });
  }

  async searchUsers(search: string = '', currentUserId: string) {
    return this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
        ],
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      },
      take: 20,
    });
  }


  private signAccessToken(payload: AccessPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private signRefreshToken(payload: AccessPayload & { rememberMe?: boolean }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret:
        this.config.get<string>('JWT_REFRESH_SECRET') ||
        'dev_refresh_secret_change_me',
      expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d') as any,
    });
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private refreshExpiresAt(): Date {
    const d = new Date();
    d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
    return d;
  }

  private async storeRefreshToken(userId: string, rawToken: string) {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(rawToken),
        expiresAt: this.refreshExpiresAt(),
      },
    });
  }

  private async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
