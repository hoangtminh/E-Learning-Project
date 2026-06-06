import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(
    userId: string,
    creatorId: string | null,
    type: string,
    content: string,
    link: string | null,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        creatorId,
        type,
        content,
        link,
        isRead: false,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    try {
      this.notificationsGateway.sendNotificationToUser(userId, notification);
    } catch (err) {
      console.error('Failed to emit live socket notification:', err);
    }

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async markAsRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { success: true };
  }

  async deleteNotification(userId: string, id: string) {
    await this.prisma.notification.deleteMany({
      where: { id, userId },
    });
    return { success: true };
  }

  sendEventToUser(userId: string, event: string, data: any) {
    try {
      this.notificationsGateway.server.to(`notification/${userId}`).emit(event, data);
    } catch (err) {
      console.error(`Failed to emit live socket event ${event} to user ${userId}:`, err);
    }
  }
}
