import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { QuizzesService } from '../quizzes/quizzes.service';

@Controller('user-stats')
export class UserStatsController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly quizzesService: QuizzesService,
  ) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return userId;
  }

  @Get('unfinished-assignments')
  async getUnfinishedAssignments(@Req() req: any) {
    const userId = this.getUserId(req);

    // Get all tasks for user and filter those without submissions
    const tasks = await this.tasksService.findAllForUser(userId);
    const unfinishedTasksCount = tasks.filter(t => t.submissions.length === 0).length;

    // Get joined quizzes and filter those without submissions
    // Note: This logic depends on whether we want to include public quizzes too.
    // For dashboard, joined/assigned quizzes make more sense.
    const joinedQuizzes = await this.quizzesService.getJoinedQuizzes(userId);
    
    // We need to check submissions for these quizzes. 
    // Since getJoinedQuizzes doesn't include user's submissions in its return, 
    // we might need a more efficient way or loop through them.
    
    let unfinishedQuizzesCount = 0;
    for (const quiz of joinedQuizzes) {
        const submissions = await this.quizzesService.getQuizSubmissions(userId, quiz.id);
        if (submissions.length === 0) {
            unfinishedQuizzesCount++;
        }
    }

    return {
      unfinishedTasks: unfinishedTasksCount,
      unfinishedQuizzes: unfinishedQuizzesCount,
      totalUnfinished: unfinishedTasksCount + unfinishedQuizzesCount,
    };
  }
}
