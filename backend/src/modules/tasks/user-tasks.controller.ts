import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('assignments')
export class UserTasksController {
  constructor(private readonly tasksService: TasksService) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return userId;
  }

  /** GET /assignments */
  @Get()
  findAllForUser(@Req() req: any) {
    return this.tasksService.findAllForUser(this.getUserId(req));
  }
}
