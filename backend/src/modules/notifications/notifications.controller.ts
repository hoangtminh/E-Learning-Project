import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return userId;
  }

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAll(this.getUserId(req));
  }

  @Patch(':id/read')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(this.getUserId(req), id);
  }

  @Delete(':id')
  deleteNotification(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(this.getUserId(req), id);
  }
}
