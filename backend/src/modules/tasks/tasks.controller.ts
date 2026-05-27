import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { IsString, IsNotEmpty } from 'class-validator';

class PresignedUploadQueryDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;
}

@Controller('classrooms/:classroomId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return userId;
  }

  /** GET /classrooms/:classroomId/tasks */
  @Get()
  findAll(@Req() req: any, @Param('classroomId') classroomId: string) {
    return this.tasksService.findAll(this.getUserId(req), classroomId);
  }

  /** GET /classrooms/:classroomId/tasks/:taskId */
  @Get(':taskId')
  findOne(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findOne(this.getUserId(req), classroomId, taskId);
  }

  /** POST /classrooms/:classroomId/tasks */
  @Post()
  create(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(this.getUserId(req), classroomId, dto);
  }

  /** PATCH /classrooms/:classroomId/tasks/:taskId */
  @Patch(':taskId')
  update(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      this.getUserId(req),
      classroomId,
      taskId,
      dto,
    );
  }

  /** DELETE /classrooms/:classroomId/tasks/:taskId */
  @Delete(':taskId')
  remove(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.remove(this.getUserId(req), classroomId, taskId);
  }

  /**
   * GET /classrooms/:classroomId/tasks/:taskId/attachment/presigned-upload
   * Admin/owner gets a presigned URL to upload the task's attachment file.
   */
  @Get(':taskId/attachment/presigned-upload')
  getTaskAttachmentPresignedUpload(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
    @Query('filename') filename: string,
    @Query('mimeType') mimeType: string,
  ) {
    return this.tasksService.getTaskAttachmentPresignedUrl(
      this.getUserId(req),
      classroomId,
      taskId,
      filename,
      mimeType,
    );
  }

  /**
   * GET /classrooms/:classroomId/tasks/:taskId/attachment/download
   * Any member gets a presigned URL to download the task's attachment.
   */
  @Get(':taskId/attachment/download')
  getTaskAttachmentDownload(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.getTaskAttachmentDownloadUrl(
      this.getUserId(req),
      classroomId,
      taskId,
    );
  }

  /**
   * GET /classrooms/:classroomId/tasks/:taskId/submissions/presigned-upload
   */
  @Get(':taskId/submissions/presigned-upload')
  getSubmissionPresignedUpload(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
    @Query('filename') filename: string,
    @Query('mimeType') mimeType: string,
  ) {
    return this.tasksService.getSubmissionPresignedUploadUrl(
      this.getUserId(req),
      classroomId,
      taskId,
      filename,
      mimeType,
    );
  }

  /** POST /classrooms/:classroomId/tasks/:taskId/submit */
  @Post(':taskId/submit')
  submit(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
    @Body() dto: SubmitTaskDto,
  ) {
    return this.tasksService.submit(
      this.getUserId(req),
      classroomId,
      taskId,
      dto,
    );
  }

  /** GET /classrooms/:classroomId/tasks/:taskId/submissions — admin/owner only */
  @Get(':taskId/submissions')
  getSubmissions(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.getSubmissions(
      this.getUserId(req),
      classroomId,
      taskId,
    );
  }

  /**
   * GET /classrooms/:classroomId/tasks/:taskId/submissions/:submissionId/download
   * Admin/owner gets a presigned download URL for a student's file.
   */
  @Get(':taskId/submissions/:submissionId/download')
  getSubmissionDownload(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
    @Param('submissionId') submissionId: string,
  ) {
    return this.tasksService.getSubmissionDownloadUrl(
      this.getUserId(req),
      classroomId,
      taskId,
      submissionId,
    );
  }

  /**
   * GET /classrooms/:classroomId/tasks/:taskId/my-submission/download
   * Student downloads their own submitted file.
   */
  @Get(':taskId/my-submission/download')
  getMySubmissionDownload(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.getOwnSubmissionDownloadUrl(
      this.getUserId(req),
      classroomId,
      taskId,
    );
  }

  /** PATCH /classrooms/:classroomId/tasks/:taskId/submissions/:submissionId/grade */
  @Patch(':taskId/submissions/:submissionId/grade')
  grade(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('taskId') taskId: string,
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.tasksService.grade(
      this.getUserId(req),
      classroomId,
      taskId,
      submissionId,
      dto,
    );
  }
}
