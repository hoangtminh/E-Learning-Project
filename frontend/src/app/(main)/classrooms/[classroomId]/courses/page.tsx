'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';

export default function ClassroomCoursesPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { classroom, loadingClassroom } = useClassrooms();

  if (loadingClassroom) {
    return (
      <div className='flex items-center justify-center py-20 text-slate-400'>
        <span className='material-symbols-outlined animate-spin mr-2'>progress_activity</span>
        Đang tải...
      </div>
    );
  }

  const linkedCourses = classroom?.linkedCourses || [];

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto w-full'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
            <span className='material-symbols-outlined text-indigo-600' style={{ fontVariationSettings: "'FILL' 1" }}>
              menu_book
            </span>
            Khóa học liên kết
          </h2>
          <p className='text-slate-500 mt-1'>
            Các khóa học chính thức được gắn kèm với lớp học này.
          </p>
        </div>
      </div>

      {linkedCourses.length === 0 ? (
        <div className='text-center py-20 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm'>
          <span className='material-symbols-outlined text-6xl text-slate-300 mb-4 block'>school</span>
          <p className='text-slate-500 font-medium'>Lớp học này chưa có khóa học liên kết nào.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {linkedCourses.map(({ course }) => (
            <div key={course.id} className='bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col'>
              <div className='h-40 bg-slate-100 relative overflow-hidden'>
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-300'>
                    <span className='material-symbols-outlined text-5xl'>image</span>
                  </div>
                )}
              </div>
              <div className='p-5 flex-1 flex flex-col'>
                <h3 className='font-bold text-slate-800 text-lg mb-2 line-clamp-2'>{course.title}</h3>
                <p className='text-slate-500 text-sm line-clamp-2 mb-4 flex-1'>
                  {course.description || 'Không có mô tả.'}
                </p>
                <Link
                  href={`/courses/${course.id}`}
                  className='text-center w-full block py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors text-sm'
                >
                  Vào học ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
