import { useState } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { FileText, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface AssignmentAttachmentCardProps {
  classroomId: string;
  taskId: string;
  attachmentKey: string | null;
  attachmentName: string | null;
}

export function AssignmentAttachmentCard({
  classroomId,
  taskId,
  attachmentKey,
  attachmentName,
}: AssignmentAttachmentCardProps) {
  const { getTaskAttachmentDownloadUrl } = useTasks();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!attachmentKey) return;
    setDownloading(true);
    try {
      const url = await getTaskAttachmentDownloadUrl(classroomId, taskId);
      window.open(url, '_blank');
      toast.success('Bắt đầu tải tệp đính kèm...');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi tải tệp đính kèm');
    } finally {
      setDownloading(false);
    }
  };

  if (!attachmentKey) return null;

  return (
    <div className='glass-panel rounded-3xl p-8 shadow-sm border border-white/50 space-y-4'>
      <h3 className='text-xs font-bold text-slate-800 uppercase tracking-wider'>Tài liệu đính kèm</h3>
      <div
        onClick={handleDownload}
        className='flex items-center justify-between p-4 rounded-2xl border border-slate-150 bg-white/60 hover:bg-white/95 hover:border-sky-300 hover:shadow-sm transition-all group cursor-pointer'
      >
        <div className='flex items-center gap-3.5 min-w-0'>
          <div className='w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100'>
            <FileText size={20} />
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-bold text-slate-800 truncate max-w-sm'>{attachmentName || 'Tệp đính kèm'}</p>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>Tải tệp đính kèm</p>
          </div>
        </div>
        <button
          disabled={downloading}
          className='w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors group-hover:scale-105 duration-200'
        >
          {downloading ? <Loader2 size={16} className='animate-spin' /> : <Download size={16} />}
        </button>
      </div>
    </div>
  );
}
