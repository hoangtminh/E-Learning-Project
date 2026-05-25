import { Module, forwardRef } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { UserTasksController } from './user-tasks.controller';
import { UserStatsController } from './user-stats.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuizzesModule } from '../quizzes/quizzes.module';

@Module({
  imports: [PrismaModule, QuizzesModule],
  controllers: [TasksController, UserTasksController, UserStatsController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
