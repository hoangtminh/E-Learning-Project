'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ICE_SERVERS = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

export interface RemotePeer {
  stream: MediaStream;
  name: string;
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
  setRoomId: (id: string | null) => void;
  joinCall: () => void;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  sendMessage: (msg: string) => void;
  initLocalMedia: () => Promise<void>;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remotePeers, setRemotePeers] = useState<{
    [socketId: string]: RemotePeer;
  }>({});

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const { user } = useAuth();

  const initLocalMedia = async () => {
    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;

        // Apply initial states
        stream.getAudioTracks().forEach((track) => {
          track.enabled = isMicOn;
        });

        if (!isCamOn) {
          stream.getVideoTracks().forEach((track) => {
            track.stop();
          });
        }
      }

      if (localVideoRef.current && localStreamRef.current) {
        if (localVideoRef.current.srcObject !== localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
    } catch (err) {
      console.error('Error getting media:', err);
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
      setRemotePeers((prev) => ({
        ...prev,
        [targetUserId]: {
          stream: event.streams[0],
          name: `User-${targetUserId.substring(0, 5)}`,
        },
      }));
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  };

  const connectSocket = () => {
    if (!roomId) return;

    socketRef.current = io('http://localhost:3001/webrtc');

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join-room', { roomId });
    });

    socketRef.current.on('all-users', (users: string[]) => {
      users.forEach((userId) => {
        const pc = createPeerConnection(userId);
        peersRef.current[userId] = pc;
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

    socketRef.current.on(
      'offer',
      async (payload: { caller: string; sdp: any }) => {
        const pc = createPeerConnection(payload.caller);
        peersRef.current[payload.caller] = pc;

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
  };

  const stopMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
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

  const toggleAudio = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  const toggleVideo = async () => {
    if (isCamOn) {
      setIsCamOn(false);
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
        });
      }
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newTrack = newStream.getVideoTracks()[0];

        if (localStreamRef.current) {
          localStreamRef.current
            .getVideoTracks()
            .forEach((t) => localStreamRef.current?.removeTrack(t));
          localStreamRef.current.addTrack(newTrack);

          Object.values(peersRef.current).forEach((pc) => {
            const sender = pc
              .getSenders()
              .find((s) => s.track?.kind === 'video' || s.track === null);
            if (sender) {
              sender.replaceTrack(newTrack);
            }
          });
        }
        setIsCamOn(true);
      } catch (err) {
        console.error('Error turning on camera', err);
      }
    }
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

  // Cleanup on full unmount
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
        localStream: localStreamRef.current,
        remotePeers,
        messages,
        setRoomId,
        joinCall,
        leaveCall,
        toggleAudio,
        toggleVideo,
        sendMessage,
        initLocalMedia,
        localVideoRef,
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
