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

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

@Injectable()
export class ClassroomsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.classroom.create({
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

    return this.prisma.classroom.delete({ where: { id } });
  }

  async joinByCode(userId: string, code: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { inviteCode: code.toUpperCase() },
    });

    if (!classroom) {
      throw new NotFoundException(`Invite code not found`);
    }

    const existing = await this.prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: { classroomId: classroom.id, userId },
      },
    });

    if (existing) {
      throw new ConflictException(`You are already a member of this classroom`);
    }

    // Remove any pending join request
    await this.prisma.classroomJoinRequest
      .delete({
        where: {
          classroomId_userId: { classroomId: classroom.id, userId },
        },
      })
      .catch(() => {});

    const member = await this.prisma.classroomMember.create({
      data: { classroomId: classroom.id, userId, role: ClassroomRole.member },
    });

    return { classroom, member };
  }

  async linkCourse(userId: string, classroomId: string, courseId: string) {
    const adminUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!adminUser || adminUser.role !== GlobalRole.admin) {
      throw new ForbiddenException('Only system admins can link courses to classrooms');
    }

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.prisma.classroomLinkedCourse.findUnique({
      where: { classroomId_courseId: { classroomId, courseId } },
    });

    if (existing) throw new ConflictException('Course already linked to this classroom');

    return this.prisma.classroomLinkedCourse.create({
      data: { classroomId, courseId },
    });
  }

  async unlinkCourse(userId: string, classroomId: string, courseId: string) {
    const adminUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!adminUser || adminUser.role !== GlobalRole.admin) {
      throw new ForbiddenException('Only system admins can unlink courses from classrooms');
    }

    const linkedCourse = await this.prisma.classroomLinkedCourse.findUnique({
      where: { classroomId_courseId: { classroomId, courseId } },
    });

    if (!linkedCourse) throw new NotFoundException('Linked course not found');

    return this.prisma.classroomLinkedCourse.delete({
      where: { classroomId_courseId: { classroomId, courseId } },
    });
  }
}
