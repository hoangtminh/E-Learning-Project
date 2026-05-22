import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class TasksService {
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

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async assertMembership(userId: string, classroomId: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!member) throw new ForbiddenException('You are not a member of this classroom');
    return member;
  }

  private async assertAdminOrOwner(userId: string, classroomId: string) {
    const member = await this.assertMembership(userId, classroomId);
    if (member.role === 'member') {
      throw new ForbiddenException('Only admins and owners can perform this action');
    }
    return member;
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────

  async findAll(userId: string, classroomId: string) {
    await this.assertMembership(userId, classroomId);
    const classroom = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom) throw new NotFoundException('Classroom not found');

    return this.prisma.classroomTask.findMany({
      where: { classroomId },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        submissions: { where: { userId } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForUser(userId: string) {
    // Find all classrooms the user is a member of
    const memberships = await this.prisma.classroomMember.findMany({
      where: { userId },
      select: { classroomId: true },
    });

    const classroomIds = memberships.map(m => m.classroomId);

    return this.prisma.classroomTask.findMany({
      where: { classroomId: { in: classroomIds } },
      include: {
        classroom: { select: { id: true, title: true } },
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        submissions: { where: { userId } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, classroomId: string, dto: CreateTaskDto) {
    await this.assertAdminOrOwner(userId, classroomId);
    const classroom = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
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

  async update(userId: string, classroomId: string, taskId: string, dto: UpdateTaskDto) {
    await this.assertAdminOrOwner(userId, classroomId);
    const task = await this.prisma.classroomTask.findFirst({ where: { id: taskId, classroomId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.classroomTask.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.deadline !== undefined && { deadline: dto.deadline ? new Date(dto.deadline) : null }),
        ...(dto.attachmentKey !== undefined && { attachmentKey: dto.attachmentKey }),
        ...(dto.attachmentName !== undefined && { attachmentName: dto.attachmentName }),
      },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { submissions: true } },
      },
    });
  }

  async remove(userId: string, classroomId: string, taskId: string) {
    await this.assertAdminOrOwner(userId, classroomId);
    const task = await this.prisma.classroomTask.findFirst({ where: { id: taskId, classroomId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.classroomTask.delete({ where: { id: taskId } });
  }

  // ── S3 Presigned URLs ─────────────────────────────────────────────────────

  /** Teacher: presigned upload URL for task attachment file.
   *  S3 path: assignments/{classroomId}/tasks/{taskId}/{uuid}-{filename}
   */
  async getTaskAttachmentPresignedUrl(
    userId: string,
    classroomId: string,
    taskId: string,
    filename: string,
    mimeType: string,
  ) {
    await this.assertAdminOrOwner(userId, classroomId);
    const task = await this.prisma.classroomTask.findFirst({ where: { id: taskId, classroomId } });
    if (!task) throw new NotFoundException('Task not found');

    const uuid = crypto.randomUUID();
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `assignments/${classroomId}/tasks/${taskId}/${uuid}-${safe}`;

    const url = await getSignedUrl(
      this.s3Client,
      new PutObjectCommand({ Bucket: this.bucketName, Key: s3Key, ContentType: mimeType, StorageClass: 'INTELLIGENT_TIERING' }),
      { expiresIn: 900 },
    );
    return { url, s3Key, filename };
  }

  /** All members: presigned download URL for task attachment. */
  async getTaskAttachmentDownloadUrl(userId: string, classroomId: string, taskId: string) {
    await this.assertMembership(userId, classroomId);
    const task = await this.prisma.classroomTask.findFirst({ where: { id: taskId, classroomId } });
    if (!task) throw new NotFoundException('Task not found');
    if (!task.attachmentKey) throw new NotFoundException('No attachment for this task');

    const url = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: task.attachmentKey,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(task.attachmentName || 'download')}"`,
      }),
      { expiresIn: 900 },
    );
    return { url, filename: task.attachmentName };
  }

  /** Student: presigned upload URL for submission file.
   *  S3 path: assignments/{classroomId}/submissions/{taskId}/{userId}/{uuid}-{filename}
   */
  async getSubmissionPresignedUploadUrl(
    userId: string,
    classroomId: string,
    taskId: string,
    filename: string,
    mimeType: string,
  ) {
    await this.assertMembership(userId, classroomId);
    const task = await this.prisma.classroomTask.findFirst({ where: { id: taskId, classroomId } });
    if (!task) throw new NotFoundException('Task not found');

    const uuid = crypto.randomUUID();
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `assignments/${classroomId}/submissions/${taskId}/${userId}/${uuid}-${safe}`;

    const url = await getSignedUrl(
      this.s3Client,
      new PutObjectCommand({ Bucket: this.bucketName, Key: s3Key, ContentType: mimeType, StorageClass: 'INTELLIGENT_TIERING' }),
      { expiresIn: 900 },
    );
    return { url, s3Key, filename };
  }

  /** Admin: presigned download URL for a student's submitted file. */
  async getSubmissionDownloadUrl(
    userId: string,
    classroomId: string,
    taskId: string,
    submissionId: string,
  ) {
    await this.assertAdminOrOwner(userId, classroomId);
    const submission = await this.prisma.taskSubmission.findFirst({ where: { id: submissionId, taskId } });
    if (!submission) throw new NotFoundException('Submission not found');
    if (!submission.fileUrl) throw new NotFoundException('No file attached to this submission');

    if (submission.fileUrl.startsWith('http')) return { url: submission.fileUrl };

    const url = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: submission.fileUrl,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(submission.fileUrl.split('/').pop() || 'download')}"`,
      }),
      { expiresIn: 900 },
    );
    return { url };
  }

  /** Student: presigned download URL for their own submitted file. */
  async getOwnSubmissionDownloadUrl(userId: string, classroomId: string, taskId: string) {
    await this.assertMembership(userId, classroomId);
    const submission = await this.prisma.taskSubmission.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    if (!submission) throw new NotFoundException('No submission found');
    if (!submission.fileUrl) throw new NotFoundException('No file attached to this submission');

    if (submission.fileUrl.startsWith('http')) return { url: submission.fileUrl };

    const url = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: submission.fileUrl,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(submission.fileUrl.split('/').pop() || 'download')}"`,
      }),
      { expiresIn: 900 },
    );
    return { url };
  }

  // ── Submissions ──────────────────────────────────────────────────────────

  async submit(userId: string, classroomId: string, taskId: string, dto: SubmitTaskDto) {
    await this.assertMembership(userId, classroomId);
    const task = await this.prisma.classroomTask.findFirst({ where: { id: taskId, classroomId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.taskSubmission.upsert({
      where: { taskId_userId: { taskId, userId } },
      create: { taskId, userId, content: dto.content, fileUrl: dto.fileUrl },
      update: { content: dto.content, fileUrl: dto.fileUrl, submittedAt: new Date() },
    });
  }

  async getSubmissions(userId: string, classroomId: string, taskId: string) {
    await this.assertAdminOrOwner(userId, classroomId);
    const task = await this.prisma.classroomTask.findFirst({ where: { id: taskId, classroomId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.taskSubmission.findMany({
      where: { taskId },
      include: { user: { select: { id: true, fullName: true, avatarUrl: true, email: true } } },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async grade(
    userId: string,
    classroomId: string,
    taskId: string,
    submissionId: string,
    dto: GradeSubmissionDto,
  ) {
    await this.assertAdminOrOwner(userId, classroomId);
    const submission = await this.prisma.taskSubmission.findFirst({ where: { id: submissionId, taskId } });
    if (!submission) throw new NotFoundException('Submission not found');
    return this.prisma.taskSubmission.update({ where: { id: submissionId }, data: { grade: dto.grade } });
  }
}
