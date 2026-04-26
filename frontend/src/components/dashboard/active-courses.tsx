'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  instructor?: string;
  progress: number;
  totalHours?: number;
  currentHour?: number;
  nextLesson?: string;
}

interface ActiveCoursesProps {
  courses?: Course[];
  isLoading?: boolean;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Advanced Patterns',
    instructor: 'Nguyen Van A',
    progress: 65,
    totalHours: 24,
    currentHour: 16,
    nextLesson: 'Suspense & Error Boundaries',
  },
  {
    id: '2',
    title: 'Web Design Fundamentals',
    instructor: 'Tran Thi B',
    progress: 42,
    totalHours: 20,
    currentHour: 8,
    nextLesson: 'Color Theory & Typography',
  },
  {
    id: '3',
    title: 'JavaScript Deep Dive',
    instructor: 'Le Van C',
    progress: 78,
    totalHours: 30,
    currentHour: 23,
    nextLesson: 'Async Patterns & Promises',
  },
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className='h-2 w-full overflow-hidden rounded-full bg-primary/10'>
      <div
        className='h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300'
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function ActiveCourses({
  courses = mockCourses,
  isLoading,
}: ActiveCoursesProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-lg font-semibold tracking-tight'>
          Khóa học đang học
        </h2>
        <p className='text-muted-foreground text-sm'>
          {courses.length} khóa học · tiến độ trung bình{' '}
          {Math.round(
            courses.reduce((sum, c) => sum + c.progress, 0) / courses.length,
          )}
          %
        </p>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='glass-elevated animate-pulse rounded-xl p-4 h-32'
            />
          ))}
        </div>
      ) : (
        <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
          {courses.map((course) => (
            <Link
              key={course.id}
              href={
                course.role === 'admin'
                  ? ROUTES.admin
                  : course.role === 'instructor'
                    ? ROUTES.instructor
                    : `${ROUTES.learning}/${course.id}`
              }
              className={cn(
                'glass-elevated group relative block rounded-xl p-4 transition-all hover:border-primary/30',
              )}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='font-semibold tracking-tight group-hover:text-primary transition-colors'>
                    {course.title}
                  </h3>
                  {course.instructor && (
                    <p className='text-muted-foreground text-xs mt-1'>
                      👨‍🏫 {course.instructor}
                    </p>
                  )}
                </div>
                <ChevronRight className='h-5 w-5 text-primary/50 group-hover:translate-x-1 transition-transform' />
              </div>

              {/* Progress Bar */}
              <div className='mt-3 space-y-1'>
                <ProgressBar value={course.progress} />
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-primary'>
                    {course.progress}% hoàn thành
                  </span>
                  {course.totalHours && (
                    <span className='text-xs text-muted-foreground'>
                      {course.currentHour ?? 0}/{course.totalHours}h
                    </span>
                  )}
                </div>
              </div>

              {/* Next Lesson */}
              {course.nextLesson && (
                <div className='mt-3 pt-3 border-t border-primary/10'>
                  <p className='text-muted-foreground text-xs mb-1'>
                    Bài học tiếp theo
                  </p>
                  <p className='text-sm font-medium text-primary'>
                    {course.nextLesson}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <Link
        href={ROUTES.courses}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        Xem tất cả khóa học →
      </Link>
    </div>
  );
}
