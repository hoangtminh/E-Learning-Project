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
} from 'lucide-react';

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
    <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden group flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
      <Link
        href={`/courses/${course.id}`}
        className='relative h-40 overflow-hidden bg-slate-100 block'
      >
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          />
        ) : (
          <div className='w-full h-full bg-sky-50 flex flex-col items-center justify-center gap-2 p-4 text-sky-500'>
            <span className='material-symbols-outlined text-4xl'>
              menu_book
            </span>
            <span className='text-xs font-bold uppercase tracking-wider text-center line-clamp-2'>
              {course.title}
            </span>
          </div>
        )}
        <div className='absolute top-3 left-3 px-2 py-1 bg-slate-900/70 backdrop-blur-md rounded flex items-center gap-1'>
          <span className='text-white text-[10px] font-bold uppercase tracking-wider'>
            {isFree ? 'Miễn phí' : 'Trả phí'}
          </span>
        </div>
      </Link>

      <div className='p-4 flex flex-col flex-1'>
        <Link href={`/courses/${course.id}`}>
          <h3 className='font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2 mb-2'>
            {course.title}
          </h3>
        </Link>
        <p className='text-slate-500 text-xs line-clamp-2 mb-4'>
          {stripHtml(course.description) || 'Chưa có mô tả cho khóa học này.'}
        </p>

        <div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-100 gap-3'>
          <div className='min-w-0'>
            <p className='text-xs text-slate-500 truncate'>
              {course.instructor?.fullName || 'Giảng viên'}
            </p>
            <p className='text-sm font-black text-slate-800'>
              {isFree ? 'Miễn phí' : `${Number(course.price).toLocaleString()}đ`}
            </p>
          </div>
          <Link
            href={`/courses/${course.id}`}
            className='px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all active:scale-95 shrink-0'
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
    <div className='space-y-10 pb-12 transition-all p-6 md:p-12'>
      <div className='flex min-h-[92px] flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-black text-slate-900'>Khóa học</h1>
          <p className='text-slate-500 mt-1'>
            Khám phá khóa học công khai và bắt đầu lộ trình học phù hợp.
          </p>
        </div>
        <Link
          href='/my-courses'
          className='inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border-0 bg-sky-50 px-4 text-sm font-semibold text-sky-600 shadow-xs transition-colors hover:bg-sky-100'
        >
          Khóa học của tôi
          <ArrowRight className='size-4' />
        </Link>
      </div>

      <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200'>
        <div className='relative flex-1 max-w-md'>
          <Input
            className='w-full bg-slate-50 pl-10 pr-4 py-2 rounded-lg text-sm border-slate-200 focus:bg-white transition-colors'
            placeholder='Tìm kiếm khóa học...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className='absolute left-3 top-2.5 size-4 text-slate-400' />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5'>
            <Filter className='size-3.5' /> Lọc
          </span>
          <div className='flex gap-1 bg-slate-100 p-1 rounded-lg text-xs'>
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'free', label: 'Miễn phí' },
              { value: 'paid', label: 'Trả phí' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilterType(item.value as CatalogFilter)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${filterType === item.value
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='h-72 bg-slate-100 animate-pulse rounded-2xl border border-slate-200'
            />
          ))}
        </div>
      ) : error ? (
        <div className='rounded-xl bg-red-50 p-6 text-red-600 text-center border border-red-100'>
          <span className='material-symbols-outlined text-4xl mb-2'>
            error
          </span>
          <p className='font-bold text-lg'>Không thể tải khóa học</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
          <SearchX className='size-10 text-slate-300 mx-auto mb-3' />
          <p className='text-slate-500 font-medium'>
            Không tìm thấy khóa học nào phù hợp.
          </p>
          <Button
            variant='outline'
            className='mt-4'
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className='space-y-8'>
          <section>
            <h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sky-500'>
                menu_book
              </span>
              Tất cả khóa học
            </h2>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {paginatedCourses.map((course) => (
                <CatalogCourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>

          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-2 pt-2'>
              <Button
                variant='outline'
                size='icon'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className='border-slate-200 text-slate-600 rounded-lg hover:bg-sky-600 hover:text-white hover:border-sky-600 disabled:opacity-50 disabled:pointer-events-none'
              >
                <ChevronLeft className='size-4' />
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`font-bold w-10 h-10 rounded-lg transition-all ${currentPage === pageNum
                        ? 'bg-sky-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
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
                className='border-slate-200 text-slate-600 rounded-lg hover:bg-sky-600 hover:text-white hover:border-sky-600 disabled:opacity-50 disabled:pointer-events-none'
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
