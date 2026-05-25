import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(query: { page?: number; limit?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { fullName: { contains: query.search } },
            { email: { contains: query.search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  async updateUserRole(userId: string, role: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as GlobalRole },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    await this.createLog(adminId, 'UPDATE_ROLE', `Updated role for user ${user.email} from ${user.role} to ${role}`);

    return updatedUser;
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.createLog(adminId, 'DELETE_USER', `Deleted user ${user.email} (${user.fullName})`);

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async findAllLogs(query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.systemLog.findMany({
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.systemLog.count(),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createLog(userId: string, action: string, details: string) {
    return this.prisma.systemLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  }
}
