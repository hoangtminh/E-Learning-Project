'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasks, SubmissionWithUser } from '@/contexts/TaskContext';
import type { ClassroomTask } from '@/api/classroom';
import { toast } from 'sonner';
import { appConfirm } from '@/components/ui/app-dialog-provider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDeadline(task: ClassroomTask): string {
  if (!task.deadline) return 'Không có hạn nộp';
  return new Date(task.deadline).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Avatar({
  name,
  avatarUrl,
}: {
  name: string | null;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || ''}
        className='w-8 h-8 rounded-full object-cover'
      />
    );
  }
  return (
    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0'>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Create / Edit Task Modal ─────────────────────────────────────────────────

function TaskFormModal({
  classroomId,
  editingTask,
  onClose,
}: {
  classroomId: string;
  editingTask?: ClassroomTask | null;
  onClose: () => void;
}) {
  const { createTask, updateTask, getTaskAttachmentPresignedUpload } =
    useTasks();
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(
    editingTask?.description ?? '',
  );
  const [deadline, setDeadline] = useState(
    editingTask?.deadline
      ? new Date(editingTask.deadline).toISOString().slice(0, 16)
      : '',
  );
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [uploadingAttach, setUploadingAttach] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const attachInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editingTask;
  const hasExistingAttachment = isEdit && !!editingTask?.attachmentKey;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      let attachmentKey: string | undefined;
      let attachmentName: string | undefined;
      // Upload attachment file if selected
      if (attachFile) {
        setUploadingAttach(true);
        // We need a taskId to generate the presigned URL. For new tasks, create first then upload.
        if (!isEdit) {
          // Create task first, then upload attachment and update
          const tempTask = await new Promise<ClassroomTask>(
            (resolve, reject) => {
              import('@/api/classroom').then(({ createTask: apiCreate }) => {
                apiCreate(classroomId, {
                  title,
                  description: description || undefined,
                  deadline: deadline || undefined,
                })
                  .then((r) =>
                    r.success && r.data
                      ? resolve(r.data)
                      : reject(new Error(r.error || 'Tạo bài tập thất bại')),
                  )
                  .catch(reject);
              });
            },
          );
          const { url, s3Key } = await getTaskAttachmentPresignedUpload(
            classroomId,
            tempTask.id,
            attachFile.name,
            attachFile.type || 'application/octet-stream',
          );
          await fetch(url, {
            method: 'PUT',
            body: attachFile,
            headers: {
              'Content-Type': attachFile.type || 'application/octet-stream',
            },
          });
          await updateTask(classroomId, tempTask.id, {
            attachmentKey: s3Key,
            attachmentName: attachFile.name,
          });
          setUploadingAttach(false);
          onClose();
          return;
        }
        const { url, s3Key } = await getTaskAttachmentPresignedUpload(
          classroomId,
          editingTask!.id,
          attachFile.name,
          attachFile.type || 'application/octet-stream',
        );
        await fetch(url, {
          method: 'PUT',
          body: attachFile,
          headers: {
            'Content-Type': attachFile.type || 'application/octet-stream',
          },
        });
        attachmentKey = s3Key;
        attachmentName = attachFile.name;
        setUploadingAttach(false);
      }
      if (isEdit) {
        await updateTask(classroomId, editingTask!.id, {
          title,
          description: description || undefined,
          deadline: deadline || null,
          ...(attachmentKey && { attachmentKey, attachmentName }),
        });
      } else {
        await createTask(classroomId, {
          title,
          description: description || undefined,
          deadline: deadline || undefined,
        });
      }
      onClose();
    } catch (e: any) {
      setError(e.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
      setUploadingAttach(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl'>
        <h2 className='text-xl font-bold text-slate-900 mb-5 flex items-center gap-2'>
          <span className='material-symbols-outlined text-indigo-600'>
            {isEdit ? 'edit' : 'assignment_add'}
          </span>
          {isEdit ? 'Sửa bài tập' : 'Tạo bài tập mới'}
        </h2>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              Tiêu đề <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800'
              placeholder='Tên bài tập...'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              Mô tả / Đề bài
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-800'
              rows={4}
              placeholder='Mô tả chi tiết yêu cầu bài tập...'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              Hạn nộp
            </label>
            <input
              type='datetime-local'
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className='w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800'
            />
          </div>
          {/* Attachment file */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              File đính kèm đề bài
            </label>
            <div
              onClick={() => attachInputRef.current?.click()}
              className='border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors'
            >
              <span className='material-symbols-outlined text-2xl text-slate-400 block mb-1'>
                attach_file
              </span>
              {attachFile ? (
                <p className='text-sm font-semibold text-indigo-600'>
                  {attachFile.name}
                </p>
              ) : hasExistingAttachment ? (
                <p className='text-sm text-slate-500'>
                  Hiện tại:{' '}
                  <span className='font-semibold text-slate-700'>
                    {editingTask?.attachmentName}
                  </span>
                  <br />
                  <span className='text-xs text-slate-400'>
                    Chọn file mới để thay thế
                  </span>
                </p>
              ) : (
                <p className='text-sm text-slate-500'>
                  Nhấn để đính kèm file đề bài (PDF, DOCX...)
                </p>
              )}
            </div>
            <input
              ref={attachInputRef}
              type='file'
              className='hidden'
              onChange={(e) => setAttachFile(e.target.files?.[0] ?? null)}
            />
            {uploadingAttach && (
              <p className='text-xs text-indigo-500 mt-1 animate-pulse'>
                Đang upload file...
              </p>
            )}
          </div>
          {error && (
            <p className='text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg'>
              {error}
            </p>
          )}
        </div>
        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors'
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className='px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2'
          >
            {submitting && (
              <span className='material-symbols-outlined animate-spin text-sm'>
                progress_activity
              </span>
            )}
            {isEdit ? 'Lưu thay đổi' : 'Tạo bài tập'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Submissions Panel ────────────────────────────────────────────────────────

function SubmissionsPanel({
  classroomId,
  task,
}: {
  classroomId: string;
  task: ClassroomTask;
}) {
  const { getSubmissions, getSubmissionDownloadUrl, gradeSubmission } =
    useTasks();
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<Record<string, string>>({});
  const [gradeSaving, setGradeSaving] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSubmissions(classroomId, task.id);
      setSubmissions(data);
      // Pre-fill grade inputs with existing grades
      const gradeMap: Record<string, string> = {};
      data.forEach((s) => {
        if (s.grade !== null && s.grade !== undefined) {
          gradeMap[s.id] = String(s.grade);
        }
      });
      setGrading(gradeMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [classroomId, task.id, getSubmissions]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGrade = async (submissionId: string) => {
    const val = parseFloat(grading[submissionId] ?? '');
    if (isNaN(val) || val < 0 || val > 100) return;
    setGradeSaving((p) => ({ ...p, [submissionId]: true }));
    try {
      await gradeSubmission(classroomId, task.id, submissionId, val);
      await load();
      toast.success('Chấm điểm thành công!');
    } catch (e: any) {
      toast.error(e.message || 'Chấm điểm thất bại');
    } finally {
      setGradeSaving((p) => ({ ...p, [submissionId]: false }));
    }
  };

  const handleDownload = async (submissionId: string) => {
    setDownloading((p) => ({ ...p, [submissionId]: true }));
    try {
      const url = await getSubmissionDownloadUrl(
        classroomId,
        task.id,
        submissionId,
      );
      window.open(url, '_blank');
      toast.success('Bắt đầu tải xuống bài nộp...');
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải file');
    } finally {
      setDownloading((p) => ({ ...p, [submissionId]: false }));
    }
  };

  const submittedCount = submissions.length;
  const gradedCount = submissions.filter(
    (s) => s.grade !== null && s.grade !== undefined,
  ).length;
  const ungradedCount = submittedCount - gradedCount;

  return (
    <div className='flex-1 min-h-0 overflow-y-auto'>
      {/* Stats bar */}
      <div className='flex gap-3 mb-5 flex-wrap'>
        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold'>
          <span className='material-symbols-outlined text-[14px]'>group</span>
          {submittedCount} đã nộp
        </div>
        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-100'>
          <span className='material-symbols-outlined text-[14px]'>
            check_circle
          </span>
          {gradedCount} đã chấm
        </div>
        {ungradedCount > 0 && (
          <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100'>
            <span className='material-symbols-outlined text-[14px]'>
              pending
            </span>
            {ungradedCount} chưa chấm
          </div>
        )}
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-12 text-slate-400'>
          <span className='material-symbols-outlined animate-spin mr-2'>
            progress_activity
          </span>
          Đang tải bài nộp...
        </div>
      ) : submissions.length === 0 ? (
        <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
          <span className='material-symbols-outlined text-4xl text-slate-300 block mb-2'>
            inbox
          </span>
          <p className='text-slate-500 text-sm font-medium'>
            Chưa có học sinh nào nộp bài
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {submissions.map((sub) => {
            const hasFile = !!sub.fileUrl;
            const isGraded = sub.grade !== null && sub.grade !== undefined;
            return (
              <div
                key={sub.id}
                className={`p-4 rounded-xl border transition-colors ${isGraded
                    ? 'bg-green-50/50 border-green-200'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
              >
                <div className='flex gap-3 items-start'>
                  <Avatar
                    name={sub.user.fullName}
                    avatarUrl={sub.user.avatarUrl}
                  />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2 flex-wrap'>
                      <div>
                        <p className='font-semibold text-slate-800 text-sm'>
                          {sub.user.fullName || sub.user.email}
                        </p>
                        <p className='text-xs text-slate-400 mt-0.5'>
                          Nộp lúc{' '}
                          {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {isGraded && (
                        <div className='text-right'>
                          <span className='text-2xl font-black text-green-700'>
                            {Number(sub.grade).toFixed(0)}
                          </span>
                          <span className='text-xs text-slate-400'>/100</span>
                        </div>
                      )}
                    </div>

                    {/* Submission content */}
                    {sub.content && (
                      <div className='mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 whitespace-pre-wrap max-h-24 overflow-y-auto'>
                        {sub.content}
                      </div>
                    )}

                    {/* File download */}
                    {hasFile && (
                      <button
                        onClick={() => handleDownload(sub.id)}
                        disabled={downloading[sub.id]}
                        className='mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors disabled:opacity-50'
                      >
                        {downloading[sub.id] ? (
                          <span className='material-symbols-outlined text-sm animate-spin'>
                            progress_activity
                          </span>
                        ) : (
                          <span className='material-symbols-outlined text-sm'>
                            download
                          </span>
                        )}
                        Tải file bài nộp
                      </button>
                    )}

                    {/* Grade input */}
                    <div className='mt-3 flex items-center gap-2'>
                      <input
                        type='number'
                        min={0}
                        max={100}
                        step={0.5}
                        value={grading[sub.id] ?? ''}
                        onChange={(e) =>
                          setGrading((p) => ({
                            ...p,
                            [sub.id]: e.target.value,
                          }))
                        }
                        placeholder='Điểm (0–100)'
                        className='w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800'
                      />
                      <button
                        onClick={() => handleGrade(sub.id)}
                        disabled={gradeSaving[sub.id]}
                        className='px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1'
                      >
                        {gradeSaving[sub.id] ? (
                          <span className='material-symbols-outlined text-sm animate-spin'>
                            progress_activity
                          </span>
                        ) : (
                          <span className='material-symbols-outlined text-sm'>
                            grade
                          </span>
                        )}
                        {isGraded ? 'Cập nhật' : 'Chấm điểm'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminTasksPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.classroomId as string;
  const { tasks, loadingTasks, fetchTasks, deleteTask } = useTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ClassroomTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<ClassroomTask | null>(null);
  const [view, setView] = useState<'list' | 'submissions'>('list');

  useEffect(() => {
    if (classroomId) fetchTasks(classroomId);
  }, [classroomId, fetchTasks]);

  // When tasks list refreshes, sync the selected task if it exists
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
    }
  }, [tasks]);

  const handleDelete = async (task: ClassroomTask) => {
    if (!(await appConfirm({ title: 'Xóa bài tập?', description: `Xóa bài tập "${task.title}"? Tất cả bài nộp sẽ bị xóa theo.`, confirmLabel: 'Xóa bài tập', variant: 'destructive' })))
      return;
    try {
      await deleteTask(classroomId, task.id);
      if (selectedTask?.id === task.id) {
        setSelectedTask(null);
        setView('list');
      }
      toast.success('Xóa bài tập thành công!');
    } catch (e: any) {
      toast.error(e.message || 'Xóa thất bại');
    }
  };

  const totalSubmissions = tasks.reduce(
    (acc, t) => acc + (t._count?.submissions || 0),
    0,
  );

  return (
    <div
      className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col'
      style={{ minHeight: 600 }}
    >
      {/* Header */}
      <div className='p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0'>
        <div>
          <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
            <span className='material-symbols-outlined text-indigo-500'>
              assignment
            </span>
            Quản lý Bài tập
          </h2>
          <p className='text-slate-500 text-xs mt-0.5'>
            {tasks.length} bài tập · {totalSubmissions} bài nộp
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 text-sm shadow-sm'
        >
          <span className='material-symbols-outlined text-[18px]'>add</span>
          Tạo bài tập
        </button>
      </div>

      {/* Body with State-based View Switcher */}
      {view === 'list' ? (
        <div className='flex-1 flex flex-col min-h-0 overflow-y-auto'>
          {loadingTasks ? (
            <div className='flex items-center justify-center py-16 text-slate-400'>
              <span className='material-symbols-outlined animate-spin mr-2'>
                progress_activity
              </span>
              Đang tải...
            </div>
          ) : tasks.length === 0 ? (
            <div className='text-center py-20 m-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2'>
              <span className='material-symbols-outlined text-5xl text-slate-300 block mb-2'>
                assignment
              </span>
              <p className='text-slate-500 font-bold text-sm'>
                Lớp học chưa có bài tập nào.
              </p>
              <p className='text-xs text-slate-400 font-medium'>
                Hãy nhấn nút "Tạo bài tập" để tạo bài tập mới cho học viên!
              </p>
            </div>
          ) : (
            <div className='p-6 space-y-4'>
              <div className='grid grid-cols-1 gap-4'>
                {tasks.map((task) => {
                  const subCount = task._count?.submissions || 0;
                  const isPast =
                    task.deadline && new Date(task.deadline) < new Date();
                  return (
                    <div
                      key={task.id}
                      className='bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-indigo-200 hover:shadow-sm'
                    >
                      <div className='flex items-start gap-3.5 min-w-0'>
                        <div className='w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm'>
                          <span className='material-symbols-outlined text-[24px]'>
                            assignment
                          </span>
                        </div>
                        <div className='min-w-0'>
                          <h3 className='font-bold text-slate-800 text-base truncate' title={task.title}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className='text-slate-500 text-xs truncate mt-0.5 max-w-lg'>
                              {task.description}
                            </p>
                          )}
                          <div className='flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-400 font-semibold'>
                            <span className='flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100'>
                              <span className='material-symbols-outlined text-[13px]'>
                                group
                              </span>
                              {subCount} đã nộp
                            </span>
                            {task.deadline && (
                              <span
                                className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isPast
                                    ? 'bg-slate-50 text-slate-400 border-slate-100 line-through'
                                    : 'bg-amber-50/50 text-amber-600 border-amber-100/60'
                                  }`}
                              >
                                <span className='material-symbols-outlined text-[13px]'>
                                  schedule
                                </span>
                                Hạn nộp: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className='flex items-center gap-2.5 self-end sm:self-center shrink-0'>
                        <button
                          onClick={() => {
                            router.push(`/assignments/${task.id}/submissions`);
                          }}
                          className='flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all text-xs font-bold shadow-sm'
                        >
                          <span className='material-symbols-outlined text-[16px]'>
                            grade
                          </span>
                          Chấm bài
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className='flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all text-xs font-bold'
                        >
                          <span className='material-symbols-outlined text-[16px]'>
                            edit
                          </span>
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          className='flex items-center gap-1.5 px-3.5 py-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all text-xs font-bold'
                        >
                          <span className='material-symbols-outlined text-[16px]'>
                            delete
                          </span>
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* View 2: Submissions Panel */
        <div className='flex-1 p-6 overflow-y-auto flex flex-col'>
          {selectedTask && (
            <>
              {/* Back breadcrumb */}
              <button
                onClick={() => {
                  setView('list');
                  setSelectedTask(null);
                }}
                className='flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-5 w-fit bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-xl shadow-sm'
              >
                <span className='material-symbols-outlined text-[16px]'>
                  arrow_back
                </span>
                Quay lại danh sách bài tập
              </button>

              <div className='mb-5 pb-5 border-b border-slate-100 shrink-0'>
                <h3 className='font-bold text-slate-800 text-lg flex items-center gap-2'>
                  <span className='material-symbols-outlined text-indigo-500'>
                    assignment
                  </span>
                  {selectedTask.title}
                </h3>
                {selectedTask.description && (
                  <p className='text-slate-500 text-sm mt-2 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3.5 rounded-xl border border-slate-100'>
                    {selectedTask.description}
                  </p>
                )}
                <div className='flex items-center gap-4 mt-3 text-xs text-slate-400 font-semibold'>
                  <span className='flex items-center gap-1'>
                    <span className='material-symbols-outlined text-[14px]'>
                      calendar_today
                    </span>
                    {formatDeadline(selectedTask)}
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='material-symbols-outlined text-[14px]'>
                      group
                    </span>
                    {selectedTask._count?.submissions || 0} bài nộp
                  </span>
                </div>
              </div>
              <SubmissionsPanel classroomId={classroomId} task={selectedTask} />
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <TaskFormModal
          classroomId={classroomId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {editingTask && (
        <TaskFormModal
          classroomId={classroomId}
          editingTask={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
