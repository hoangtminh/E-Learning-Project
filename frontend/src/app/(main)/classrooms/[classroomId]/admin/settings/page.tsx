'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClassrooms } from '@/contexts/ClassroomContext';

export default function AdminSettingsPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const router = useRouter();
  const { classroom, updateClassroom, deleteClassroom } = useClassrooms();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (classroom) {
      setTitle(classroom.title);
      setDescription(classroom.description || '');
    }
  }, [classroom]);

  const handleUpdate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await updateClassroom(classroomId, title, description || undefined);
      alert('Cập nhật lớp học thành công!');
    } catch (e: any) {
      alert(e.message || 'Cập nhật thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN lớp học này không? Hành động này không thể hoàn tác!')) return;
    try {
      await deleteClassroom(classroomId);
      router.push('/classrooms');
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
    }
  };

  if (!classroom) return <div className='p-6 text-slate-500'>Đang tải...</div>;

  return (
    <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-100 bg-slate-50'>
        <h2 className='text-lg font-bold text-slate-800'>Cài đặt Lớp học</h2>
        <p className='text-slate-500 text-sm mt-1'>Thay đổi thông tin cơ bản hoặc xóa lớp học</p>
      </div>

      <div className='p-6 space-y-6 max-w-2xl'>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Tên lớp học <span className='text-red-500'>*</span></label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800'
              placeholder='Nhập tên lớp...'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none'
              placeholder='Nhập mô tả...'
              rows={4}
            />
          </div>
          <div className='pt-2'>
            <button
              onClick={handleUpdate}
              disabled={isSubmitting || !title.trim() || (title === classroom.title && description === (classroom.description || ''))}
              className='px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50'
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>

        <div className='pt-8 border-t border-red-100 mt-8'>
          <h3 className='text-lg font-bold text-red-600 mb-2'>Khu vực nguy hiểm</h3>
          <p className='text-sm text-slate-500 mb-4'>Hành động xóa lớp học sẽ xóa vĩnh viễn toàn bộ dữ liệu, thành viên, và tài nguyên của lớp. Không thể khôi phục.</p>
          <button
            onClick={handleDelete}
            className='px-5 py-2 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors'
          >
            Xóa lớp học
          </button>
        </div>
      </div>
    </div>
  );
}
