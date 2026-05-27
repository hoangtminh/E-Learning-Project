'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CourseListItem } from '@/api/courses';

interface CourseCardProps {
  course: CourseListItem;
}

export function CourseCard({ course }: CourseCardProps) {
  const isFree = Number(course.price) === 0;

  return (
    <div className='bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden group flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 h-full'>
      <div className='relative h-48 overflow-hidden bg-slate-100'>
        <Link href={`/courses/${course?.id}`} className='block w-full h-full'>
          <Avatar className='w-full h-full rounded-none after:rounded-none after:border-0'>
            <AvatarImage
              src={course?.thumbnailUrl || undefined}
              alt={course?.title}
              className='w-full h-full object-cover rounded-none group-hover:scale-110 transition-transform duration-700'
            />
            <AvatarFallback className='w-full h-full rounded-none bg-sky-50 flex flex-col items-center justify-center text-sky-500 font-bold select-none gap-2 p-4'>
              <span className='material-symbols-outlined text-4xl'>
                menu_book
              </span>
              <span className='text-xs uppercase tracking-wider text-center line-clamp-2'>
                {course?.title}
              </span>
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
      
      <div className='p-5 flex flex-col flex-grow'>
        <div className='flex justify-between items-start mb-2'>
          <Link href={`/courses/${course?.id}`} className='block w-full'>
            <h3 className='font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2'>
              {course?.title}
            </h3>
          </Link>
        </div>
        
        <p className='text-slate-500 text-xs mb-4 line-clamp-2'>
          {course?.description || 'Chưa có mô tả cho khóa học này.'}
        </p>
        
        <div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-100'>
          <span className='text-lg font-black text-slate-800'>
            {isFree ? 'Miễn phí' : `${Number(course?.price).toLocaleString()}đ`}
          </span>
          <Button asChild>
            <Link href={`/courses/${course.id}`}>
              Đăng ký
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
