import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { GlobalRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
    fullName: string | null;
    role: GlobalRole;
  };
};

@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  findAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.findAllUsers({ page, limit, search });
  }

  @Patch('users/:userId/role')
  updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: GlobalRole,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.updateUserRole(userId, role, req.user.userId);
  }

  @Delete('users/:userId')
  deleteUser(
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.deleteUser(userId, req.user.userId);
  }

  @Get('logs')
  findAllLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.findAllLogs({ page, limit });
  }

  @Post('logs')
  createLog(
    @Body('action') action: string,
    @Body('details') details: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.createLog(req.user.userId, action, details);
  }
}
