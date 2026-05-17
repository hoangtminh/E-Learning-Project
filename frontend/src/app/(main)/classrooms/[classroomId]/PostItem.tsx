'use client';

import { useState } from 'react';
import { ClassroomPost } from '@/api/classroom';
import { useAuth } from '@/contexts/AuthContext';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { MoreHorizontal, Edit2, Trash2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface PostItemProps {
  post: ClassroomPost;
}

export default function PostItem({ post }: PostItemProps) {
  const { user } = useAuth();
  const { deletePost, updatePost, classroom } = useClassrooms();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user?.userId === post.authorId || user?.id === post.authorId;
  const isEdited = post.previousVersionId !== null;

  const handleUpdate = async () => {
    if (!classroom) return;
    try {
      await updatePost(classroom.id, post.id, editContent);
      setIsEditing(false);
      setShowMenu(false);
    } catch (e: any) {
      alert(e.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async () => {
    if (!classroom) return;
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    setIsDeleting(true);
    try {
      await deletePost(classroom.id, post.id);
    } catch (e: any) {
      alert(e.message || 'Lỗi xóa thông báo');
      setIsDeleting(false);
    }
  };

  if (isDeleting) return null;

  return (
    <article className='p-6 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200 shadow-sm transition-all hover:shadow-md relative'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <img
            alt='Avatar'
            className='w-10 h-10 rounded-full object-cover border border-slate-200'
            src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.fullName || 'User')}&background=random`}
          />
          <div>
            <h4 className='text-sm font-bold text-slate-800'>
              {post.author.fullName || 'Người dùng'}
              <span className='text-xs font-normal text-slate-500 ml-2'>
                {isAuthor ? '(Bạn)' : ''}
              </span>
            </h4>
            <div className='flex items-center gap-2'>
              <p className='text-[10px] text-slate-400 uppercase font-semibold'>
                {new Date(post.createdAt).toLocaleString('vi-VN')}
              </p>
              {isEdited && (
                <span className='text-[10px] text-slate-400 font-medium italic'>
                  (Đã chỉnh sửa)
                </span>
              )}
            </div>
          </div>
        </div>

        {isAuthor && (
          <div className='relative'>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className='p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors'
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className='absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 z-10 py-1 overflow-hidden'>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className='w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2'
                >
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2'
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className='mt-2'>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className='w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all min-h-[100px] resize-none text-slate-800'
          />
          <div className='flex justify-end gap-2 mt-3'>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className='px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors'
            >
              Hủy
            </button>
            <button
              onClick={handleUpdate}
              className='px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm'
            >
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className='text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words'>
            {post.content}
          </p>
          <div className='mt-4 pt-4 border-t border-slate-100 flex items-center gap-4'>
            <Link
              href={`/classrooms/${classroom?.id}/posts/${post.id}`}
              className='flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors text-xs font-medium'
            >
              <MessageCircle size={16} />
              {post._count?.comments || 0} bình luận
            </Link>
          </div>
        </>
      )}
    </article>
  );
}
