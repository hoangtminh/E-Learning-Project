import { Clock } from 'lucide-react';

interface AssignmentDetailCardProps {
  title: string | null;
  deadline: string | null;
  classroomTitle?: string;
}

function formatDueDate(deadlineStr: string | null) {
  if (!deadlineStr) return 'Không có hạn nộp';
  const date = new Date(deadlineStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AssignmentDetailCard({ title, deadline, classroomTitle }: AssignmentDetailCardProps) {
  return (
    <div className='glass-panel rounded-3xl p-8 shadow-sm border border-white/50 space-y-6'>
      <div className='flex justify-between items-start gap-4 flex-wrap'>
        <div className='space-y-2'>
          <h1 className='text-xl md:text-2xl font-black text-slate-800 leading-tight'>
            {title || 'Bài tập không có tiêu đề'}
          </h1>
          <p className='text-xs font-semibold text-slate-500 flex items-center gap-1.5'>
            <Clock size={13} className='text-sky-500' />
            Hạn nộp: {formatDueDate(deadline)}
          </p>
          {classroomTitle && (
            <p className='text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100/50 w-fit'>
              Lớp học: {classroomTitle}
            </p>
          )}
        </div>
        <div className='text-right border-l-0 sm:border-l sm:border-slate-100 sm:pl-5 pt-2 sm:pt-0 shrink-0'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5'>Thang điểm</p>
          <p className='text-lg font-black text-slate-700'>100 điểm</p>
        </div>
      </div>
    </div>
  );
}
