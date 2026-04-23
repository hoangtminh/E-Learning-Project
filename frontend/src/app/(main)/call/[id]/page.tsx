'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCallContext } from '../contexts/CallContext';
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
  } = useCallContext();

  const [activeTab, setActiveTab] = useState<'participants' | 'chat'>('participants');

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
    leaveCall();
    router.push('/call');
  };

  if (!isJoined) {
    return (
      <main className='flex flex-1 h-full items-center justify-center bg-background text-on-surface p-6'>
        <div className='glass-panel-elevated p-8 rounded-3xl max-w-2xl w-full flex flex-col gap-8 shadow-xl'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-primary mb-2'>
              Sẵn sàng tham gia?
            </h1>
            <p className='text-on-surface-variant text-sm'>
              Phòng: <span className='font-semibold'>{roomId}</span>
            </p>
          </div>

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
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${isCamOn ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {/* Quick toggles on video */}
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/60 backdrop-blur-md p-2 px-4 rounded-full border border-outline-variant/20 shadow-sm'>
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
              className='px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dim shadow-md transition-all'
            >
              Tham gia ngay
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='flex flex-1 h-full overflow-hidden bg-background text-on-surface'>
      <section className='flex-1 p-4 overflow-hidden flex flex-col'>
        <div className='grid grid-cols-12 gap-4 h-full'>
          
          {/* Main Video Area */}
          <div className='col-span-12 lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden'>
            <div className='w-full flex-1 min-h-0 glass-panel rounded-2xl overflow-hidden relative shadow-sm border border-outline-variant/30 bg-black'>
              {!isCamOn && (
                <div className='absolute inset-0 flex items-center justify-center flex-col gap-3 bg-surface-container-high text-on-surface-variant'>
                  <span className='material-symbols-outlined text-5xl opacity-50'>
                    account_circle
                  </span>
                  <span className='text-sm'>Bạn đang tắt Camera</span>
                </div>
              )}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${isCamOn ? 'opacity-100' : 'opacity-0'}`}
              />
              
              <div className='absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm shadow-sm'>
                <span className='material-symbols-outlined text-[16px] text-sky-300'>
                  person
                </span>
                <span>Bạn</span>
                {!isMicOn && (
                  <span className='material-symbols-outlined text-[14px] text-red-400 ml-1'>
                    mic_off
                  </span>
                )}
              </div>
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
                <span className='material-symbols-outlined text-[18px]'>group</span>
                Học viên
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border-b-2 ${activeTab === 'chat' ? 'border-primary text-primary bg-surface' : 'border-transparent text-on-surface-variant hover:bg-surface/50'}`}
              >
                <span className='material-symbols-outlined text-[18px]'>forum</span>
                Trò chuyện
              </button>
            </div>
            
            <div className='flex-1 overflow-hidden'>
              {activeTab === 'participants' ? <ParticipantsPanel /> : <ChatPanel />}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
