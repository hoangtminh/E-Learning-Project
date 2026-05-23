import {
  Controller,
  Get,
  Req,
  Param,
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

  /** GET /assignments/:id */
  @Get(':id')
  findOneForUser(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.findOneForUser(this.getUserId(req), id);
  }
}
