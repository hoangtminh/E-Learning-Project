'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(newContent);
      setNewContent('');
      onClose();
      toast.success('Đã đăng thông báo!');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi tạo thông báo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-md p-6 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-100'>
        <h2 className='text-lg font-black text-slate-800 mb-4 flex items-center gap-2 tracking-tight uppercase'>
          <span className='material-symbols-outlined text-sky-600'>
            campaign
          </span>
          Tạo Thông Báo Mới
        </h2>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className='w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all min-h-[130px] resize-none text-slate-700'
          placeholder='Nhập nội dung thông báo cho lớp học của bạn...'
          autoFocus
        />
        <div className='mt-5 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4.5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-md transition-colors'
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={isSubmitting || !newContent.trim()}
            className='px-5.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-95'
          >
            {isSubmitting ? (
              <>
                <span className='material-symbols-outlined animate-spin text-[14px]'>
                  progress_activity
                </span>
                Đang đăng...
              </>
            ) : (
              'Đăng thông báo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
