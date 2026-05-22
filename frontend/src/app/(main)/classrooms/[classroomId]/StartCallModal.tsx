'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StartCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export function StartCallModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: StartCallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='rounded-md max-w-sm border border-slate-200/80 p-5 bg-white/95 backdrop-blur-md shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-base font-extrabold text-slate-800'>
            Bắt đầu cuộc gọi nhóm?
          </DialogTitle>
          <DialogDescription className='text-xs font-semibold text-slate-500 mt-1 leading-relaxed'>
            Bạn có chắc chắn muốn bắt đầu một cuộc họp video nhóm riêng tư
            cho lớp học này? Hệ thống sẽ tạo bài viết thông báo công khai
            trong bảng tin để các thành viên khác có thể cùng nhấn tham gia.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='mt-4 flex gap-2 justify-end'>
          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            className='rounded-md text-xs font-bold border-slate-200'
          >
            Hủy
          </Button>
          <Button
            variant='default'
            size='sm'
            onClick={onConfirm}
            disabled={isSubmitting}
            className='rounded-md text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all'
          >
            {isSubmitting ? 'Đang tạo...' : 'Bắt đầu cuộc họp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
