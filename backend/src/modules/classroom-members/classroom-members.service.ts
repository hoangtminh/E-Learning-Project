import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ClassroomRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PendingMemberDto } from './dto/pending-member.dto';
import { AddMembersResponseDto } from './dto/add-members-response.dto';
import { ApproveAllResponseDto } from './dto/approve-all-response.dto';
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class ClassroomMembersService {
  constructor(private prisma: PrismaService) { }

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

  async addMemberByEmail(requesterId: string, classroomId: string, email: string) {
    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });

    if (!requesterMember || requesterMember.role === 'member') {
      throw new ForbiddenException(
        'Only admins and owners can add members',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này');
    }

    const existingMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: user.id } },
    });

    if (existingMember) {
      throw new ConflictException('Người dùng này đã là thành viên của lớp học');
    }

    // Xóa request xin gia nhập (nếu có)
    await this.prisma.classroomJoinRequest.deleteMany({
      where: { classroomId, userId: user.id },
    });

    const member = await this.prisma.classroomMember.create({
      data: {
        classroomId,
        userId: user.id,
        role: 'member',
      },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
      },
    });

    return member;
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

  // 8. Cập nhật quyền (role) thành viên
  async updateMemberRole(
    requesterId: string,
    classroomId: string,
    targetUserId: string,
    newRole: ClassroomRole,
  ) {
    const requesterMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: requesterId } },
    });
    if (
      !requesterMember ||
      (requesterMember.role !== 'owner' && requesterMember.role !== 'admin')
    ) {
      throw new ForbiddenException(
        'Only owners and admins can update member roles',
      );
    }

    const targetMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: targetUserId } },
    });
    if (!targetMember) throw new NotFoundException('Member not found');

    if (targetMember.role === 'owner') {
      if (requesterId !== targetUserId) {
        throw new ForbiddenException(
          "Cannot modify the classroom owner's role",
        );
      }
      if (newRole !== 'owner') {
        throw new BadRequestException(
          'Owner cannot demote themselves without transferring ownership first',
        );
      }
    }

    if (newRole === 'owner') {
      if (requesterMember.role !== 'owner') {
        throw new ForbiddenException(
          'Only the classroom owner can transfer ownership',
        );
      }
      // Transfer ownership
      await this.prisma.$transaction([
        this.prisma.classroom.update({
          where: { id: classroomId },
          data: { ownerId: targetUserId },
        }),
        this.prisma.classroomMember.update({
          where: { classroomId_userId: { classroomId, userId: requesterId } },
          data: { role: 'admin' },
        }),
        this.prisma.classroomMember.update({
          where: { classroomId_userId: { classroomId, userId: targetUserId } },
          data: { role: 'owner' },
        }),
      ]);
      return { success: true };
    }

    return this.prisma.classroomMember.update({
      where: { classroomId_userId: { classroomId, userId: targetUserId } },
      data: { role: newRole },
    });
  }

  // 9. Rời phòng (leave)
  async leaveClassroom(userId: string, classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { members: true },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');

    const member = classroom.members.find((m) => m.userId === userId);
    if (!member) {
      throw new NotFoundException('You are not a member of this classroom');
    }

    // Role validations for leaving when there are other members:
    if (classroom.members.length > 1) {
      if (member.role === 'owner' || member.role === 'admin') {
        const adminsAndOwners = classroom.members.filter(
          (m) => m.role === 'owner' || m.role === 'admin',
        );
        if (adminsAndOwners.length === 1) {
          const otherMembers = classroom.members.filter((m) => m.userId !== userId);
          if (otherMembers.length > 0) {
            throw new BadRequestException(
              'Bạn là admin/owner duy nhất của lớp học. Vui lòng cấp quyền admin cho một thành viên khác trước khi rời phòng.',
            );
          }
        }
      }
    }

    let transferredOwnership = false;
    if (member.role === 'owner' && classroom.members.length > 1) {
      const otherAdminsAndOwners = classroom.members.filter(
        (m) =>
          m.userId !== userId && (m.role === 'owner' || m.role === 'admin'),
      );
      if (otherAdminsAndOwners.length > 0) {
        const newOwner = otherAdminsAndOwners[0];
        await this.prisma.$transaction([
          this.prisma.classroom.update({
            where: { id: classroomId },
            data: { ownerId: newOwner.userId },
          }),
          this.prisma.classroomMember.update({
            where: {
              classroomId_userId: { classroomId, userId: newOwner.userId },
            },
            data: { role: 'owner' },
          }),
          this.prisma.classroomMember.delete({
            where: { classroomId_userId: { classroomId, userId } },
          }),
        ]);
        transferredOwnership = true;
      }
    }

    if (!transferredOwnership) {
      await this.prisma.classroomMember.delete({
        where: { classroomId_userId: { classroomId, userId } },
      });
    }

    // Now query the remaining members count in the classroom
    const remainingMembersCount = await this.prisma.classroomMember.count({
      where: { classroomId },
    });

    if (remainingMembersCount === 0) {
      // 1. Find all linked courses
      const linkedCourses = await this.prisma.classroomLinkedCourse.findMany({
        where: { classroomId },
        select: { courseId: true },
      });
      const courseIds = linkedCourses.map((lc) => lc.courseId);

      // 2. Delete S3 folder
      try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
        const s3Client = new S3Client({
          region: process.env.AWS_REGION || 'ap-southeast-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          },
        });
        const prefix = `classrooms/${classroomId}/`;
        const listedObjects = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
          }),
        );

        if (listedObjects.Contents && listedObjects.Contents.length > 0) {
          const deleteParams = {
            Bucket: bucketName,
            Delete: {
              Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
            },
          };
          await s3Client.send(new DeleteObjectsCommand(deleteParams));
        }
      } catch (err) {
        console.error('Failed to delete S3 folder for classroom', err);
      }

      // 3. Delete DB records in exact dependency-respecting order inside a transaction
      await this.prisma.$transaction(async (tx) => {

        // B. Delete Post Comments
        await tx.classroomPostComment.deleteMany({
          where: { post: { classroomId } },
        });

        // C. Delete Posts
        await tx.classroomPost.deleteMany({
          where: { classroomId },
        });

        // D. Delete Task Submissions
        await tx.taskSubmission.deleteMany({
          where: { task: { classroomId } },
        });

        // E. Delete Classroom Tasks
        await tx.classroomTask.deleteMany({
          where: { classroomId },
        });

        // F. Delete Classroom Files
        await tx.classroomFile.deleteMany({
          where: { classroomId },
        });

        // G. Delete Linked Courses relations
        await tx.classroomLinkedCourse.deleteMany({
          where: { classroomId },
        });

        // H. Delete the Linked Courses themselves
        if (courseIds.length > 0) {
          for (const courseId of courseIds) {
            try {
              // Delete UserProgress first
              await tx.userProgress.deleteMany({ where: { courseId } });
              // Delete Course itself (which cascade deletes Section, CourseMember, CourseInvitation, etc.)
              await tx.course.delete({ where: { id: courseId } });
            } catch (err) {
              console.error(`Failed to delete course ${courseId} inside transaction:`, err);
            }
          }
        }

        // I. Delete Notes
        await tx.note.deleteMany({
          where: { classroomId },
        });

        // J. Delete Calls
        await tx.call.deleteMany({
          where: { classroomId },
        });

        // K. Delete Messages
        await tx.message.deleteMany({
          where: { conversation: { classroomId } },
        });

        // L. Delete Conversation Members
        await tx.conversationMember.deleteMany({
          where: { conversation: { classroomId } },
        });

        // M. Delete Conversations
        await tx.conversation.deleteMany({
          where: { classroomId },
        });

        // N. Delete Join Requests
        await tx.classroomJoinRequest.deleteMany({
          where: { classroomId },
        });

        // P. Delete the Classroom itself
        await tx.classroom.delete({
          where: { id: classroomId },
        });
      });

      return { success: true, classroomDeleted: true };
    }

    return { success: true };
  }
}
