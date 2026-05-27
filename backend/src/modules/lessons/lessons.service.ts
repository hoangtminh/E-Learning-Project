import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class LessonsService {
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

  async getPresignedUploadUrl(filename: string, mimeType: string) {
    const fileId = crypto.randomUUID();
    const s3Key = `lessons/${fileId}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

    // The public URL to access the file after upload
    const publicUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${s3Key}`;

    return { uploadUrl: url, s3Key, publicUrl };
  }

  async create(sectionId: string, dto: CreateLessonDto) {
    // Verify section exists
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    // Dynamic duration resolution for YouTube URL
    let resolvedDurationSec = dto.durationSec;
    if (dto.type === 'video' && dto.contentUrl && (!resolvedDurationSec || resolvedDurationSec === 0)) {
      const ytDuration = await getYoutubeVideoDuration(dto.contentUrl);
      if (ytDuration) resolvedDurationSec = ytDuration;
    }

    try {
      return await this.prisma.lesson.create({
        data: {
          ...dto,
          durationSec: resolvedDurationSec,
          sectionId,
        },
      });
    } catch (error: any) {
      require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + error.stack + '\n');
      throw error;
    }
  }

  async findAllBySection(sectionId: string) {
    return this.prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto) {
    const lesson = await this.findOne(id);

    // Dynamic duration resolution for YouTube URL
    let resolvedDurationSec = dto.durationSec;
    if (
      (dto.type === 'video' || (!dto.type && lesson.type === 'video')) &&
      (dto.contentUrl || lesson.contentUrl) &&
      (!resolvedDurationSec || resolvedDurationSec === 0)
    ) {
      const targetUrl = dto.contentUrl || lesson.contentUrl;
      if (targetUrl) {
        const ytDuration = await getYoutubeVideoDuration(targetUrl);
        if (ytDuration) resolvedDurationSec = ytDuration;
      }
    }

    return this.prisma.lesson.update({
      where: { id },
      data: {
        ...dto,
        ...(resolvedDurationSec !== undefined ? { durationSec: resolvedDurationSec } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}

// ── YouTube Video Duration Scraper Helper ──
async function getYoutubeVideoDuration(url: string): Promise<number | null> {
  try {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    if (!videoId) return null;

    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const html = await response.text();
    
    // Find lengthSeconds":"123"
    const lengthSecondsMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
    if (lengthSecondsMatch && lengthSecondsMatch[1]) {
      return parseInt(lengthSecondsMatch[1], 10);
    }

    // Try backup check for approxDurationMs
    const approxDurationMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/);
    if (approxDurationMatch && approxDurationMatch[1]) {
      return Math.round(parseInt(approxDurationMatch[1], 10) / 1000);
    }

    return null;
  } catch (error) {
    console.error('Error fetching YouTube duration:', error);
    return null;
  }
}
