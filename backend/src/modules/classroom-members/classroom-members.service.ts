import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PendingMemberDto } from './dto/pending-member.dto';
import { AddMembersResponseDto } from './dto/add-members-response.dto';
import { ApproveAllResponseDto } from './dto/approve-all-response.dto';

@Injectable()
export class ClassroomMembersService {
  constructor(private prisma: PrismaService) {}

  // 1. Tự động Join bằng ID hoặc vào hàng đợi (Pending)
  async joinClassroom(userId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');

    const existing = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (existing) {
      throw new ConflictException('You are already a member');
    }

    if (classroom.isPublic) {
      return this.prisma.classroomMember.create({
        data: {
          classroomId,
          userId,
          role: 'member',
        },
      });
    } else {
      const existingRequest = await this.prisma.classroomJoinRequest.findUnique(
        {
          where: { classroomId_userId: { classroomId, userId } },
        },
      );
      if (existingRequest) {
        throw new ConflictException('You are already in the pending queue');
      }

      return this.prisma.classroomJoinRequest.create({
        data: { classroomId, userId },
      });
    }
  }

  // 2. Thêm thành viên trực tiếp
  async addMembers(
    requesterId: string,
    classroomId: string,
    targetUserIds: string[],
  ): Promise<AddMembersResponseDto> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');

    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });

    if (!requesterMember) {
      throw new ForbiddenException('You must be an active member to add users');
    }

    // Rule: Lớp private -> chỉ Owner/Admin được thêm. Lớp public -> member cũng được thêm
    if (!classroom.isPublic && requesterMember.role === 'member') {
      throw new ForbiddenException(
        'Only admins and owners can add users to a private classroom',
      );
    }

    // Check for existing members and filter out users who are already members
    const existingMembers = await this.prisma.classroomMember.findMany({
      where: {
        classroomId,
        userId: { in: targetUserIds },
      },
      select: { userId: true },
    });

    const existingUserIds = existingMembers.map((member) => member.userId);
    const newUserIds = targetUserIds.filter(
      (userId) => !existingUserIds.includes(userId),
    );

    if (newUserIds.length === 0) {
      throw new ConflictException('All specified users are already members');
    }

    // Xoá request xin gia nhập (nếu có) cho các user mới
    await this.prisma.classroomJoinRequest.deleteMany({
      where: {
        classroomId,
        userId: { in: newUserIds },
      },
    });

    // Tạo members mới cho tất cả user
    const newMembers = await this.prisma.classroomMember.createMany({
      data: newUserIds.map((userId) => ({
        classroomId,
        userId,
        role: 'member' as const,
      })),
    });

    return {
      added: newMembers.count,
      skipped: existingUserIds.length,
      total: targetUserIds.length,
    };
  }

  // 3. Admin/Owner duyệt người dùng trong hàng đợi
  async approveMember(
    requesterId: string,
    classroomId: string,
    targetUserId: string,
  ) {
    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });

    if (!requesterMember || requesterMember.role === 'member') {
      throw new ForbiddenException(
        'Only admins and owners can approve join requests',
      );
    }

    const targetRequest = await this.prisma.classroomJoinRequest.findUnique({
      where: { classroomId_userId: { classroomId, userId: targetUserId } },
    });
    if (!targetRequest) {
      throw new NotFoundException('Pending request not found');
    }

    const [_, newMember] = await this.prisma.$transaction([
      this.prisma.classroomJoinRequest.delete({
        where: { classroomId_userId: { classroomId, userId: targetUserId } },
      }),
      this.prisma.classroomMember.create({
        data: { classroomId, userId: targetUserId, role: 'member' },
      }),
    ]);

    return newMember;
  }

  // 3.1. Admin/Owner duyệt tất cả người dùng trong hàng đợi
  async approveAllMembers(
    requesterId: string,
    classroomId: string,
  ): Promise<ApproveAllResponseDto> {
    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });

    if (!requesterMember || requesterMember.role === 'member') {
      throw new ForbiddenException(
        'Only admins and owners can approve join requests',
      );
    }

    // Lấy tất cả pending requests
    const pendingRequests = await this.prisma.classroomJoinRequest.findMany({
      where: { classroomId },
      select: { userId: true },
    });

    if (pendingRequests.length === 0) {
      return { approved: 0, message: 'No pending requests to approve' };
    }

    const pendingUserIds = pendingRequests.map((request) => request.userId);

    // Sử dụng transaction để xóa requests và tạo members
    const result = await this.prisma.$transaction(async (tx) => {
      // Xóa tất cả pending requests
      await tx.classroomJoinRequest.deleteMany({
        where: { classroomId, userId: { in: pendingUserIds } },
      });

      // Tạo members mới cho tất cả users
      const newMembers = await tx.classroomMember.createMany({
        data: pendingUserIds.map((userId) => ({
          classroomId,
          userId,
          role: 'member' as const,
        })),
      });

      return newMembers;
    });

    return {
      approved: result.count,
      message: `Successfully approved ${result.count} join requests`,
    };
  }

  // 4. Admin/Owner lấy danh sách hàng đợi
  async getPendingMembers(
    requesterId: string,
    classroomId: string,
  ): Promise<PendingMemberDto[]> {
    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });

    if (!requesterMember || requesterMember.role === 'member') {
      throw new ForbiddenException(
        'Only admins and owners can view the pending queue',
      );
    }

    return this.prisma.classroomJoinRequest.findMany({
      where: { classroomId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  // 5. Lấy danh sách thành viên của lớp học
  async getMembers(requesterId: string, classroomId: string) {
    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });

    if (!requesterMember) {
      throw new ForbiddenException('You are not a member of this classroom');
    }

    return this.prisma.classroomMember.findMany({
      where: { classroomId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  // 6. Admin/Owner xóa thành viên khỏi lớp học
  async removeMember(
    requesterId: string,
    classroomId: string,
    targetUserId: string,
  ) {
    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });

    if (!requesterMember || requesterMember.role === 'member') {
      throw new ForbiddenException(
        'Only admins and owners can remove members',
      );
    }

    if (targetUserId === requesterId) {
      throw new ForbiddenException('You cannot remove yourself');
    }

    const targetMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: targetUserId } },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found in this classroom');
    }

    // Cannot remove the owner
    if (targetMember.role === 'owner') {
      throw new ForbiddenException('Cannot remove the classroom owner');
    }

    return this.prisma.classroomMember.delete({
      where: { classroomId_userId: { classroomId, userId: targetUserId } },
    });
  }

  // 7. Admin/Owner từ chối người dùng trong hàng đợi
  async rejectMember(
    requesterId: string,
    classroomId: string,
    targetUserId: string,
  ) {
    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });

    if (!requesterMember || requesterMember.role === 'member') {
      throw new ForbiddenException(
        'Only admins and owners can reject join requests',
      );
    }

    const targetRequest = await this.prisma.classroomJoinRequest.findUnique({
      where: { classroomId_userId: { classroomId, userId: targetUserId } },
    });

    if (!targetRequest) {
      throw new NotFoundException('Pending request not found');
    }

    return this.prisma.classroomJoinRequest.delete({
      where: { classroomId_userId: { classroomId, userId: targetUserId } },
    });
  }
}
