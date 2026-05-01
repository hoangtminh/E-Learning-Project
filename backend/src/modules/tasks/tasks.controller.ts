import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

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

  /** POST /classrooms/:classroomId/tasks */
  @Post()
  create(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(this.getUserId(req), classroomId, dto);
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
