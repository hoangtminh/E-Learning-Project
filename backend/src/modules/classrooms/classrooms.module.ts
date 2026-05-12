import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClassroomFilesController } from './files/files.controller';
import { ClassroomFilesService } from './files/files.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClassroomsController, ClassroomFilesController],
  providers: [ClassroomsService, ClassroomFilesService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
