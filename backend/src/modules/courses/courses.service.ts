import {
  BadRequestException,
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
        where: { visibility: { in: ['public', 'sale'] } },
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
      this.prisma.course.count({ where: { visibility: { in: ['public', 'sale'] } } }),
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
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
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

    // Dynamic duration calculation
    let totalVideoSec = 0;
    let totalTextSec = 0;
    let totalQuizSec = 0;

    // Collect all quiz IDs to fetch their durations in one query
    const quizIds: string[] = [];
    course.sections.forEach((s) => {
      s.lessons.forEach((l) => {
        if (l.type === 'quiz' && l.contentUrl) {
          quizIds.push(l.contentUrl);
        }
      });
    });

    // Fetch quiz durations
    const quizzes = quizIds.length > 0
      ? await this.prisma.quiz.findMany({
          where: { id: { in: quizIds } },
          select: { id: true, duration: true },
        })
      : [];
    const quizDurationMap = new Map(quizzes.map((q) => [q.id, q.duration]));

    // Map through lessons to enrich and aggregate
    const enrichedSections = course.sections.map((s) => ({
      ...s,
      lessons: s.lessons.map((l) => {
        let finalDurationSec = l.durationSec || 0;
        if (l.type === 'video') {
          totalVideoSec += finalDurationSec;
        } else if (l.type === 'text') {
          // Calculate dynamic reading time based on word count of the body text (approx 200 words per minute)
          if (!finalDurationSec) {
            const textContent = l.body || '';
            // Strip HTML tags if any (quill editor outputs HTML)
            const plainText = textContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const wordCount = plainText ? plainText.split(/\s+/).length : 0;
            // 200 WPM, min 1 minute (60 seconds)
            const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));
            finalDurationSec = readingTimeMin * 60;
          }
          totalTextSec += finalDurationSec;
        } else if (l.type === 'quiz') {
          // Look up quiz duration in map (default to 15 minutes = 900 seconds)
          const quizMin = l.contentUrl ? (quizDurationMap.get(l.contentUrl) || 15) : 15;
          finalDurationSec = quizMin * 60;
          totalQuizSec += finalDurationSec;
        }
        return {
          ...l,
          durationSec: finalDurationSec,
        };
      }),
    }));

    const totalSec = totalVideoSec + totalTextSec + totalQuizSec;
    // Round to nearest minute
    const totalDurationMin = Math.round(totalSec / 60);

    return {
      ...course,
      sections: enrichedSections,
      totalDurationMin,
      durationBreakdown: {
        video: totalVideoSec,
        text: totalTextSec,
        quiz: totalQuizSec,
      },
    };
  }

  async update(id: string, userId: string, dto: UpdateCourseDto) {
    const course = await this.findOne(id);

    if (course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only the course instructor can update this course',
      );
    }

    return this.prisma.course.update({
      where: { id: course.id },
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
      where: { id: course.id },
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

    // Block direct enrollment for paid courses
    if (Number(course.price) > 0) {
      throw new BadRequestException('This is a paid course. You must pay to enroll.');
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
            sections: {
              include: {
                _count: {
                  select: { lessons: true },
                },
              },
            },
            progresses: {
              where: {
                userId,
                isCompleted: true,
              },
              select: {
                lessonId: true,
              },
            },
            _count: {
              select: { sections: true, members: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const enrolledCourses = await Promise.all(
      memberships.map(async (m) => {
        const totalLessons = await this.prisma.lesson.count({
          where: { section: { courseId: m.course.id } },
        });
        const completedLessons = await this.prisma.userProgress.count({
          where: {
            userId,
            courseId: m.course.id,
            isCompleted: true,
          },
        });
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        return {
          ...m.course,
          enrolledAt: m.enrolledAt,
          progressPercent,
          completedLessons,
          totalLessons,
        };
      })
    );

    return enrolledCourses;
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

  async saveLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    lastWatchedSecond: number,
    isCompleted: boolean,
  ) {
    return this.prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        lastWatchedSecond,
        isCompleted,
        updatedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        lessonId,
        lastWatchedSecond,
        isCompleted,
      },
    });
  }

  async getCourseProgress(userId: string, courseId: string) {
    return this.prisma.userProgress.findMany({
      where: {
        userId,
        courseId,
      },
    });
  }

  async getContinueLearning(userId: string, courseId: string) {
    const lastProgress = await this.prisma.userProgress.findFirst({
      where: {
        userId,
        courseId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (lastProgress) {
      return { lessonId: lastProgress.lessonId };
    }

    // Find the first lesson of the first section in the course
    const firstSection = await this.prisma.section.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    const firstLesson = firstSection?.lessons?.[0];
    return { lessonId: firstLesson?.id ?? null };
  }
}

