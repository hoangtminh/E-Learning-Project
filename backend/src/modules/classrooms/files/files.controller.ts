import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClassroomFilesService } from './files.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('classrooms/:classroomId/files')
export class ClassroomFilesController {
  constructor(private readonly filesService: ClassroomFilesService) {}

  @Get()
  async listFiles(
    @Param('classroomId') classroomId: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.filesService.listFiles(classroomId, userId);
  }

  @Post('presigned-upload')
  async getPresignedUploadUrl(
    @Param('classroomId') classroomId: string,
    @Body('filename') filename: string,
    @Body('mimeType') mimeType: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.filesService.getPresignedUploadUrl(classroomId, userId, filename, mimeType);
  }

  @Post('confirm')
  async confirmUpload(
    @Param('classroomId') classroomId: string,
    @Body('s3Key') s3Key: string,
    @Body('name') name: string,
    @Body('sizeBytes') sizeBytes: number,
    @Body('mimeType') mimeType: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.filesService.confirmUpload(classroomId, userId, s3Key, name, sizeBytes, mimeType);
  }

  @Get(':fileId/download')
  async getDownloadUrl(
    @Param('classroomId') classroomId: string,
    @Param('fileId') fileId: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.filesService.getPresignedDownloadUrl(classroomId, fileId, userId);
  }

  @Patch(':fileId')
  async renameFile(
    @Param('classroomId') classroomId: string,
    @Param('fileId') fileId: string,
    @Body('name') name: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.filesService.renameFile(classroomId, fileId, userId, name);
  }

  @Delete(':fileId')
  async deleteFile(
    @Param('classroomId') classroomId: string,
    @Param('fileId') fileId: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.filesService.deleteFile(classroomId, fileId, userId);
  }
}
