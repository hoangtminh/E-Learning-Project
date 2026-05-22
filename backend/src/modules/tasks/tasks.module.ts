import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { UserTasksController } from './user-tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, UserTasksController],
  providers: [TasksService],
})
export class TasksModule {}
