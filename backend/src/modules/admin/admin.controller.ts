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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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

  // ───────────────── STATS ─────────────────

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('stats/logs')
  getLogStats(@Query('days') days?: number) {
    return this.adminService.getLogStats(Number(days) || 14);
  }

  // ───────────────── USERS ─────────────────

  @Get('users')
  findAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
  ) {
    return this.adminService.findAllUsers({ page, limit, search, role, status, sortBy, sortDir });
  }

  @Get('users/:userId')
  getUserDetail(@Param('userId') userId: string) {
    return this.adminService.getUserDetail(userId);
  }

  @Post('users')
  createUser(
    @Body() body: { email: string; password: string; fullName?: string; role?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.createUser(body, req.user.userId);
  }

  @Patch('users/:userId/role')
  updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: GlobalRole,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.updateUserRole(userId, role, req.user.userId);
  }

  @Patch('users/:userId/suspend')
  suspendUser(
    @Param('userId') userId: string,
    @Body('suspend') suspend: boolean,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.suspendUser(userId, suspend, req.user.userId);
  }

  @Patch('users/:userId/reset-password')
  resetPassword(
    @Param('userId') userId: string,
    @Body('newPassword') newPassword: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.resetPassword(userId, newPassword, req.user.userId);
  }

  @Delete('users/:userId')
  deleteUser(
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.deleteUser(userId, req.user.userId);
  }

  // ───────────────── LOGS ─────────────────

  @Get('logs')
  findAllLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('level') level?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.adminService.findAllLogs({ page, limit, action, userId, level, dateFrom, dateTo });
  }

  @Get('logs/export')
  async exportLogs(
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('level') level?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.adminService.exportLogs({ action, userId, level, dateFrom, dateTo });
    res!.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res!.setHeader('Content-Disposition', `attachment; filename="system-logs-${Date.now()}.csv"`);
    res!.send('\uFEFF' + csv); // BOM for Excel UTF-8
  }

  @Get('logs/actions')
  getDistinctActions() {
    return this.adminService.getDistinctActions();
  }

  @Post('logs')
  createLog(
    @Body('action') action: string,
    @Body('details') details: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.createLog(req.user.userId, action, details);
  }

  @Delete('logs/bulk')
  bulkDeleteLogs(
    @Body('olderThanDays') olderThanDays: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.bulkDeleteLogs(olderThanDays || 30, req.user.userId);
  }
}
