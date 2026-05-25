import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalRole, LogLevel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ───────────────────────────── STATS ─────────────────────────────

  async getStats() {
    const [totalUsers, adminCount, instructorCount, userCount, totalLogs, totalTransactions, successTransactions] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: 'admin' } }),
        this.prisma.user.count({ where: { role: 'instructor' } }),
        this.prisma.user.count({ where: { role: 'user' } }),
        this.prisma.systemLog.count(),
        this.prisma.transaction.count(),
        this.prisma.transaction.count({ where: { status: 'success' } }),
      ]);

    // Users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await this.prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const suspendedUsers = await this.prisma.user.count({ where: { isSuspended: true } });

    return {
      totalUsers,
      adminCount,
      instructorCount,
      userCount,
      suspendedUsers,
      newUsersThisMonth,
      totalLogs,
      totalTransactions,
      successTransactions,
    };
  }

  async getLogStats(days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.systemLog.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, action: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const byDate: Record<string, number> = {};
    logs.forEach((log) => {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      byDate[dateKey] = (byDate[dateKey] || 0) + 1;
    });

    // Fill missing dates
    const result: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, count: byDate[key] || 0 });
    }

    // Top actions
    const actionCounts: Record<string, number> = {};
    logs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));

    return { timeline: result, topActions };
  }

  // ───────────────────────────── USERS ─────────────────────────────

  async findAllUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string; // 'active' | 'suspended' | 'all'
    sortBy?: string;
    sortDir?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where['OR'] = [
        { fullName: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    if (query.role && query.role !== 'all') {
      where['role'] = query.role as GlobalRole;
    }

    if (query.status === 'suspended') {
      where['isSuspended'] = true;
    } else if (query.status === 'active') {
      where['isSuspended'] = false;
    }

    const sortField = ['createdAt', 'fullName', 'email', 'role'].includes(query.sortBy || '')
      ? query.sortBy!
      : 'createdAt';
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          isSuspended: true,
          createdAt: true,
          _count: {
            select: {
              classroomMembers: true,
              courseMemberships: true,
              logs: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortField]: sortDir },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        _count: {
          select: {
            ownedClassrooms: true,
            classroomMembers: true,
            courseMemberships: true,
            coursesInstructing: true,
            taskSubmissions: true,
            transactions: true,
          },
        },
        logs: {
          select: { id: true, action: true, details: true, createdAt: true, level: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(dto: { email: string; password: string; fullName?: string; role?: string }, adminId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName || null,
        role: (dto.role as GlobalRole) || 'user',
      },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });

    await this.createLog(adminId, 'ADMIN_CREATE_USER', `Tạo người dùng mới: ${user.email} (${dto.role || 'user'})`, 'info');
    return user;
  }

  async updateUserRole(userId: string, role: string, adminId: string) {
    if (userId === adminId) {
      throw new ForbiddenException('Bạn không thể tự thay đổi vai trò của chính mình');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as GlobalRole },
      select: { id: true, email: true, fullName: true, role: true },
    });

    await this.createLog(
      adminId,
      'ADMIN_UPDATE_ROLE',
      `Đổi vai trò ${user.email} từ ${user.role} → ${role}`,
      'warn',
      userId,
      'User',
    );

    return updatedUser;
  }

  async suspendUser(userId: string, suspend: boolean, adminId: string) {
    if (userId === adminId) {
      throw new ForbiddenException('Bạn không thể tự khóa tài khoản của chính mình');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: suspend },
      select: { id: true, email: true, fullName: true, isSuspended: true },
    });

    await this.createLog(
      adminId,
      suspend ? 'ADMIN_SUSPEND_USER' : 'ADMIN_UNSUSPEND_USER',
      `${suspend ? 'Khóa' : 'Mở khóa'} tài khoản: ${user.email}`,
      'warn',
      userId,
      'User',
    );

    return updated;
  }

  async resetPassword(userId: string, newPassword: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    await this.createLog(
      adminId,
      'ADMIN_RESET_PASSWORD',
      `Reset mật khẩu cho: ${user.email}`,
      'warn',
      userId,
      'User',
    );

    return { success: true };
  }

  async deleteUser(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new ForbiddenException('Bạn không thể tự xóa tài khoản của chính mình');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.createLog(
      adminId,
      'ADMIN_DELETE_USER',
      `Xóa người dùng: ${user.email} (${user.fullName || 'Không tên'})`,
      'warn',
    );

    return this.prisma.user.delete({ where: { id: userId } });
  }

  // ───────────────────────────── LOGS ─────────────────────────────

  async findAllLogs(query: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    level?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.action && query.action !== 'all') {
      where['action'] = { contains: query.action };
    }

    if (query.userId) {
      where['userId'] = query.userId;
    }

    if (query.level && query.level !== 'all') {
      where['level'] = query.level as LogLevel;
    }

    if (query.dateFrom || query.dateTo) {
      where['createdAt'] = {};
      if (query.dateFrom) (where['createdAt'] as Record<string, unknown>)['gte'] = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        (where['createdAt'] as Record<string, unknown>)['lte'] = to;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.systemLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.systemLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async exportLogs(query: { action?: string; userId?: string; level?: string; dateFrom?: string; dateTo?: string }) {
    const where: Record<string, unknown> = {};

    if (query.action && query.action !== 'all') where['action'] = { contains: query.action };
    if (query.userId) where['userId'] = query.userId;
    if (query.level && query.level !== 'all') where['level'] = query.level;

    if (query.dateFrom || query.dateTo) {
      where['createdAt'] = {};
      if (query.dateFrom) (where['createdAt'] as Record<string, unknown>)['gte'] = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        (where['createdAt'] as Record<string, unknown>)['lte'] = to;
      }
    }

    const logs = await this.prisma.systemLog.findMany({
      where,
      include: { user: { select: { email: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const header = 'Thời gian,Người dùng,Email,Hành động,Level,Chi tiết,IP\n';
    const rows = logs
      .map((log) => {
        const cols = [
          new Date(log.createdAt).toLocaleString('vi-VN'),
          log.user?.fullName || 'System',
          log.user?.email || '-',
          log.action,
          log.level,
          (log.details || '').replace(/,/g, ';').replace(/\n/g, ' '),
          log.ipAddress || '-',
        ];
        return cols.map((c) => `"${c}"`).join(',');
      })
      .join('\n');

    return header + rows;
  }

  async bulkDeleteLogs(olderThanDays: number, adminId: string) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const result = await this.prisma.systemLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    await this.createLog(
      adminId,
      'ADMIN_BULK_DELETE_LOGS',
      `Xóa ${result.count} logs cũ hơn ${olderThanDays} ngày`,
      'warn',
    );

    return { deleted: result.count };
  }

  async getDistinctActions(): Promise<string[]> {
    const logs = await this.prisma.systemLog.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
      take: 100,
    });
    return logs.map((l) => l.action);
  }

  async createLog(
    userId: string | null,
    action: string,
    details: string,
    level: LogLevel | 'info' | 'warn' | 'error' = 'info',
    targetId?: string,
    targetType?: string,
  ) {
    return this.prisma.systemLog.create({
      data: {
        userId: userId ?? undefined,
        action,
        details,
        level: level as LogLevel,
        targetId,
        targetType,
      },
    });
  }
}
