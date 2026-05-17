'use client';

import { useEffect, useRef, useState } from 'react';
import { useClassrooms } from '@/contexts/ClassroomContext';
import PostItem from './PostItem';
import { PlusCircle } from 'lucide-react';

export default function PostList() {
  const { classroom, posts, loadingPosts, fetchPosts, createPost } = useClassrooms();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endOfListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (classroom) {
      fetchPosts(classroom.id);
    }
  }, [classroom, fetchPosts]);

  // Auto scroll to bottom when posts loaded (like chat)
  useEffect(() => {
    if (posts.length > 0) {
      endOfListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [posts]);

  // Sort ascending so newest is at the bottom
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleCreate = async () => {
    if (!classroom || !newContent.trim()) return;
    setIsSubmitting(true);
    try {
      await createPost(classroom.id, newContent);
      setIsModalOpen(false);
      setNewContent('');
      // Scroll to bottom happens automatically via useEffect
    } catch (e: any) {
      alert(e.message || 'Lỗi khi tạo thông báo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPosts && posts.length === 0) {
    return (
      <div className='flex items-center justify-center p-12 text-slate-400'>
        <span className='material-symbols-outlined animate-spin mr-2'>progress_activity</span>
        Đang tải thông báo...
      </div>
    );
  }

  return (
    <div className='flex flex-col h-[calc(100vh-200px)]'>
      {/* Posts Chat View */}
      <div className='flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200'>
        {sortedPosts.length === 0 ? (
          <div className='text-center p-12 bg-white/40 backdrop-blur rounded-2xl border border-dashed border-slate-300'>
            <span className='material-symbols-outlined text-4xl text-slate-300 mb-2'>forum</span>
            <p className='text-slate-500'>Chưa có thông báo nào trong lớp học.</p>
          </div>
        ) : (
          sortedPosts.map((post) => <PostItem key={post.id} post={post} />)
        )}
        <div ref={endOfListRef} className='h-4' />
      </div>

      {/* Bottom section to open create modal */}
      <div className='mt-6 pt-4 border-t border-slate-200'>
        <div 
          onClick={() => setIsModalOpen(true)}
          className='w-full bg-white rounded-xl border border-slate-200 p-4 cursor-text flex items-center gap-3 text-slate-400 hover:border-sky-300 transition-colors shadow-sm'
        >
          <div className='w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center'>
            <PlusCircle size={18} className='text-sky-600' />
          </div>
          <span className='text-sm'>Tạo thông báo mới cho lớp học...</span>
        </div>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl'>
            <h2 className='text-xl font-bold text-slate-900 mb-4 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sky-600'>campaign</span>
              Tạo thông báo mới
            </h2>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className='w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all min-h-[150px] resize-none text-slate-800'
              placeholder='Nhập nội dung thông báo...'
              autoFocus
            />
            <div className='mt-6 flex justify-end gap-3'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors'
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !newContent.trim()}
                className='px-6 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md'
              >
                {isSubmitting ? (
                  <>
                    <span className='material-symbols-outlined animate-spin text-sm'>progress_activity</span>
                    Đang đăng...
                  </>
                ) : (
                  'Đăng thông báo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
