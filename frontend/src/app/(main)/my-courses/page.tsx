'use client';

import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MyCoursesPage() {
  const { courses, isLoading, error } = useCourses();
  const { user } = useAuth();
  
  // Filter logic: 
  // 1. My created courses
  const myCreatedCourses = courses.filter(c => c.instructor?.id === user?.userId);
  
  // 2. Enrolled courses (currently approximated or empty if no backend support)
  // For now, we leave it empty or you can mock it.
  const enrolledCourses = [] as any[];

  return (
    <div className='space-y-8 min-h-screen pb-12 transition-all p-6 md:p-12'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-200 pb-6'>
        <div>
          <h1 className='text-3xl font-black text-slate-900'>Khóa học của tôi</h1>
          <p className='text-slate-500 mt-1'>Quản lý các khóa học bạn đã tạo và đang tham gia.</p>
        </div>
        <div className='flex items-center gap-3'>
          <Link href="/courses" className='text-sky-600 font-semibold hover:bg-sky-50 px-4 py-2 rounded-lg transition-colors'>
            Khám phá thêm
          </Link>
          <Link 
            href="/instructor/studio" 
            className='bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 active:scale-95 duration-200 flex items-center gap-2'
          >
            <span className='material-symbols-outlined text-[18px]'>add_circle</span>
            Tạo khóa học
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-20 text-slate-400'>
          <span className='material-symbols-outlined animate-spin mr-2 text-3xl'>progress_activity</span>
          <span className='font-medium'>Đang tải dữ liệu...</span>
        </div>
      ) : error ? (
        <div className='rounded-xl bg-red-50 p-6 text-red-600 text-center border border-red-100'>
          <span className='material-symbols-outlined text-4xl mb-2'>error</span>
          <p className='font-bold text-lg'>Không thể tải khóa học</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      ) : (
        <div className='space-y-12'>
          
          {/* Enrolled Courses Section */}
          <section>
            <h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
              <span className="material-symbols-outlined text-sky-500">menu_book</span>
              Khóa học đã tham gia
            </h2>
            
            {enrolledCourses.length === 0 ? (
              <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
                <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>history_edu</span>
                <p className='text-slate-500 font-medium'>Bạn chưa tham gia khóa học nào.</p>
                <Link href="/courses" className='text-sky-600 text-sm hover:underline mt-1 inline-block'>
                  Khám phá các khóa học ngay
                </Link>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                 {/* Render enrolled courses here */}
              </div>
            )}
          </section>

          {/* Created Courses Section */}
          <section>
            <h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
              <span className="material-symbols-outlined text-indigo-500">video_library</span>
              Khóa học của tôi (Đã tạo)
            </h2>
            
            {myCreatedCourses.length === 0 ? (
              <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
                <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>post_add</span>
                <p className='text-slate-500 font-medium'>Bạn chưa tạo khóa học nào.</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {myCreatedCourses.map((c) => (
                  <div
                    key={c.id}
                    className='bg-white border border-slate-200 rounded-2xl overflow-hidden group flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
                  >
                    <div className='relative h-40 overflow-hidden bg-slate-100'>
                      <img 
                        src={c.thumbnailUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop&sig=${c.id}`} 
                        alt={c.title} 
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' 
                      />
                      <div className='absolute top-3 left-3 px-2 py-1 bg-slate-900/70 backdrop-blur-md rounded flex items-center gap-1'>
                        <span className='text-white text-[10px] font-bold uppercase tracking-wider'>{c.visibility}</span>
                      </div>
                    </div>
                    
                    <div className='p-4 flex flex-col flex-1'>
                      <h3 className='font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2'>
                        {c.title}
                      </h3>
                      
                      <div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-100'>
                        <span className='text-sm font-black text-slate-800'>
                          {c.price ? `${c.price.toLocaleString()}đ` : 'Miễn phí'}
                        </span>
                        <Link href={`/instructor/studio`} className='px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all active:scale-95'>
                          Quản lý
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
