import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createConversation(userId: string, dto: CreateConversationDto) {
    const { type, title, classroomId, participantEmails } = dto;

    // Resolve emails to user IDs
    const participants = await this.prisma.user.findMany({
      where: {
        email: { in: participantEmails },
      },
      select: { id: true },
    });

    const participantIds = participants.map((p) => p.id);

    // Ensure the creator is included in participants and filter out any undefined/null
    if (!userId) {
      throw new ForbiddenException(
        'User ID is required to create a conversation',
      );
    }

    const allParticipantIds = Array.from(
      new Set([...participantIds, userId]),
    ).filter((id) => !!id);

    return this.prisma.conversation.create({
      data: {
        type,
        title,
        classroomId,
        members: {
          create: allParticipantIds.map((id) => ({
            userId: id,
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async joinConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const existingMember = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (existingMember) {
      return existingMember;
    }

    return this.prisma.conversationMember.create({
      data: {
        conversationId,
        userId,
      },
    });
  }

  async addMember(conversationId: string, targetUserId: string) {
    const existingMember = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: targetUserId,
      },
    });

    if (existingMember) {
      return existingMember;
    }

    return this.prisma.conversationMember.create({
      data: {
        conversationId,
        userId: targetUserId,
      },
    });
  }

  async updateConversation(conversationId: string, title?: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  async removeConversation(conversationId: string) {
    return this.prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  async removeMember(conversationId: string, userId: string) {
    return this.prisma.conversationMember.deleteMany({
      where: {
        conversationId,
        userId,
      },
    });
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const { conversationId, content, fileUrl } = dto;

    // Verify membership & fetch all conversation members at once to avoid multiple DB trips
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const senderMember = conversation.members.find((m) => m.userId === userId);
    if (!senderMember) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        fileUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });

    // Parse mentions
    const contentLower = (content || '').toLowerCase();
    const isPingAll = contentLower.includes('@all');

    const isPinged = (m: typeof conversation.members[0]) => {
      if (isPingAll) return true;
      const email = m.user.email.toLowerCase();
      const fullName = m.user.fullName?.toLowerCase();
      const mId = m.user.id;
      if (contentLower.includes('@' + email)) return true;
      if (fullName && contentLower.includes('@' + fullName)) return true;
      if (fullName && contentLower.includes(`@[${fullName}](${mId})`)) return true;
      if (contentLower.includes('@' + mId)) return true;
      return false;
    };

    // Broadcast WebSocket 'new_message' to all conversation members so their UI updates immediately
    conversation.members.forEach((m) => {
      this.chatGateway.server.to(`chat/${m.userId}`).emit('new_message', message);
    });

    // Asynchronously create database notifications for other conversation members
    (async () => {
      try {
        const senderName = message.sender.fullName || message.sender.email || 'Thành viên';
        const conversationName = conversation.title || 'cuộc trò chuyện';
        const textPreview = content && content.length > 50 ? content.slice(0, 50) + '...' : content || 'tệp đính kèm';
        const link = `/chat/${conversationId}`;

        const promises = conversation.members
          .filter((m) => m.userId !== userId)
          .filter((m) => m.notificationsEnabled || isPinged(m))
          .map((m) => {
            const pinged = isPinged(m);
            let notifyContent = '';
            if (pinged) {
              if (isPingAll) {
                notifyContent = `${senderName} đã nhắc đến mọi người trong ${conversationName}`;
              } else {
                notifyContent = `${senderName} đã nhắc đến bạn trong ${conversationName}`;
              }
            } else {
              notifyContent = `${senderName} đã gửi tin nhắn trong ${conversationName}: "${textPreview}"`;
            }

            return this.notificationsService.createNotification(
              m.userId,
              userId,
              'chat',
              notifyContent,
              link,
            );
          });
        await Promise.all(promises);
      } catch (err) {
        console.error('Failed to create chat notifications:', err);
      }
    })();

    return message;
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is member
    const isMember = conversation.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    return conversation;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    // Verify membership
    const member = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  async getConversationParticipants(conversationId: string) {
    const members = await this.prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    return members.map((m) => m.userId);
  }

  async updateNotificationSettings(
    userId: string,
    conversationId: string,
    enabled: boolean,
  ) {
    const member = await this.prisma.conversationMember.findFirst({
      where: { conversationId, userId },
    });

    if (!member) {
      throw new NotFoundException('Bạn không phải là thành viên của cuộc trò chuyện này');
    }

    return this.prisma.conversationMember.update({
      where: { id: member.id },
      data: { notificationsEnabled: enabled },
    });
  }
}
