import {
  Clock,
  MoreVertical,
  Settings,
  Share2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Quiz } from '@/api/quizzes';
import { Button } from '@/components/ui/button';

interface QuizCardProps {
  quiz: Quiz;
  onEdit?: (quiz: Quiz) => void;
  onSettings?: (quiz: Quiz) => void;
  onShare?: (quiz: Quiz) => void;
  onTake?: (quiz: Quiz) => void;
  isOwner?: boolean;
}

export function QuizCard({
  quiz,
  onEdit,
  onSettings,
  onShare,
  onTake,
  isOwner,
}: QuizCardProps) {
  return (
    <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden group flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative'>
      {/* Top Banner (Thumbnail or Pastel Gradient Placeholder) */}
      <div className='relative h-40 overflow-hidden bg-slate-100 block shrink-0'>
        <div className='w-full h-full bg-sky-50 flex flex-col items-center justify-center gap-2 p-4 text-sky-500'>
          <span className='material-symbols-outlined text-4xl'>
            extension
          </span>
          <span className='text-xs font-bold uppercase tracking-wider text-center line-clamp-2 px-2'>
            {quiz.title}
          </span>
        </div>

        {/* Badges on Top Left */}
        <div className='absolute top-3 left-3 px-2 py-1 bg-slate-900/70 backdrop-blur-md rounded flex items-center gap-1.5'>
          <span className='text-white text-[10px] font-bold uppercase tracking-wider'>
            {quiz.isPublic ? 'Công khai' : 'Riêng tư'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className='p-4 flex flex-col flex-1'>
        <h3 className='text-base font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2 mb-2'>
          {quiz.title}
        </h3>
        <p className='text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed'>
          {quiz.description || 'Khám phá kiến thức thông qua bài trắc nghiệm này.'}
        </p>

        {/* Footer info & CTA matched to Courses page */}
        <div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-100 gap-3'>
          <div className='min-w-0'>
            <p className='text-xs text-slate-500 truncate'>
              {quiz.duration ? `${quiz.duration} phút` : 'Không giới hạn'}
            </p>
            <p className='text-sm font-black text-slate-800 mt-0.5'>
              {quiz._count?.memberships || 0} lượt tham gia
            </p>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            <button
              onClick={() => onTake?.(quiz)}
              className='px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all active:scale-95 shrink-0'
            >
              Làm bài
            </button>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon' className='h-7 w-7 rounded-lg border-slate-200 shrink-0 text-slate-500 hover:text-slate-700 hover:bg-slate-50 p-0 flex items-center justify-center'>
                    <MoreVertical className='size-3.5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48 rounded-xl p-1.5 border-slate-200 shadow-xl bg-white'>
                  <DropdownMenuItem onClick={() => onEdit?.(quiz)} className='rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer p-2 flex items-center gap-2'>
                    <Settings className='size-3.5 text-slate-400' /> Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSettings?.(quiz)} className='rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer p-2 flex items-center gap-2'>
                    <Clock className='size-3.5 text-slate-400' /> Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare?.(quiz)} className='rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer p-2 flex items-center gap-2'>
                    <Share2 className='size-3.5 text-slate-400' /> Chia sẻ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
