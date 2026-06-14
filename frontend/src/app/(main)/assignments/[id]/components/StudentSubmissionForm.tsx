import { useState, useRef } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { Assignment } from '@/api/assignments';
import { FileText, Paperclip, Plus, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentSubmissionFormProps {
  assignment: Assignment;
  classroomId: string;
  onRefresh: () => void;
}

export function StudentSubmissionForm({
  assignment,
  classroomId,
  onRefresh,
}: StudentSubmissionFormProps) {
  const { submitTask, getSubmissionPresignedUpload, getMySubmissionDownloadUrl } = useTasks();
  const existing = assignment.submissions?.[0];

  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [content, setContent] = useState(existing?.content ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dlLoading, setDlLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasS3File = existing?.fileUrl && !existing.fileUrl.startsWith('http');
  const hasLinkFile = existing?.fileUrl?.startsWith('http');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      let fileUrl: string | undefined;
      if (tab === 'file' && file) {
        setProgress(10);
        const { url, s3Key } = await getSubmissionPresignedUpload(
          classroomId,
          assignment.id,
          file.name,
          file.type || 'application/octet-stream'
        );
        setProgress(30);
        const r = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
        });
        if (!r.ok) throw new Error('Upload thất bại');
        fileUrl = s3Key;
        setProgress(90);
      }
      await submitTask(classroomId, assignment.id, {
        content: tab === 'text' ? content || undefined : undefined,
        fileUrl: tab === 'file' ? fileUrl : (existing?.fileUrl ?? undefined),
        fileName: tab === 'file' && file ? file.name : undefined,
      });
      setProgress(100);
      setSuccess(true);
      setFile(null);
      toast.success('Nộp bài thành công!');
      setTimeout(() => {
        onRefresh();
        setSuccess(false);
      }, 800);
    } catch (e: any) {
      setError(e.message || 'Nộp bài thất bại');
      toast.error(e.message || 'Nộp bài thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOwn = async () => {
    setDlLoading(true);
    try {
      const url = await getMySubmissionDownloadUrl(classroomId, assignment.id);
      window.open(url, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi tải file nộp');
    } finally {
      setDlLoading(false);
    }
  };

  return (
    <div className='glass-panel rounded-2xl p-6 shadow-xs border border-white/50 space-y-5'>
      <div className='flex items-center justify-between border-b border-outline-variant/20 pb-3'>
        <h2 className='text-sm font-bold text-on-surface tracking-wide uppercase'>Bài nộp của tôi</h2>
        {existing && (
          <span className='px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 flex items-center gap-1'>
            <CheckCircle2 size={12} /> Đã nộp
          </span>
        )}
      </div>

      <div className='flex gap-1.5 bg-surface-container-low/80 p-1 rounded-xl w-fit'>
        <button
          onClick={() => setTab('text')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'text' ? 'bg-white text-on-surface shadow-xs' : 'text-on-surface-variant/70 hover:text-on-surface'}`}
        >
          <FileText size={13} /> Text / Link
        </button>
        <button
          onClick={() => setTab('file')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'file' ? 'bg-white text-on-surface shadow-xs' : 'text-on-surface-variant/70 hover:text-on-surface'}`}
        >
          <Paperclip size={13} /> Tải file
        </button>
      </div>

      {tab === 'text' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder='Dán link bài làm (Google Drive, Github) hoặc nhập câu trả lời trực tiếp tại đây...'
          className='w-full px-4 py-3 border border-outline-variant/30 rounded-xl text-sm text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white/60 resize-none transition-all'
        />
      ) : (
        <div className='space-y-3'>
          <div
            onClick={() => fileRef.current?.click()}
            className='border-2 border-dashed border-outline-variant/30 hover:border-sky-400 hover:bg-primary/5/20 rounded-xl p-6 text-center cursor-pointer transition-all duration-200'
          >
            <div className='w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-2 text-primary'>
              <Plus size={20} />
            </div>
            {file ? (
              <p className='text-sm font-semibold text-primary truncate max-w-xs mx-auto'>{file.name}</p>
            ) : (
              <p className='text-xs text-on-surface-variant/70'>Nhấp để tải lên tệp bài làm của bạn</p>
            )}
          </div>
          <input
            ref={fileRef}
            type='file'
            className='hidden'
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {(hasS3File || hasLinkFile) && !file && (
            <button
              onClick={handleDownloadOwn}
              disabled={dlLoading}
              className='flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-sky-700 transition-colors disabled:opacity-50'
            >
              {dlLoading ? <Loader2 size={13} className='animate-spin' /> : <Download size={13} />}
              Tải tệp bài nộp cũ của bạn
            </button>
          )}

          {loading && progress > 0 && (
            <div className='space-y-1'>
              <div className='h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden'>
                <div className='h-full bg-primary/50 transition-all duration-300' style={{ width: `${progress}%` }} />
              </div>
              <p className='text-[10px] font-bold text-on-surface-variant/50 text-right'>{progress}%</p>
            </div>
          )}
        </div>
      )}

      {error && <p className='text-xs text-rose-500 font-medium'>{error}</p>}
      {success && <p className='text-xs text-emerald-600 font-semibold flex items-center gap-1'><CheckCircle2 size={13} /> Nộp bài thành công!</p>}

      <div className='flex justify-end pt-2'>
        <button
          onClick={handleSubmit}
          disabled={loading || (tab === 'file' && !file && !existing)}
          className='w-full sm:w-auto px-6 py-2.5 bg-primary/50 hover:bg-primary-dim text-white font-bold rounded-xl text-sm shadow-md shadow-sky-100 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2'
        >
          {loading && <Loader2 size={14} className='animate-spin' />}
          {existing ? 'Cập nhật bài nộp' : 'Nộp bài'}
        </button>
      </div>
    </div>
  );
}
export default StudentSubmissionForm;
