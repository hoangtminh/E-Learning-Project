'use client';

import { useClassrooms } from '@/contexts/ClassroomContext';
import PostList from './PostList';

export default function ClassroomDetailPage() {
  const { classroom } = useClassrooms();
  if (!classroom) return null;

  return (
    <div className='p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full'>
      {/* Page Header */}
      <div className='flex justify-between items-center mb-4 md:mb-6'>
        <div>
          <h2 className='text-lg sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
            <span className='material-symbols-outlined text-sky-600' style={{ fontVariationSettings: "'FILL' 1" }}>
              forum
            </span>
            Bảng tin lớp học
          </h2>
          <p className='text-slate-500 text-xs sm:text-sm mt-1'>
            Cập nhật tin tức và thông báo mới nhất từ giáo viên và các thành viên khác.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
        <div className='lg:col-span-8 w-full'>
          <PostList />
        </div>
      </div>
    </div>
  );
}
