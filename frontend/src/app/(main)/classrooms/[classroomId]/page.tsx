'use client';

import { useClassrooms } from '@/contexts/ClassroomContext';
import PostList from './PostList';

export default function ClassroomDetailPage() {
  const { classroom } = useClassrooms();
  if (!classroom) return null;

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 w-full'>
      {/* Left Column: Pinned & Info */}
      <div className='lg:col-span-4 space-y-6'>
        {/* Pinned Messages */}
        <div className='p-6 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200'>
          <h3 className='text-xs font-bold text-slate-500 tracking-widest uppercase mb-4'>
            Tin nhắn đã ghim
          </h3>
          <div className='space-y-4'>
            <div className='flex gap-3 items-start p-3 bg-sky-50 rounded-lg border border-sky-100'>
              <span className='material-symbols-outlined text-sky-600 text-xl'>
                push_pin
              </span>
              <div>
                <p className='text-xs font-semibold text-sky-700'>
                  Lịch học tuần này
                </p>
                <p className='text-xs text-slate-600 mt-1'>
                  Buổi 4: Server Components & Actions sẽ bắt đầu vào 20:00 tối
                  nay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Activity Feed (Posts) */}
      <div className='lg:col-span-8'>
        <PostList />
      </div>
    </div>
  );
}

