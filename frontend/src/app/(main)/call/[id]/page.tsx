'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCallContext } from '../../../../contexts/CallContext';
import ChatPanel from '../components/ChatPanel';
import ParticipantsPanel from '../components/ParticipantsPanel';
import BottomStatsBar from '../components/BottomStatsBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function CallRoom() {
  const params = useParams();
  const roomId = params.id as string;

  const {
    isJoined,
    isCamOn,
    isMicOn,
    setRoomId,
    initLocalMedia,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    localVideoRef,
    permissionError,
    localStream,

    // Call classification & waiting state
    callDetails,
    waitingList,
    isWaitingForApproval,
    isHost,
    approveJoin,
    rejectJoin,
    approveAllJoin,
    rejectAllJoin,

    // Screen sharing
    isSharingScreen,
    screenStream,
    screenSharerId,
    screenSharerName,
    remotePeers,
    exitAndRedirect,
  } = useCallContext();

  const [activeTab, setActiveTab] = useState<'participants' | 'chat'>(
    'participants',
  );

  const sharedScreenVideoRef = useRef<HTMLVideoElement>(null);
  const [sharedScreenError, setSharedScreenError] = useState<string | null>(null);

  // Sync screen stream with video element
  useEffect(() => {
    setSharedScreenError(null);
    let timeoutId: NodeJS.Timeout;

    if (sharedScreenVideoRef.current && screenSharerId) {
      const activeStream = isSharingScreen ? screenStream : remotePeers[screenSharerId]?.screenStream;
      if (sharedScreenVideoRef.current.srcObject !== activeStream) {
        sharedScreenVideoRef.current.srcObject = activeStream || null;
      }

      timeoutId = setTimeout(() => {
        if (sharedScreenVideoRef.current && sharedScreenVideoRef.current.paused) {
          setSharedScreenError('Không thể tải màn hình chia sẻ');
        }
      }, 8000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [screenSharerId, isSharingScreen, screenStream, remotePeers]);

  // Auto-switch to participants tab when someone starts screen sharing
  useEffect(() => {
    if (screenSharerId) {
      setActiveTab('participants');
    }
  }, [screenSharerId]);

  const [localVideoError, setLocalVideoError] = useState<string | null>(null);

  // Sync local stream with video element whenever it changes
  useEffect(() => {
    setLocalVideoError(null);
    let timeoutId: NodeJS.Timeout;

    if (localVideoRef.current && localStream && isCamOn) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }

      timeoutId = setTimeout(() => {
        if (localVideoRef.current && localVideoRef.current.paused) {
          setLocalVideoError('Lỗi tải video');
        }
      }, 8000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [localStream, isJoined, isCamOn, localVideoRef]);

  // Initialize room and local media when component mounts
  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
      initLocalMedia();
    }

    return () => {
      leaveCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleBack = () => {
    exitAndRedirect();
  };

  // 1. Waiting room state for private calls
  if (isJoined && isWaitingForApproval) {
    return (
      <main className='flex min-h-[100dvh] flex-1 items-center justify-center bg-slate-950 p-4 text-slate-100 sm:p-6'>
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className='glass-panel-elevated p-8 rounded-2xl max-w-md w-full flex flex-col items-center justify-center text-center gap-6 shadow-xl border border-white/10 bg-slate-900/60 backdrop-blur-lg'
        >
          <div className='relative flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-xl border border-amber-500/20'>
            <span className='material-symbols-outlined text-3xl text-amber-500 animate-pulse'>
              lock_clock
            </span>
          </div>
          <div>
            <h1 className='text-xl font-bold text-white mb-2'>
              Đang chờ phê duyệt...
            </h1>
            <p className='text-slate-400 text-xs px-4 leading-relaxed'>
              Phòng học này là riêng tư. Chủ phòng đã được thông báo về yêu cầu
              tham gia của bạn. Vui lòng đợi trong giây lát!
            </p>
          </div>
          <div className='w-full bg-white/5 rounded-xl p-4 border border-white/5 text-xs text-slate-300 flex flex-col gap-2.5'>
            <div className='flex justify-between items-center'>
              <span className='font-medium text-slate-400'>Lớp học:</span>
              <span className='font-semibold text-white truncate max-w-[180px]'>
                {callDetails?.title || roomId}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='font-medium text-slate-400'>Chủ phòng:</span>
              <span className='font-semibold text-white'>
                {callDetails?.creator?.fullName || 'Giảng viên'}
              </span>
            </div>
          </div>
          <button
            onClick={handleBack}
            className='w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all py-2.5 rounded-xl font-semibold border border-red-500/20 active:scale-[0.98]'
          >
            Hủy yêu cầu tham gia
          </button>
        </motion.div>
      </main>
    );
  }

  // 2. Pre-join screen ("Ready to Join?")
  if (!isJoined) {
    return (
      <main className='flex min-h-[100dvh] flex-1 items-center justify-center bg-slate-950 p-4 text-slate-100 sm:p-6'>
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className='glass-panel-elevated p-6 sm:p-8 rounded-2xl max-w-2xl w-full flex flex-col gap-6 shadow-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md'
        >
          <div className='text-center'>
            <h1 className='text-xl sm:text-2xl font-bold text-white tracking-tight mb-2'>
              Sẵn sàng tham gia lớp học?
            </h1>
            <p className='text-slate-400 text-xs sm:text-sm flex items-center justify-center gap-2 flex-wrap'>
              <span className='font-semibold text-white'>
                {callDetails?.title || 'Phòng học trực tuyến'}
              </span>
              <span className='text-slate-600'>•</span>
              <span className='bg-primary/20 text-primary-container text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-primary/20'>
                {callDetails?.type === 'public' && 'Công khai'}
                {callDetails?.type === 'private' && 'Riêng tư'}
                {callDetails?.type === 'channel' && 'Lớp học'}
              </span>
            </p>
          </div>

          {permissionError && (
            <div className='bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-3 rounded-xl flex items-start gap-3 text-xs'>
              <span className='material-symbols-outlined text-amber-500 shrink-0'>
                warning
              </span>
              <p className='leading-relaxed'>{permissionError}</p>
            </div>
          )}

          <div className='relative bg-slate-950 rounded-xl overflow-hidden aspect-video shadow-inner flex items-center justify-center border border-white/5'>
            {!isCamOn && (
              <div className='absolute inset-0 flex items-center justify-center flex-col gap-2 text-slate-400 bg-slate-900/90 z-10'>
                <span className='material-symbols-outlined text-3xl opacity-50'>
                  videocam_off
                </span>
                <span className='text-xs font-medium'>Camera đang tắt</span>
              </div>
            )}
            <video
              ref={(el) => {
                if (localVideoRef) {
                  (localVideoRef as { current: HTMLVideoElement | null }).current = el;
                }
                if (el && localStream) {
                  el.srcObject = localStream;
                }
              }}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${isCamOn ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Quick toggles on video */}
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-1.5 px-3.5 rounded-full border border-white/10 shadow-lg z-20'>
              <button
                onClick={toggleAudio}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isMicOn ? 'bg-primary/20 text-primary-container hover:bg-primary/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
                title={isMicOn ? 'Tắt mic' : 'Bật mic'}
              >
                <span className='material-symbols-outlined text-[18px]'>
                  {isMicOn ? 'mic' : 'mic_off'}
                </span>
              </button>
              <button
                onClick={toggleVideo}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isCamOn ? 'bg-primary/20 text-primary-container hover:bg-primary/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
                title={isCamOn ? 'Tắt camera' : 'Bật camera'}
              >
                <span className='material-symbols-outlined text-[18px]'>
                  {isCamOn ? 'videocam' : 'videocam_off'}
                </span>
              </button>
            </div>
          </div>

          <div className='flex items-center gap-4 justify-center'>
            <button
              onClick={handleBack}
              className='px-5 py-2.5 rounded-xl bg-transparent border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-semibold text-xs cursor-pointer'
            >
              Quay lại
            </button>
            <button
              onClick={joinCall}
              className='px-7 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dim shadow-md transition-all active:scale-[0.98] text-xs cursor-pointer border-0'
            >
              {callDetails?.type === 'private'
                ? 'Yêu cầu tham gia'
                : 'Tham gia ngay'}
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className='relative flex h-full min-h-0 flex-1 overflow-hidden bg-slate-950 text-slate-100 w-full'>
      {/* 3. Floating approval request banner for the Host */}
      <AnimatePresence>
        {isHost && waitingList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className='absolute left-3 right-3 top-3 z-50 mx-auto flex max-h-[min(400px,70vh)] max-w-xl flex-col gap-3 overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-lg'
          >
            <div className='flex items-center gap-3 border-b border-white/10 pb-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-400/10 text-amber-300'>
                <span className='material-symbols-outlined text-lg animate-pulse'>
                  person_add
                </span>
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='truncate text-xs font-bold text-white uppercase tracking-wider'>
                  Yêu cầu tham gia lớp học
                </h4>
                <p className='truncate text-[10px] text-slate-400'>
                  Đang có {waitingList.length} người chờ duyệt
                </p>
              </div>
            </div>

            <div className='custom-scrollbar flex flex-col gap-2 overflow-y-auto pr-1 flex-1'>
              {waitingList.map((user) => (
                <div key={user.socketId} className='flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3.5'>
                  <div className='flex-1 min-w-0'>
                    <p className='truncate text-xs font-bold text-white'>{user.name}</p>
                    <p className='truncate text-[10px] text-slate-400'>{user.email}</p>
                  </div>
                  <div className='flex gap-2 ml-2 shrink-0'>
                    <button
                      onClick={() => rejectJoin(user.socketId)}
                      className='w-7 h-7 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer border-0'
                      title='Từ chối'
                    >
                      <span className='material-symbols-outlined text-[14px]'>close</span>
                    </button>
                    <button
                      onClick={() => approveJoin(user.socketId, user.userId)}
                      className='w-7 h-7 rounded-full flex items-center justify-center bg-primary/20 text-primary-container hover:bg-primary hover:text-white transition-colors cursor-pointer border-0'
                      title='Phê duyệt'
                    >
                      <span className='material-symbols-outlined text-[14px]'>check</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-1 flex justify-end gap-2.5 border-t border-white/10 pt-3 shrink-0'>
              <button
                onClick={rejectAllJoin}
                className='rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 transition-all hover:bg-white/5 cursor-pointer'
              >
                Từ chối tất cả
              </button>
              <button
                onClick={approveAllJoin}
                className='bg-primary hover:bg-primary-dim text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] cursor-pointer border-0'
              >
                Phê duyệt tất cả
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main interface layout */}
      <section className='flex h-full min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-4'>
        <div className='grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(280px,38vh)] gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-rows-1'>
          {/* Main Video Area */}
          <div className='flex min-h-0 flex-col gap-4 overflow-hidden'>
            <div className='relative min-h-[220px] w-full flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slate-950 shadow-2xl'>
              {screenSharerId ? (
                <>
                  {sharedScreenError && (
                    <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-500/90 text-white p-4 text-center gap-2'>
                      <span className='material-symbols-outlined text-2xl'>error</span>
                      <span className='text-xs font-bold'>{sharedScreenError}</span>
                      <button
                        onClick={() => {
                          if (sharedScreenVideoRef.current) {
                            const activeStream = isSharingScreen ? screenStream : remotePeers[screenSharerId]?.screenStream;
                            sharedScreenVideoRef.current.srcObject = null;
                            sharedScreenVideoRef.current.srcObject = activeStream || null;
                            setSharedScreenError(null);
                          }
                        }}
                        className='px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs transition-colors'
                      >
                        Thử tải lại
                      </button>
                    </div>
                  )}
                  <video
                    ref={(el) => {
                      if (sharedScreenVideoRef) {
                        (sharedScreenVideoRef as { current: HTMLVideoElement | null }).current = el;
                      }
                      if (el && screenSharerId) {
                        const activeStream = isSharingScreen ? screenStream : remotePeers[screenSharerId]?.screenStream;
                        if (el.srcObject !== activeStream) {
                          el.srcObject = activeStream || null;
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    onPlaying={() => setSharedScreenError(null)}
                    onError={() => setSharedScreenError('Lỗi luồng chia sẻ màn hình')}
                    className='w-full h-full object-contain'
                  />
                  <div className='absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-xl bg-slate-900/70 px-3.5 py-1.5 text-xs text-white shadow-md backdrop-blur-md border border-white/5'>
                    <span className='material-symbols-outlined text-sm text-amber-400 animate-pulse'>
                      screen_share
                    </span>
                    <span className='font-bold'>
                      Màn hình của {isSharingScreen ? 'Bạn' : screenSharerName} đang chia sẻ
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {!isCamOn && (
                    <div className='absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 z-0'>
                      <span className='material-symbols-outlined text-4xl opacity-50'>
                        videocam_off
                      </span>
                    </div>
                  )}
                  {localVideoError && (
                    <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-500/90 text-white p-4 text-center gap-2'>
                      <span className='material-symbols-outlined text-2xl'>error</span>
                      <span className='text-xs font-bold'>{localVideoError}</span>
                    </div>
                  )}
                  <video
                    ref={(el) => {
                      if (localVideoRef) {
                        (localVideoRef as { current: HTMLVideoElement | null }).current = el;
                      }
                      if (el && localStream) {
                        if (el.srcObject !== localStream) {
                          el.srcObject = localStream;
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    onPlaying={() => setLocalVideoError(null)}
                    onError={() => setLocalVideoError('Lỗi hiển thị camera')}
                    className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 relative z-10 ${isCamOn ? 'opacity-100' : 'opacity-0'}`}
                  />

                  <div className='absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-xl bg-slate-900/70 px-3.5 py-1.5 text-xs text-white shadow-md backdrop-blur-md border border-white/5 z-20'>
                    <span className='material-symbols-outlined text-sm text-primary-container'>
                      person
                    </span>
                    <span className='font-bold'>
                      Bạn {isHost && '(Chủ phòng)'}
                    </span>
                    {!isMicOn && (
                      <span className='material-symbols-outlined text-xs text-red-400 ml-1'>
                        mic_off
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className='shrink-0'>
              <BottomStatsBar />
            </div>
          </div>

          {/* Right Sidebar (Tabs) */}
          <aside className='flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl'>
            <div className='flex shrink-0 border-b border-white/5 bg-slate-950/40 p-1'>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer border-0 ${
                  activeTab === 'participants' 
                    ? 'bg-slate-800 text-primary-container shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className='material-symbols-outlined text-base'>
                  group
                </span>
                Học viên
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer border-0 ${
                  activeTab === 'chat' 
                    ? 'bg-slate-800 text-primary-container shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className='material-symbols-outlined text-base'>
                  forum
                </span>
                Trò chuyện
              </button>
            </div>

            <div className='min-h-0 flex-1 overflow-hidden bg-slate-900/60'>
              {activeTab === 'participants' ? (
                <ParticipantsPanel />
              ) : (
                <ChatPanel />
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
