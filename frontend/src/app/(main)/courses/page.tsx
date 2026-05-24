'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CourseCard } from '@/components/course/CourseCard';
import { Search, Filter, SearchX, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function CoursesCatalogPage() {
  const { courses, isLoading, error } = useCourses();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const publicCourses = courses.filter((c) => c.visibility === 'public');

  const filteredCourses = publicCourses.filter((course) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = course.title.toLowerCase().includes(query);
      const matchDesc = course.description?.toLowerCase().includes(query) || false;
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Type Filter (Free/Paid)
    if (filterType === 'free' && Number(course.price) !== 0) return false;
    if (filterType === 'paid' && Number(course.price) === 0) return false;

    return true;
  });

  // Pagination configuration (8 items per page)
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className='max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen pb-12 transition-all'>
      {/* Hero Header Section */}
      <section className='relative overflow-hidden rounded-2xl bg-slate-900 aspect-[21/9] md:aspect-[4/1] flex flex-col justify-center px-8 md:px-12 group shadow-lg'>
        <div className='absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10'></div>
        <div className='absolute inset-0 z-0'>
          <img
            className='w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700'
            src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'
            alt='Hero background'
          />
        </div>
        <div className='relative z-20 max-w-2xl'>
          <span className='inline-block px-3 py-1 rounded-full bg-sky-400/20 text-sky-300 text-xs font-bold tracking-widest uppercase mb-4 border border-sky-400/30'>
            Khóa Học Trực Tuyến
          </span>
          <h2 className='text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-md'>
            Khám Phá <span className='text-sky-400'>Khóa Học</span>
          </h2>
          <p className='text-slate-300 text-sm md:text-base leading-relaxed max-w-xl'>
            Mở khóa hàng trăm khóa học chất lượng từ các chuyên gia hàng đầu. Bắt đầu hành trình nâng cao kỹ năng của bạn ngay hôm nay.
          </p>
        </div>
      </section>

      {/* Header and Search/Filters Bar */}
      <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs'>
        <div className='relative flex-1 max-w-md'>
          <Input
            className='w-full bg-slate-50/50 pl-10 pr-4 py-2 rounded-lg text-sm border-slate-200 focus:bg-white transition-colors'
            placeholder='Tìm kiếm khóa học...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className='absolute left-3 top-2.5 size-4 text-slate-400' />
        </div>

        <div className='flex flex-wrap items-center gap-4 justify-between md:justify-end'>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5'>
              <Filter className='size-3.5' /> Lọc:
            </span>
            <div className='flex gap-1 bg-slate-100 p-1 rounded-lg text-xs'>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType('free')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  filterType === 'free'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Miễn phí
              </button>
              <button
                onClick={() => setFilterType('paid')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  filterType === 'paid'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Trả phí
              </button>
            </div>
          </div>

          <Link
            href='/my-courses'
            className='text-sky-600 hover:text-sky-700 font-semibold text-sm flex items-center gap-1 hover:underline whitespace-nowrap self-center'
          >
            Đến Khóa học của tôi <ArrowRight className='size-4' />
          </Link>
        </div>
      </div>

      {/* Main Catalog View */}
      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='h-72 bg-slate-200/60 animate-pulse rounded-2xl border border-slate-100' />
          ))}
        </div>
      ) : error ? (
        <div className='rounded-xl bg-red-50 p-6 text-red-600 text-center border border-red-100'>
          <p className='font-bold text-lg'>Không thể tải khóa học</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className='text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center space-y-4'>
          <SearchX className='size-12 text-slate-300' />
          <p className='text-slate-500 font-medium text-lg'>
            Không tìm thấy khóa học nào phù hợp.
          </p>
          <Button
            variant='outline'
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
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {paginatedCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-2 pt-8'>
              <Button
                variant='outline'
                size='icon'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className='border-slate-200 text-slate-600 rounded-lg hover:bg-sky-500 hover:text-white hover:border-sky-500 disabled:opacity-50 disabled:pointer-events-none'
              >
                <ChevronLeft className='size-4' />
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`font-bold w-10 h-10 rounded-lg transition-all ${
                      currentPage === pageNum
                        ? 'bg-sky-500 text-white'
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className='border-slate-200 text-slate-600 rounded-lg hover:bg-sky-500 hover:text-white hover:border-sky-500 disabled:opacity-50 disabled:pointer-events-none'
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
