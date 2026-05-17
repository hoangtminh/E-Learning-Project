import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'qs';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async createPaymentUrl(userId: string, courseId: string, ipAddr: string) {
    try {
      console.log(`Creating payment URL for userId: ${userId}, courseId: ${courseId}`);

      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const course = await this.prisma.course.findFirst({
        where: {
          OR: [
            { id: courseId },
            { slug: courseId }
          ]
        }
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      if (Number(course.price) <= 0) {
        throw new BadRequestException('Course is free');
      }

      const amount = Number(course.price);
      const txnRef = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Double check if user exists to avoid foreign key error
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found in database`);
      }

      await this.prisma.transaction.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amount,
          vnpTxnRef: txnRef,
          status: 'pending',
        }
      });

      const tmnCode = this.configService.get<string>('VNP_TMN_CODE') || '';
      const secretKey = this.configService.get<string>('VNP_HASH_SECRET') || '';
      const vnpUrl = this.configService.get<string>('VNP_URL') || '';
      const returnUrl = this.configService.get<string>('VNP_RETURN_URL') || '';

      const createDate = this.formatDate(new Date());

      const vnpParams: Record<string, string | number> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Thanh toan khoa hoc ${course.id}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      const sortedParams = this.sortObject(vnpParams);

      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      sortedParams['vnp_SecureHash'] = signed;

      const paymentUrl = vnpUrl + '?' + querystring.stringify(sortedParams, { encode: false });

      return { paymentUrl };
    } catch (error) {
      console.error('PaymentService Error:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message || 'Internal Server Error');
    }
  }

  async vnpayReturnIpn(query: any) {
    const vnp_SecureHash = query['vnp_SecureHash'];
    delete query['vnp_SecureHash'];
    delete query['vnp_SecureHashType'];

    const sortedParams = this.sortObject(query);
    const secretKey = this.configService.get<string>('VNP_HASH_SECRET') || '';
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (vnp_SecureHash !== signed) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const orderId = query['vnp_TxnRef'];
    const rspCode = query['vnp_ResponseCode'];
    const amount = Number(query['vnp_Amount']) / 100;

    const transaction = await this.prisma.transaction.findUnique({
      where: { vnpTxnRef: orderId }
    });

    if (!transaction) {
      return { RspCode: '01', Message: 'Order not found' };
    }

    if (Number(transaction.amount) !== amount) {
      return { RspCode: '04', Message: 'Invalid amount' };
    }

    if (transaction.status !== 'pending') {
      return { RspCode: '02', Message: 'Order already confirmed' };
    }

    if (rspCode === '00') {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { 
              status: 'success',
              vnpBankCode: query['vnp_BankCode'],
              vnpBankTranNo: query['vnp_BankTranNo'],
              vnpCardType: query['vnp_CardType'],
              vnpPayDate: query['vnp_PayDate'],
              vnpOrderInfo: query['vnp_OrderInfo'],
              vnpTransactionNo: query['vnp_TransactionNo'],
              vnpResponseCode: rspCode,
            }
          });

          await tx.courseMember.create({
            data: {
              userId: transaction.userId,
              courseId: transaction.courseId,
            }
          });
        });
        return { RspCode: '00', Message: 'Confirm Success' };
      } catch (error) {
        return { RspCode: '99', Message: 'Server error' };
      }
    } else {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: 'failed',
          vnpBankCode: query['vnp_BankCode'],
          vnpBankTranNo: query['vnp_BankTranNo'],
          vnpCardType: query['vnp_CardType'],
          vnpPayDate: query['vnp_PayDate'],
          vnpOrderInfo: query['vnp_OrderInfo'],
          vnpTransactionNo: query['vnp_TransactionNo'],
          vnpResponseCode: rspCode, 
        }
      });
      return { RspCode: '00', Message: 'Confirm Success' };
    }
  }

  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort((a, b) => a.toString().localeCompare(b.toString()));
    for (const key of keys) {
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
    }
    return sorted;
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear().toString();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return yyyy + MM + dd + HH + mm + ss;
  }
}
