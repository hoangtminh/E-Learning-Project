'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuiz } from '@/contexts/QuizContext';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { usePosts } from '@/contexts/PostContext';
import { ClipboardList, Loader2, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SendQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendQuizModal({ isOpen, onClose }: SendQuizModalProps) {
  const { createdQuizzes, fetchCreatedQuizzes, handleShareQuiz, loading } = useQuiz();
  const { classroom } = useClassrooms();
  const { createPost } = usePosts();
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      void fetchCreatedQuizzes();
      setSelectedQuizId(null);
      setSearchTerm('');
    }
  }, [isOpen, fetchCreatedQuizzes]);

  // Filter quizzes by search term
  const filteredQuizzes = createdQuizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = async () => {
    if (!classroom?.id || !selectedQuizId) return;
    const quiz = createdQuizzes.find((q) => q.id === selectedQuizId);
    if (!quiz) return;

    setIsSending(true);
    try {
      // 1. Share the quiz with the classroom members in backend
      await handleShareQuiz(selectedQuizId, { classroomId: classroom.id });

      // 2. Post a system post announcement in the classroom feed
      await createPost(classroom.id, `[SYSTEM_QUIZ]:${quiz.id}:${quiz.title}`);

      toast.success(`Đã gửi quiz "${quiz.title}" cho lớp học!`);
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi gửi quiz vào lớp học');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSending && onClose()}>
      <DialogContent className='rounded-md max-w-md border border-slate-200/80 p-5 bg-white/95 backdrop-blur-md shadow-lg flex flex-col max-h-[85vh]'>
        <DialogHeader>
          <DialogTitle className='text-base font-extrabold text-slate-800 flex items-center gap-2'>
            <ClipboardList className='text-amber-500 w-5 h-5' />
            Gửi Quiz cho lớp học
          </DialogTitle>
          <DialogDescription className='text-xs font-semibold text-slate-500 mt-1 leading-relaxed'>
            Chọn một bài kiểm tra từ thư viện của bạn để giao cho tất cả thành viên trong lớp học này.
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-2 border border-slate-200 rounded-md px-2.5 py-1.5 mt-2 bg-slate-50 focus-within:border-slate-400 transition-colors'>
          <Search size={14} className='text-slate-400' />
          <Input
            placeholder='Tìm kiếm bài kiểm tra...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='border-0 p-0 h-auto focus-visible:ring-0 text-xs bg-transparent'
          />
        </div>

        <div className='flex-1 min-h-[200px] overflow-hidden mt-3'>
          {loading ? (
            <div className='flex flex-col items-center justify-center h-full py-12 gap-2 text-slate-400'>
              <Loader2 className='w-6 h-6 animate-spin text-primary' />
              <span className='text-xs font-semibold'>Đang tải thư viện quiz...</span>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-200 rounded-md bg-slate-50/50 p-4 h-full gap-2.5'>
              <AlertCircle size={28} className='text-slate-350' />
              <div>
                <p className='text-xs font-bold text-slate-700'>
                  {searchTerm ? 'Không tìm thấy kết quả' : 'Thư viện quiz trống'}
                </p>
                <p className='text-[10px] text-slate-400 mt-1 max-w-[250px] mx-auto'>
                  {searchTerm
                    ? 'Thử tìm kiếm với từ khóa khác.'
                    : 'Bạn chưa tạo bài kiểm tra nào. Vui lòng truy cập trang Quizzes để tạo.'}
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className='h-[260px] pr-1.5'>
              <div className='space-y-2'>
                {filteredQuizzes.map((quiz) => {
                  const isSelected = selectedQuizId === quiz.id;
                  return (
                    <div
                      key={quiz.id}
                      onClick={() => setSelectedQuizId(quiz.id)}
                      className={cn(
                        'p-3 rounded-md border text-left cursor-pointer transition-all flex items-center justify-between gap-3',
                        isSelected
                          ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-xs font-extrabold text-slate-700 truncate'>
                          {quiz.title}
                        </h4>
                        <p className='text-[10px] text-slate-400 mt-0.5 truncate font-medium'>
                          {quiz.description || 'Không có mô tả.'}
                        </p>
                        <div className='flex gap-3 text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide'>
                          <span>{quiz._count?.questions || 0} câu hỏi</span>
                          {quiz.duration ? (
                            <span>{quiz.duration} phút</span>
                          ) : (
                            <span>Không giới hạn thời gian</span>
                          )}
                        </div>
                      </div>
                      <div className={cn(
                        'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all',
                        isSelected
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-slate-300'
                      )}>
                        {isSelected && <div className='w-1.5 h-1.5 rounded-full bg-white' />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className='mt-4 flex gap-2 justify-end shrink-0 pt-2 border-t border-slate-100'>
          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={isSending}
            className='rounded-md text-xs font-bold border-slate-200'
          >
            Hủy
          </Button>
          <Button
            variant='default'
            size='sm'
            onClick={handleSend}
            disabled={isSending || !selectedQuizId}
            className='rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 transition-all'
          >
            {isSending ? (
              <>
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
                Đang gửi...
              </>
            ) : (
              'Gửi bài thi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
