import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClassroomFilesController } from './files/files.controller';
import { ClassroomFilesService } from './files/files.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ClassroomsController, ClassroomFilesController],
  providers: [ClassroomsService, ClassroomFilesService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
