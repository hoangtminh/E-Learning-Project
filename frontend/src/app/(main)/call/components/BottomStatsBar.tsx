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
    <div className='flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/90 p-3.5 text-slate-200 shadow-2xl sm:flex-row sm:items-center sm:justify-between backdrop-blur-md'>
      {/* Stats Section */}
      <div className='no-scrollbar flex w-full min-w-0 gap-4 overflow-x-auto sm:w-auto sm:gap-6 items-center'>
        <div>
          <p className='text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5'>
            Thời gian gọi
          </p>
          <p className='text-base font-bold text-white tabular-nums'>
            {durationStr}
          </p>
        </div>
        <div className='h-8 w-px shrink-0 self-center bg-white/10'></div>
        <div>
          <p className='text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5'>
            Mạng
          </p>
          <p className='text-base font-bold text-green-400'>Ổn định</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className='flex max-w-full items-center gap-2.5 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 p-1.5'>
        <button
          onClick={toggleAudio}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer border-0 ${isMicOn ? 'bg-primary/20 text-primary-container hover:bg-primary/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
          title={isMicOn ? 'Tắt mic' : 'Bật mic'}
        >
          <span className='material-symbols-outlined text-[18px]'>
            {isMicOn ? 'mic' : 'mic_off'}
          </span>
        </button>
        <button
          onClick={toggleVideo}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer border-0 ${isCamOn ? 'bg-primary/20 text-primary-container hover:bg-primary/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
          title={isCamOn ? 'Tắt camera' : 'Bật camera'}
        >
          <span className='material-symbols-outlined text-[18px]'>
            {isCamOn ? 'videocam' : 'videocam_off'}
          </span>
        </button>
        <button
          onClick={isSharingScreen ? stopScreenShare : startScreenShare}
          disabled={screenSharerId !== null && !isSharingScreen}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer border-0 ${isSharingScreen
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-bold border border-amber-500/40'
              : screenSharerId !== null
                ? 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-40'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition-colors hover:bg-white/15 cursor-pointer border-0'
          title='Cài đặt'
        >
          <span className='material-symbols-outlined text-[18px]'>
            settings
          </span>
        </button>

        <div className='mx-1 h-6 w-px shrink-0 bg-white/10'></div>

        <button
          onClick={handleLeave}
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs transition-all hover:bg-amber-500 cursor-pointer border-0 active:scale-[0.97]'
          title='Rời phòng cuộc gọi'
        >
          <span className='material-symbols-outlined text-[18px]'>
            logout
          </span>
        </button>

        {isHost && (
          <button
            onClick={handleEndCall}
            className='flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border-0 bg-red-600 px-4 text-xs font-bold text-white shadow-xs transition-all hover:bg-red-750 active:scale-[0.97] cursor-pointer'
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
      <div className='flex w-full items-center justify-end gap-3 sm:w-auto shrink-0'>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            void appAlert('Đã sao chép đường dẫn cuộc gọi vào bộ nhớ tạm!');
          }}
          className='flex shrink-0 items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-dim px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer border-0'
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
