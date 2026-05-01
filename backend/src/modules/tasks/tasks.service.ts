import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // ── Helper ──────────────────────────────────────────────────────────────────

  private async assertMembership(userId: string, classroomId: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this classroom');
    }
    return member;
  }

  private async assertAdminOrOwner(userId: string, classroomId: string) {
    const member = await this.assertMembership(userId, classroomId);
    if (member.role === 'member') {
      throw new ForbiddenException(
        'Only admins and owners can perform this action',
      );
    }
    return member;
  }

  // ── Tasks ────────────────────────────────────────────────────────────────────

  /** List all tasks in a classroom, including the current user's submission */
  async findAll(userId: string, classroomId: string) {
    await this.assertMembership(userId, classroomId);

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');

    return this.prisma.classroomTask.findMany({
      where: { classroomId },
      include: {
        creator: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        // Only return the current user's own submission
        submissions: {
          where: { userId },
        },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Create a new task — owner/admin only */
  async create(
    userId: string,
    classroomId: string,
    dto: CreateTaskDto,
  ) {
    await this.assertAdminOrOwner(userId, classroomId);

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');

    return this.prisma.classroomTask.create({
      data: {
        classroomId,
        creatorId: userId,
        title: dto.title,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { submissions: true } },
      },
    });
  }

  /** Delete a task — owner/admin only */
  async remove(userId: string, classroomId: string, taskId: string) {
    await this.assertAdminOrOwner(userId, classroomId);

    const task = await this.prisma.classroomTask.findFirst({
      where: { id: taskId, classroomId },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.classroomTask.delete({ where: { id: taskId } });
  }

  // ── Submissions ──────────────────────────────────────────────────────────────

  /** Submit or update submission for a task */
  async submit(
    userId: string,
    classroomId: string,
    taskId: string,
    dto: SubmitTaskDto,
  ) {
    await this.assertMembership(userId, classroomId);

    const task = await this.prisma.classroomTask.findFirst({
      where: { id: taskId, classroomId },
    });
    if (!task) throw new NotFoundException('Task not found');

    // Upsert: create if not exists, update if exists
    return this.prisma.taskSubmission.upsert({
      where: { taskId_userId: { taskId, userId } },
      create: {
        taskId,
        userId,
        content: dto.content,
        fileUrl: dto.fileUrl,
      },
      update: {
        content: dto.content,
        fileUrl: dto.fileUrl,
        submittedAt: new Date(),
      },
    });
  }

  /** Get all submissions for a task — admin/owner only */
  async getSubmissions(userId: string, classroomId: string, taskId: string) {
    await this.assertAdminOrOwner(userId, classroomId);

    const task = await this.prisma.classroomTask.findFirst({
      where: { id: taskId, classroomId },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.taskSubmission.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  /** Grade a submission — admin/owner only */
  async grade(
    userId: string,
    classroomId: string,
    taskId: string,
    submissionId: string,
    dto: GradeSubmissionDto,
  ) {
    await this.assertAdminOrOwner(userId, classroomId);

    const submission = await this.prisma.taskSubmission.findFirst({
      where: { id: submissionId, taskId },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    return this.prisma.taskSubmission.update({
      where: { id: submissionId },
      data: { grade: dto.grade },
    });
  }
}
