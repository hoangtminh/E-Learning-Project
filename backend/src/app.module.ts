import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ActivityLoggerInterceptor } from './common/interceptors/activity-logger.interceptor';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SocketModule } from './socket/socket.module';
import { ClassroomMembersModule } from './modules/classroom-members/classroom-members.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CoursesModule } from './modules/courses/courses.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';
import { SectionsModule } from './modules/sections/sections.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { CallsModule } from './modules/calls/calls.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClassroomsModule,
    CoursesModule,
    SectionsModule,
    LessonsModule,
    TasksModule,
    SocketModule,
    ClassroomMembersModule,
    ChatModule,
    NotificationsModule,
    RealtimeModule,
    QuizzesModule,
    CallsModule,
    PaymentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLoggerInterceptor,
    },
  ],
})
export class AppModule {}

