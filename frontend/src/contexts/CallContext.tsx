'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { appAlert } from '@/components/ui/app-dialog-provider';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { callsApi, Call, CallType } from '@/api/calls';

const ICE_SERVERS = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

export interface RemotePeer {
  stream?: MediaStream;
  screenStream?: MediaStream;
  name: string;
  isCamOn?: boolean;
  isMicOn?: boolean;
  email?: string;
  cameraStreamId?: string;
  screenStreamId?: string;
}

export interface ChatMessage {
  roomId: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp?: string;
}

interface CallContextType {
  socket: Socket | null;
  roomId: string | null;
  isJoined: boolean;
  joinedAt: Date | null;
  isMicOn: boolean;
  isCamOn: boolean;
  localStream: MediaStream | null;
  remotePeers: { [socketId: string]: RemotePeer };
  messages: ChatMessage[];
  permissionError: string | null;
  setRoomId: (id: string | null) => void;
  joinCall: () => void;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  sendMessage: (msg: string) => void;
  initLocalMedia: () => Promise<void>;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;

  // Call classification additions:
  callDetails: Call | null;
  waitingList: Array<{
    socketId: string;
    userId: string;
    email: string;
    name: string;
  }>;
  isWaitingForApproval: boolean;
  hostId: string | null;
  isHost: boolean;
  approveJoin: (socketId: string, userId: string) => void;
  rejectJoin: (socketId: string) => void;
  approveAllJoin: () => void;
  rejectAllJoin: () => void;
  endCall: () => void;
  createCall: (
    title: string,
    type: CallType,
    classroomId?: string,
    conversationId?: string,
  ) => Promise<string>;
  kickUser: (targetSocketId: string) => void;

  // Screen share addition:
  isSharingScreen: boolean;
  screenStream: MediaStream | null;
  screenSharerId: string | null;
  screenSharerName: string | null;
  screenStreamId: string | null;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  exitAndRedirect: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [remotePeers, setRemotePeers] = useState<{
    [socketId: string]: RemotePeer;
  }>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Call Classification State
  const [callDetails, setCallDetails] = useState<Call | null>(null);
  const [waitingList, setWaitingList] = useState<
    Array<{ socketId: string; userId: string; email: string; name: string }>
  >([]);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);

  // Screen sharing states
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenSharerId, setScreenSharerId] = useState<string | null>(null);
  const [screenSharerName, setScreenSharerName] = useState<string | null>(null);
  const [screenStreamId, setScreenStreamId] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const screenSendersRef = useRef<{ [socketId: string]: RTCRtpSender }>({});
  const screenStreamIdRef = useRef<string | null>(null);
  const screenSharerIdRef = useRef<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const isHost = user?.userId === hostId || user?.id === hostId;

  // Fetch call details when room ID is updated
  useEffect(() => {
    const fetchDetails = async () => {
      if (roomId) {
        try {
          const res = await callsApi.getCall(roomId);
          if (res.success && res.data) {
            setCallDetails(res.data);
            setHostId(res.data.creatorId);
          }
        } catch (err) {
          console.error('Failed to fetch call details', err);
        }
      } else {
        setCallDetails(null);
        setHostId(null);
        setWaitingList([]);
        setIsWaitingForApproval(false);
      }
    };
    fetchDetails();
  }, [roomId]);

  const initLocalMedia = async () => {
    try {
      setPermissionError(null);
      if (localStreamRef.current) return;

      let stream: MediaStream | null = null;
      let finalCamOn = false;
      let finalMicOn = false;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        finalMicOn = true;
        finalCamOn = true;
      } catch (e) {
        console.warn('Both video and audio failed, trying audio only...', e);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          finalMicOn = true;
          finalCamOn = false;
          setPermissionError(
            'Camera permission denied. You are in audio-only mode.',
          );
        } catch (e2) {
          console.warn('Audio failed too, trying video only...', e2);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            finalMicOn = false;
            finalCamOn = true;
            setPermissionError(
              'Microphone permission denied. You are in video-only mode.',
            );
          } catch (e3) {
            console.error('All media permissions denied.', e3);
            finalMicOn = false;
            finalCamOn = false;
            setPermissionError(
              'All media permissions denied. You can still view and hear others.',
            );
          }
        }
      }

      setIsMicOn(finalMicOn);
      setIsCamOn(finalCamOn);

      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
        stream.getAudioTracks().forEach((track) => {
          track.enabled = finalMicOn;
        });

        if (!finalCamOn) {
          stream.getVideoTracks().forEach((track) => track.stop());
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.error('Error in initLocalMedia:', err);
      setPermissionError(
        'An unexpected error occurred while accessing media devices.',
      );
    }
  };

  const createPeerConnection = (targetUserId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) =>
      event.candidate &&
      socketRef.current?.emit('ice-candidate', {
        target: targetUserId,
        candidate: event.candidate,
      });

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;

      setRemotePeers((prev) => {
        const peer = prev[targetUserId] || { name: `User-${targetUserId.substring(0, 5)}` };
        const newMediaStream = new MediaStream(stream.getTracks());
        
        // Deterministic matching based on active stream IDs
        const isScreen = stream.id === peer.screenStreamId || (screenStreamIdRef.current && stream.id === screenStreamIdRef.current);
        const isCamera = stream.id === peer.cameraStreamId;

        if (isScreen) {
          return {
            ...prev,
            [targetUserId]: {
              ...peer,
              screenStream: newMediaStream,
            },
          };
        } else if (isCamera) {
          return {
            ...prev,
            [targetUserId]: {
              ...peer,
              stream: newMediaStream,
            },
          };
        }

        // Fallback checks with dynamic stream ID mapping
        if (!peer.stream) {
          return {
            ...prev,
            [targetUserId]: {
              ...peer,
              stream: newMediaStream,
              cameraStreamId: stream.id,
            },
          };
        } else {
          return {
            ...prev,
            [targetUserId]: {
              ...peer,
              screenStream: newMediaStream,
              screenStreamId: stream.id,
            },
          };
        }
      });
    };

    const hasVideo = localStreamRef.current
      ?.getVideoTracks()
      .some((t) => t.readyState === 'live');
    const hasAudio = localStreamRef.current
      ?.getAudioTracks()
      .some((t) => t.readyState === 'live');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      // If we are currently sharing screen, add the screen sharing track as well
      if (isSharingScreen && screenStream) {
        const screenTrack = screenStream.getVideoTracks()[0];
        if (screenTrack) {
          try {
            const sender = pc.addTrack(screenTrack, screenStream);
            screenSendersRef.current[targetUserId] = sender;
          } catch (e) {
            console.error('Error adding screen sharing track during initialization:', e);
          }
        }
      }
    }

    if (!hasVideo) {
      pc.addTransceiver('video', { direction: 'recvonly' });
    }
    if (!hasAudio) {
      pc.addTransceiver('audio', { direction: 'recvonly' });
    }

    const isRemoteScreenSharing = screenSharerIdRef.current === targetUserId || !!remotePeers[targetUserId]?.screenStreamId;
    if (isRemoteScreenSharing) {
      try {
        pc.addTransceiver('video', { direction: 'recvonly' });
      } catch (e) {
        console.error('Error adding screen sharing transceiver:', e);
      }
    }

    return pc;
  };

  const connectSocket = () => {
    if (!roomId) return;

    const currentUserId = user?.userId || user?.id;
    const displayName =
      user?.fullName || user?.fullName || user?.fullName || 'Người dùng';

    socketRef.current = io('http://localhost:3001/webrtc', {
      auth: { userId: currentUserId },
    });

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join-room', {
        roomId,
        userId: currentUserId,
        email: user?.email,
        name: displayName,
      });

      // Broadcast initial mic and camera states immediately
      socketRef.current?.emit('user-state-changed', {
        roomId,
        isCamOn,
        isMicOn,
        email: user?.email,
        name: displayName,
        cameraStreamId: localStreamRef.current?.id,
      });
    });

    // Handle waiting state in private calls
    socketRef.current.on(
      'waiting-for-approval',
      (data: { message: string }) => {
        setIsWaitingForApproval(true);
      },
    );

    // Handle incoming join requests (for host)
    socketRef.current.on(
      'join-request',
      (data: {
        socketId: string;
        userId: string;
        email: string;
        name: string;
      }) => {
        setWaitingList((prev) => {
          if (prev.some((w) => w.socketId === data.socketId)) return prev;
          return [...prev, data];
        });
      },
    );

    // When the host approves this client
    socketRef.current.on('join-approved', () => {
      setIsWaitingForApproval(false);
    });

    // When host rejects this client
    socketRef.current.on('join-rejected', (data: { message: string }) => {
      void appAlert(data.message);
      leaveCall();
    });

    // When the host changes (transfer of ownership)
    socketRef.current.on(
      'host-changed',
      (data: { newHostId: string; newHostName: string }) => {
        setHostId(data.newHostId);
        void appAlert(`Chủ phòng đã chuyển sang: ${data.newHostName}`);
      },
    );

    // When the call room is ended by host
    socketRef.current.on('call-ended', (data: { message: string }) => {
      void appAlert(data.message);
      exitAndRedirect();
    });

    // General authorization/join errors
    socketRef.current.on('join-error', (data: { message: string }) => {
      void appAlert(data.message);
      exitAndRedirect();
    });

    // Kicked out listener
    socketRef.current.on('kicked-out', (data: { message: string }) => {
      void appAlert(data.message);
      leaveCall();
      router.push('/call');
    });

    // Screen sharing socket listeners
    socketRef.current.on(
      'screen-share-started',
      (data: { socketId: string; name: string; streamId?: string }) => {
        setScreenSharerId(data.socketId);
        screenSharerIdRef.current = data.socketId;
        setScreenSharerName(data.name);
        if (data.streamId) {
          setScreenStreamId(data.streamId);
          screenStreamIdRef.current = data.streamId;
        }

        if (data.socketId) {
          setRemotePeers((prev) => {
            const peer = prev[data.socketId] || { name: data.name };
            return {
              ...prev,
              [data.socketId]: {
                ...peer,
                screenStreamId: data.streamId,
              },
            };
          });
        }
      },
    );

    socketRef.current.on('screen-share-stopped', (data: { socketId: string }) => {
      setScreenSharerId(null);
      screenSharerIdRef.current = null;
      setScreenSharerName(null);
      setScreenStreamId(null);
      screenStreamIdRef.current = null;

      if (data.socketId) {
        setRemotePeers((prev) => {
          const peer = prev[data.socketId];
          if (peer) {
            return {
              ...prev,
              [data.socketId]: {
                ...peer,
                screenStream: undefined,
                screenStreamId: undefined,
              },
            };
          }
          return prev;
        });
      }
    });

    // Listening for remote user status changes
    socketRef.current.on(
      'user-state-changed',
      (data: {
        socketId: string;
        isCamOn: boolean;
        isMicOn: boolean;
        email?: string;
        name?: string;
        cameraStreamId?: string;
      }) => {
        setRemotePeers((prev) => {
          const peer = prev[data.socketId] || { name: data.name || `User-${data.socketId.substring(0, 5)}` };
          return {
            ...prev,
            [data.socketId]: {
              ...peer,
              isCamOn: data.isCamOn,
              isMicOn: data.isMicOn,
              email: data.email || peer.email,
              name: data.name || peer.name,
              cameraStreamId: data.cameraStreamId || peer.cameraStreamId,
              stream: data.isCamOn ? peer.stream : undefined,
            },
          };
        });
      },
    );

    socketRef.current.on('all-users', (users: string[]) => {
      users.forEach((userId) => {
        const pc = createPeerConnection(userId);
        peersRef.current[userId] = pc;

        setRemotePeers((prev) => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            name: prev[userId]?.name || `User-${userId.substring(0, 5)}`,
          },
        }));

        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socketRef.current?.emit('offer', {
              target: userId,
              caller: socketRef.current?.id,
              sdp: pc.localDescription,
            });
          });
      });
    });

    socketRef.current.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
      setRemotePeers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          name: prev[userId]?.name || `User-${userId.substring(0, 5)}`,
        },
      }));

      // Broadcast our state to the newly joined user
      socketRef.current?.emit('user-state-changed', {
        roomId,
        isCamOn,
        isMicOn,
        email: user?.email,
        name: displayName,
        cameraStreamId: localStreamRef.current?.id,
      });
    });

    socketRef.current.on(
      'offer',
      async (payload: { caller: string; sdp: any }) => {
        let pc = peersRef.current[payload.caller];

        if (!pc) {
          pc = createPeerConnection(payload.caller);
          peersRef.current[payload.caller] = pc;

          setRemotePeers((prev) => ({
            ...prev,
            [payload.caller]: {
              ...prev[payload.caller],
              name:
                prev[payload.caller]?.name ||
                `User-${payload.caller.substring(0, 5)}`,
            },
          }));
        }

        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current?.emit('answer', {
          target: payload.caller,
          caller: socketRef.current?.id,
          sdp: pc.localDescription,
        });
      },
    );

    socketRef.current.on(
      'answer',
      async (payload: { caller: string; sdp: any }) => {
        const pc = peersRef.current[payload.caller];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
      },
    );

    socketRef.current.on(
      'ice-candidate',
      async (payload: { caller: string; candidate: any }) => {
        const pc = peersRef.current[payload.caller];
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
        }
      },
    );

    socketRef.current.on('user-left', (socketId: string) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }
      setRemotePeers((prev) => {
        const newPeers = { ...prev };
        delete newPeers[socketId];
        return newPeers;
      });

      // Restore screen if the leaving user was screen sharing
      if (screenSharerIdRef.current === socketId) {
        screenSharerIdRef.current = null;
      }
      setScreenSharerId((currentId) => {
        if (currentId === socketId) {
          setScreenSharerName(null);
          return null;
        }
        return currentId;
      });
    });

    socketRef.current.on('chat-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
  };

  const disconnectSocket = () => {
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setRemotePeers({});
    setMessages([]);
    setWaitingList([]);
    setIsWaitingForApproval(false);

    // Stop and clean up screen sharing
    setScreenStream((prev) => {
      if (prev) {
        prev.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
    setIsSharingScreen(false);
    setScreenSharerId(null);
    screenSharerIdRef.current = null;
    setScreenSharerName(null);
    setScreenStreamId(null);
    screenStreamIdRef.current = null;
  };

  const stopMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
  };

  const joinCall = () => {
    setIsJoined(true);
    setJoinedAt(new Date());
    connectSocket();
  };

  const leaveCall = () => {
    setIsJoined(false);
    setJoinedAt(null);
    setRoomId(null);
    disconnectSocket();
    stopMedia();
  };

  const exitAndRedirect = () => {
    const targetClassroomId = callDetails?.classroomId;
    const targetConversationId = callDetails?.conversationId;

    leaveCall();

    if (targetClassroomId) {
      router.push(`/classrooms/${targetClassroomId}`);
    } else if (targetConversationId) {
      router.push(`/chat/${targetConversationId}`);
    } else {
      router.push('/call');
    }
  };

  const toggleAudio = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
    socketRef.current?.emit('user-state-changed', {
      roomId,
      isCamOn,
      isMicOn: nextState,
      email: user?.email,
      name: user?.fullName || user?.fullName || user?.fullName || 'Người dùng',
      cameraStreamId: localStreamRef.current?.id,
    });
  };

  const toggleVideo = async () => {
    if (isCamOn) {
      setIsCamOn(false);
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
          localStreamRef.current?.removeTrack(track);
        });
      }
      setLocalStream(localStreamRef.current ? new MediaStream(localStreamRef.current.getTracks()) : null);

      // Remove video track from peers to trigger remote removal, then renegotiate
      Object.entries(peersRef.current).forEach(([socketId, pc]) => {
        try {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === 'video');
          if (videoSender) {
            pc.removeTrack(videoSender);
          }

          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              socketRef.current?.emit('offer', {
                target: socketId,
                caller: socketRef.current?.id,
                sdp: pc.localDescription,
              });
            });
        } catch (e) {
          console.error('Error stopping video track on peer:', socketId, e);
        }
      });

      socketRef.current?.emit('user-state-changed', {
        roomId,
        isCamOn: false,
        isMicOn,
        email: user?.email,
        name: user?.fullName || user?.fullName || user?.fullName || 'Người dùng',
        cameraStreamId: null,
      });
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newTrack = newStream.getVideoTracks()[0];

        if (!localStreamRef.current) {
          localStreamRef.current = new MediaStream();
        }

        localStreamRef.current
          .getVideoTracks()
          .forEach((t) => {
            t.stop();
            localStreamRef.current?.removeTrack(t);
          });
        localStreamRef.current.addTrack(newTrack);
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

        // Remove old track sender first if present, then add new track to force a fresh remote ontrack event
        Object.entries(peersRef.current).forEach(([socketId, pc]) => {
          try {
            const senders = pc.getSenders();
            const videoSender = senders.find((s) => s.track?.kind === 'video');
            if (videoSender) {
              pc.removeTrack(videoSender);
            }
            pc.addTrack(newTrack, localStreamRef.current!);

            pc.createOffer()
              .then((offer) => pc.setLocalDescription(offer))
              .then(() => {
                socketRef.current?.emit('offer', {
                  target: socketId,
                  caller: socketRef.current?.id,
                  sdp: pc.localDescription,
                });
              });
          } catch (e) {
            console.error('Error starting video track on peer:', socketId, e);
          }
        });

        setIsCamOn(true);
        socketRef.current?.emit('user-state-changed', {
          roomId,
          isCamOn: true,
          isMicOn,
          email: user?.email,
          name: user?.fullName || user?.fullName || user?.fullName || 'Người dùng',
          cameraStreamId: localStreamRef.current?.id,
        });
      } catch (err) {
        console.error('Error turning on camera', err);
      }
    }
  };

  const startScreenShare = async () => {
    if (!roomId) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = stream.getVideoTracks()[0];

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setScreenStream(stream);
      setIsSharingScreen(true);
      setScreenSharerId(socketRef.current?.id || 'me');
      setScreenSharerName(user?.fullName || user?.fullName || 'Bạn');
      setScreenStreamId(stream.id);
      screenStreamIdRef.current = stream.id;

      // Add separate screen track to all active connections and renegotiate
      Object.entries(peersRef.current).forEach(([socketId, pc]) => {
        try {
          const sender = pc.addTrack(screenTrack, stream);
          screenSendersRef.current[socketId] = sender;

          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              socketRef.current?.emit('offer', {
                target: socketId,
                caller: socketRef.current?.id,
                sdp: pc.localDescription,
              });
            });
        } catch (e) {
          console.error('Error adding screen sharing track:', e);
        }
      });

      socketRef.current?.emit('screen-share-started', {
        roomId,
        name: user?.fullName || user?.fullName || 'Bạn',
        streamId: stream.id,
      });
    } catch (err) {
      console.error('Error starting screen share:', err);
    }
  };

  const stopScreenShare = () => {
    setScreenStream((prev) => {
      if (prev) {
        prev.getTracks().forEach((track) => track.stop());
      }
      return null;
    });

    setIsSharingScreen(false);
    setScreenSharerId(null);
    screenSharerIdRef.current = null;
    setScreenSharerName(null);
    setScreenStreamId(null);
    screenStreamIdRef.current = null;

    // Remove screen sharing tracks from active connections and renegotiate
    Object.entries(peersRef.current).forEach(([socketId, pc]) => {
      try {
        const sender = screenSendersRef.current[socketId];
        if (sender) {
          pc.removeTrack(sender);
          delete screenSendersRef.current[socketId];

          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              socketRef.current?.emit('offer', {
                target: socketId,
                caller: socketRef.current?.id,
                sdp: pc.localDescription,
              });
            });
        }
      } catch (e) {
        console.error('Error removing screen sharing track:', e);
      }
    });

    socketRef.current?.emit('screen-share-stopped', { roomId });
  };

  const sendMessage = (msg: string) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('chat-message', {
        roomId,
        message: msg,
        senderId: socketRef.current.id,
        senderName: user?.email || 'Bạn',
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Host approvals
  const approveJoin = (targetSocketId: string, targetUserId: string) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('approve-join', {
        roomId,
        targetSocketId,
        targetUserId,
      });
      setWaitingList((prev) =>
        prev.filter((w) => w.socketId !== targetSocketId),
      );
    }
  };

  const rejectJoin = (targetSocketId: string) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('reject-join', {
        roomId,
        targetSocketId,
      });
      setWaitingList((prev) =>
        prev.filter((w) => w.socketId !== targetSocketId),
      );
    }
  };

  const approveAllJoin = () => {
    if (socketRef.current && roomId) {
      waitingList.forEach((w) => {
        socketRef.current?.emit('approve-join', {
          roomId,
          targetSocketId: w.socketId,
          targetUserId: w.userId,
        });
      });
      setWaitingList([]);
    }
  };

  const rejectAllJoin = () => {
    if (socketRef.current && roomId) {
      waitingList.forEach((w) => {
        socketRef.current?.emit('reject-join', {
          roomId,
          targetSocketId: w.socketId,
        });
      });
      setWaitingList([]);
    }
  };

  // Host end call
  const endCall = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('end-call', { roomId });
    }
  };

  // Host kick user
  const kickUser = (targetSocketId: string) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('kick-user', {
        roomId,
        targetSocketId,
      });
    }
  };

  // REST Create Call room wrapper
  const createCall = async (
    title: string,
    type: CallType,
    classroomId?: string,
    conversationId?: string,
  ): Promise<string> => {
    const res = await callsApi.createCall({
      title,
      type,
      classroomId,
      conversationId,
    });
    if (res.success && res.data) {
      return res.data.id;
    } else {
      throw new Error(res.error || 'Tạo phòng học thất bại!');
    }
  };

  useEffect(() => {
    return () => {
      stopMedia();
      disconnectSocket();
    };
  }, []);

  return (
    <CallContext.Provider
      value={{
        socket: socketRef.current,
        roomId,
        isJoined,
        joinedAt,
        isMicOn,
        isCamOn,
        localStream,
        remotePeers,
        messages,
        permissionError,
        setRoomId,
        joinCall,
        leaveCall,
        toggleAudio,
        toggleVideo,
        sendMessage,
        initLocalMedia,
        localVideoRef,

        callDetails,
        waitingList,
        isWaitingForApproval,
        hostId,
        isHost,
        approveJoin,
        rejectJoin,
        approveAllJoin,
        rejectAllJoin,
        endCall,
        createCall,
        kickUser,

        isSharingScreen,
        screenStream,
        screenSharerId,
        screenSharerName,
        screenStreamId,
        startScreenShare,
        stopScreenShare,
        exitAndRedirect,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext must be used within CallProvider');
  }
  return context;
};
