import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        ...dto,
        ownerId,
      },
      include: {
        owner: {
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
          owner: {
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
        owner: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
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

    if (course.ownerId !== userId) {
      throw new ForbiddenException('Only the course owner can update this course');
    }

    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: {
        owner: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const course = await this.findOne(id);

    if (course.ownerId !== userId) {
      throw new ForbiddenException('Only the course owner can delete this course');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }
}
