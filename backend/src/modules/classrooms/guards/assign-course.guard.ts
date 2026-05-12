import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AssignCourseGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId || request.user?.sub;
    const classId = request.params.id; // From route parameter ':id'

    if (!userId) {
      return false;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'admin') {
      return true; // Admin has full access
    }

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classId },
    });

    if (classroom?.ownerId === userId) {
      return true; // Owner of the classroom has access
    }

    throw new ForbiddenException('Chỉ Admin hoặc Chủ lớp học mới có quyền thực hiện.');
  }
}
