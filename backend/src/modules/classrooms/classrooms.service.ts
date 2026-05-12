import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { ClassroomRole, GlobalRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

@Injectable()
export class ClassroomsService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private prisma: PrismaService) {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async create(userId: string, dto: CreateClassroomDto) {
    // Auto-generate a unique 6-char invite code
    let inviteCode: string;
    let tries = 0;
    do {
      inviteCode = generateInviteCode();
      const existing = await this.prisma.classroom.findUnique({
        where: { inviteCode },
      });
      if (!existing) break;
      tries++;
    } while (tries < 5);

    const classroom = await this.prisma.classroom.create({
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        inviteCode,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: ClassroomRole.owner,
          },
        },
      },
    });

    try {
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `classrooms/${classroom.id}/`,
      }));
    } catch (err) {
      console.error('Failed to create S3 folder for classroom', err);
    }

    return classroom;
  }

  async findAll(userId: string) {
    return this.prisma.classroom.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        owner: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
        linkedCourses: {
          include: {
            course: {
              select: { id: true, title: true, description: true, thumbnailUrl: true },
            },
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom not found`);
    }

    const isMember = classroom.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException(`You are not a member of this classroom`);
    }

    return classroom;
  }

  async update(id: string, userId: string, dto: UpdateClassroomDto) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId: id, userId } },
    });

    if (!member) {
      throw new NotFoundException(`Classroom not found or you are not a member`);
    }

    if (
      member.role !== ClassroomRole.owner &&
      member.role !== ClassroomRole.admin
    ) {
      throw new ForbiddenException(
        `You do not have permission to update this classroom`,
      );
    }

    return this.prisma.classroom.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId: id, userId } },
    });

    if (!member) {
      throw new NotFoundException(`Classroom not found or you are not a member`);
    }

    if (member.role !== ClassroomRole.owner) {
      throw new ForbiddenException(`Only the owner can delete this classroom`);
    }

    // Delete all objects in S3 folder
    try {
      const prefix = `classrooms/${id}/`;
      const listedObjects = await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      }));

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        const deleteParams = {
          Bucket: this.bucketName,
          Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) },
        };
        await this.s3Client.send(new DeleteObjectsCommand(deleteParams));
      }
    } catch (err) {
      console.error('Failed to delete S3 folder for classroom', err);
    }

    return this.prisma.classroom.delete({ where: { id } });
  }

  async joinByCode(userId: string, code: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { inviteCode: code.toUpperCase() },
    });

    if (!classroom) {
      throw new NotFoundException(`Invite code not found`);
    }

    // Already a member?
    const existingMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId: classroom.id, userId } },
    });
    if (existingMember) {
      throw new ConflictException(`You are already a member of this classroom`);
    }

    // Already has a pending request?
    const existingRequest = await this.prisma.classroomJoinRequest.findUnique({
      where: { classroomId_userId: { classroomId: classroom.id, userId } },
    });
    if (existingRequest) {
      throw new ConflictException(`You already have a pending join request for this classroom`);
    }

    // Always create a join request — owner approves it
    await this.prisma.classroomJoinRequest.create({
      data: { classroomId: classroom.id, userId },
    });

    return { classroomId: classroom.id, status: 'pending' };
  }

  async getMyPendingClassrooms(userId: string) {
    const requests = await this.prisma.classroomJoinRequest.findMany({
      where: { userId },
      include: {
        classroom: {
          include: {
            _count: { select: { members: true } },
            owner: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      requestId: r.id,
      createdAt: r.createdAt,
      classroom: r.classroom,
    }));
  }

  async assignCourseToClass(courseId: string, classId: string, userId: string) {
    // 1. Lấy thông tin user thực hiện
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isAdmin = user?.role === GlobalRole.admin;

    // 2. Lấy thông tin khóa học
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    // 3. Logic kiểm tra quyền nghiệp vụ (Business Logic)
    let hasCourseAccess = false;

    if (isAdmin) {
      // Điều kiện 4: userId là Admin (có quyền gắn mọi loại khóa học)
      hasCourseAccess = true;
    } else if (course.visibility === 'public') {
      // Điều kiện 1: Khóa học là public
      hasCourseAccess = true;
    } else if (course.visibility === 'private' && course.instructorId === userId) {
      // Điều kiện 2: Khóa học là private nhưng userId chính là instructor_id
      hasCourseAccess = true;
    } else if (course.visibility === 'sale') {
      // Điều kiện 3: Khóa học là sale nhưng userId đã mua khóa học này
      const membership = await this.prisma.courseMember.findUnique({
        where: {
          courseId_userId: { courseId, userId },
        },
      });
      if (membership) {
        hasCourseAccess = true;
      }
    }

    if (!hasCourseAccess) {
      throw new ForbiddenException(
        'Bạn không có quyền gắn khóa học này vào lớp (Khóa học private của người khác, hoặc khóa học đang bán mà bạn chưa mua).',
      );
    }

    // 4. Kiểm tra xem đã gắn chưa
    const existing = await this.prisma.classroomLinkedCourse.findUnique({
      where: { classroomId_courseId: { classroomId: classId, courseId } },
    });

    if (existing) {
      throw new ConflictException('Khóa học này đã được gắn vào lớp từ trước.');
    }

    // 5. Gắn khóa học vào lớp
    return this.prisma.classroomLinkedCourse.create({
      data: { classroomId: classId, courseId },
    });
  }

  async unlinkCourse(userId: string, classroomId: string, courseId: string) {
    // Logic của Guard (AssignCourseGuard) đã đảm bảo người gọi là Admin hoặc Owner.
    // Ở đây chỉ cần thực hiện việc tháo gỡ.
    const linkedCourse = await this.prisma.classroomLinkedCourse.findUnique({
      where: { classroomId_courseId: { classroomId, courseId } },
    });

    if (!linkedCourse) throw new NotFoundException('Không tìm thấy liên kết khóa học trong lớp này.');

    return this.prisma.classroomLinkedCourse.delete({
      where: { classroomId_courseId: { classroomId, courseId } },
    });
  }
}
