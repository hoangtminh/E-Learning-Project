'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCallContext } from '../contexts/CallContext';

export default function BottomStatsBar() {
  const { joinedAt, isMicOn, isCamOn, toggleAudio, toggleVideo, leaveCall } = useCallContext();
  const [durationStr, setDurationStr] = useState('00:00:00');
  const router = useRouter();

  useEffect(() => {
    if (!joinedAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - joinedAt.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setDurationStr(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [joinedAt]);

  const handleLeave = () => {
    leaveCall();
    router.push('/call');
  };

  return (
    <div className='rounded-2xl p-3 px-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 shadow-sm border border-slate-700 text-slate-200'>
      
      {/* Stats Section */}
      <div className='flex gap-6 md:gap-8 w-full md:w-auto overflow-x-auto no-scrollbar'>
        <div>
          <p className='text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5'>Thời gian gọi</p>
          <p className='text-lg font-bold text-white tabular-nums'>{durationStr}</p>
        </div>
        <div className='w-px h-8 bg-slate-700 shrink-0 self-center'></div>
        <div>
          <p className='text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5'>Mạng</p>
          <p className='text-lg font-bold text-emerald-400'>Tốt</p>
        </div>
      </div>
      
      {/* Controls Section (Moved from Video Overlay) */}
      <div className='flex items-center gap-3 bg-slate-800 p-1.5 rounded-xl border border-slate-700'>
        <button
          onClick={toggleAudio}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isMicOn ? 'bg-primary/20 text-sky-300 hover:bg-primary/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
        >
          <span className='material-symbols-outlined text-[18px]'>
            {isMicOn ? 'mic' : 'mic_off'}
          </span>
        </button>
        <button
          onClick={toggleVideo}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isCamOn ? 'bg-primary/20 text-sky-300 hover:bg-primary/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
        >
          <span className='material-symbols-outlined text-[18px]'>
            {isCamOn ? 'videocam' : 'videocam_off'}
          </span>
        </button>
        <button className='w-9 h-9 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600 transition-colors'>
          <span className='material-symbols-outlined text-[18px]'>
            present_to_all
          </span>
        </button>
        <button className='w-9 h-9 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600 transition-colors'>
          <span className='material-symbols-outlined text-[18px]'>settings</span>
        </button>
        <div className='w-px h-6 bg-slate-600 mx-1'></div>
        <button
          onClick={handleLeave}
          className='w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-all shadow-md'
        >
          <span className='material-symbols-outlined text-[18px]'>call_end</span>
        </button>
      </div>

      {/* Invite Section */}
      <div className='flex items-center gap-4 w-full md:w-auto justify-end'>
        <button className='bg-primary px-4 py-2 rounded-lg text-white font-bold text-xs shadow-md hover:bg-primary-dim transition-all flex items-center gap-1.5 shrink-0'>
          <span className='material-symbols-outlined text-[16px]'>person_add</span>
          Mời tham gia
        </button>
      </div>
    </div>
  );
}
