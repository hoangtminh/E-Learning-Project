'use client';

import { useState, memo } from 'react';
import { Send } from 'lucide-react';
import { usePosts } from '@/contexts/PostContext';
import { toast } from 'sonner';

interface CommentInputProps {
  classroomId: string;
  postId: string;
}

export const CommentInput = memo(function CommentInput({
  classroomId,
  postId,
}: CommentInputProps) {
  const { createComment } = usePosts();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createComment(classroomId, postId, newComment);
      setNewComment('');
      toast.success('Đã gửi bình luận!');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi gửi bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='p-3 bg-white border-t border-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]'>
      <div className='max-w-4xl mx-auto flex items-center gap-2'>
        <div className='flex-1 relative'>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder='Viết bình luận...'
            className='w-full py-2.5 px-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all resize-none max-h-24 text-slate-800 shadow-inner'
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!newComment.trim() || isSubmitting}
            className='absolute right-2 bottom-1.5 p-1.5 text-sky-600 disabled:text-slate-300 transition-colors hover:bg-sky-50 rounded-full'
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});
