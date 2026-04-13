import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    // Authenticate users before they connect to the socket
    server.use((client: Socket, next) => {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers['authorization'];

      if (!token) {
        return next(new Error('Unauthorized: No token provided'));
      }

      try {
        // TODO: Add your actual authentication logic here.
        // Example: const decoded = this.jwtService.verify(token);
        // client.data.userId = decoded.sub;

        client.data.userId = token; // Assuming the token serves as userId for this mock
        next();
      } catch (err) {
        next(new Error('Unauthorized: Invalid token'));
      }
    });
  }

  handleConnection(client: Socket) {
    const userId = client.data.userId;
    client.join(`chat/${userId}`); // Join a user-specific room
    console.log(`Client connected: ${client.id} (User ID: ${userId})`);
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId;
    console.log(`Client disconnected: ${client.id} (User ID: ${userId})`);
  }

  @SubscribeMessage('message')
  handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      targetUserId: string;
      message: string;
    },
  ) {
    const { targetUserId, message } = payload;
    const eventPath = `chat/${targetUserId}`;

    console.log(
      `Message from ${client.data.userId} to ${eventPath}: `,
      message,
    );

    // Emit message to the target user's room on the path 'chat/userid'
    this.server.to(targetUserId).emit(eventPath, {
      from: client.data.userId,
      message,
    });
  }
}
