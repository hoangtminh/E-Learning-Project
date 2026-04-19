import { Module } from '@nestjs/common';
import { ClassroomMembersService } from './classroom-members.service';
import { ClassroomMembersController } from './classroom-members.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClassroomMembersController],
  providers: [ClassroomMembersService],
  exports: [ClassroomMembersService],
})
export class ClassroomMembersModule {}
