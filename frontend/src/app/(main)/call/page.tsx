'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

interface RemotePeer {
  stream: MediaStream;
  name: string;
}

export default function CallPage() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});

  const [remotePeers, setRemotePeers] = useState<{
    [socketId: string]: RemotePeer;
  }>({});
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001/webrtc');

    socketRef.current.on('connect', () => {
      startMedia();
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

    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);

    socketRef.current.on('user-left', (socketId: string) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }
      setRemotePeers((prev) => {
        const { [socketId]: _, ...rest } = prev;
        return rest;
      });
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(peersRef.current).forEach((pc) => pc.close());
      socketRef.current?.disconnect();
    };
  }, []);

  const handleOffer = async (payload: {
    caller: string;
    sdp: RTCSessionDescriptionInit;
  }) => {
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
  };

  const handleAnswer = async (payload: {
    caller: string;
    sdp: RTCSessionDescriptionInit;
  }) => {
    const pc = peersRef.current[payload.caller];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    }
  };

  const handleIceCandidate = async (payload: {
    caller: string;
    candidate: RTCIceCandidateInit;
  }) => {
    const pc = peersRef.current[payload.caller];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (e) {
        console.error('Error adding ICE candidate', e);
      }
    }
  };

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      socketRef.current?.emit('join-room', { roomId: 'test-room' });
    } catch (err) {
      console.error('Error getting media (Camera/Mic): ', err);
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

    pc.ontrack = (event) =>
      setRemotePeers((prev) => ({
        ...prev,
        [targetUserId]: {
          stream: event.streams[0],
          name: `User-${targetUserId.substring(0, 5)}`,
        },
      }));

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStreamRef.current!));
    }

    return pc;
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMicOn(track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsCamOn(track.enabled);
      });
    }
  };

  const RemoteVideo = ({
    stream,
    name,
  }: {
    stream: MediaStream;
    name: string;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div className='relative rounded-2xl overflow-hidden bg-surface-container'>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className='w-full h-40 object-cover opacity-90'
        />
        <div className='absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white'>
          {name}
        </div>
      </div>
    );
  };

  return (
    <main className='flex flex-1 h-full overflow-hidden bg-background text-on-surface'>
      <section className='flex-1 p-6 overflow-y-auto bg-slate-50/50 flex flex-col gap-6'>
        <div className='grid grid-cols-12 grid-rows-6 gap-6 h-full min-h-[800px]'>
          <div className='col-span-12 lg:col-span-8 row-span-4 glass-panel-elevated rounded-3xl overflow-hidden relative shadow-xl'>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className='w-full h-full object-cover scale-x-[-1]'
            />
            <div className='absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm'>
              <span className='material-symbols-outlined text-sm text-sky-400'>
                person
              </span>
              <span>Bạn</span>
            </div>
            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/20 backdrop-blur-xl p-3 rounded-2xl border border-white/30'>
              <button
                onClick={toggleAudio}
                className={`w-12 h-12 rounded-xl text-on-surface flex items-center justify-center transition-colors ${isMicOn ? 'bg-white/90 hover:bg-white' : 'bg-red-500/80 text-white hover:bg-red-500'}`}
              >
                <span className='material-symbols-outlined'>
                  {isMicOn ? 'mic' : 'mic_off'}
                </span>
              </button>
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-xl text-on-surface flex items-center justify-center transition-colors ${isCamOn ? 'bg-white/90 hover:bg-white' : 'bg-red-500/80 text-white hover:bg-red-500'}`}
              >
                <span className='material-symbols-outlined'>
                  {isCamOn ? 'videocam' : 'videocam_off'}
                </span>
              </button>
              <button className='w-12 h-12 rounded-xl bg-error text-white flex items-center justify-center hover:bg-error-dim transition-colors'>
                <span className='material-symbols-outlined'>call_end</span>
              </button>
              <div className='w-px h-8 bg-white/20 mx-2'></div>
              <button className='w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20'>
                <span className='material-symbols-outlined'>
                  present_to_all
                </span>
              </button>
              <button className='w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20'>
                <span className='material-symbols-outlined'>draw</span>
              </button>
            </div>
          </div>

          <div className='col-span-12 lg:col-span-4 row-span-2 glass-panel rounded-3xl p-4 flex flex-col gap-4'>
            <div className='flex justify-between items-center px-2'>
              <h3 className='font-bold text-on-surface flex items-center gap-2'>
                <span className='material-symbols-outlined text-primary'>
                  group
                </span>
                Học viên ({Object.keys(remotePeers).length})
              </h3>
              <button className='text-primary text-xs font-medium hover:underline'>
                Xem tất cả
              </button>
            </div>
            <div className='grid grid-cols-2 gap-3 h-full overflow-hidden'>
              {Object.entries(remotePeers).map(([id, peer]) => (
                <RemoteVideo key={id} stream={peer.stream} name={peer.name} />
              ))}
            </div>
          </div>

          <div className='col-span-12 lg:col-span-4 row-span-2 glass-panel rounded-3xl p-5 flex flex-col gap-4'>
            <h3 className='font-bold text-on-surface flex items-center gap-2'>
              <span className='material-symbols-outlined text-primary'>
                auto_stories
              </span>
              Tài liệu bài giảng
            </h3>
            {/* Static content */}
          </div>

          <div className='col-span-12 lg:col-span-4 row-start-1 lg:row-span-6 glass-panel-elevated rounded-3xl flex flex-col overflow-hidden'>
            <div className='p-5 border-b border-sky-400/10 flex justify-between items-center bg-white/40'>
              <h3 className='font-bold text-on-surface flex items-center gap-2'>
                <span className='material-symbols-outlined text-primary'>
                  forum
                </span>
                Trò Chuyện Trực Tiếp
              </h3>
              <span className='bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full'>
                LIVE
              </span>
            </div>
            <div className='flex-1 p-5 overflow-y-auto space-y-4'>
              {/* Static chat messages */}
            </div>
            <div className='p-4 bg-white/60 border-t border-sky-400/10'>
              <div className='relative'>
                <input
                  className='w-full bg-surface-container-lowest border border-sky-400/20 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm'
                  placeholder='Nhập tin nhắn...'
                  type='text'
                />
                <button className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dim transition-colors shadow-md'>
                  <span className='material-symbols-outlined text-sm'>
                    send
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className='col-span-12 lg:col-span-8 row-span-2 glass-panel rounded-3xl p-6 flex items-center justify-between'>
            {/* Static stats bar */}
          </div>
        </div>
      </section>
    </main>
  );
}
