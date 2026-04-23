import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { WebrtcGateway } from './webrtc.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SocketGateway, WebrtcGateway],
})
export class SocketModule {}
