import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(instructorId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        ...dto,
        instructorId,
      },
      include: {
        instructor: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async findAll(query?: { page?: number; limit?: number }) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 12;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where: { visibility: 'public' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          _count: {
            select: { sections: true, members: true },
          },
        },
      }),
      this.prisma.course.count({ where: { visibility: 'public' } }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: { sections: true, members: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, userId: string, dto: UpdateCourseDto) {
    const course = await this.findOne(id);

    if (course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only the course instructor can update this course',
      );
    }

    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: {
        instructor: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const course = await this.findOne(id);

    if (course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only the course instructor can delete this course',
      );
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }

  // ── Enrollment ──────────────────────────────────────────

  async enrollCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Check if already enrolled
    const existing = await this.prisma.courseMember.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (existing) {
      throw new ConflictException('You are already enrolled in this course');
    }

    // Private courses require invitation
    if (course.visibility === 'private') {
      const invitation = await this.prisma.courseInvitation.findFirst({
        where: { courseId, inviteeId: userId, acceptedAt: null },
      });

      if (!invitation && course.instructorId !== userId) {
        throw new ForbiddenException(
          'This is a private course. You need an invitation to enroll.',
        );
      }

      // Mark invitation as accepted
      if (invitation) {
        await this.prisma.courseInvitation.update({
          where: { id: invitation.id },
          data: { acceptedAt: new Date() },
        });
      }
    }

    return this.prisma.courseMember.create({
      data: { courseId, userId },
    });
  }

  async checkEnrollment(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (course?.instructorId === userId) {
      return { enrolled: true, enrolledAt: new Date() };
    }

    const member = await this.prisma.courseMember.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    return {
      enrolled: !!member,
      enrolledAt: member?.enrolledAt ?? null,
    };
  }

  async getEnrolledCourses(userId: string) {
    const memberships = await this.prisma.courseMember.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
            _count: {
              select: { sections: true, members: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.course,
      enrolledAt: m.enrolledAt,
    }));
  }

  async unenrollCourse(userId: string, courseId: string) {
    const member = await this.prisma.courseMember.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (!member) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    return this.prisma.courseMember.delete({
      where: { courseId_userId: { courseId, userId } },
    });
  }

  // ── Instructor ──────────────────────────────────────────

  async findMyCoursesAsInstructor(userId: string) {
    return this.prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        instructor: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        _count: {
          select: { sections: true, members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
