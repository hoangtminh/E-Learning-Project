import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [PrismaModule, LessonsModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
