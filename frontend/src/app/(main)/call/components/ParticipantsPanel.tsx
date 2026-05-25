'use client';

import { useEffect, useRef, useState } from 'react';
import { useCallContext } from '../../../../contexts/CallContext';
import { appConfirm } from '@/components/ui/app-dialog-provider';

interface RemoteVideoProps {
  id: string;
  stream?: MediaStream;
  name: string;
  isCamOn: boolean;
  isMicOn: boolean;
  isHost: boolean;
  onKick: (socketId: string) => void;
}


function RemoteVideo({
  id,
  stream,
  name,
  isCamOn,
  isMicOn,
  isHost,
  onKick,
}: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => setPlayError(null));
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
    <div className='group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-sm'>
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
        <div className='flex h-full w-full flex-col items-center justify-center bg-slate-800 text-slate-500'>
          <span className='material-symbols-outlined text-xl opacity-60'>
            videocam_off
          </span>
        </div>
      )}
      <div className='absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm'>
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
    queueMicrotask(() => setPlayError(null));
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
    <div className='relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black shadow-sm'>
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
        <div className='flex h-full w-full flex-col items-center justify-center bg-slate-800 text-slate-500'>
          <span className='material-symbols-outlined text-xl opacity-60'>
            videocam_off
          </span>
        </div>
      )}
      <div className='absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm'>
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
    <div className='flex h-full min-h-0 flex-col overflow-hidden bg-slate-900'>
      <div className='flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3'>
        <h3 className='flex items-center gap-1.5 text-sm font-bold text-white'>
        <span className='material-symbols-outlined text-sky-300 text-[18px]'>
          group
        </span>
        Người tham gia ({peersList.length + 1})
        </h3>
        <span className='rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400'>Live</span>
      </div>

      <div className='grid min-h-0 grid-cols-2 gap-2 overflow-y-auto p-3'>
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
              isCamOn={!!peer.isCamOn}
              isMicOn={peer.isMicOn !== false}
              isHost={isHost}
              onKick={kickUser}
            />
          );
        })}
        {peersList.length === 0 && !screenSharerId && (
          <div className='col-span-2 rounded-lg border border-dashed border-white/15 py-8 text-center text-xs text-slate-500'>
            Đang chờ người khác tham gia...
          </div>
        )}
      </div>
    </div>
  );
}
