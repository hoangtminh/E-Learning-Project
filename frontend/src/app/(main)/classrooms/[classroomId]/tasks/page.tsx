'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTasks } from '@/contexts/TaskContext';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { ClassroomTask } from '@/api/classroom';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useDeadline(deadline: string | null) {
  if (!deadline) return { label: null, color: '' };
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / 86400000,
  );
  if (diff < 0)
    return {
      label: `Hết hạn ${new Date(deadline).toLocaleDateString('vi-VN')}`,
      color: 'text-slate-400',
    };
  if (diff === 0)
    return { label: 'Hết hạn hôm nay', color: 'text-red-500 font-semibold' };
  if (diff <= 3)
    return {
      label: `Còn ${diff} ngày`,
      color: 'text-orange-500 font-semibold',
    };
  return {
    label: new Date(deadline).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    color: 'text-slate-400',
  };
}

// ─── Submission Form (inline inside panel) ───────────────────────────────────

function SubmitForm({
  task,
  classroomId,
  onDone,
}: {
  task: ClassroomTask;
  classroomId: string;
  onDone: () => void;
}) {
  const {
    submitTask,
    getSubmissionPresignedUpload,
    getMySubmissionDownloadUrl,
  } = useTasks();
  const existing = task.submissions[0];

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
          task.id,
          file.name,
          file.type || 'application/octet-stream',
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
      await submitTask(classroomId, task.id, {
        content: tab === 'text' ? content || undefined : undefined,
        fileUrl: tab === 'file' ? fileUrl : (existing?.fileUrl ?? undefined),
        fileName: tab === 'file' && file ? file.name : undefined,
      });
      setProgress(100);
      setSuccess(true);
      setFile(null);
      setTimeout(onDone, 800);
    } catch (e: any) {
      setError(e.message || 'Nộp bài thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOwn = async () => {
    setDlLoading(true);
    try {
      window.open(
        await getMySubmissionDownloadUrl(classroomId, task.id),
        '_blank',
      );
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi tải file nộp');
    } finally {
      setDlLoading(false);
    }
  };

  return (
    <div className='mt-4 border-t border-slate-100 pt-4'>
      <p className='text-xs font-bold text-slate-500 uppercase tracking-wide mb-3'>
        {existing ? 'Cập nhật bài nộp' : 'Nộp bài'}
      </p>

      {/* Tab */}
      <div className='flex gap-1 bg-slate-100 rounded-lg p-1 mb-3 w-fit'>
        {(['text', 'file'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === t ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className='material-symbols-outlined text-[14px]'>
              {t === 'text' ? 'edit_note' : 'attach_file'}
            </span>
            {t === 'text' ? 'Text / Link' : 'Upload file'}
          </button>
        ))}
      </div>

      {tab === 'text' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder='Dán link Google Drive, GitHub, hoặc nhập nội dung...'
          className='w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none bg-slate-50'
        />
      ) : (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            className='border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/40 transition-colors'
          >
            <span className='material-symbols-outlined text-3xl text-slate-300 block mb-1'>
              cloud_upload
            </span>
            {file ? (
              <p className='text-sm font-semibold text-sky-600'>{file.name}</p>
            ) : (
              <p className='text-sm text-slate-400'>Nhấn để chọn file</p>
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
              className='mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-sky-600 transition-colors'
            >
              <span className='material-symbols-outlined text-sm'>
                {dlLoading ? 'progress_activity' : 'download'}
              </span>
              Tải file đã nộp
            </button>
          )}
          {loading && progress > 0 && (
            <div className='mt-2'>
              <div className='h-1 w-full bg-slate-200 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-sky-500 transition-all duration-300'
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className='text-xs text-slate-400 mt-1'>{progress}%</p>
            </div>
          )}
        </div>
      )}

      {error && <p className='text-xs text-red-500 mt-2'>{error}</p>}
      {success && (
        <p className='text-xs text-green-600 mt-2 flex items-center gap-1'>
          <span className='material-symbols-outlined text-sm'>
            check_circle
          </span>
          Nộp bài thành công!
        </p>
      )}

      <div className='mt-3 flex justify-end'>
        <button
          onClick={handleSubmit}
          disabled={loading || (tab === 'file' && !file && !existing)}
          className='flex items-center gap-1.5 px-5 py-2 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-40 shadow-sm shadow-sky-200'
        >
          {loading && (
            <span className='material-symbols-outlined text-sm animate-spin'>
              progress_activity
            </span>
          )}
          {existing ? 'Cập nhật' : 'Nộp bài'}
        </button>
      </div>
    </div>
  );
}

// ─── Attachment Download ──────────────────────────────────────────────────────

function AttachBtn({
  label,
  onPress,
}: {
  label: string;
  onPress: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await onPress();
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className='inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50'
    >
      <span className='material-symbols-outlined text-sm'>
        {loading ? 'progress_activity' : 'download'}
      </span>
      {label}
    </button>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function TaskDetailPanel({
  task,
  classroomId,
  onClose,
  onRefresh,
}: {
  task: ClassroomTask;
  classroomId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const { getTaskAttachmentDownloadUrl } = useTasks();
  const existing = task.submissions[0];
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDone = () => {
    setRefreshKey((k) => k + 1);
    onRefresh();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-start gap-3 p-5 border-b border-slate-100'>
          <div className='flex-1 min-w-0'>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
              Bài tập
            </p>
            <h2 className='text-base font-bold text-slate-900 leading-snug'>
              {task.title}
            </h2>
            {task.deadline && <DeadlineBadge deadline={task.deadline} />}
          </div>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0'
          >
            <span className='material-symbols-outlined'>close</span>
          </button>
        </div>

        <div className='overflow-y-auto flex-1 px-5 py-4 space-y-4'>
          {/* Description */}
          {task.description && (
            <div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5'>
                Yêu cầu
              </p>
              <p className='text-sm text-slate-700 leading-relaxed whitespace-pre-wrap'>
                {task.description}
              </p>
            </div>
          )}

          {/* Attachment */}
          {task.attachmentKey && (
            <div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5'>
                File đính kèm
              </p>
              <AttachBtn
                label={task.attachmentName ?? 'Tải đề bài'}
                onPress={async () => {
                  const url = await getTaskAttachmentDownloadUrl(
                    classroomId,
                    task.id,
                  );
                  window.open(url, '_blank');
                }}
              />
            </div>
          )}

          {/* Current submission preview */}
          {existing && (
            <div className='bg-slate-50 border border-slate-200 rounded-xl p-3'>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1'>
                <span className='material-symbols-outlined text-sm text-green-500'>
                  check_circle
                </span>
                Bài đã nộp ·{' '}
                {new Date(existing.submittedAt).toLocaleString('vi-VN')}
              </p>
              {existing.content && (
                <p className='text-sm text-slate-600 whitespace-pre-wrap leading-relaxed'>
                  {existing.content}
                </p>
              )}
              {existing.grade !== null && existing.grade !== undefined && (
                <div className='mt-2 flex items-center gap-2'>
                  <span className='text-xs text-slate-500'>Điểm:</span>
                  <span className='text-lg font-black text-green-700'>
                    {Number(existing.grade).toFixed(0)}
                  </span>
                  <span className='text-xs text-slate-400'>/100</span>
                </div>
              )}
            </div>
          )}

          {/* Submit form */}
          <SubmitForm
            key={refreshKey}
            task={task}
            classroomId={classroomId}
            onDone={handleDone}
          />
        </div>
      </div>
    </div>
  );
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const { label, color } = useDeadline(deadline);
  if (!label) return null;
  return (
    <span className={`flex items-center gap-0.5 text-xs mt-1 ${color}`}>
      <span className='material-symbols-outlined text-[13px]'>schedule</span>
      {label}
    </span>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  classroomId,
}: {
  task: ClassroomTask;
  classroomId: string;
}) {
  const existing = task.submissions[0];
  const submitted = !!existing;
  const graded = existing?.grade !== null && existing?.grade !== undefined;
  const { label: dlLabel, color: dlColor } = useDeadline(task.deadline);
  const isPast = task.deadline && new Date(task.deadline) < new Date();

  return (
    <Link
      href={`/assignments/${task.id}`}
      className='w-full flex items-center gap-3 px-3 sm:px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group'
    >
      {/* Status dot */}
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${graded ? 'bg-green-500' : submitted ? 'bg-sky-400' : isPast ? 'bg-red-400' : 'bg-slate-300'}`}
      />

      {/* Title */}
      <p className='flex-1 text-sm font-medium text-slate-800 truncate group-hover:text-sky-700 transition-colors'>
        {task.title}
      </p>

      {/* Status badge */}
      {graded ? (
        <span className='shrink-0 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full'>
          {Number(existing.grade).toFixed(0)}/100
        </span>
      ) : submitted ? (
        <span className='shrink-0 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full'>
          Đã nộp
        </span>
      ) : (
        <span className='shrink-0 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full'>
          Chưa nộp
        </span>
      )}

      {/* Deadline */}
      {dlLabel && (
        <span
          className={`shrink-0 text-xs ${dlColor} hidden sm:block min-w-[80px] text-right`}
        >
          {dlLabel}
        </span>
      )}

      <span className='material-symbols-outlined text-slate-300 group-hover:text-slate-400 text-[18px] shrink-0 transition-colors'>
        chevron_right
      </span>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClassroomTasksPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { tasks, loadingTasks, fetchTasks } = useTasks();
  const { members } = useClassrooms();
  const { user } = useAuth();

  useEffect(() => {
    if (classroomId) fetchTasks(classroomId);
  }, [classroomId, fetchTasks]);

  const currentUserId = user?.userId || user?.id;
  const currentMember = members.find((m) => m.userId === currentUserId);
  const currentUserRole = currentMember?.role;
  const isOwnerOrAdmin =
    currentUserRole === 'owner' || currentUserRole === 'admin';

  const submitted = tasks.filter((t) => t.submissions.length > 0).length;
  const total = tasks.length;

  if (loadingTasks) {
    return (
      <div className='flex items-center justify-center py-20 text-slate-400 gap-2'>
        <span className='material-symbols-outlined animate-spin'>
          progress_activity
        </span>
        Đang tải...
      </div>
    );
  }

  return (
    <div className='p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full'>
      {/* Page Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 sm:gap-4'>
        <div>
          <h2 className='text-lg sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
            <span className='material-symbols-outlined text-purple-600' style={{ fontVariationSettings: "'FILL' 1" }}>
              assignment
            </span>
            Bài tập về nhà
          </h2>
          <p className='text-slate-500 text-xs sm:text-sm mt-1'>
            Theo dõi tiến độ hoàn thành và điểm số các bài tập của bạn.
          </p>
        </div>
        {isOwnerOrAdmin && (
          <Link
            href={`/classrooms/${classroomId}/admin/tasks`}
            className='flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors border border-indigo-200 shadow-sm shrink-0'
          >
            <span className='material-symbols-outlined text-[16px]'>
              admin_panel_settings
            </span>
            Quản lý bài tập (Admin)
          </Link>
        )}
      </div>

      <div className='max-w-3xl'>
        {/* Summary info and progress bar */}
        <div className='flex items-center justify-between mb-3 px-1'>
          <h3 className='text-sm font-bold text-slate-700'>
            Danh sách bài tập ({total})
          </h3>
          <div className='flex items-center gap-2 text-xs text-slate-500 font-semibold'>
            <span className='w-2 h-2 rounded-full bg-sky-400 inline-block animate-pulse' />
            <span>
              {submitted}/{total} đã nộp
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='h-1.5 w-full bg-slate-100 rounded-full mb-6 overflow-hidden border border-slate-200/20'>
          <div
            className='h-full bg-sky-500 rounded-full transition-all duration-500'
            style={{ width: total ? `${(submitted / total) * 100}%` : '0%' }}
          />
        </div>

        {/* Task list or Empty state */}
        {total === 0 ? (
          <div className='text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 px-4'>
            <span className='material-symbols-outlined text-5xl text-slate-300 block mb-2'>
              assignment
            </span>
            <p className='text-slate-500 font-bold text-sm'>
              Không có bài tập nào.
            </p>
            <p className='text-xs text-slate-400 font-medium'>
              Hiện chưa có bài tập nào được giao trong lớp học này.
            </p>
          </div>
        ) : (
          <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100'>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} classroomId={classroomId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
