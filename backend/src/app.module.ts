import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SocketModule } from './socket/socket.module';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';
import { ClassroomMembersModule } from './modules/classroom-members/classroom-members.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClassroomsModule,
    SocketModule,
    ClassroomMembersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
