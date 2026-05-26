import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallDto } from './create-call.dto';

@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return userId;
  }

  /**
   * POST /calls
   * Create a new call room
   */
  @Post()
  async create(@Req() req: any, @Body() dto: CreateCallDto) {
    const userId = this.getUserId(req);
    return this.callsService.create(userId, dto);
  }

  /**
   * GET /calls
   * Get all ongoing calls
   */
  @Get()
  async findOngoing() {
    return this.callsService.findOngoing();
  }

  /**
   * GET /calls/history
   * Get call history for current user
   */
  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.callsService.getCallHistory(userId);
  }

  /**
   * GET /calls/:id
   * Get call room details
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.callsService.findOne(id);
  }

  /**
   * GET /calls/:id/can-join
   * Check if the current user can join the call
   */
  @Get(':id/can-join')
  async canJoin(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.callsService.canJoin(userId, id);
  }

  /**
   * POST /calls/:id/approve
   * Host approves a participant to join a private call
   */
  @Post(':id/approve')
  async approve(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    const hostId = this.getUserId(req);
    return this.callsService.approveUser(hostId, id, body.userId);
  }

  /**
   * POST /calls/:id/transfer-host
   * Host transfers ownership of the call
   */
  @Post(':id/transfer-host')
  async transferHost(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { newHostId: string },
  ) {
    const hostId = this.getUserId(req);
    return this.callsService.transferHost(id, hostId, body.newHostId);
  }

  /**
   * POST /calls/:id/end
   * Host ends the call
   */
  @Post(':id/end')
  async endCall(@Req() req: any, @Param('id') id: string) {
    const hostId = this.getUserId(req);
    return this.callsService.endCall(hostId, id);
  }
}
