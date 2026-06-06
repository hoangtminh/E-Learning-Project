'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { stripHtml } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SearchX,
  BookOpen,
  User,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CatalogFilter = 'all' | 'free' | 'paid';

type CatalogCourse = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  instructor?: { fullName: string | null } | null;
};

function CatalogCourseCard({ course }: { course: CatalogCourse }) {
  const isFree = Number(course.price) === 0;

  return (
    <div className='bg-white border border-outline-variant/30 rounded-2xl overflow-hidden group flex flex-col hover:shadow-xs hover:border-primary/45 transition-all duration-300 relative h-full'>
      <Link
        href={`/courses/${course.id}`}
        className='relative h-24 sm:h-36 overflow-hidden bg-slate-100 block shrink-0'
      >
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className='w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500'
          />
        ) : (
          <div className='w-full h-full bg-primary/5 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-4 text-primary'>
            <BookOpen className='size-5 sm:size-8 text-primary/45' />
            <span className='text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-center line-clamp-2 px-2 sm:px-4'>
              {course.title}
            </span>
          </div>
        )}
        <div className='absolute top-2 left-2 px-1.5 py-0.5 sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 bg-slate-950/70 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10'>
          <span className='text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider'>
            {isFree ? 'Miễn phí' : 'Trả phí'}
          </span>
        </div>
      </Link>

      <div className='p-2.5 sm:p-4.5 flex flex-col flex-1'>
        <Link href={`/courses/${course.id}`}>
          <h3 className='font-bold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1 sm:mb-1.5 h-8 sm:h-10 text-xs sm:text-base'>
            {course.title}
          </h3>
        </Link>
        <p className='text-on-surface-variant/80 text-xs line-clamp-2 mb-4 h-8 leading-relaxed hidden sm:block'>
          {stripHtml(course.description) || 'Chưa có mô tả chi tiết cho khóa học này.'}
        </p>

        <div className='mt-auto flex items-center justify-between pt-2.5 sm:pt-4.5 border-t border-outline-variant/20 gap-2 sm:gap-3'>
          <div className='min-w-0'>
            <p className='text-[8px] sm:text-[10px] text-on-surface-variant/70 truncate flex items-center gap-1 sm:gap-1.5'>
              <User className='size-2.5 sm:size-3 text-on-surface-variant/50' />
              <span className='truncate'>{course.instructor?.fullName || 'Chưa cập nhật'}</span>
            </p>
            <p className='text-xs sm:text-sm font-black text-on-surface mt-0.5 sm:mt-1'>
              {isFree ? 'Miễn phí' : `${Number(course.price).toLocaleString('vi-VN')}đ`}
            </p>
          </div>
          <Link
            href={`/courses/${course.id}`}
            className='px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl bg-primary text-white text-[10px] sm:text-xs font-bold hover:bg-primary-dim shadow-xs transition-all active:scale-[0.97] shrink-0'
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CoursesCatalogPage() {
  const { courses, isLoading, error } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CatalogFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const visibleCourses = courses.filter(
    (course) => course.visibility === 'public' || course.visibility === 'sale'
  );

  const filteredCourses = visibleCourses.filter((course) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = course.title.toLowerCase().includes(query);
      const matchDesc = course.description?.toLowerCase().includes(query) || false;
      if (!matchTitle && !matchDesc) return false;
    }

    if (filterType === 'free' && Number(course.price) !== 0) return false;
    if (filterType === 'paid' && Number(course.price) === 0) return false;

    return true;
  });

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className='pb-16 transition-all p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8 bg-surface-container-lowest min-h-screen text-on-surface relative'>
      <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />

      {/* Title section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6 relative z-10'>
        <div>
          <h1 className='text-xl sm:text-2xl font-black text-on-surface tracking-tight'>Khóa học</h1>
          <p className='text-xs sm:text-sm text-on-surface-variant/85 mt-1 max-w-2xl'>
            Khám phá khóa học công khai và bắt đầu lộ trình học tập phù hợp nhất.
          </p>
        </div>
        <Link
          href='/my-courses'
          className='inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border-0 bg-primary/10 hover:bg-primary/15 px-4 text-xs font-bold text-primary shadow-xs transition-all active:scale-[0.98] self-start sm:self-center'
        >
          Khóa học của tôi
          <ArrowRight className='size-3.5' />
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-3 rounded-2xl border border-outline-variant/30 relative z-10 shadow-xs'>
        <div className='relative flex-1 max-w-md w-full'>
          <Input
            className='w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border-outline-variant/40 focus-visible:ring-primary/20 focus:bg-white transition-colors h-10'
            placeholder='Tìm kiếm khóa học...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className='absolute left-3 top-3 size-4 text-on-surface-variant/45' />
        </div>

        <div className='flex items-center gap-2 self-start md:self-center'>
          <span className='text-xs font-bold text-on-surface-variant/75 uppercase tracking-wider flex items-center gap-1.5 shrink-0'>
            <Filter className='size-3.5' /> Lọc
          </span>
          <div className='flex gap-1 bg-surface-container p-1 rounded-xl text-xs border border-outline-variant/20'>
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'free', label: 'Miễn phí' },
              { value: 'paid', label: 'Trả phí' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilterType(item.value as CatalogFilter)}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer border-0 transition-all text-[11px] ${filterType === item.value
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-on-surface-variant/75 hover:text-on-surface'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 relative z-10'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='h-48 sm:h-64 bg-slate-100 animate-pulse rounded-2xl border border-outline-variant/25'
            />
          ))}
        </div>
      ) : error ? (
        <div className='rounded-2xl bg-error/5 p-8 text-center border border-error/15 max-w-md mx-auto relative z-10'>
          <div className='w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error mx-auto mb-3'>
            <AlertCircle className='size-6' />
          </div>
          <p className='font-bold text-sm text-on-surface uppercase tracking-wider mb-1'>Không thể tải khóa học</p>
          <p className='text-xs text-error/85 leading-relaxed'>{error}</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant/40 relative z-10'>
          <SearchX className='size-8 text-on-surface-variant/35 mx-auto mb-3' />
          <p className='text-sm text-on-surface-variant font-bold mb-1'>
            Không tìm thấy khóa học nào phù hợp.
          </p>
          <p className='text-xs text-on-surface-variant/70 mb-4'>
            Thử thay đổi từ khóa tìm kiếm hoặc các tùy chọn lọc.
          </p>
          <Button
            variant='outline'
            className='rounded-xl text-xs h-9 cursor-pointer'
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className='space-y-8 relative z-10'>
          <section>
            <div className='flex items-center gap-2 mb-5'>
              <BookOpen className='size-5 text-primary' />
              <h2 className='text-sm sm:text-base font-black text-on-surface uppercase tracking-wider'>
                Tất cả khóa học
              </h2>
            </div>

            <motion.div 
              className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {paginatedCourses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
                  }}
                >
                  <CatalogCourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-2 pt-4'>
              <Button
                variant='outline'
                size='icon'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className='border-outline-variant/35 text-on-surface-variant/80 rounded-xl hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:pointer-events-none w-9 h-9 cursor-pointer'
              >
                <ChevronLeft className='size-4' />
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`font-bold w-9 h-9 rounded-xl transition-all text-xs cursor-pointer ${currentPage === pageNum
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white border border-outline-variant/30 text-on-surface-variant/80 hover:bg-slate-50'
                      }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant='outline'
                size='icon'
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className='border-outline-variant/35 text-on-surface-variant/80 rounded-xl hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:pointer-events-none w-9 h-9 cursor-pointer'
              >
                <ChevronRight className='size-4' />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
