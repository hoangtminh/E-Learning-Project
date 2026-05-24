'use client';

import { useState, memo } from 'react';
import { ClassroomPostComment } from '@/api/classroom';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { usePosts } from '@/contexts/PostContext';
import { toast } from 'sonner';
import { appConfirm } from '@/components/ui/app-dialog-provider';

interface CommentItemProps {
  comment: ClassroomPostComment;
  classroomId: string;
  postId: string;
  isCommentAuthor: boolean;
  canDelete: boolean;
}

export const CommentItem = memo(function CommentItem({
  comment,
  classroomId,
  postId,
  isCommentAuthor,
  canDelete,
}: CommentItemProps) {
  const { updateComment, deleteComment } = usePosts();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      await updateComment(classroomId, postId, comment.id, editContent);
      setIsEditing(false);
      setShowMenu(false);
      toast.success('Đã cập nhật bình luận!');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi cập nhật bình luận');
    }
  };

  const handleDelete = async () => {
    if (!(await appConfirm({ title: 'Xóa bình luận?', description: 'Bạn có chắc chắn muốn xóa bình luận này?', confirmLabel: 'Xóa', variant: 'destructive' }))) return;
    try {
      await deleteComment(classroomId, postId, comment.id);
      toast.success('Đã xóa bình luận!');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi xóa bình luận');
    }
  };

  return (
    <div
      className={`flex gap-2.5 ${isCommentAuthor ? 'flex-row-reverse' : ''} group`}
    >
      <img
        alt='Avatar'
        className='w-7 h-7 rounded-full object-cover shrink-0 border border-slate-100'
        src={
          comment.author.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.fullName || 'User')}&background=random`
        }
      />
      <div
        className={`relative max-w-[80%] ${isCommentAuthor ? 'items-end' : 'items-start'} flex flex-col`}
      >
        <span className='text-[10px] font-semibold text-slate-500 mb-0.5 px-1'>
          {comment.author.fullName}
        </span>

        {isEditing ? (
          <div className='w-64 bg-white border border-sky-300 rounded-xl p-2 shadow-sm'>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className='w-full p-2 text-xs bg-slate-50 border-none rounded-lg focus:ring-0 focus:outline-none min-h-[50px] resize-none text-slate-800'
            />
            <div className='flex gap-2 mt-1.5 justify-end'>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className='px-2.5 py-1 text-[9px] font-bold text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50'
              >
                HỦY
              </button>
              <button
                onClick={handleUpdate}
                className='px-2.5 py-1 text-[9px] font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm'
              >
                LƯU
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`p-2.5 rounded-2xl text-xs shadow-sm leading-relaxed ${
              isCommentAuthor
                ? 'bg-sky-600 text-white rounded-tr-none'
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}
          >
            {comment.content}
          </div>
        )}

        <div className='flex items-center gap-2 mt-0.5 px-1 relative'>
          <span className='text-[9px] text-slate-400'>
            {new Date(comment.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {(isCommentAuthor || canDelete) && !isEditing && (
            <div className='relative flex items-center'>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className='text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-slate-100'
              >
                <MoreVertical size={11} />
              </button>

              {showMenu && (
                <div className='absolute bottom-full mb-1 right-0 bg-white shadow-lg rounded-lg border border-slate-100 py-0.5 z-10 w-20 overflow-hidden'>
                  {isCommentAuthor && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className='w-full px-2.5 py-1 text-left text-[9px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5'
                    >
                      <Edit2 size={9} /> SỬA
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className='w-full px-2.5 py-1 text-left text-[9px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-1.5'
                    >
                      <Trash2 size={9} /> XÓA
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
});
