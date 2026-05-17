'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCourse, CourseDetail } from '@/api/courses';
import { CourseHero } from '@/components/course/CourseHero';
import { CourseBuyCard } from '@/components/course/CourseBuyCard';
import { CourseTabs } from '@/components/course/CourseTabs';

import { paymentApi } from '@/api/payment';

// Default placeholder thumbnail when course has none
const DEFAULT_THUMBNAIL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDsShA9-Xp_8PjhhBjFkZHA1jDKOvzkXeHp3I7H7B-gqYFuWcFn6RJPdvLVEXVqBWocqAAZZJIBeOe-xo-wLAOJVLCJ81R2ShE6LhJOJ8pX3Ao6IcoDMZFnOUAO8QuqSUoIS27bME35VU3h9gKol4s8wE9EzwzqMKbDlcGJgUI87dRSKc7qCStrP2kdQI7Mqaae2X7R_y9kd4DCW0mQeu9DNBscURf5BDIQ9nmQt0HJdc-OowxZ8-__FtxxqSD-yZgSdMP7_CjfEmo6';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCoLcZt8R31CwX3UiyL5JxZf-X251KAIKT8ZXC5YlL4nUC870JjR0Km4WzFJsip6_pzz0hPTJki_YMdT4TZSVrOZl3RRjcBKEVDVGR6t1x6AsCFBvw6Bl6tIbGWcfu5t9eyI21LtKP0t6YpJPKsV71m8LX8rJSARv-_dVEgT0Gb4NkiEUAp6LQN7RWNKKBkG8X25KKbMzZ4fyxFfCJSWvY0ucPclgX3kUJ0r_IjGymPsg6Xk5RfsyGYhGxDUKl4opdReA3vi4IBvTK3';

/**
 * Map API CourseDetail data into the shape each UI component expects.
 */
function mapCourseToHeroProps(course: CourseDetail) {
  const totalLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0,
  );
  // Estimate ~0.5 hours per lesson as a rough duration calculation
  const totalHours = Math.round(totalLessons * 0.5);

  return {
    title: course.title,
    subtitle: course.description ?? 'Khóa học chất lượng cao trên Glacier Learning.',
    category: course.visibility === 'public' ? 'Phổ biến' : course.visibility,
    level: 'Tất cả trình độ',
    rating: 4.8,
    reviewCount: course._count?.members ? course._count.members * 2 : 0,
    studentCount: course._count?.members ?? 0,
    totalHours,
    updatedAt: new Date(course.createdAt).toLocaleDateString('vi-VN'),
    isBestSeller: (course._count?.members ?? 0) > 50,
    hasCertificate: true,
    thumbnailUrl: course.thumbnailUrl ?? DEFAULT_THUMBNAIL,
    instructor: {
      name: (course.instructor ?? course.owner)?.fullName ?? 'Giảng viên',
      avatarUrl: (course.instructor ?? course.owner)?.avatarUrl ?? DEFAULT_AVATAR,
    },
  };
}

function mapCourseToBuyCardProps(course: CourseDetail) {
  const price = Number(course.price) || 0;
  return {
    price,
    originalPrice: price > 0 ? Math.round(price * 1.5) : 299000,
    thumbnailUrl: course.thumbnailUrl ?? DEFAULT_THUMBNAIL,
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getCourse(courseId);
        if (res.success && res.data) {
          setCourse(res.data);
        } else {
          setError(res.error || 'Không tìm thấy khóa học');
        }
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi tải khóa học');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            Đang tải khóa học…
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-red-400">
              error
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Không tìm thấy khóa học
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              {error || 'Khóa học này có thể đã bị xóa hoặc không tồn tại.'}
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Quay lại danh mục
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ──
  const heroProps = mapCourseToHeroProps(course);
  const buyCardProps = mapCourseToBuyCardProps(course);

  const handleMobileBuy = async () => {
    if (!course) return;
    try {
      const res = await paymentApi.createPaymentUrl(course.id);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (error) {
      console.error('Lỗi khi tạo payment request', error);
      alert('Không thể tạo giao dịch. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Hero banner */}
      <CourseHero 
        course={heroProps} 
        onBuy={handleMobileBuy} 
        price={Number(course.price)} 
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        {/* Left column: Tabs */}
        <div className="min-w-0">
          <CourseTabs courseId={course.id} />
        </div>

        {/* Right column: Buy card */}
        <aside className="hidden lg:block">
          <CourseBuyCard courseId={course.id} course={buyCardProps} />
        </aside>
      </div>

      {/* Mobile sticky buy bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div>
          <span className="text-xl font-black text-slate-900">
            {Number(course.price) === 0
              ? 'Miễn phí'
              : `₫${Number(course.price).toLocaleString('vi-VN')}`}
          </span>
          {Number(course.price) > 0 && (
            <span className="text-xs text-slate-400 line-through ml-2">
              ₫{Math.round(Number(course.price) * 1.5).toLocaleString('vi-VN')}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleMobileBuy}
          className="flex-1 max-w-[200px] py-3 bg-[#006382] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#006382]/25 hover:bg-[#005672] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
}
