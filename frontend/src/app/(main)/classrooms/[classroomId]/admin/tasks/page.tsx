'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTasks } from '@/contexts/TaskContext';
import type { ClassroomTask } from '@/api/classroom';

function formatDeadline(task: ClassroomTask): string {
  if (!task.deadline) return 'Không có hạn nộp';
  return new Date(task.deadline).toLocaleDateString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CreateTaskModal({ classroomId, onClose }: { classroomId: string; onClose: () => void }) {
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
          <span className='material-symbols-outlined text-indigo-600'>assignment_add</span>
          Tạo bài tập mới
        </h2>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Tiêu đề <span className='text-red-500'>*</span></label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='Tên bài tập...'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none'
              rows={3}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Hạn nộp</label>
            <input
              type='datetime-local'
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
          {error && <p className='text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg'>{error}</p>}
        </div>
        <div className='mt-6 flex justify-end gap-3'>
          <button onClick={onClose} className='px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors'>Hủy</button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className='px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50'
          >
            {submitting ? 'Đang tạo...' : 'Tạo bài tập'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTasksPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { tasks, loadingTasks, fetchTasks, deleteTask } = useTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (classroomId) fetchTasks(classroomId);
  }, [classroomId, fetchTasks]);

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
        <span className='material-symbols-outlined animate-spin mr-2'>progress_activity</span>
        Đang tải...
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50'>
        <div>
          <h2 className='text-lg font-bold text-slate-800'>Quản lý Bài tập</h2>
          <p className='text-slate-500 text-sm mt-1'>Thêm, sửa, xóa các bài tập giao cho học viên</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm'
        >
          <span className='material-symbols-outlined text-[18px]'>add</span>
          Tạo bài tập
        </button>
      </div>

      <div className='p-6'>
        {tasks.length === 0 ? (
          <div className='text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
            <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>assignment</span>
            <p className='text-slate-500 text-sm font-medium'>Chưa có bài tập nào được tạo.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {tasks.map((task) => (
              <div key={task.id} className='flex gap-4 p-4 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white items-center'>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-bold text-slate-800 text-sm'>{task.title}</h4>
                  <p className='text-slate-500 text-xs mt-1 truncate'>{task.description || 'Không có mô tả'}</p>
                  <div className='flex items-center gap-4 mt-2 text-xs text-slate-500'>
                    <span className='flex items-center gap-1'><span className='material-symbols-outlined text-[14px]'>calendar_today</span> {formatDeadline(task)}</span>
                    <span className='flex items-center gap-1'><span className='material-symbols-outlined text-[14px]'>group</span> {task._count?.submissions || 0} bài nộp</span>
                  </div>
                </div>
                <div className='shrink-0'>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className='text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors'
                    title='Xóa bài tập'
                  >
                    <span className='material-symbols-outlined block'>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && <CreateTaskModal classroomId={classroomId} onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
