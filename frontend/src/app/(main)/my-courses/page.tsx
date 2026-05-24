'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EnrolledCourse, getMyEnrolledCourses } from '@/api/enrollment';
import { getMyTeachingCourses, InstructorCourse } from '@/api/instructor';
import { useAuth } from '@/contexts/AuthContext';

type CourseCardData = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  instructor?: { fullName: string | null } | null;
  enrolledAt?: string;
  visibility?: string;
};

function CourseCard({
  course,
  badge,
  href,
  actionLabel,
}: {
  course: CourseCardData;
  badge: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden group flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
      <Link
        href={href}
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
            {badge}
          </span>
        </div>
      </Link>

      <div className='p-4 flex flex-col flex-1'>
        <Link href={href}>
          <h3 className='font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2 mb-2'>
            {course.title}
          </h3>
        </Link>
        <p className='text-slate-500 text-xs line-clamp-2 mb-4'>
          {course.description || 'Chưa có mô tả cho khóa học này.'}
        </p>

        <div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-100 gap-3'>
          <div className='min-w-0'>
            <p className='text-xs text-slate-500 truncate'>
              {course.instructor?.fullName || 'Giảng viên'}
            </p>
            {course.enrolledAt && (
              <p className='text-[11px] text-slate-400'>
                Tham gia{' '}
                {new Date(course.enrolledAt).toLocaleDateString('vi-VN')}
              </p>
            )}
            {course.visibility && !course.enrolledAt && (
              <p className='text-[11px] text-slate-400 uppercase'>
                {course.visibility}
              </p>
            )}
          </div>
          <Link
            href={href}
            className='px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all active:scale-95 shrink-0'
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [teachingCourses, setTeachingCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canManageCourses = user?.role === 'instructor' || user?.role === 'admin';

  useEffect(() => {
    let mounted = true;

    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const enrolledRes = await getMyEnrolledCourses();
        if (!mounted) return;

        if (enrolledRes.success && enrolledRes.data) {
          setEnrolledCourses(enrolledRes.data);
        } else {
          setError(enrolledRes.error || 'Không thể tải khóa học đã tham gia.');
          return;
        }

        if (canManageCourses) {
          const teachingRes = await getMyTeachingCourses();
          if (!mounted) return;

          if (teachingRes.success && teachingRes.data) {
            setTeachingCourses(teachingRes.data);
          } else {
            setError(teachingRes.error || 'Không thể tải khóa học của tôi.');
          }
        } else {
          setTeachingCourses([]);
        }
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error
            ? err.message
            : 'Không thể tải danh sách khóa học.',
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchCourses();

    return () => {
      mounted = false;
    };
  }, [canManageCourses]);

  return (
    <div className='space-y-10 pb-12 transition-all p-6 md:p-12'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6'>
        <div>
          <h1 className='text-3xl font-black text-slate-900'>
            Khóa học của tôi
          </h1>
          <p className='text-slate-500 mt-1'>
            Theo dõi khóa học đã tham gia và khóa học bạn đang quản lý.
          </p>
        </div>
        <Link
          href='/courses'
          className='text-sky-600 font-semibold hover:bg-sky-50 px-4 py-2 rounded-lg transition-colors'
        >
          Khám phá thêm
        </Link>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-20 text-slate-400'>
          <span className='material-symbols-outlined animate-spin mr-2 text-3xl'>
            progress_activity
          </span>
          <span className='font-medium'>Đang tải dữ liệu...</span>
        </div>
      ) : error ? (
        <div className='rounded-xl bg-red-50 p-6 text-red-600 text-center border border-red-100'>
          <span className='material-symbols-outlined text-4xl mb-2'>
            error
          </span>
          <p className='font-bold text-lg'>Không thể tải khóa học</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      ) : (
        <div className='space-y-12'>
          <section>
            <h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sky-500'>
                menu_book
              </span>
              Khóa học đã tham gia
            </h2>

            {enrolledCourses.length === 0 ? (
              <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
                <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>
                  history_edu
                </span>
                <p className='text-slate-500 font-medium'>
                  Bạn chưa tham gia khóa học nào.
                </p>
                <Link
                  href='/courses'
                  className='text-sky-600 text-sm hover:underline mt-1 inline-block'
                >
                  Khám phá các khóa học ngay
                </Link>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    badge='Đang học'
                    href={`/courses/${course.id}`}
                    actionLabel='Vào học'
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
              <span className='material-symbols-outlined text-indigo-500'>
                video_library
              </span>
              Khóa học của tôi
            </h2>

            {teachingCourses.length === 0 ? (
              <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
                <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>
                  school
                </span>
                <p className='text-slate-500 font-medium'>
                  Bạn chưa có khóa học nào để quản lý.
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {teachingCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    badge='Của tôi'
                    href={`/instructor/studio/${course.id}`}
                    actionLabel='Quản lý'
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
