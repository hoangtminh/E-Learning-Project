'use client';

import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CoursesCatalogPage() {
  const { courses, isLoading, error } = useCourses();
  const { user } = useAuth();
  
  // Filter logic: Only PUBLIC courses, optionally excluding courses the user already owns if you want
  const publicCourses = courses.filter(c => c.visibility === 'PUBLIC');

  return (
    <div className='space-y-8 min-h-screen pb-12 transition-all'>
      {/* Hero Header Section */}
      <section className='relative overflow-hidden rounded-2xl bg-slate-900 aspect-[21/9] md:aspect-[4/1] flex flex-col justify-center px-8 md:px-12 group shadow-lg'>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10"></div>
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero background" 
          />
        </div>
        <div className='relative z-20 max-w-2xl'>
          <span className="inline-block px-3 py-1 rounded-full bg-sky-400/20 text-sky-300 text-xs font-bold tracking-widest uppercase mb-4 border border-sky-400/30">
            Khóa Học Trực Tuyến
          </span>
          <h2 className='text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-md'>
            Khám Phá <span className="text-sky-400">Khóa Học</span>
          </h2>
          <p className='text-slate-300 text-sm md:text-base leading-relaxed max-w-xl'>
            Mở khóa hàng trăm khóa học chất lượng từ các chuyên gia hàng đầu. Bắt đầu hành trình nâng cao kỹ năng của bạn ngay hôm nay.
          </p>
        </div>
      </section>

      {/* Header and Filters (Optional) */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-bold text-slate-800'>Tất cả khóa học</h3>
        <Link 
          href='/my-courses'
          className='text-sky-600 hover:text-sky-700 font-semibold text-sm flex items-center gap-1 hover:underline'
        >
          Đến Khóa học của tôi <span className='material-symbols-outlined text-[16px]'>arrow_forward</span>
        </Link>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-20 text-slate-400'>
          <span className='material-symbols-outlined animate-spin mr-2 text-3xl'>progress_activity</span>
          <span className='font-medium'>Đang tải danh sách...</span>
        </div>
      ) : error ? (
        <div className='rounded-xl bg-red-50 p-6 text-red-600 text-center border border-red-100'>
          <span className='material-symbols-outlined text-4xl mb-2'>error</span>
          <p className='font-bold text-lg'>Không thể tải khóa học</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      ) : publicCourses.length === 0 ? (
        <div className='text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200'>
          <span className='material-symbols-outlined text-5xl text-slate-300 mb-3 block'>search_off</span>
          <p className='text-slate-500 font-medium'>
            Hiện chưa có khóa học public nào.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {publicCourses.map((c) => (
            <div
              key={c.id}
              className='bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden group flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300'
            >
              <div className='relative h-48 overflow-hidden bg-slate-100'>
                <img 
                  src={c.imageUrl || `https://source.unsplash.com/random/800x600?technology,learning&sig=${c.id}`} 
                  alt={c.title} 
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' 
                />
                <div className='absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-md flex items-center gap-1 border border-white/10'>
                  <span className='text-amber-400 material-symbols-outlined text-[12px]' style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className='text-white text-[10px] font-black uppercase tracking-wider'>4.9</span>
                </div>
              </div>
              
              <div className='p-5 flex flex-col flex-1'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2'>
                    {c.title}
                  </h3>
                </div>
                
                <p className='text-slate-500 text-xs mb-4 line-clamp-2'>
                  {c.description || 'Chưa có mô tả cho khóa học này.'}
                </p>
                
                <div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-100'>
                  <span className='text-lg font-black text-slate-800'>
                    {c.price ? `${c.price.toLocaleString()}đ` : 'Miễn phí'}
                  </span>
                  <button className='px-5 py-2 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-all active:scale-95 shadow-md shadow-sky-500/20'>
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
