import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { CallsModule } from '../modules/calls/calls.module';

@Module({
  imports: [PrismaModule, CallsModule],
  providers: [WebrtcGateway],
  exports: [WebrtcGateway],
})
export class SocketModule {}
