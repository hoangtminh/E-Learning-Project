'use client';

import { useClassrooms } from '@/contexts/ClassroomContext';
import PostList from './PostList';

export default function ClassroomDetailPage() {
  const { classroom } = useClassrooms();
  if (!classroom) return null;

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 w-full'>
      {/* Right Column: Activity Feed (Posts) */}
      <div className='lg:col-span-8'>
        <PostList />
      </div>
    </div>
  );
}
