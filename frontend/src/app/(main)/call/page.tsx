'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CallInfo {
  id: string;
  name: string;
  membersCount: number;
  startTime: string;
  isPublic: boolean;
}

const MOCK_CALLS: CallInfo[] = [
  {
    id: 'test-room',
    name: 'Toán Cao Cấp - Nhóm 1',
    membersCount: 4,
    startTime: '14:00',
    isPublic: true,
  },
  {
    id: 'room-2',
    name: 'Lập Trình Web - Demo',
    membersCount: 12,
    startTime: '15:30',
    isPublic: false,
  },
];

export default function CallPage() {
  const router = useRouter();
  const [calls, setCalls] = useState<CallInfo[]>(MOCK_CALLS);

  const handleJoinCall = (callId: string) => {
    router.push(`/call/${callId}`);
  };

  const handleCreateCall = () => {
    const newCallId = `room-${Date.now()}`;
    const newCall: CallInfo = {
      id: newCallId,
      name: `Phòng học ${Math.floor(Math.random() * 1000)}`,
      membersCount: 1,
      startTime: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isPublic: true,
    };
    setCalls([...calls, newCall]);
    router.push(`/call/${newCallId}`);
  };

  return (
    <main className='flex flex-1 h-full overflow-y-auto bg-background text-on-surface p-6'>
      <div className='max-w-5xl mx-auto w-full flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-primary flex items-center gap-3'>
            <span className='material-symbols-outlined text-4xl'>
              video_camera_front
            </span>
            Phòng Học Trực Tuyến
          </h1>
          <button
            onClick={handleCreateCall}
            className='bg-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary-dim transition-colors shadow-lg'
          >
            <span className='material-symbols-outlined'>add</span>
            Tạo phòng mới
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4'>
          {calls.map((call) => (
            <div
              key={call.id}
              className='glass-panel-elevated rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start'>
                <h2 className='text-xl font-bold text-on-surface line-clamp-2'>
                  {call.name}
                </h2>
                {call.isPublic ? (
                  <span className='bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1'>
                    <span className='material-symbols-outlined text-[14px]'>
                      public
                    </span>{' '}
                    Công khai
                  </span>
                ) : (
                  <span className='bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1'>
                    <span className='material-symbols-outlined text-[14px]'>
                      lock
                    </span>{' '}
                    Riêng tư
                  </span>
                )}
              </div>

              <div className='flex flex-col gap-2 text-sm text-on-surface-variant'>
                <div className='flex items-center gap-2'>
                  <span className='material-symbols-outlined text-base'>
                    group
                  </span>
                  <span>{call.membersCount} thành viên đang tham gia</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='material-symbols-outlined text-base'>
                    schedule
                  </span>
                  <span>Bắt đầu lúc {call.startTime}</span>
                </div>
              </div>

              <button
                onClick={() => handleJoinCall(call.id)}
                className='mt-2 w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-colors py-2.5 rounded-xl font-medium'
              >
                Tham gia ngay
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
