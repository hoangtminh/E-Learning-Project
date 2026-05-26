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
import { CallsService } from '../modules/calls/calls.service';
import { UseFilters } from '@nestjs/common';

@WebSocketGateway({
  path: '/api/socket.io',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/webrtc', // Separate namespace for WebRTC
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Map to store active socketIds inside a room: roomId -> socketIds[]
  private roomToUsers: Map<string, string[]> = new Map();
  // Map to map socketId to roomId: socketId -> roomId
  private socketToRoom: Map<string, string> = new Map();

  // Maps to store user metadata based on socketId
  private socketToUserId: Map<string, string> = new Map();
  private socketToUserName: Map<string, string> = new Map();
  private socketToUserEmail: Map<string, string> = new Map();

  // Map to store users in waiting room: roomId -> Array<{ socketId, userId, email, name }>
  private roomToWaitingUsers: Map<
    string,
    Array<{ socketId: string; userId: string; email: string; name: string }>
  > = new Map();

  // Map to store active screen sharer in a room: roomId -> { socketId, name, streamId? }
  private roomToScreenSharer: Map<
    string,
    { socketId: string; name: string; streamId?: string }
  > = new Map();

  constructor(
    private prisma: PrismaService,
    private callsService: CallsService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`WebRTC Client connected: ${client.id}`);
    
    // Support retrieving userId from handshake auth
    const userId = client.handshake.auth?.userId;
    if (userId) {
      this.socketToUserId.set(client.id, userId);
      console.log(`WebRTC Client ${client.id} mapped to User ID ${userId}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const roomId = this.socketToRoom.get(client.id);
    const userId = this.socketToUserId.get(client.id) || client.handshake.auth?.userId;

    if (roomId) {
      let users = this.roomToUsers.get(roomId) || [];
      users = users.filter((id) => id !== client.id);

      if (users.length > 0) {
        this.roomToUsers.set(roomId, users);
      } else {
        this.roomToUsers.delete(roomId);
      }
      this.socketToRoom.delete(client.id);

      // Notify other clients in room that this user left
      this.server.to(roomId).emit('user-left', client.id);

      // Clean up screen sharing if they were presenting
      const activeSharer = this.roomToScreenSharer.get(roomId);
      if (activeSharer && activeSharer.socketId === client.id) {
        this.roomToScreenSharer.delete(roomId);
        this.server.to(roomId).emit('screen-share-stopped', {
          socketId: client.id,
        });
      }

      try {
        // Decrement participant count
        await this.prisma.call.update({
          where: { id: roomId },
          data: { participantCount: { decrement: 1 } },
        });
      } catch (err) {
        if (!(err instanceof Error && (err as any).code === 'P2025')) {
          console.error('Error decrementing participantCount', err);
        }
      }

      // Check if leaving user was the host of the call
      if (userId) {
        try {
          const call = await this.prisma.call.findUnique({
            where: { id: roomId },
          });

          if (call && call.status === 'ongoing') {
            if (call.creatorId === userId) {
              // The host is leaving! Transfer ownership if there are other participants
              if (users.length > 0) {
                const nextHostSocketId = users[0];
                const nextHostUserId = this.socketToUserId.get(nextHostSocketId);
                if (nextHostUserId) {
                  await this.callsService.autoTransferHost(roomId, nextHostUserId);
                  const nextHostName = this.socketToUserName.get(nextHostSocketId) || 'Another User';
                  
                  // Broadcast to everyone that host has changed
                  this.server.to(roomId).emit('host-changed', {
                    newHostId: nextHostUserId,
                    newHostName: nextHostName,
                  });
                }
              } else {
                // Host is leaving and NO ONE else is in the call -> end the call!
                await this.callsService.systemEndCall(roomId);
              }
            } else {
              // A non-host user is leaving. If NO ONE is left, end the call
              if (users.length === 0) {
                await this.callsService.systemEndCall(roomId);
              }
            }
          }
        } catch (err) {
          console.error('Error checking host transfer upon leaving:', err);
        }
      }
    }

    // Clean up waiting list if they were waiting
    if (roomId && userId) {
      let waiting = this.roomToWaitingUsers.get(roomId) || [];
      waiting = waiting.filter((w) => w.socketId !== client.id);
      if (waiting.length > 0) {
        this.roomToWaitingUsers.set(roomId, waiting);
      } else {
        this.roomToWaitingUsers.delete(roomId);
      }
    }

    // Clean up maps
    this.socketToRoom.delete(client.id);
    this.socketToUserId.delete(client.id);
    this.socketToUserName.delete(client.id);
    this.socketToUserEmail.delete(client.id);

    console.log(`WebRTC Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      userId?: string;
      email?: string;
      name?: string;
    },
  ) {
    const { roomId } = payload;
    const userId = payload.userId || this.socketToUserId.get(client.id) || client.handshake.auth?.userId;

    if (!userId) {
      client.emit('join-error', { message: 'Xác thực không hợp lệ. Vui lòng đăng nhập lại!' });
      client.disconnect();
      return;
    }

    // Cache user info in our maps
    this.socketToUserId.set(client.id, userId);
    if (payload.name) this.socketToUserName.set(client.id, payload.name);
    if (payload.email) this.socketToUserEmail.set(client.id, payload.email);

    // 1. Verify call type and permissions
    const check = await this.callsService.canJoin(userId, roomId);

    if (!check.allowed) {
      if (check.requiresApproval) {
        // Put in waiting list
        client.join(roomId + '-waiting');
        this.socketToRoom.set(client.id, roomId);

        const waitingUsers = this.roomToWaitingUsers.get(roomId) || [];
        const info = {
          socketId: client.id,
          userId,
          email: payload.email || 'guest@elearning.com',
          name: payload.name || `Học viên ${userId.substring(0, 5)}`,
        };
        
        waitingUsers.push(info);
        this.roomToWaitingUsers.set(roomId, waitingUsers);

        // Notify client they are in waiting room
        client.emit('waiting-for-approval', {
          message: 'Cuộc gọi này là riêng tư. Đang chờ chủ phòng phê duyệt...',
        });

        // Notify the host socket(s) about the join request
        try {
          const call = await this.prisma.call.findUnique({
            where: { id: roomId },
          });

          if (call) {
            // Find host's active sockets in this room
            const activeSockets = this.roomToUsers.get(roomId) || [];
            activeSockets.forEach((sockId) => {
              if (this.socketToUserId.get(sockId) === call.creatorId) {
                this.server.to(sockId).emit('join-request', info);
              }
            });
          }
        } catch (err) {
          console.error('Error finding host for join request:', err);
        }
        return;
      } else {
        // Disallowed completely (e.g. ended or not in classroom)
        client.emit('join-error', { message: check.reason || 'Bạn không thể tham gia cuộc gọi này!' });
        return;
      }
    }

    // 2. Allowed to join directly
    client.join(roomId);
    this.socketToRoom.set(client.id, roomId);

    const usersInRoom = this.roomToUsers.get(roomId) || [];

    // If there is an active screen sharer, inform the newly joined client first
    const activeSharer = this.roomToScreenSharer.get(roomId);
    if (activeSharer) {
      client.emit('screen-share-started', {
        socketId: activeSharer.socketId,
        name: activeSharer.name,
        streamId: activeSharer.streamId,
      });
    }

    // Return the list of current users in room to the newly joined client
    client.emit('all-users', usersInRoom);

    // Notify other users in room
    client.to(roomId).emit('user-joined', client.id);

    usersInRoom.push(client.id);
    this.roomToUsers.set(roomId, usersInRoom);
    console.log(`Client ${client.id} (User: ${userId}) joined WebRTC room ${roomId}`);

    try {
      await this.prisma.call.update({
        where: { id: roomId },
        data: { participantCount: { increment: 1 } },
      });
    } catch (err) {
      if (!(err instanceof Error && (err as any).code === 'P2025')) {
        console.error('Error incrementing participantCount', err);
      }
    }
  }

  /**
   * Host approves a waiting user
   */
  @SubscribeMessage('approve-join')
  async approveJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      targetSocketId: string;
      targetUserId: string;
    },
  ) {
    const { roomId, targetSocketId, targetUserId } = payload;
    const hostUserId = this.socketToUserId.get(client.id);

    if (!hostUserId) return;

    try {
      // 1. Save approval in database/service
      await this.callsService.approveUser(hostUserId, roomId, targetUserId);

      // 2. Fetch the target socket from server
      const targetSocket = this.server.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        // Move socket from waiting room to active room
        targetSocket.leave(roomId + '-waiting');
        targetSocket.emit('join-approved');

        // Remove from waiting list map
        let waiting = this.roomToWaitingUsers.get(roomId) || [];
        waiting = waiting.filter((w) => w.socketId !== targetSocketId);
        this.roomToWaitingUsers.set(roomId, waiting);

        // Perform normal join room operations for target socket
        targetSocket.join(roomId);
        this.socketToRoom.set(targetSocketId, roomId);

        const usersInRoom = this.roomToUsers.get(roomId) || [];

        // If there is an active screen sharer, inform the newly joined client first
        const activeSharer = this.roomToScreenSharer.get(roomId);
        if (activeSharer) {
          targetSocket.emit('screen-share-started', {
            socketId: activeSharer.socketId,
            name: activeSharer.name,
            streamId: activeSharer.streamId,
          });
        }

        targetSocket.emit('all-users', usersInRoom);
        targetSocket.to(roomId).emit('user-joined', targetSocketId);

        usersInRoom.push(targetSocketId);
        this.roomToUsers.set(roomId, usersInRoom);

        await this.prisma.call.update({
          where: { id: roomId },
          data: { participantCount: { increment: 1 } },
        });

        console.log(`Host ${hostUserId} approved user ${targetUserId} to join ${roomId}`);
      }
    } catch (err) {
      console.error('Error approving join request:', err);
      client.emit('error', { message: 'Không thể phê duyệt yêu cầu!' });
    }
  }

  /**
   * Host rejects a waiting user
   */
  @SubscribeMessage('reject-join')
  async rejectJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      targetSocketId: string;
    },
  ) {
    const { roomId, targetSocketId } = payload;
    const hostUserId = this.socketToUserId.get(client.id);

    if (!hostUserId) return;

    try {
      const call = await this.prisma.call.findUnique({
        where: { id: roomId },
      });

      if (call && call.creatorId === hostUserId) {
        const targetSocket = this.server.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('join-rejected', {
            message: 'Yêu cầu tham gia của bạn đã bị chủ phòng từ chối!',
          });
          targetSocket.leave(roomId + '-waiting');
        }

        // Remove from waiting list
        let waiting = this.roomToWaitingUsers.get(roomId) || [];
        waiting = waiting.filter((w) => w.socketId !== targetSocketId);
        this.roomToWaitingUsers.set(roomId, waiting);
      }
    } catch (err) {
      console.error('Error rejecting join request:', err);
    }
  }

  /**
   * Host ends the call room
   */
  @SubscribeMessage('end-call')
  async endCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const { roomId } = payload;
    const hostUserId = this.socketToUserId.get(client.id);

    if (!hostUserId) return;

    try {
      // 1. Update status in database
      await this.callsService.endCall(hostUserId, roomId);

      // 2. Broadcast call ended to everyone in room and waiting room
      this.server.to(roomId).emit('call-ended', { message: 'Cuộc gọi đã được kết thúc bởi chủ phòng!' });
      this.server.to(roomId + '-waiting').emit('call-ended', { message: 'Cuộc gọi đã kết thúc!' });

      // Clean up maps and rooms
      this.roomToWaitingUsers.delete(roomId);
      this.roomToUsers.delete(roomId);

      console.log(`Host ${hostUserId} ended call room ${roomId}`);
    } catch (err) {
      console.error('Error ending call via socket:', err);
      client.emit('error', { message: 'Bạn không có quyền kết thúc cuộc gọi này!' });
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

  @SubscribeMessage('screen-share-started')
  handleScreenShareStarted(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; name: string; streamId?: string },
  ) {
    this.roomToScreenSharer.set(payload.roomId, {
      socketId: client.id,
      name: payload.name,
      streamId: payload.streamId,
    });

    client.to(payload.roomId).emit('screen-share-started', {
      socketId: client.id,
      name: payload.name,
      streamId: payload.streamId,
    });
  }

  @SubscribeMessage('screen-share-stopped')
  handleScreenShareStopped(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    this.roomToScreenSharer.delete(payload.roomId);

    client.to(payload.roomId).emit('screen-share-stopped', {
      socketId: client.id,
    });
  }

  @SubscribeMessage('user-state-changed')
  handleUserStateChanged(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      isCamOn: boolean;
      isMicOn: boolean;
      email?: string;
      name?: string;
      cameraStreamId?: string | null;
    },
  ) {
    client.to(payload.roomId).emit('user-state-changed', {
      socketId: client.id,
      isCamOn: payload.isCamOn,
      isMicOn: payload.isMicOn,
      email: payload.email,
      name: payload.name,
      cameraStreamId: payload.cameraStreamId,
    });
  }

  @SubscribeMessage('kick-user')
  async kickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      targetSocketId: string;
    },
  ) {
    const { roomId, targetSocketId } = payload;
    const hostUserId = this.socketToUserId.get(client.id);

    if (!hostUserId) return;

    try {
      const call = await this.prisma.call.findUnique({
        where: { id: roomId },
      });

      if (call && call.creatorId === hostUserId) {
        const targetSocket = this.server.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('kicked-out', {
            message: 'Bạn đã bị chủ phòng mời ra khỏi cuộc gọi!',
          });
          targetSocket.leave(roomId);
        }

        // Remove from users list
        let usersInRoom = this.roomToUsers.get(roomId) || [];
        usersInRoom = usersInRoom.filter((id) => id !== targetSocketId);
        this.roomToUsers.set(roomId, usersInRoom);

        // Notify others
        this.server.to(roomId).emit('user-left', targetSocketId);

        // Clean up screen share if target was presenting
        const activeSharer = this.roomToScreenSharer.get(roomId);
        if (activeSharer && activeSharer.socketId === targetSocketId) {
          this.roomToScreenSharer.delete(roomId);
          this.server.to(roomId).emit('screen-share-stopped', {
            socketId: targetSocketId,
          });
        }

        console.log(`Host ${hostUserId} kicked user ${targetSocketId} out of call ${roomId}`);
      }
    } catch (err) {
      console.error('Error kicking user:', err);
    }
  }
}
