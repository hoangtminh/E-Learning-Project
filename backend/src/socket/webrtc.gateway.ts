import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
  namespace: '/webrtc', // Tạo một namespace riêng cho WebRTC để tách biệt với chat
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Map lưu trữ user trong mỗi phòng và phòng của mỗi user
  private roomToUsers: Map<string, string[]> = new Map();
  private socketToRoom: Map<string, string> = new Map();

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`WebRTC Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const roomId = this.socketToRoom.get(client.id);
    if (roomId) {
      let users = this.roomToUsers.get(roomId) || [];
      users = users.filter((id) => id !== client.id);

      if (users.length > 0) {
        this.roomToUsers.set(roomId, users);
      } else {
        this.roomToUsers.delete(roomId);
      }
      this.socketToRoom.delete(client.id);

      // Báo cho các client khác trong room biết user này đã rời khỏi để họ dọn dẹp RTCPeerConnection
      this.server.to(roomId).emit('user-left', client.id);

      try {
        await this.prisma.call.update({
          where: { id: roomId },
          data: { participantCount: { decrement: 1 } },
        });
      } catch (err) {
        // Chỉ log nếu không phải lỗi "Record not found" (P2025)
        if (!(err instanceof Error && (err as any).code === 'P2025')) {
          console.error('Lỗi khi trừ participantCount', err);
        }
      }
    }
    console.log(`WebRTC Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const { roomId } = payload;
    client.join(roomId);
    this.socketToRoom.set(client.id, roomId);

    const usersInRoom = this.roomToUsers.get(roomId) || [];

    // Trả về danh sách socketId đang có trong phòng để client mới tạo RTCPeerConnection (Mesh Topology)
    client.emit('all-users', usersInRoom);

    usersInRoom.push(client.id);
    this.roomToUsers.set(roomId, usersInRoom);
    console.log(`Client ${client.id} joined WebRTC room ${roomId}`);

    try {
      await this.prisma.call.update({
        where: { id: roomId },
        data: { participantCount: { increment: 1 } },
      });
    } catch (err) {
      // Chỉ log nếu không phải lỗi "Record not found" (P2025)
      if (!(err instanceof Error && (err as any).code === 'P2025')) {
        console.error('Lỗi khi cộng participantCount', err);
      }
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { target: string; caller: string; sdp: any },
  ) {
    this.server
      .to(payload.target)
      .emit('offer', { caller: client.id, sdp: payload.sdp });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { target: string; caller: string; sdp: any },
  ) {
    this.server
      .to(payload.target)
      .emit('answer', { caller: client.id, sdp: payload.sdp });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { target: string; candidate: any },
  ) {
    this.server.to(payload.target).emit('ice-candidate', {
      caller: client.id,
      candidate: payload.candidate,
    });
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      message: string;
      senderId: string;
      senderName: string;
    },
  ) {
    this.server.to(payload.roomId).emit('chat-message', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
