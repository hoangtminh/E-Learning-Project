'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, BookOpen, User, AlertCircle, LogOut } from 'lucide-react';
import { EnrolledCourse, getMyEnrolledCourses } from '@/api/enrollment';
import { getMyTeachingCourses, InstructorCourse } from '@/api/instructor';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { appConfirm } from '@/components/ui/app-dialog-provider';
import { toast } from 'sonner';
import { stripHtml } from '@/lib/utils';
import { motion } from 'framer-motion';

type CourseCardData = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  instructor?: { fullName: string | null } | null;
  enrolledAt?: string;
  visibility?: string;
  progressPercent?: number;
};

function CourseCard({
  course,
  badge,
  href,
  actionLabel,
  onLeave,
}: {
  course: CourseCardData;
  badge: string;
  href: string;
  actionLabel: string;
  onLeave?: (id: string) => void;
}) {
  return (
    <div className='bg-white border border-outline-variant/30 rounded-2xl overflow-hidden group flex flex-col hover:shadow-xs hover:border-primary/45 transition-all duration-300 relative h-full'>
      {/* Leave Course button */}
      {onLeave && (
        <div className='absolute top-2 right-2 sm:top-3 sm:right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLeave(course.id);
            }}
            className='bg-error hover:bg-error/90 text-white px-2 py-1.5 rounded-lg flex items-center justify-center transition-colors shadow-md text-[10px] sm:text-xs font-bold gap-1 cursor-pointer border-0 active:scale-95'
            title='Rời khóa học'
          >
            <LogOut className='size-3 sm:size-3.5' />
            <span className='hidden xs:inline'>Rời khóa</span>
          </button>
        </div>
      )}

      <Link
        href={href}
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
            {badge}
          </span>
        </div>
      </Link>

      <div className='p-2.5 sm:p-4.5 flex flex-col flex-1'>
        <Link href={href}>
          <h3 className='font-bold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1 sm:mb-1.5 h-8 sm:h-10 text-xs sm:text-base'>
            {course.title}
          </h3>
        </Link>
        <p className='text-on-surface-variant/80 text-xs line-clamp-2 mb-4 h-8 leading-relaxed hidden sm:block'>
          {stripHtml(course.description) || 'Chưa có mô tả chi tiết cho khóa học này.'}
        </p>

        {/* Dynamic Progress Bar for Enrolled Courses */}
        {course.enrolledAt && course.progressPercent !== undefined && (
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              <span>Tiến độ</span>
              <span className='text-primary'>{course.progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className='mt-auto flex items-center justify-between pt-2.5 sm:pt-4 border-t border-outline-variant/20 gap-2 sm:gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='text-[8px] sm:text-[10px] text-on-surface-variant/70 truncate flex items-center gap-1 sm:gap-1.5 mb-1'>
              <User className='size-2.5 sm:size-3 text-on-surface-variant/50' />
              <span className='truncate'>{course.instructor?.fullName || 'Chưa cập nhật'}</span>
            </p>
            {course.enrolledAt && (
              <p className='text-[9px] sm:text-[11px] font-bold text-on-surface-variant/85'>
                Đã tham gia: {new Date(course.enrolledAt).toLocaleDateString('vi-VN')}
              </p>
            )}
            {course.visibility && !course.enrolledAt && (
              <p className='text-[9px] sm:text-[11px] font-bold text-on-surface-variant/85 uppercase'>
                {course.visibility === 'public' ? 'Công khai' : course.visibility}
              </p>
            )}
          </div>
          <Link
            href={href}
            className='px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl bg-primary text-white text-[10px] sm:text-xs font-bold hover:bg-primary-dim shadow-xs transition-all active:scale-[0.97] shrink-0'
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
  const { unenrollCourse } = useCourses();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [teachingCourses, setTeachingCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canManageCourses = user?.role === 'instructor' || user?.role === 'admin';

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const enrolledRes = await getMyEnrolledCourses();

      if (enrolledRes.success && enrolledRes.data) {
        setEnrolledCourses(enrolledRes.data);
      } else {
        setError(enrolledRes.error || 'Không thể tải khóa học đã tham gia.');
        return;
      }

      if (canManageCourses) {
        const teachingRes = await getMyTeachingCourses();

        if (teachingRes.success && teachingRes.data) {
          setTeachingCourses(teachingRes.data);
        } else {
          setError(teachingRes.error || 'Không thể tải khóa học của tôi.');
        }
      } else {
        setTeachingCourses([]);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải danh sách khóa học.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [canManageCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleLeaveCourse = async (courseId: string) => {
    const confirmed = await appConfirm({
      title: 'Rời khóa học?',
      description: 'Bạn có chắc chắn muốn rời khỏi khóa học này? Mọi tiến độ học tập có thể bị mất.',
      confirmLabel: 'Rời khóa',
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await unenrollCourse(courseId);
        toast.success('Đã rời khỏi khóa học thành công');
        fetchCourses(); // Refresh list
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể rời khóa học';
        toast.error(message);
      }
    }
  };

  return (
    <div className='pb-16 transition-all p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8 bg-surface-container-lowest min-h-screen text-on-surface relative'>
      <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6 relative z-10'>
        <div>
          <h1 className='text-xl sm:text-2xl font-black text-on-surface tracking-tight'>
            Khóa học của tôi
          </h1>
          <p className='text-xs sm:text-sm text-on-surface-variant/85 mt-1 max-w-2xl'>
            Theo dõi khóa học đã tham gia và khóa học bạn đang quản lý.
          </p>
        </div>
        <Link
          href='/courses'
          className='inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border-0 bg-primary/10 hover:bg-primary/15 px-4 text-xs font-bold text-primary shadow-xs transition-all active:scale-[0.98] self-start sm:self-center'
        >
          Khám phá thêm
          <ArrowRight className='size-3.5' />
        </Link>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 relative z-10'>
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
      ) : (
        <div className='space-y-12 relative z-10'>
          <section>
            <div className='flex items-center gap-2 mb-5'>
              <BookOpen className='size-5 text-primary' />
              <h2 className='text-sm sm:text-base font-black text-on-surface uppercase tracking-wider'>
                Khóa học đã tham gia
              </h2>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className='text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant/40 relative z-10'>
                <BookOpen className='size-8 text-on-surface-variant/35 mx-auto mb-3' />
                <p className='text-sm text-on-surface-variant font-bold mb-1'>
                  Bạn chưa tham gia khóa học nào.
                </p>
                <Link
                  href='/courses'
                  className='text-primary text-xs font-bold hover:underline mt-2 inline-block'
                >
                  Khám phá các khóa học ngay
                </Link>
              </div>
            ) : (
              <motion.div 
                className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
              >
                {enrolledCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
                    }}
                  >
                    <CourseCard
                      course={course}
                      badge='Đang học'
                      href={`/courses/${course.id}`}
                      actionLabel='Vào học'
                      onLeave={handleLeaveCourse}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {canManageCourses && (
            <section>
              <div className='flex items-center gap-2 mb-5'>
                <User className='size-5 text-indigo-500' />
                <h2 className='text-sm sm:text-base font-black text-on-surface uppercase tracking-wider'>
                  Khóa học của tôi (Quản lý)
                </h2>
              </div>

              {teachingCourses.length === 0 ? (
                <div className='text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant/40 relative z-10'>
                  <User className='size-8 text-on-surface-variant/35 mx-auto mb-3' />
                  <p className='text-sm text-on-surface-variant font-bold mb-1'>
                    Bạn chưa có khóa học nào để quản lý.
                  </p>
                </div>
              ) : (
                <motion.div 
                  className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {teachingCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
                      }}
                    >
                      <CourseCard
                        course={course}
                        badge='Của tôi'
                        href={`/instructor/studio/${course.id}`}
                        actionLabel='Quản lý'
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
