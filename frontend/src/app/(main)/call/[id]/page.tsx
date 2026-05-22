'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCallContext } from '../../../../contexts/CallContext';
import ChatPanel from '../components/ChatPanel';
import ParticipantsPanel from '../components/ParticipantsPanel';
import BottomStatsBar from '../components/BottomStatsBar';

export default function CallRoom() {
  const params = useParams();
  const router = useRouter();
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
      <main className='flex flex-1 h-full items-center justify-center bg-background text-on-surface p-6'>
        <div className='glass-panel-elevated p-8 rounded-3xl max-w-md w-full flex flex-col items-center justify-center text-center gap-6 shadow-xl border border-outline/10 bg-surface/50 backdrop-blur-md'>
          <div className='relative flex items-center justify-center w-20 h-20 bg-amber-500/10 rounded-full border border-amber-500/20'>
            <span className='material-symbols-outlined text-4xl text-amber-500 animate-pulse'>
              lock_clock
            </span>
          </div>
          <div>
            <h1 className='text-2xl font-bold text-on-surface mb-2 animate-pulse'>
              Đang chờ phê duyệt...
            </h1>
            <p className='text-on-surface-variant text-sm px-4'>
              Phòng học này là riêng tư. Chủ phòng đã được thông báo về yêu cầu
              tham gia của bạn. Vui lòng đợi một lát!
            </p>
          </div>
          <div className='w-full bg-surface-variant/30 rounded-2xl p-4 border border-outline/10 text-xs text-on-surface-variant flex flex-col gap-2.5'>
            <div className='flex justify-between items-center'>
              <span className='font-medium'>Phòng học:</span>
              <span className='font-semibold text-on-surface truncate max-w-[180px]'>
                {callDetails?.title || roomId}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='font-medium'>Chủ phòng:</span>
              <span className='font-semibold text-on-surface'>
                {callDetails?.creator?.fullName || 'Giảng viên'}
              </span>
            </div>
          </div>
          <button
            onClick={handleBack}
            className='w-full bg-error/10 hover:bg-error text-error hover:text-white transition-all py-3 rounded-xl font-semibold border border-error/20 active:scale-95'
          >
            Hủy yêu cầu tham gia
          </button>
        </div>
      </main>
    );
  }

  // 2. Pre-join screen ("Ready to Join?")
  if (!isJoined) {
    return (
      <main className='flex flex-1 h-full items-center justify-center bg-background text-on-surface p-6'>
        <div className='glass-panel-elevated p-8 rounded-3xl max-w-2xl w-full flex flex-col gap-8 shadow-xl'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-primary mb-2'>
              Sẵn sàng tham gia lớp học?
            </h1>
            <p className='text-on-surface-variant text-sm flex items-center justify-center gap-1.5'>
              <span className='font-semibold text-on-surface'>
                {callDetails?.title || 'Phòng học trực tuyến'}
              </span>
              <span>•</span>
              <span className='bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-medium'>
                {callDetails?.type === 'public' && 'Công khai'}
                {callDetails?.type === 'private' && 'Riêng tư'}
                {callDetails?.type === 'channel' && 'Lớp học'}
              </span>
            </p>
          </div>

          {permissionError && (
            <div className='bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-xl flex items-start gap-3 text-sm'>
              <span className='material-symbols-outlined text-amber-500'>
                warning
              </span>
              <p>{permissionError}</p>
            </div>
          )}

          <div className='relative bg-surface-container-highest rounded-2xl overflow-hidden aspect-video shadow-inner flex items-center justify-center border border-outline-variant/30'>
            {!isCamOn && (
              <div className='absolute inset-0 flex items-center justify-center flex-col gap-3 text-on-surface-variant bg-surface-container'>
                <span className='material-symbols-outlined text-4xl opacity-50'>
                  videocam_off
                </span>
                <span className='text-sm'>Camera đang tắt</span>
              </div>
            )}
            <video
              ref={(el) => {
                if (localVideoRef) {
                  (localVideoRef as any).current = el;
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
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/60 dark:bg-black/60 backdrop-blur-md p-2 px-4 rounded-full border border-outline-variant/20 shadow-sm'>
              <button
                onClick={toggleAudio}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-primary/10 text-primary' : 'bg-error/20 text-error'}`}
              >
                <span className='material-symbols-outlined text-[18px]'>
                  {isMicOn ? 'mic' : 'mic_off'}
                </span>
              </button>
              <button
                onClick={toggleVideo}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-primary/10 text-primary' : 'bg-error/20 text-error'}`}
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
              className='px-6 py-3 rounded-xl bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-medium'
            >
              Quay lại
            </button>
            <button
              onClick={joinCall}
              className='px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dim shadow-md transition-all active:scale-95'
            >
              {callDetails?.type === 'private'
                ? 'Yêu cầu tham gia'
                : 'Tham gia ngay'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='flex flex-1 h-full overflow-hidden bg-background text-on-surface relative'>
      {/* 3. Floating approval request banner for the Host */}
      {isHost && waitingList.length > 0 && (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-surface border border-outline/20 dark:border-outline/40 backdrop-blur-md rounded-2xl shadow-2xl p-4 max-w-sm w-full flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300 max-h-[60vh] overflow-hidden'>
          <div className='flex items-center gap-3 border-b border-outline/10 pb-3'>
            <div className='w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shrink-0'>
              <span className='material-symbols-outlined text-xl animate-pulse'>
                person_add
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='font-bold text-sm text-on-surface truncate'>
                Yêu cầu tham gia lớp học
              </h4>
              <p className='text-xs text-on-surface-variant truncate'>
                Đang có {waitingList.length} người chờ duyệt
              </p>
            </div>
          </div>
          
          <div className='flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar'>
            {waitingList.map((user) => (
              <div key={user.socketId} className='flex items-center justify-between bg-surface-variant/20 p-2 rounded-lg border border-outline/5'>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-on-surface truncate'>{user.name}</p>
                  <p className='text-xs text-on-surface-variant truncate'>{user.email}</p>
                </div>
                <div className='flex gap-1.5 ml-2 shrink-0'>
                  <button
                    onClick={() => rejectJoin(user.socketId)}
                    className='w-8 h-8 rounded-full flex items-center justify-center bg-error/10 text-error hover:bg-error hover:text-white transition-colors'
                    title='Từ chối'
                  >
                    <span className='material-symbols-outlined text-[16px]'>close</span>
                  </button>
                  <button
                    onClick={() => approveJoin(user.socketId, user.userId)}
                    className='w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors'
                    title='Phê duyệt'
                  >
                    <span className='material-symbols-outlined text-[16px]'>check</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='flex gap-2.5 justify-end border-t border-outline/10 pt-3 mt-1'>
            <button
              onClick={rejectAllJoin}
              className='px-4 py-1.5 rounded-lg text-xs font-semibold border border-outline/20 hover:bg-surface-variant/30 text-on-surface transition-all'
            >
              Từ chối tất cả
            </button>
            <button
              onClick={approveAllJoin}
              className='bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-dim transition-all shadow-md active:scale-95'
            >
              Phê duyệt tất cả
            </button>
          </div>
        </div>
      )}

      {/* Main interface layout */}
      <section className='flex-1 p-4 overflow-hidden flex flex-col'>
        <div className='grid grid-cols-12 gap-4 h-full'>
          {/* Main Video Area */}
          <div className='col-span-12 lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden'>
            <div className='w-full flex-1 min-h-0 glass-panel rounded-2xl overflow-hidden relative shadow-sm border border-outline-variant/30 bg-black'>
              {screenSharerId ? (
                <>
                  {sharedScreenError && (
                    <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-error/90 text-white p-4 text-center gap-2'>
                      <span className='material-symbols-outlined text-2xl'>error</span>
                      <span className='text-sm font-semibold'>{sharedScreenError}</span>
                      <button 
                        onClick={() => {
                          if (sharedScreenVideoRef.current) {
                            const activeStream = isSharingScreen ? screenStream : remotePeers[screenSharerId]?.screenStream;
                            sharedScreenVideoRef.current.srcObject = null;
                            sharedScreenVideoRef.current.srcObject = activeStream || null;
                            setSharedScreenError(null);
                          }
                        }}
                        className='px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs transition-colors'
                      >
                        Thử tải lại
                      </button>
                    </div>
                  )}
                  <video
                    ref={(el) => {
                      if (sharedScreenVideoRef) {
                        (sharedScreenVideoRef as any).current = el;
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
                  <div className='absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm shadow-sm'>
                    <span className='material-symbols-outlined text-[16px] text-amber-300 animate-pulse'>
                      screen_share
                    </span>
                    <span className='font-semibold'>
                      Màn hình của {isSharingScreen ? 'Bạn' : screenSharerName} đang chia sẻ
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {!isCamOn && (
                    <div className='absolute inset-0 flex items-center justify-center bg-surface-container-highest text-on-surface-variant/40'>
                      <span className='material-symbols-outlined text-3xl opacity-60'>
                        videocam_off
                      </span>
                    </div>
                  )}
                  {localVideoError && (
                    <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-error/90 text-white p-4 text-center gap-2'>
                      <span className='material-symbols-outlined text-2xl'>error</span>
                      <span className='text-sm font-semibold'>{localVideoError}</span>
                    </div>
                  )}
                  <video
                    ref={(el) => {
                      if (localVideoRef) {
                        (localVideoRef as any).current = el;
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
                    className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${isCamOn ? 'opacity-100' : 'opacity-0'}`}
                  />
 
                  <div className='absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm shadow-sm'>
                    <span className='material-symbols-outlined text-[16px] text-sky-300'>
                      person
                    </span>
                    <span className='font-semibold'>
                      Bạn {isHost && '(Chủ phòng)'}
                    </span>
                    {!isMicOn && (
                      <span className='material-symbols-outlined text-[14px] text-red-400 ml-1'>
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
          <div className='col-span-12 lg:col-span-4 flex flex-col glass-panel rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden bg-surface h-full'>
            <div className='flex border-b border-outline-variant/30 bg-surface-container-low'>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border-b-2 ${activeTab === 'participants' ? 'border-primary text-primary bg-surface' : 'border-transparent text-on-surface-variant hover:bg-surface/50'}`}
              >
                <span className='material-symbols-outlined text-[18px]'>
                  group
                </span>
                Học viên
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border-b-2 ${activeTab === 'chat' ? 'border-primary text-primary bg-surface' : 'border-transparent text-on-surface-variant hover:bg-surface/50'}`}
              >
                <span className='material-symbols-outlined text-[18px]'>
                  forum
                </span>
                Trò chuyện
              </button>
            </div>

            <div className='flex-1 overflow-hidden'>
              {activeTab === 'participants' ? (
                <ParticipantsPanel />
              ) : (
                <ChatPanel />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
