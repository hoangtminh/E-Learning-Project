'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { useAuth } from '@/contexts/AuthContext';
import { ClassroomPost, ClassroomPostComment } from '@/api/classroom';
import { ChevronLeft, Send, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function PostDetailPage() {
  const { classroomId, postId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { 
    classroom, 
    posts, 
    fetchComments, 
    createComment, 
    updateComment, 
    deleteComment 
  } = useClassrooms();

  const [post, setPost] = useState<ClassroomPost | null>(null);
  const [comments, setComments] = useState<ClassroomPostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!classroomId || !postId) return;
      setLoading(true);
      try {
        // Find post in existing context or fetch if needed
        const foundPost = posts.find(p => p.id === postId);
        if (foundPost) setPost(foundPost);
        
        const fetchedComments = await fetchComments(classroomId as string, postId as string);
        setComments(fetchedComments);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [classroomId, postId, posts, fetchComments]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createComment(classroomId as string, postId as string, newComment);
      setNewComment('');
      const updated = await fetchComments(classroomId as string, postId as string);
      setComments(updated);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    try {
      await updateComment(classroomId as string, commentId, editContent);
      setEditingCommentId(null);
      const updated = await fetchComments(classroomId as string, postId as string);
      setComments(updated);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      await deleteComment(classroomId as string, commentId);
      const updated = await fetchComments(classroomId as string, postId as string);
      setComments(updated);
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading && !post) {
    return <div className='p-10 text-center text-slate-400'>Đang tải...</div>;
  }

  if (!post) {
    return <div className='p-10 text-center text-slate-400'>Không tìm thấy bài đăng.</div>;
  }

  return (
    <div className='flex flex-col h-[calc(100vh-64px)] bg-slate-50'>
      {/* Header */}
      <div className='p-4 bg-white border-b border-slate-200 flex items-center gap-4 sticky top-0 z-20 shadow-sm'>
        <button 
          onClick={() => router.back()}
          className='p-2 hover:bg-slate-100 rounded-full transition-colors'
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className='text-sm font-bold text-slate-800 uppercase tracking-wider'>
          Bình luận bài viết
        </h2>
      </div>

      {/* Content Area */}
      <div className='flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-8'>
        {/* Original Post (Fixed at top conceptually) */}
        <div className='bg-white rounded-2xl p-6 border border-slate-200 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <img
              alt='Avatar'
              className='w-12 h-12 rounded-full object-cover border-2 border-sky-100'
              src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.fullName || 'User')}&background=random`}
            />
            <div>
              <h4 className='text-base font-bold text-slate-900'>{post.author.fullName}</h4>
              <p className='text-xs text-slate-400'>{new Date(post.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
          <p className='text-slate-700 whitespace-pre-wrap leading-relaxed'>{post.content}</p>
        </div>

        {/* Comments Section */}
        <div className='space-y-4'>
          <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest pl-2'>
            Bình luận ({comments.length})
          </h3>
          
          <div className='space-y-4'>
            {comments.map((comment) => {
              const isCommentAuthor = user?.userId === comment.authorId || user?.id === comment.authorId;
              const isPostAuthor = user?.userId === post.authorId || user?.id === post.authorId;
              const canDelete = isCommentAuthor || isPostAuthor;

              return (
                <div key={comment.id} className={`flex gap-3 ${isCommentAuthor ? 'flex-row-reverse' : ''}`}>
                  <img
                    alt='Avatar'
                    className='w-8 h-8 rounded-full object-cover shrink-0'
                    src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.fullName || 'User')}&background=random`}
                  />
                  <div className={`group relative max-w-[80%] ${isCommentAuthor ? 'items-end' : 'items-start'} flex flex-col`}>
                    <p className='text-[10px] font-bold text-slate-500 mb-1 px-1'>
                      {comment.author.fullName}
                    </p>
                    
                    {editingCommentId === comment.id ? (
                      <div className='w-full'>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className='w-full p-2 text-sm bg-white border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-200 focus:outline-none min-h-[60px]'
                        />
                        <div className='flex gap-2 mt-2 justify-end'>
                          <button 
                            onClick={() => setEditingCommentId(null)}
                            className='text-[10px] font-bold text-slate-400 hover:text-slate-600'
                          >
                            HỦY
                          </button>
                          <button 
                            onClick={() => handleUpdate(comment.id)}
                            className='text-[10px] font-bold text-sky-600 hover:text-sky-700'
                          >
                            LƯU
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                        isCommentAuthor 
                        ? 'bg-sky-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                      }`}>
                        {comment.content}
                      </div>
                    )}

                    <div className='flex items-center gap-3 mt-1 px-1'>
                      <p className='text-[9px] text-slate-400'>
                        {new Date(comment.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      
                      {(isCommentAuthor || canDelete) && !editingCommentId && (
                        <div className='relative'>
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                            className='text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100'
                          >
                            <MoreVertical size={12} />
                          </button>
                          
                          {activeMenuId === comment.id && (
                            <div className='absolute bottom-full mb-1 right-0 bg-white shadow-xl rounded-lg border border-slate-100 py-1 z-10 w-24'>
                              {isCommentAuthor && (
                                <button 
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditContent(comment.content);
                                    setActiveMenuId(null);
                                  }}
                                  className='w-full px-3 py-1.5 text-left text-[10px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2'
                                >
                                  <Edit2 size={10} /> SỬA
                                </button>
                              )}
                              {canDelete && (
                                <button 
                                  onClick={() => handleDelete(comment.id)}
                                  className='w-full px-3 py-1.5 text-left text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2'
                                >
                                  <Trash2 size={10} /> XÓA
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={commentsEndRef} />
          </div>
        </div>
      </div>

      {/* Footer Input */}
      <div className='p-4 bg-white border-t border-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]'>
        <div className='max-w-4xl mx-auto flex items-center gap-3'>
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
              className='w-full py-3 px-4 pr-12 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sky-500/20 transition-all resize-none max-h-32 text-slate-800'
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!newComment.trim() || isSubmitting}
              className='absolute right-2 bottom-1.5 p-2 text-sky-600 disabled:text-slate-300 transition-colors'
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
