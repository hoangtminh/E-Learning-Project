'use client';

import { useEffect, useState } from 'react';
import { useCallContext } from '../../../../contexts/CallContext';
import { appAlert, appConfirm } from '@/components/ui/app-dialog-provider';

export default function BottomStatsBar() {
  const {
    joinedAt,
    isMicOn,
    isCamOn,
    toggleAudio,
    toggleVideo,
    isHost,
    endCall,
    isSharingScreen,
    startScreenShare,
    stopScreenShare,
    screenSharerId,
    exitAndRedirect,
  } = useCallContext();
  const [durationStr, setDurationStr] = useState('00:00:00');
  useEffect(() => {
    if (!joinedAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - joinedAt.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setDurationStr(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [joinedAt]);

  const handleLeave = async () => {
    if (isHost) {
      if (await appConfirm({ title: 'Rời phòng gọi?', description: 'Bạn là chủ phòng. Rời phòng sẽ chuyển quyền chủ phòng cho người khác. Bạn vẫn muốn rời?', confirmLabel: 'Rời phòng', variant: 'destructive' })) {
        exitAndRedirect();
      }
    } else {
      exitAndRedirect();
    }
  };

  const handleEndCall = async () => {
    if (await appConfirm({ title: 'Kết thúc cuộc gọi?', description: 'Bạn có chắc chắn muốn KẾT THÚC cuộc gọi cho toàn bộ thành viên?', confirmLabel: 'Kết thúc', variant: 'destructive' })) {
      endCall();
    }
  };

  return (
    <div className='flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/95 p-3 text-slate-200 shadow-2xl sm:flex-row sm:items-center sm:justify-between'>
      {/* Stats Section */}
      <div className='no-scrollbar flex w-full min-w-0 gap-4 overflow-x-auto sm:w-auto sm:gap-6'>
        <div>
          <p className='text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5'>
            Thời gian gọi
          </p>
          <p className='text-lg font-bold text-white tabular-nums'>
            {durationStr}
          </p>
        </div>
        <div className='h-8 w-px shrink-0 self-center bg-slate-700'></div>
        <div>
          <p className='text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5'>
            Mạng
          </p>
          <p className='text-lg font-bold text-emerald-400'>Tốt</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className='flex max-w-full items-center gap-2 overflow-x-auto rounded-xl border border-slate-700 bg-slate-800 p-1.5'>
        <button
          onClick={toggleAudio}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${isMicOn ? 'bg-primary/20 text-sky-300 hover:bg-primary/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
          title={isMicOn ? 'Tắt mic' : 'Bật mic'}
        >
          <span className='material-symbols-outlined text-[18px]'>
            {isMicOn ? 'mic' : 'mic_off'}
          </span>
        </button>
        <button
          onClick={toggleVideo}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${isCamOn ? 'bg-primary/20 text-sky-300 hover:bg-primary/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
          title={isCamOn ? 'Tắt camera' : 'Bật camera'}
        >
          <span className='material-symbols-outlined text-[18px]'>
            {isCamOn ? 'videocam' : 'videocam_off'}
          </span>
        </button>
        <button
          onClick={isSharingScreen ? stopScreenShare : startScreenShare}
          disabled={screenSharerId !== null && !isSharingScreen}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${isSharingScreen
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-bold border border-amber-500/40'
              : screenSharerId !== null
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-40'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          title={
            isSharingScreen
              ? 'Dừng chia sẻ màn hình'
              : screenSharerId !== null
                ? 'Người khác đang chia sẻ màn hình'
                : 'Chia sẻ màn hình'
          }
        >
          <span className='material-symbols-outlined text-[18px]'>
            {isSharingScreen ? 'cancel_presentation' : 'present_to_all'}
          </span>
        </button>
        <button
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600'
          title='Cài đặt'
        >
          <span className='material-symbols-outlined text-[18px]'>
            settings
          </span>
        </button>

        <div className='mx-1 h-6 w-px shrink-0 bg-slate-600'></div>

        <button
          onClick={handleLeave}
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white shadow-md transition-all hover:bg-amber-500'
          title='Rời phòng cuộc gọi'
        >
          <span className='material-symbols-outlined text-[18px]'>
            logout
          </span>
        </button>

        {isHost && (
          <button
            onClick={handleEndCall}
            className='flex shrink-0 items-center gap-1 rounded-lg border border-red-500 bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95'
            title='Kết thúc cuộc gọi cho tất cả mọi người'
          >
            <span className='material-symbols-outlined text-[16px]'>
              call_end
            </span>
            <span>Kết thúc</span>
          </button>
        )}
      </div>

      {/* Invite Section */}
      <div className='flex w-full items-center justify-end gap-3 sm:w-auto'>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            void appAlert('Đã sao chép đường dẫn cuộc gọi vào bộ nhớ tạm!');
          }}
          className='flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-sky-500'
        >
          <span className='material-symbols-outlined text-[16px]'>
            link
          </span>
          Sao chép link
        </button>
      </div>
    </div>
  );
}
