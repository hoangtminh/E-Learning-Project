'use client';

import { useEffect, useRef } from 'react';
import { useCallContext } from '../../../../contexts/CallContext';

function RemoteVideo({ stream, name }: { stream: MediaStream; name: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className='relative rounded-2xl overflow-hidden bg-surface-container-high shadow-sm aspect-video border border-outline-variant/30'>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className='w-full h-full object-cover'
      />
      <div className='absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white'>
        {name}
      </div>
    </div>
  );
}

export default function ParticipantsPanel() {
  const { remotePeers } = useCallContext();
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
        {peersList.map(([id, peer]) => (
          <RemoteVideo key={id} stream={peer.stream} name={peer.name} />
        ))}
        {peersList.length === 0 && (
          <div className='col-span-2 text-center text-xs text-on-surface-variant py-6 border border-dashed border-outline-variant/50 rounded-lg'>
            Đang chờ người khác tham gia...
          </div>
        )}
      </div>
    </div>
  );
}
