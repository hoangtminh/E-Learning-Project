import {
  Clock,
  MoreVertical,
  Settings,
  Share2,
  Users
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
    <div className='bg-white border border-outline-variant/30 rounded-2xl overflow-hidden group flex flex-col hover:shadow-xs hover:border-primary/45 transition-all duration-300 relative h-full'>
      {/* Top Banner (Thumbnail or Pastel Gradient Placeholder) */}
      <div className='relative h-24 sm:h-36 overflow-hidden bg-slate-100 block shrink-0'>
        <div className='w-full h-full bg-primary/5 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-4 text-primary'>
          <span className='material-symbols-outlined text-[2rem] sm:text-[2.5rem] text-primary/45'>
            extension
          </span>
          <span className='text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-center line-clamp-2 px-2 sm:px-4'>
            {quiz.title}
          </span>
        </div>

        {/* Badges on Top Left */}
        <div className='absolute top-2 left-2 px-1.5 py-0.5 sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 bg-slate-950/70 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10'>
          <span className='text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider'>
            {quiz.isPublic ? 'Công khai' : 'Riêng tư'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className='p-2.5 sm:p-4.5 flex flex-col flex-1'>
        <h3 className='font-bold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1 sm:mb-1.5 h-8 sm:h-10 text-xs sm:text-base'>
          {quiz.title}
        </h3>
        <p className='text-on-surface-variant/80 text-xs line-clamp-2 mb-4 h-8 leading-relaxed hidden sm:block'>
          {quiz.description || 'Khám phá kiến thức thông qua bài trắc nghiệm này.'}
        </p>

        {/* Footer info & CTA matched to Courses page */}
        <div className='mt-auto flex items-center justify-between pt-2.5 sm:pt-4.5 border-t border-outline-variant/20 gap-2 sm:gap-3'>
          <div className='min-w-0'>
            <p className='text-[8px] sm:text-[10px] text-on-surface-variant/70 truncate flex items-center gap-1 sm:gap-1.5'>
              <Clock className='size-2.5 sm:size-3 text-on-surface-variant/50' />
              <span className='truncate'>{quiz.duration ? `${quiz.duration} phút` : 'Không giới hạn'}</span>
            </p>
            <p className='text-xs sm:text-sm font-black text-on-surface mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5'>
              <Users className='size-3 sm:size-4 text-on-surface-variant/50 hidden sm:block' />
              {quiz._count?.memberships || 0} lượt
            </p>
          </div>

          <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
            <button
              onClick={() => onTake?.(quiz)}
              className='px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl bg-primary text-white text-[10px] sm:text-xs font-bold hover:bg-primary-dim shadow-xs transition-all active:scale-[0.97] shrink-0 border-0 cursor-pointer'
            >
              Làm bài
            </button>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon' className='h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl border border-outline-variant/30 shrink-0 text-on-surface-variant/70 hover:text-on-surface hover:bg-slate-50 hover:border-outline-variant/50 transition-all flex items-center justify-center p-0 cursor-pointer'>
                    <MoreVertical className='size-3 sm:size-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48 rounded-xl p-1.5 border-outline-variant/30 shadow-md bg-white'>
                  <DropdownMenuItem onClick={() => onEdit?.(quiz)} className='rounded-lg text-xs font-bold text-on-surface hover:bg-slate-50 cursor-pointer p-2.5 flex items-center gap-2'>
                    <Settings className='size-3.5 text-on-surface-variant/60' /> Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSettings?.(quiz)} className='rounded-lg text-xs font-bold text-on-surface hover:bg-slate-50 cursor-pointer p-2.5 flex items-center gap-2'>
                    <Clock className='size-3.5 text-on-surface-variant/60' /> Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare?.(quiz)} className='rounded-lg text-xs font-bold text-on-surface hover:bg-slate-50 cursor-pointer p-2.5 flex items-center gap-2'>
                    <Share2 className='size-3.5 text-on-surface-variant/60' /> Chia sẻ
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
