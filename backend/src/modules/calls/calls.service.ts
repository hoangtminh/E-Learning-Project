import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCallDto } from './create-call.dto';
import { CallStatus, CallType } from '@prisma/client';

@Injectable()
export class CallsService {
  // In-memory store for approved user IDs in private calls: callId -> Set of userId
  private approvedUsersMap = new Map<string, Set<string>>();

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new call
   */
  async create(userId: string, dto: CreateCallDto) {
    const { title, type = CallType.public, classroomId, conversationId } = dto;

    // Permissions check for channel type calls
    if (type === CallType.channel) {
      if (!classroomId && !conversationId) {
        throw new BadRequestException(
          'Channel calls require a classroomId or conversationId',
        );
      }

      if (classroomId) {
        const classroom = await this.prisma.classroom.findUnique({
          where: { id: classroomId },
          select: { ownerId: true },
        });

        const isClassroomOwner = classroom && classroom.ownerId === userId;

        if (!isClassroomOwner) {
          const member = await this.prisma.classroomMember.findUnique({
            where: {
              classroomId_userId: {
                classroomId,
                userId,
              },
            },
          });
          if (!member) {
            throw new ForbiddenException(
              'You are not a member of this classroom',
            );
          }
        }
      }

      if (conversationId) {
        const member = await this.prisma.conversationMember.findFirst({
          where: {
            conversationId,
            userId,
          },
        });
        if (!member) {
          throw new ForbiddenException(
            'You are not a member of this conversation',
          );
        }
      }
    }

    const call = await this.prisma.call.create({
      data: {
        title: title || `Call-${Date.now()}`,
        type,
        classroomId,
        conversationId,
        creatorId: userId,
        status: CallStatus.ongoing,
        startedAt: new Date(),
      },
    });

    // Initialize approval set if private
    if (type === CallType.private) {
      this.approvedUsersMap.set(call.id, new Set<string>([userId]));
    }

    return call;
  }

  /**
   * Find all ongoing calls
   */
  async findOngoing() {
    return this.prisma.call.findMany({
      where: {
        status: CallStatus.ongoing,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find call by ID
   */
  async findOne(callId: string) {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
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

    if (!call) {
      throw new NotFoundException('Call room not found');
    }

    return call;
  }

  /**
   * Check if a user can join a call
   */
  async canJoin(
    userId: string,
    callId: string,
  ): Promise<{
    allowed: boolean;
    requiresApproval?: boolean;
    reason?: string;
  }> {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      return { allowed: false, reason: 'Call room not found' };
    }

    if (call.status === CallStatus.ended) {
      return { allowed: false, reason: 'Cuộc gọi này đã kết thúc!' };
    }

    // Host can always join
    if (call.creatorId === userId) {
      return { allowed: true };
    }

    // Public calls can be joined by any authenticated user
    if (call.type === CallType.public) {
      return { allowed: true };
    }

    // Channel calls check classroom or conversation membership
    if (call.type === CallType.channel) {
      if (call.classroomId) {
        const classroom = await this.prisma.classroom.findUnique({
          where: { id: call.classroomId },
          select: { ownerId: true },
        });

        const isClassroomOwner = classroom && classroom.ownerId === userId;

        if (!isClassroomOwner) {
          const member = await this.prisma.classroomMember.findUnique({
            where: {
              classroomId_userId: {
                classroomId: call.classroomId,
                userId,
              },
            },
          });
          if (!member) {
            return {
              allowed: false,
              reason: 'Bạn không phải thành viên của lớp học này!',
            };
          }
        }
      }

      if (call.conversationId) {
        const member = await this.prisma.conversationMember.findFirst({
          where: {
            conversationId: call.conversationId,
            userId,
          },
        });
        if (!member) {
          return {
            allowed: false,
            reason: 'Bạn không thuộc nhóm trò chuyện này!',
          };
        }
      }

      return { allowed: true };
    }

    // Private calls require approval from the host
    if (call.type === CallType.private) {
      const approvedSet = this.approvedUsersMap.get(callId);
      if (approvedSet && approvedSet.has(userId)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        requiresApproval: true,
        reason: 'Cần sự cho phép của chủ phòng',
      };
    }

    return { allowed: false, reason: 'Unknown call type' };
  }

  /**
   * Host approves a user to join a private call
   */
  async approveUser(hostId: string, callId: string, userIdToApprove: string) {
    const call = await this.findOne(callId);

    if (call.creatorId !== hostId) {
      throw new ForbiddenException('Only the host can approve participants');
    }

    if (call.status === CallStatus.ended) {
      throw new BadRequestException('Call has already ended');
    }

    let approvedSet = this.approvedUsersMap.get(callId);
    if (!approvedSet) {
      approvedSet = new Set<string>([call.creatorId]);
      this.approvedUsersMap.set(callId, approvedSet);
    }

    approvedSet.add(userIdToApprove);
    return { success: true };
  }

  /**
   * End a call
   */
  async endCall(hostId: string, callId: string) {
    const call = await this.findOne(callId);

    if (call.creatorId !== hostId) {
      throw new ForbiddenException('Only the host can end the call');
    }

    const updated = await this.prisma.call.update({
      where: { id: callId },
      data: {
        status: CallStatus.ended,
        endedAt: new Date(),
      },
    });

    this.approvedUsersMap.delete(callId);

    return updated;
  }

  /**
   * System ends call (e.g. when no one is left)
   */
  async systemEndCall(callId: string) {
    try {
      const call = await this.prisma.call.findUnique({ where: { id: callId } });
      if (!call || call.status === CallStatus.ended) return;

      await this.prisma.call.update({
        where: { id: callId },
        data: {
          status: CallStatus.ended,
          endedAt: new Date(),
        },
      });

      this.approvedUsersMap.delete(callId);
      console.log(`System ended empty call room: ${callId}`);
    } catch (err) {
      console.error(`Failed to system end call ${callId}:`, err);
    }
  }

  /**
   * Transfer host ownership of a call to another user
   */
  async transferHost(callId: string, currentHostId: string, newHostId: string) {
    const call = await this.findOne(callId);

    if (call.creatorId !== currentHostId) {
      throw new ForbiddenException(
        'Only the current host can transfer host ownership',
      );
    }

    const updated = await this.prisma.call.update({
      where: { id: callId },
      data: {
        creatorId: newHostId,
      },
    });

    // Make sure new host is in approved set if private
    if (call.type === CallType.private) {
      let approvedSet = this.approvedUsersMap.get(callId);
      if (!approvedSet) {
        approvedSet = new Set<string>([newHostId]);
        this.approvedUsersMap.set(callId, approvedSet);
      } else {
        approvedSet.add(newHostId);
      }
    }

    return updated;
  }

  /**
   * Transfer host ownership of a call automatically (e.g. when host leaves)
   */
  async autoTransferHost(callId: string, newHostId: string) {
    try {
      await this.prisma.call.update({
        where: { id: callId },
        data: {
          creatorId: newHostId,
        },
      });

      // Maintain approved list
      const approvedSet = this.approvedUsersMap.get(callId);
      if (approvedSet) {
        approvedSet.add(newHostId);
      }
      console.log(
        `Auto transferred host of call ${callId} to user ${newHostId}`,
      );
    } catch (err) {
      console.error(
        `Failed to auto transfer host of call ${callId} to ${newHostId}:`,
        err,
      );
    }
  }

  /**
   * Get call history for a user
   */
  async getCallHistory(userId: string) {
    return this.prisma.call.findMany({
      where: {
        OR: [{ creatorId: userId }, { status: CallStatus.ended }],
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 30,
    });
  }

  /**
   * Get dynamic ICE servers from Xirsys (or fallback to Google STUN)
   */
  async getIceServers() {
    const ident = process.env.XIRSYS_IDENT;
    const secret = process.env.XIRSYS_SECRET;
    const channel = process.env.XIRSYS_CHANNEL || 'default';

    const fallbackStun = [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ];

    if (!ident || !secret) {
      console.warn(
        'Xirsys credentials not found in env. Falling back to Google STUN.',
      );
      return fallbackStun;
    }

    try {
      const auth = Buffer.from(`${ident}:${secret}`).toString('base64');
      const response = await fetch(
        `https://global.xirsys.net/_turn/${channel}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format: 'urls' }),
        },
      );

      if (!response.ok) {
        throw new Error(`Xirsys API returned status: ${response.status}`);
      }

      const data = (await response.json()) as any;
      if (data && data.s === 'ok' && data.v && data.v.iceServers) {
        const iceServers = data.v.iceServers;
        if (Array.isArray(iceServers)) {
          return iceServers;
        } else if (iceServers && typeof iceServers === 'object') {
          if (iceServers.urls) {
            return [iceServers];
          }
        }
      }
      throw new Error('Xirsys response status was not ok or iceServers format invalid');
    } catch (error) {
      console.error(
        'Failed to fetch ICE servers from Xirsys, using fallback Google STUN:',
        error,
      );
      return fallbackStun;
    }
  }
}
