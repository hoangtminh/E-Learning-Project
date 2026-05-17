'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { usePosts } from '@/contexts/PostContext';
import PostItem from './PostItem';
import { PlusCircle } from 'lucide-react';
import { CreatePostModal } from './CreatePostModal';

export default function PostList() {
  const { classroom } = useClassrooms();
  const { posts, loadingPosts, fetchPosts, createPost } = usePosts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const endOfListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (classroom) {
      fetchPosts(classroom.id);
    }
  }, [classroom, fetchPosts]);

  useEffect(() => {
    if (posts.length > 0) {
      endOfListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [posts]);

  // Sort ascending so newest is at the bottom (chat-style feed flow)
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handlePostSubmit = useCallback(async (content: string) => {
    if (!classroom) return;
    await createPost(classroom.id, content);
  }, [classroom, createPost]);

  if (loadingPosts && posts.length === 0) {
    return (
      <div className='flex items-center justify-center p-12 text-slate-400 font-semibold text-sm gap-2'>
        <span className='material-symbols-outlined animate-spin'>progress_activity</span>
        Đang tải thông báo...
      </div>
    );
  }

  return (
    <div className='flex flex-col h-[calc(100vh-200px)]'>
      {/* Posts Chat View */}
      <div className='flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200/80 scrollbar-track-transparent'>
        {sortedPosts.length === 0 ? (
          <div className='text-center py-14 px-6 bg-white/40 backdrop-blur rounded-md border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2'>
            <span className='material-symbols-outlined text-4xl text-slate-300'>forum</span>
            <p className='text-slate-500 font-bold text-sm'>Chưa có thông báo nào trong lớp học.</p>
            <p className='text-xs text-slate-400 font-medium'>Hãy là người đầu tiên đăng thông báo cho các thành viên khác!</p>
          </div>
        ) : (
          sortedPosts.map((post) => <PostItem key={post.id} post={post} />)
        )}
        <div ref={endOfListRef} className='h-2' />
      </div>

      {/* Bottom section to trigger modal */}
      <div className='mt-4 pt-3.5 border-t border-slate-200/80'>
        <div 
          onClick={() => setIsModalOpen(true)}
          className='w-full bg-white rounded-md border border-slate-200 p-3.5 cursor-text flex items-center gap-3 text-slate-400 hover:border-sky-300 hover:shadow-sm transition-all shadow-inner'
        >
          <div className='w-7 h-7 rounded-md bg-sky-50 flex items-center justify-center shadow-sm'>
            <PlusCircle size={15} className='text-sky-600' />
          </div>
          <span className='text-sm font-semibold text-slate-500'>Tạo thông báo mới cho lớp học của bạn...</span>
        </div>
      </div>

      {/* Create Announcement Modal */}
      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handlePostSubmit}
      />
    </div>
  );
}
