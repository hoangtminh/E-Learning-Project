'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostContext';
import { ChevronLeft } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

export default function PostDetailPage() {
  const { classroomId, postId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { posts, commentsMap, fetchComments, fetchPosts, loadingPosts, loadingComments } = usePosts();

  const post = posts.find((p) => p.id === postId);
  const comments = commentsMap[postId as string] || [];
  const isLoadingComments = loadingComments[postId as string];
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (classroomId) {
      fetchPosts(classroomId as string);
    }
  }, [classroomId, fetchPosts]);

  useEffect(() => {
    if (classroomId && postId) {
      fetchComments(classroomId as string, postId as string);
    }
  }, [classroomId, postId, fetchComments]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if ((loadingPosts && !post) || (isLoadingComments && comments.length === 0)) {
    return (
      <div className='flex items-center justify-center min-h-[400px] text-slate-400'>
        <span className='material-symbols-outlined animate-spin mr-2'>progress_activity</span>
        Đang tải thảo luận...
      </div>
    );
  }

  if (!post) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4'>
        <span className='material-symbols-outlined text-4xl text-slate-300'>error_outline</span>
        <p className='text-sm'>Không tìm thấy bài đăng hoặc bạn không có quyền xem.</p>
        <button 
          onClick={() => router.back()}
          className='px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all'
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-[calc(100vh-64px)] bg-slate-50'>
      {/* Header */}
      <div className='p-3 bg-white border-b border-slate-200/80 flex items-center gap-3 sticky top-0 z-20 shadow-sm'>
        <button 
          onClick={() => router.back()}
          className='p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600'
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className='text-xs font-black text-slate-800 uppercase tracking-widest'>
            Chi Tiết Thảo Luận
          </h2>
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl mx-auto w-full space-y-5 sm:space-y-6 scrollbar-thin scrollbar-thumb-slate-200'>
        {/* Original Post Card */}
        <article className='bg-white rounded-2xl p-3.5 sm:p-4.5 border border-slate-200/60 shadow-sm relative overflow-hidden'>
          <div className='absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-500 to-indigo-500'></div>
          <div className='flex items-center gap-2.5 mb-2.5'>
            <img
              alt='Avatar'
              className='w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-100 shadow-sm shrink-0'
              src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.fullName || 'User')}&background=random`}
            />
            <div>
              <h4 className='text-xs font-bold text-slate-800 flex items-center gap-1.5'>
                {post.author.fullName}
                {user?.userId === post.authorId || user?.id === post.authorId ? (
                  <span className='px-1.5 py-0.5 text-[8px] bg-slate-100 text-slate-500 rounded font-medium'>(Bạn)</span>
                ) : null}
              </h4>
              <p className='text-[10px] text-slate-400 font-semibold uppercase'>
                {new Date(post.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <div className='pl-1.5'>
            <MarkdownRenderer content={post.content} />
          </div>
        </article>

        {/* Comments Section */}
        <div className='space-y-3.5'>
          <div className='flex items-center justify-between pl-1'>
            <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>
              Ý Kiến Trao Đổi ({comments.length})
            </h3>
          </div>
          
          <div className='space-y-4 bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 shadow-inner min-h-[150px] flex flex-col justify-between'>
            {comments.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-slate-400 gap-2'>
                <span className='material-symbols-outlined text-3xl text-slate-300'>chat_bubble_outline</span>
                <p className='text-[11px] font-semibold'>Lớp học chưa có thảo luận nào cho bài viết này.</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {comments.map((comment) => {
                  const isCommentAuthor = user?.userId === comment.authorId || user?.id === comment.authorId;
                  const isPostAuthor = user?.userId === post.authorId || user?.id === post.authorId;
                  const canDelete = isCommentAuthor || isPostAuthor;

                  return (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      classroomId={classroomId as string}
                      postId={postId as string}
                      isCommentAuthor={isCommentAuthor}
                      canDelete={canDelete}
                    />
                  );
                })}
              </div>
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Footer Input */}
      <CommentInput classroomId={classroomId as string} postId={postId as string} />
    </div>
  );
}
