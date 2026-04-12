import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClassroomsModule } from './classrooms/classrooms.module';

@Module({
  imports: [PrismaModule, ClassroomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
