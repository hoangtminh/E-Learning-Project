'use client';

import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';

export default function CoursesCatalogPage() {
  const { courses, isLoading, error } = useCourses();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Danh mục khóa học
        </h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          Khám phá các khóa học mới nhất từ Glacier Learning.
        </p>
      </div>

      {isLoading ? (
        <div className='flex items-center gap-2 text-muted-foreground text-sm'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
          <span>Đang tải danh sách khóa học…</span>
        </div>
      ) : error ? (
        <div className='rounded-lg bg-destructive/10 p-4 text-destructive text-sm'>
          <p className='font-medium'>Không thể tải khóa học</p>
          <p>{error}</p>
        </div>
      ) : courses.length === 0 ? (
        <p className='text-muted-foreground text-sm italic'>
          Hiện chưa có khóa học nào được đăng tải.
        </p>
      ) : (
        <ul className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {courses.map((c) => (
            <li
              key={c.id}
              className='glass-elevated group relative flex flex-col rounded-2xl p-5 transition-all hover:ring-2 hover:ring-primary/20'
            >
              <div className='flex-1'>
                <div className='mb-3 flex items-center justify-between'>
                  <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase'>
                    {c.visibility}
                  </span>
                  {c.price != null && (
                    <span className='text-xs font-semibold text-primary'>
                      {c.price === 0
                        ? 'Miễn phí'
                        : `${c.price.toLocaleString()} VNĐ`}
                    </span>
                  )}
                </div>
                <h2 className='text-lg font-bold leading-tight tracking-tight group-hover:text-primary transition-colors'>
                  {c.title}
                </h2>
                <p className='text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed'>
                  {c.description ?? 'Chưa có mô tả cho khóa học này.'}
                </p>
              </div>

              <div className='mt-6 flex items-center justify-between border-t border-white/10 pt-4'>
                <div className='flex items-center gap-2'>
                  <div className='h-6 w-6 rounded-full bg-muted'></div>
                  <span className='text-xs text-muted-foreground'>
                    Giảng viên
                  </span>
                </div>
                <Link
                  href={`/courses/${c.id}`}
                  className='text-xs font-bold text-primary hover:underline'
                >
                  Xem chi tiết →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
