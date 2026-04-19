import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { ClassroomRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClassroomsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createClassroomDto: CreateClassroomDto) {
    // Automatically make the user who created it the 'owner'
    return this.prisma.classroom.create({
      data: {
        ...createClassroomDto,
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
    // Return only classrooms where the user is a member
    return this.prisma.classroom.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: { userId },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom not found`);
    }

    // Protect against non-members accessing classroom details
    if (classroom.members.length === 0) {
      throw new ForbiddenException(`You are not a member of this classroom`);
    }

    return classroom;
  }

  async update(
    id: string,
    userId: string,
    updateClassroomDto: UpdateClassroomDto,
  ) {
    const member = await this.prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId: id,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException(
        `Classroom not found or you are not a member`,
      );
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
      data: updateClassroomDto,
    });
  }

  async remove(id: string, userId: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId: id,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException(
        `Classroom not found or you are not a member`,
      );
    }

    if (member.role !== ClassroomRole.owner) {
      throw new ForbiddenException(`Only the owner can delete this classroom`);
    }

    return this.prisma.classroom.delete({
      where: { id },
    });
  }
}
