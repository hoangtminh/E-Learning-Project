'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { useTasks } from '@/contexts/TaskContext';
import type { ClassroomTask } from '@/api/classroom';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDeadline(task: ClassroomTask): {
  text: string;
  urgency: 'high' | 'normal' | 'past';
} {
  if (!task.deadline) return { text: 'Không có hạn nộp', urgency: 'normal' };
  const diff = Math.ceil(
    (new Date(task.deadline).getTime() - Date.now()) / 86400000,
  );
  if (diff < 0)
    return {
      text: `Hết hạn ${new Date(task.deadline).toLocaleDateString('vi-VN')}`,
      urgency: 'past',
    };
  if (diff === 0) return { text: 'Hạn nộp hôm nay!', urgency: 'high' };
  if (diff <= 3)
    return { text: `Còn ${diff} ngày`, urgency: 'high' };
  return {
    text: `Hạn: ${new Date(task.deadline).toLocaleDateString('vi-VN')}`,
    urgency: 'normal',
  };
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

function CreateTaskModal({
  classroomId,
  onClose,
}: {
  classroomId: string;
  onClose: () => void;
}) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createTask(classroomId, {
        title,
        description: description || undefined,
        deadline: deadline || undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Tạo bài tập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl'>
        <h2 className='text-xl font-bold text-slate-900 mb-5 flex items-center gap-2'>
          <span className='material-symbols-outlined text-sky-600'>assignment_add</span>
          Tạo bài tập mới
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
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800'
              placeholder='Tên bài tập...'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              Mô tả (Tùy chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 resize-none'
              placeholder='Mô tả chi tiết bài tập...'
              rows={3}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              Hạn nộp (Tùy chọn)
            </label>
            <input
              type='datetime-local'
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800'
            />
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
            className='px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors'
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className='px-5 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2'
          >
            {submitting ? (
              <>
                <span className='material-symbols-outlined animate-spin text-sm'>
                  progress_activity
                </span>
                Đang tạo...
              </>
            ) : (
              'Tạo bài tập'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Submit Modal ────────────────────────────────────────────────────────────

function SubmitModal({
  task,
  classroomId,
  onClose,
}: {
  task: ClassroomTask;
  classroomId: string;
  onClose: () => void;
}) {
  const { submitTask } = useTasks();
  const [content, setContent] = useState(task.submissions[0]?.content ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await submitTask(classroomId, task.id, { content });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Nộp bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl'>
        <h2 className='text-xl font-bold text-slate-900 mb-1 flex items-center gap-2'>
          <span className='material-symbols-outlined text-sky-600'>upload_file</span>
          Nộp bài
        </h2>
        <p className='text-sm text-slate-500 mb-5'>{task.title}</p>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              Nội dung / Link bài nộp
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 resize-none'
              placeholder='Dán link hoặc nhập nội dung bài làm...'
              rows={4}
            />
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
            className='px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors'
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className='px-5 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2'
          >
            {submitting ? (
              <>
                <span className='material-symbols-outlined animate-spin text-sm'>
                  progress_activity
                </span>
                Đang nộp...
              </>
            ) : task.submissions.length > 0 ? (
              'Cập nhật bài nộp'
            ) : (
              'Nộp bài'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ICON_STYLES = [
  { icon: 'assignment', color: 'text-purple-600', bg: 'bg-purple-100' },
  { icon: 'code', color: 'text-sky-600', bg: 'bg-sky-100' },
  { icon: 'description', color: 'text-slate-500', bg: 'bg-slate-100' },
  { icon: 'quiz', color: 'text-amber-600', bg: 'bg-amber-100' },
];

export default function ClassroomTasksPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { classroom } = useClassrooms();
  const { tasks, loadingTasks, fetchTasks, deleteTask } = useTasks();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitTask, setSubmitTask] = useState<ClassroomTask | null>(null);

  useEffect(() => {
    if (classroomId) fetchTasks(classroomId);
  }, [classroomId, fetchTasks]);

  // Determine user's role from classroom context
  // The 'members' array from findOne includes role info
  const isAdminOrOwner =
    classroom?.members?.some(
      (m) => m.role === 'owner' || m.role === 'admin',
    ) ?? false;

  const todoCount = tasks.filter((t) => t.submissions.length === 0).length;
  const doneCount = tasks.filter((t) => t.submissions.length > 0).length;

  const handleDelete = async (taskId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;
    try {
      await deleteTask(classroomId, taskId);
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
    }
  };

  if (loadingTasks) {
    return (
      <div className='flex items-center justify-center py-20 text-slate-400'>
        <span className='material-symbols-outlined animate-spin mr-2'>
          progress_activity
        </span>
        Đang tải bài tập...
      </div>
    );
  }

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto w-full'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Main Assignments List */}
        <div className='col-span-1 lg:col-span-8 space-y-6'>
          {/* Toolbar */}
          <div className='flex justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-xl border border-sky-200/50 shadow-sm'>
            <div className='flex gap-2'>
              <span className='px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold'>
                Cần làm: {todoCount}
              </span>
              <span className='px-3 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-semibold border border-green-100'>
                Đã nộp: {doneCount}
              </span>
            </div>
            {isAdminOrOwner && (
              <button
                onClick={() => setShowCreateModal(true)}
                className='flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95 text-sm'
              >
                <span className='material-symbols-outlined text-lg'>add</span>
                Tạo bài tập
              </button>
            )}
          </div>

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className='text-center py-16 text-slate-400'>
              <span className='material-symbols-outlined text-5xl block mb-3'>
                assignment
              </span>
              <p className='font-medium'>Chưa có bài tập nào</p>
              {isAdminOrOwner && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='mt-4 text-sky-600 text-sm font-semibold hover:underline'
                >
                  + Tạo bài tập đầu tiên
                </button>
              )}
            </div>
          )}

          {/* Task Cards */}
          {tasks.map((task, index) => {
            const submission = task.submissions[0];
            const status = submission
              ? submission.grade !== null
                ? 'graded'
                : 'submitted'
              : 'todo';
            const ui = ICON_STYLES[index % ICON_STYLES.length];
            const { text: dueDateStr, urgency } = formatDeadline(task);

            return (
              <div
                key={task.id}
                className={`bg-white/60 backdrop-blur-md border p-6 rounded-2xl group transition-all duration-300 shadow-sm ${
                  status === 'todo'
                    ? urgency === 'high'
                      ? 'border-l-4 border-l-red-500 border-slate-200 hover:border-red-400/60'
                      : 'border-l-4 border-l-sky-500 border-slate-200 hover:border-sky-400/60'
                    : 'border-slate-200 hover:border-sky-300/60 opacity-90'
                }`}
              >
                <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
                  <div className='flex gap-4 flex-1'>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ui.bg} ${ui.color}`}
                    >
                      <span className='material-symbols-outlined'>{ui.icon}</span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors'>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className='text-sm text-slate-500 mt-1 leading-relaxed'>
                          {task.description}
                        </p>
                      )}
                      <div className='flex flex-wrap items-center gap-4 mt-3'>
                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            urgency === 'high'
                              ? 'text-red-500 font-bold'
                              : urgency === 'past'
                                ? 'text-slate-400 line-through'
                                : 'text-slate-500'
                          }`}
                        >
                          <span className='material-symbols-outlined text-sm'>
                            {urgency === 'high'
                              ? 'priority_high'
                              : status !== 'todo'
                                ? 'history'
                                : 'calendar_today'}
                          </span>
                          {dueDateStr}
                        </div>
                        <div className='flex items-center gap-1.5 text-xs text-slate-400'>
                          <span className='material-symbols-outlined text-sm'>person</span>
                          {task.creator?.fullName ?? 'N/A'}
                        </div>
                        {isAdminOrOwner && task._count.submissions > 0 && (
                          <div className='flex items-center gap-1.5 text-xs text-indigo-500'>
                            <span className='material-symbols-outlined text-sm'>
                              assignment_turned_in
                            </span>
                            {task._count.submissions} bài đã nộp
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col items-end gap-2 shrink-0'>
                    {/* Status badge */}
                    {status === 'graded' && (
                      <>
                        <span className='px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1'>
                          <span className='material-symbols-outlined text-sm'>check_circle</span>
                          Đã chấm điểm
                        </span>
                        <div className='text-2xl font-black text-slate-800 text-right'>
                          {submission?.grade}
                          <span className='text-sm font-normal text-slate-500'>/100</span>
                        </div>
                      </>
                    )}
                    {status === 'submitted' && (
                      <>
                        <span className='px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center gap-1'>
                          <span className='material-symbols-outlined text-sm'>pending</span>
                          Đã nộp
                        </span>
                        <button
                          onClick={() => setSubmitTask(task)}
                          className='text-sky-600 text-xs font-bold hover:underline'
                        >
                          Sửa bài nộp
                        </button>
                      </>
                    )}
                    {status === 'todo' && (
                      <>
                        <span className='px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200'>
                          Chưa làm
                        </span>
                        <button
                          onClick={() => setSubmitTask(task)}
                          className='mt-1 bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95'
                        >
                          Nộp bài
                        </button>
                      </>
                    )}
                    {/* Admin delete */}
                    {isAdminOrOwner && (
                      <button
                        onClick={() => handleDelete(task.id)}
                        className='text-red-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors mt-1'
                      >
                        <span className='material-symbols-outlined text-sm'>delete</span>
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className='col-span-1 lg:col-span-4 space-y-6'>
          {/* Progress */}
          <div className='bg-white/60 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm'>
            <h4 className='font-bold text-slate-800 mb-6'>Tiến độ của bạn</h4>
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='text-slate-500'>Đã hoàn thành</span>
                  <span className='font-bold text-slate-800'>
                    {doneCount}/{tasks.length || 1}
                  </span>
                </div>
                <div className='w-full bg-slate-200 h-2 rounded-full overflow-hidden'>
                  <div
                    className='bg-sky-500 h-full rounded-full transition-all duration-500'
                    style={{
                      width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-slate-50 p-4 rounded-xl border border-slate-100 text-center'>
                  <div className='text-2xl font-black text-sky-600'>
                    {todoCount}
                  </div>
                  <div className='text-xs text-slate-500 mt-1'>Cần làm</div>
                </div>
                <div className='bg-slate-50 p-4 rounded-xl border border-slate-100 text-center'>
                  <div className='text-2xl font-black text-green-600'>
                    {doneCount}
                  </div>
                  <div className='text-xs text-slate-500 mt-1'>Đã nộp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming deadlines */}
          {tasks.filter((t) => t.deadline && t.submissions.length === 0).length > 0 && (
            <div className='bg-white/60 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm'>
              <h4 className='font-bold text-slate-800 mb-4'>Sắp tới hạn</h4>
              <div className='space-y-3'>
                {tasks
                  .filter((t) => t.deadline && t.submissions.length === 0)
                  .sort(
                    (a, b) =>
                      new Date(a.deadline!).getTime() -
                      new Date(b.deadline!).getTime(),
                  )
                  .slice(0, 3)
                  .map((t) => {
                    const { text, urgency } = formatDeadline(t);
                    return (
                      <div key={t.id} className='flex gap-3 items-center'>
                        <span
                          className={`material-symbols-outlined text-sm ${urgency === 'high' ? 'text-red-500' : 'text-slate-400'}`}
                        >
                          calendar_today
                        </span>
                        <div>
                          <div
                            className={`text-xs font-bold uppercase ${urgency === 'high' ? 'text-red-500' : 'text-slate-400'}`}
                          >
                            {text}
                          </div>
                          <div className='text-sm font-semibold text-slate-800'>
                            {t.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          classroomId={classroomId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {submitTask && (
        <SubmitModal
          task={submitTask}
          classroomId={classroomId}
          onClose={() => setSubmitTask(null)}
        />
      )}
    </div>
  );
}
