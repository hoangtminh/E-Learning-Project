import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UseFilters, UsePipes, ValidationPipe, Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway(3001, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    server.use((client: Socket, next) => {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers['authorization'];

      if (!token) {
        // For now, if no token, check for userId in auth (backward compatibility or simpler auth)
        if (client.handshake.auth?.userId) {
          client.data.userId = client.handshake.auth.userId;
          return next();
        }
        return next(new Error('Unauthorized: No token provided'));
      }

      try {
        // TODO: Validate token and set userId
        client.data.userId = token; 
        next();
      } catch (err) {
        next(new Error('Unauthorized: Invalid token'));
      }
    });
  }

  async handleConnection(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      client.join(`chat/${userId}`);
      console.log(`User ${userId} connected to chat namespace`);
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`User ${client.data.userId} disconnected from chat.`);
  }

  @SubscribeMessage('send_message')
  @UsePipes(new ValidationPipe())
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const message = await this.chatService.sendMessage(userId, payload);
      return { status: 'success', message };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      await this.chatService.joinConversation(userId, payload.conversationId);
      return { status: 'success' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
