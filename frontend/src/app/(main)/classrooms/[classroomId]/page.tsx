'use client';

import { useClassrooms } from '@/contexts/ClassroomContext';
import PostList from './PostList';

export default function ClassroomDetailPage() {
  const { classroom } = useClassrooms();
  if (!classroom) return null;

  return (
    <div className='p-3 sm:p-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 w-full'>
      {/* Right Column: Activity Feed (Posts) */}
      <div className='lg:col-span-8 w-full'>
        <PostList />
      </div>
    </div>
  );
}
