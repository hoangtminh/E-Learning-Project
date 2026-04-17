import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomsService {
  constructor(private prisma: PrismaService) {}

  create(createClassroomDto: CreateClassroomDto) {
    return this.prisma.classroom.create({
      data: createClassroomDto,
    });
  }

  findAll() {
    return this.prisma.classroom.findMany();
  }

  async findOne(id: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
    });
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }
    return classroom;
  }

  async update(id: string, updateClassroomDto: UpdateClassroomDto) {
    await this.findOne(id);
    return this.prisma.classroom.update({
      where: { id },
      data: updateClassroomDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.classroom.delete({
      where: { id },
    });
  }
}
