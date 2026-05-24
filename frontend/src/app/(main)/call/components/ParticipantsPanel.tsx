'use client';

import { useEffect, useRef, useState } from 'react';
import { useCallContext } from '../../../../contexts/CallContext';
import { appConfirm } from '@/components/ui/app-dialog-provider';

interface RemoteVideoProps {
  id: string;
  stream?: MediaStream;
  name: string;
  email?: string;
  isCamOn: boolean;
  isMicOn: boolean;
  isHost: boolean;
  onKick: (socketId: string) => void;
}

function getInitials(name: string, email?: string) {
  if (name && name !== 'Người dùng' && name.trim() !== '') {
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

function RemoteVideo({
  id,
  stream,
  name,
  email,
  isCamOn,
  isMicOn,
  isHost,
  onKick,
}: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  useEffect(() => {
    setPlayError(null);
    let timeoutId: NodeJS.Timeout;

    if (videoRef.current && stream && isCamOn) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }

      timeoutId = setTimeout(() => {
        if (videoRef.current && videoRef.current.paused) {
          setPlayError('Không thể tải luồng video');
        }
      }, 8000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [stream, isCamOn]);

  return (
    <div className='relative rounded-2xl overflow-hidden bg-surface-container-high shadow-sm aspect-video border border-outline-variant/30 flex items-center justify-center group'>
      {isCamOn && stream && stream.getVideoTracks().length > 0 ? (
        <>
          {playError && (
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-error/95 text-white p-2 text-center gap-1.5'>
              <span className='material-symbols-outlined text-[16px]'>
                error
              </span>
              <span className='text-[10px] font-semibold leading-tight'>
                {playError}
              </span>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onPlaying={() => setPlayError(null)}
            onError={() => setPlayError('Lỗi tải video')}
            className='w-full h-full object-cover animate-fade-in'
          />
        </>
      ) : (
        <div className='flex flex-col items-center justify-center w-full h-full bg-surface-container-highest text-on-surface-variant/40'>
          <span className='material-symbols-outlined text-xl opacity-60'>
            videocam_off
          </span>
        </div>
      )}
      <div className='absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1'>
        <span>{name}</span>
        {!isMicOn && (
          <span className='material-symbols-outlined text-[10px] text-red-400'>
            mic_off
          </span>
        )}
      </div>

      {isHost && (
        <button
          onClick={async () => {
            if (
              await appConfirm({ title: 'Mời ra khỏi cuộc gọi?', description: `Bạn có chắc chắn muốn mời ${name} ra khỏi cuộc gọi?`, confirmLabel: 'Mời ra', variant: 'destructive' })
            ) {
              onKick(id);
            }
          }}
          className='absolute top-2 right-2 w-6 h-6 rounded bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 active:scale-95 shadow transition-all opacity-0 group-hover:opacity-100'
          title={`Mời ${name} ra ngoài`}
        >
          <span className='material-symbols-outlined text-[14px] font-bold'>
            close
          </span>
        </button>
      )}
    </div>
  );
}

function LocalVideoInSidebar({
  stream,
  isCamOn,
  name,
}: {
  stream: MediaStream | null;
  isCamOn: boolean;
  name: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  useEffect(() => {
    setPlayError(null);
    let timeoutId: NodeJS.Timeout;

    if (videoRef.current && stream && isCamOn) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }

      timeoutId = setTimeout(() => {
        if (videoRef.current && videoRef.current.paused) {
          setPlayError('Lỗi hiển thị');
        }
      }, 8000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [stream, isCamOn]);

  return (
    <div className='relative rounded-2xl overflow-hidden bg-black aspect-video border border-outline-variant/30 flex items-center justify-center shadow-sm'>
      {isCamOn && stream && stream.getVideoTracks().length > 0 ? (
        <>
          {playError && (
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-error/95 text-white p-2 text-center gap-1'>
              <span className='material-symbols-outlined text-[14px]'>
                error
              </span>
              <span className='text-[8px] font-semibold'>{playError}</span>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onPlaying={() => setPlayError(null)}
            onError={() => setPlayError('Lỗi camera')}
            className='w-full h-full object-cover scale-x-[-1]'
          />
        </>
      ) : (
        <div className='flex flex-col items-center justify-center w-full h-full bg-surface-container-highest text-on-surface-variant/40'>
          <span className='material-symbols-outlined text-xl opacity-60'>
            videocam_off
          </span>
        </div>
      )}
      <div className='absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium'>
        {name}
      </div>
    </div>
  );
}

export default function ParticipantsPanel() {
  const {
    remotePeers,
    localStream,
    isCamOn,
    screenSharerId,
    isHost,
    kickUser,
  } = useCallContext();
  const peersList = Object.entries(remotePeers);

  return (
    <div className='flex flex-col h-full p-3 overflow-y-auto'>
      <h3 className='font-bold text-on-surface mb-3 flex items-center gap-1.5 text-sm'>
        <span className='material-symbols-outlined text-primary text-[18px]'>
          group
        </span>
        Người tham gia ({peersList.length + 1})
      </h3>

      <div className='grid grid-cols-2 gap-2'>
        {/* Render our own camera if screen is being shared by anyone */}
        {screenSharerId && (
          <LocalVideoInSidebar
            stream={localStream}
            isCamOn={isCamOn}
            name='Bạn'
          />
        )}

        {peersList.map(([id, peer]) => {
          return (
            <RemoteVideo
              key={id}
              id={id}
              stream={peer.stream}
              name={peer.name}
              email={peer.email}
              isCamOn={!!peer.isCamOn}
              isMicOn={peer.isMicOn !== false}
              isHost={isHost}
              onKick={kickUser}
            />
          );
        })}
        {peersList.length === 0 && !screenSharerId && (
          <div className='col-span-2 text-center text-xs text-on-surface-variant py-6 border border-dashed border-outline-variant/50 rounded-lg'>
            Đang chờ người khác tham gia...
          </div>
        )}
      </div>
    </div>
  );
}
