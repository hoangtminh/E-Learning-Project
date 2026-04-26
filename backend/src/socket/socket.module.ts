import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WebrtcGateway],
  exports: [WebrtcGateway],
})
export class SocketModule {}
