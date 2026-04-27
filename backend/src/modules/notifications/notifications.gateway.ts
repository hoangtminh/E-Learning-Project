import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notification',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
    if (userId) {
      client.join(`notification/${userId}`);
      console.log(`User ${userId} connected to notifications namespace`);
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from notifications: ${client.id}`);
  }

  // Example: Notify user about something
  sendNotification(userId: string, data: any) {
    this.server.to(`notification/${userId}`).emit('notification:new', data);
  }
}
