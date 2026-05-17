import { Controller, Post, Body, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create_url')
  async createPaymentUrl(
    @GetCurrentUser() user: any,
    @Body('courseId') courseId: string,
    @Req() req: any
  ) {
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip || '127.0.0.1';

    return this.paymentService.createPaymentUrl(user.userId, courseId, ipAddr);
  }

  @Public()
  @Get('vnpay_ipn')
  async vnpayReturnIpn(@Query() query: any) {
    return this.paymentService.vnpayReturnIpn(query);
  }
}
