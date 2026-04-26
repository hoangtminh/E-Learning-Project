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

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
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
          },
        },
      },
    });

    // Broadcast to all participants
    const participantIds = await this.getConversationParticipants(conversationId);
    participantIds.forEach((id) => {
      this.chatGateway.server.to(`chat/${id}`).emit('new_message', message);
    });

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
}
