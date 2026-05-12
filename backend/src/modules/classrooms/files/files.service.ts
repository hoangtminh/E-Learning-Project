import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClassroomRole } from '@prisma/client';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class ClassroomFilesService {
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

  async getPresignedUploadUrl(classroomId: string, userId: string, filename: string, mimeType: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });

    if (!member || (member.role !== ClassroomRole.owner && member.role !== ClassroomRole.admin)) {
      throw new ForbiddenException('Only admins can upload files');
    }

    const fileId = crypto.randomUUID();
    const s3Key = `classrooms/${classroomId}/${fileId}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: mimeType,
      StorageClass: 'INTELLIGENT_TIERING',
    });

    // URL expires in 15 minutes
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

    return { url, s3Key };
  }

  async confirmUpload(classroomId: string, userId: string, s3Key: string, name: string, sizeBytes: number, mimeType: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });

    if (!member || (member.role !== ClassroomRole.owner && member.role !== ClassroomRole.admin)) {
      throw new ForbiddenException('Only admins can confirm uploads');
    }

    // Verify S3 object exists? Optional, assume frontend uploaded it if they are calling this.
    // For safety, could headObject, but let's just create DB record.

    return this.prisma.classroomFile.create({
      data: {
        classroomId,
        uploaderId: userId,
        s3Key,
        name,
        sizeBytes,
        mimeType,
      },
      include: {
        uploader: {
          select: { fullName: true, avatarUrl: true }
        }
      }
    });
  }

  async listFiles(classroomId: string, userId: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this classroom');
    }

    return this.prisma.classroomFile.findMany({
      where: { classroomId },
      include: {
        uploader: {
          select: { fullName: true, avatarUrl: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async getPresignedDownloadUrl(classroomId: string, fileId: string, userId: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this classroom');
    }

    const file = await this.prisma.classroomFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.classroomId !== classroomId) {
      throw new NotFoundException('File not found');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
    return { url };
  }

  async renameFile(classroomId: string, fileId: string, userId: string, newName: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });

    if (!member || (member.role !== ClassroomRole.owner && member.role !== ClassroomRole.admin)) {
      throw new ForbiddenException('Only admins can rename files');
    }

    const file = await this.prisma.classroomFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.classroomId !== classroomId) {
      throw new NotFoundException('File not found');
    }

    return this.prisma.classroomFile.update({
      where: { id: fileId },
      data: { name: newName },
    });
  }

  async deleteFile(classroomId: string, fileId: string, userId: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });

    if (!member || (member.role !== ClassroomRole.owner && member.role !== ClassroomRole.admin)) {
      throw new ForbiddenException('Only admins can delete files');
    }

    const file = await this.prisma.classroomFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.classroomId !== classroomId) {
      throw new NotFoundException('File not found');
    }

    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: file.s3Key,
      }));
    } catch (error) {
      console.error('Failed to delete S3 object', error);
      // Even if S3 delete fails (e.g. object already gone), we should delete from DB
    }

    await this.prisma.classroomFile.delete({
      where: { id: fileId },
    });

    return { success: true };
  }
}
