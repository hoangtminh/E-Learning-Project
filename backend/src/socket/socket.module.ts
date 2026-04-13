import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { WebrtcGateway } from './webrtc.gateway';

@Module({
  providers: [SocketGateway, WebrtcGateway],
})
export class SocketModule {}
