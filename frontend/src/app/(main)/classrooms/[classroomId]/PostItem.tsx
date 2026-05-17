'use client';

import { useState } from 'react';
import { ClassroomPost, getPresignedDownloadUrl } from '@/api/classroom';
import { useAuth } from '@/contexts/AuthContext';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { usePosts } from '@/contexts/PostContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  MessageCircle,
  Video,
  FileText,
  FolderOpen,
  Download,
} from 'lucide-react';
import Link from 'next/link';

interface PostItemProps {
  post: ClassroomPost;
}

export default function PostItem({ post }: PostItemProps) {
  const { user } = useAuth();
  const { classroom } = useClassrooms();
  const { deletePost, updatePost } = usePosts();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || '');
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor =
    user?.userId === post?.authorId || user?.id === post?.authorId;
  const isEdited =
    post?.updatedAt &&
    post?.createdAt &&
    new Date(post.updatedAt).getTime() >
      new Date(post.createdAt).getTime() + 1000;

  const isSystemPost = post?.content?.startsWith('[SYSTEM_');

  // Parse system post content
  let systemType = '';
  let systemParam1 = '';
  let systemParam2 = '';
  if (isSystemPost && post?.content) {
    const parts = post.content.split(':');
    systemType = parts[0] || ''; // [SYSTEM_CALL], [SYSTEM_TASK], [SYSTEM_FILE]
    systemParam1 = parts[1] || ''; // roomId, taskId, fileId
    systemParam2 = parts.slice(2).join(':') || ''; // taskTitle, fileName
  }

  const handleUpdate = async () => {
    if (!classroom?.id || !editContent.trim()) return;
    try {
      await updatePost(classroom.id, post.id, editContent);
      setIsEditing(false);
      setShowMenu(false);
      toast.success('Đã cập nhật bài đăng!');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi cập nhật thông báo');
    }
  };

  const handleDelete = async () => {
    if (!classroom?.id) return;
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    setIsDeleting(true);
    try {
      await deletePost(classroom.id, post.id);
      toast.success('Đã xóa bài đăng!');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi xóa thông báo');
      setIsDeleting(false);
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    if (!classroom?.id) return;
    try {
      const res = await getPresignedDownloadUrl(classroom.id, fileId);
      if (res.success && res.data?.url) {
        window.open(res.data.url, '_blank');
        toast.success('Bắt đầu tải xuống file...');
      } else {
        throw new Error(res.error || 'Failed to download file');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải xuống file tài nguyên.');
    }
  };

  if (isDeleting) return null;

  return (
    <article className='p-5 rounded-md bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300 relative overflow-hidden group'>
      <div className='absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity'></div>
      <div className='flex items-center justify-between mb-4 pl-1'>
        <div className='flex items-center gap-3'>
          <img
            alt='Avatar'
            className='w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm'
            src={
              post?.author?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.author?.fullName || 'User')}&background=random`
            }
          />
          <div>
            <h4 className='text-sm font-bold text-slate-800 flex items-center gap-2'>
              {post?.author?.fullName || 'Người dùng'}
              {isAuthor ? (
                <span className='px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-500 rounded font-semibold'>
                  (Bạn)
                </span>
              ) : null}
            </h4>
            <div className='flex items-center gap-2 mt-0.5'>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
                {post?.createdAt
                  ? new Date(post.createdAt).toLocaleString('vi-VN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : ''}
              </p>
              {isEdited && (
                <span className='text-[10px] text-slate-400 font-semibold italic'>
                  • Đã chỉnh sửa
                </span>
              )}
            </div>
          </div>
        </div>

        {isAuthor && !isSystemPost && (
          <div className='relative'>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className='p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors'
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className='absolute right-0 mt-1.5 w-32 bg-white rounded-md shadow-md border border-slate-200 z-10 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100'>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className='w-full px-3.5 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2'
                >
                  <Edit2 size={13} className='text-slate-400' /> Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  className='w-full px-3.5 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2'
                >
                  <Trash2 size={13} className='text-red-400' /> Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className='mt-2 pl-1'>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className='w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-semibold focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all min-h-[100px] resize-none text-slate-700'
          />
          <div className='flex justify-end gap-2 mt-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setIsEditing(false);
                setEditContent(post?.content || '');
              }}
              className='rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors'
            >
              Hủy
            </Button>
            <Button
              size='sm'
              onClick={handleUpdate}
              className='rounded-md text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm'
            >
              Lưu
            </Button>
          </div>
        </div>
      ) : isSystemPost ? (
        <div className='mt-2 p-4 rounded-md border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex gap-3.5 items-start'>
            {systemType === '[SYSTEM_CALL]' && (
              <div className='w-11 h-11 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-sm'>
                <Video size={22} className='animate-pulse text-rose-500' />
              </div>
            )}
            {systemType === '[SYSTEM_TASK]' && (
              <div className='w-11 h-11 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm'>
                <FileText size={22} className='text-indigo-500' />
              </div>
            )}
            {systemType === '[SYSTEM_FILE]' && (
              <div className='w-11 h-11 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm'>
                <FolderOpen size={22} className='text-emerald-500' />
              </div>
            )}
            <div>
              <p className='text-sm text-slate-700 font-semibold leading-relaxed'>
                <span className='font-extrabold text-slate-800'>
                  {post?.author?.fullName || 'Thành viên'}
                </span>{' '}
                {systemType === '[SYSTEM_CALL]' &&
                  'đã bắt đầu cuộc họp video nhóm cho lớp học.'}
                {systemType === '[SYSTEM_TASK]' && (
                  <>
                    đã giao một bài tập mới:{' '}
                    <span className='text-indigo-600 font-extrabold block mt-0.5'>
                      {systemParam2 || 'Bài tập'}
                    </span>
                  </>
                )}
                {systemType === '[SYSTEM_FILE]' && (
                  <>
                    đã tải lên một tài nguyên tài liệu:{' '}
                    <span className='text-emerald-600 font-extrabold block mt-0.5'>
                      {systemParam2 || 'Tài liệu'}
                    </span>
                  </>
                )}
              </p>
              <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block'>
                Hệ thống thông báo tự động
              </span>
            </div>
          </div>

          <div className='w-full sm:w-auto shrink-0 flex justify-end'>
            {systemType === '[SYSTEM_CALL]' && (
              <Link
                href={`/call/${systemParam1}`}
                target='_blank'
                className='w-full sm:w-auto'
              >
                <Button
                  size='sm'
                  className='w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-md flex items-center justify-center gap-1.5 shadow-sm text-xs px-4 py-2 transition-all'
                >
                  <Video size={14} />
                  Tham gia cuộc họp
                </Button>
              </Link>
            )}
            {systemType === '[SYSTEM_TASK]' && (
              <Link
                href={`/classrooms/${classroom?.id}/tasks`}
                className='w-full sm:w-auto'
              >
                <Button
                  size='sm'
                  variant='outline'
                  className='w-full sm:w-auto text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-extrabold rounded-md flex items-center justify-center gap-1.5 shadow-sm text-xs bg-white px-4 py-2 transition-all'
                >
                  <FileText size={14} />
                  Xem chi tiết bài tập
                </Button>
              </Link>
            )}
            {systemType === '[SYSTEM_FILE]' && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleDownloadFile(systemParam1)}
                className='w-full sm:w-auto text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-extrabold rounded-md flex items-center justify-center gap-1.5 shadow-sm text-xs bg-white px-4 py-2 transition-all'
              >
                <Download size={14} />
                Tải tài liệu
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className='pl-1'>
          <p className='text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words font-medium'>
            {post?.content}
          </p>
          <div className='mt-4 pt-3 border-t border-slate-100 flex items-center gap-4'>
            <Link
              href={`/classrooms/${classroom?.id}/posts/${post?.id}`}
              className='flex items-center gap-1.5 text-slate-400 hover:text-sky-600 transition-colors text-xs font-extrabold'
            >
              <MessageCircle size={15} className='text-slate-400' />
              <span>{post?._count?.comments || 0} bình luận</span>
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
