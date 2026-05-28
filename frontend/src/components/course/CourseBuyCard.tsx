'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { enrollCourse, checkEnrollment } from '@/api/enrollment';
import { getCourse, getCourses, CourseListItem } from '@/api/courses';
import { getCourseProgress } from '@/api/progress';
import { useAuth } from '@/contexts/AuthContext';
import { appAlert } from '@/components/ui/app-dialog-provider';

import { paymentApi } from '@/api/payment';

interface CourseBuyCardProps {
  courseId: string;
  course: {
    price: number;
    originalPrice: number;
    thumbnailUrl: string;
  };
  enrolled?: boolean;
  onEnroll?: () => void;
  enrolling?: boolean;
  courseDetail?: any;
}

const includes = [
  { icon: 'ondemand_video', text: '42 giờ video theo yêu cầu' },
  { icon: 'terminal',       text: 'Môi trường Lab thực hành ảo' },
  { icon: 'description',    text: '18 tài liệu & cheat sheets' },
  { icon: 'quiz',           text: '12 bài kiểm tra & 3 bài thi thử' },
  { icon: 'all_inclusive',  text: 'Truy cập trọn đời trên mọi thiết bị' },
  { icon: 'workspace_premium', text: 'Chứng chỉ hoàn thành khóa học' },
];

const relatedCourses = [
  {
    title: 'Ethical Hacking: Complete Guide',
    rating: 4.6,
    price: '₫799.000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKHijFMHOx0bIFYYQrZnot196AFa7OhCG6g6THug372jJSk0j6sNBmVt6nV5aPetnnjbKYY_b94N-WR6lqDd2J9SGHoUMnrLZ7uz7QVCq5A5kkd9hEYzMjfaA8LVtOn9zfGD_D4ylDtJfxrmhGM2O6RZwew0t6i4mJc1_NBOHQbl8szoljBhEsmcIOaqxsH5cZ93krU9JICraqFVKql8jS6McURJonNLQ8tnu9KKoE-Tv4Qfhi0VAMz2Ta9UGPqjzOTrW9H2v4on1S',
  },
  {
    title: 'AWS Cloud Security Masterclass',
    rating: 4.7,
    price: '₫1.099.000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDswEDQ066iTZQviul9gS07MDXaKky7Jg4B3KlXc10oYITBpe2RuY0k7tjQEQvQwoBXknOOKw_T7MeJReJaQd9t2EcbAUbkr_Yn-2ZvAM7FfdfHs9_GAcQJlrA0PdcrVTuQGKjEVLSDuvqtE63HMfd0oz-W2KLCxQ0KQmyCHANQnUiqyh9KYbirEaxjae3N8PMCuUD5WdwuUTZ0vexUacLwaz0yqX1wTJfFi7z38Gr-xdcKHcobdtbbpsk-zvox6nNEY9-N2l-z-93O',
  },
];

function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return `${d} ngày ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CourseBuyCard({ 
  course, 
  courseId, 
  enrolled: propsEnrolled, 
  onEnroll: propsOnEnroll, 
  enrolling: propsEnrolling,
  courseDetail
}: CourseBuyCardProps) {
  const discount = Math.round((1 - course.price / course.originalPrice) * 100);
  const countdown = useCountdown(38528000);
  const router = useRouter();
  const { user } = useAuth();

  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number; percent: number } | null>(null);
  const [related, setRelated] = useState<CourseListItem[]>([]);

  // Calculate dynamic includes if courseDetail is provided
  const sections = courseDetail?.sections || [];
  const totalLessons = sections.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0);
  const videoLessons = sections.reduce(
    (acc: number, s: any) => acc + (s.lessons?.filter((l: any) => l.type === 'video').length || 0),
    0
  );
  const quizLessons = sections.reduce(
    (acc: number, s: any) => acc + (s.lessons?.filter((l: any) => l.type === 'quiz').length || 0),
    0
  );
  const textLessons = sections.reduce(
    (acc: number, s: any) => acc + (s.lessons?.filter((l: any) => l.type === 'text').length || 0),
    0
  );

  const calculatedIncludes = courseDetail
    ? [
        ...(videoLessons > 0 ? [{ icon: 'ondemand_video', text: `${videoLessons} bài học video chất lượng` }] : []),
        ...(quizLessons > 0 ? [{ icon: 'quiz', text: `${quizLessons} bài kiểm tra thực hành` }] : []),
        ...(textLessons > 0 ? [{ icon: 'description', text: `${textLessons} tài liệu & bài đọc thêm` }] : []),
        ...(totalLessons === 0 ? [{ icon: 'play_lesson', text: 'Chương trình học đang cập nhật' }] : []),
        { icon: 'all_inclusive', text: 'Truy cập trọn đời trên mọi thiết bị' },
        ...(courseDetail.hasCertificate || courseDetail.visibility === 'public'
          ? [{ icon: 'workspace_premium', text: 'Chứng chỉ hoàn thành khóa học' }]
          : [])
      ]
    : includes;

  useEffect(() => {
    if (courseId) {
      getCourses({ limit: 6 }).then((res) => {
        if (res.success && res.data && res.data.data) {
          const other = res.data.data.filter((c) => c.id !== courseId);
          setRelated(other.slice(0, 2));
        }
      });
    }
  }, [courseId]);

  const coursesToRender = related.length > 0 
    ? related.map((c) => ({
        id: c.id,
        title: c.title,
        rating: 4.8,
        price: Number(c.price) === 0 ? 'Miễn phí' : `₫${Number(c.price).toLocaleString('vi-VN')}`,
        img: c.thumbnailUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsShA9-Xp_8PjhhBjFkZHA1jDKOvzkXeHp3I7H7B-gqYFuWcFn6RJPdvLVEXVqBWocqAAZZJIBeOe-xo-wLAOJVLCJ81R2ShE6LhJOJ8pX3Ao6IcoDMZFnOUAO8QuqSUoIS27bME35VU3h9gKol4s8wE9EzwzqMKbDlcGJgUI87dRSKc7qCStrP2kdQI7Mqaae2X7R_y9kd4DCW0mQeu9DNBscURf5BDIQ9nmQt0HJdc-OowxZ8-__FtxxqSD-yZgSdMP7_CjfEmo6',
      }))
    : relatedCourses.map((c) => ({
        id: null,
        title: c.title,
        rating: c.rating,
        price: c.price,
        img: c.img,
      }));

  const handleRelatedClick = (id: string | null) => {
    if (id) {
      router.push(`/courses/${id}`);
    }
  };

  useEffect(() => {
    if (courseId && user && enrolled) {
      getCourse(courseId).then((res) => {
        if (res.success && res.data) {
          const sections = res.data.sections || [];
          const total = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
          
          getCourseProgress(courseId).then((progRes) => {
            if (progRes.success && progRes.data) {
              const completed = progRes.data.filter((p) => p.isCompleted).length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              setProgress({ completed, total, percent });
            }
          });
        }
      });
    }
  }, [courseId, user, enrolled]);

  useEffect(() => {
    if (propsEnrolled !== undefined) {
      setEnrolled(propsEnrolled);
    }
  }, [propsEnrolled]);

  useEffect(() => {
    if (propsEnrolling !== undefined) {
      setEnrolling(propsEnrolling);
    }
  }, [propsEnrolling]);

  useEffect(() => {
    if (courseId && user) {
      if (propsEnrolled === undefined) {
        checkEnrollment(courseId).then((res) => {
          if (res.success && res.data?.enrolled) {
            setEnrolled(true);
          }
        });
      }
      // Get first lesson for "continue learning" link
      getCourse(courseId).then((res) => {
        if (res.success && res.data) {
          const sections = res.data.sections || [];
          for (const section of sections) {
            if (section.lessons && section.lessons.length > 0) {
              setFirstLessonId(section.lessons[0].id);
              break;
            }
          }
        }
      });
    }
  }, [courseId, user, propsEnrolled]);

  const handleEnroll = async () => {
    if (propsOnEnroll) {
      await propsOnEnroll();
      return;
    }
    if (!courseId) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setEnrolling(true);
    try {
      if (course.price > 0) {
        const res = await paymentApi.createPaymentUrl(courseId);
        console.log(res)
        if (res.paymentUrl) {
          window.location.href = res.paymentUrl;
        } else {
          void appAlert('Không thể tạo giao dịch thanh toán. Vui lòng thử lại.');
        }
      } else {
        const res = await enrollCourse(courseId);
        if (res.success) {
          setEnrolled(true);
          if (firstLessonId) {
            router.push(`/learning/${courseId}/${firstLessonId}`);
          }
        } else {
          void appAlert(res.error || 'Đăng ký thất bại');
        }
      }
    } catch (err: any) {
      void appAlert(err.message || 'Đã xảy ra lỗi');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuy = async () => {
    if (propsOnEnroll) {
      await propsOnEnroll();
      return;
    }
    if (!courseId) return;
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      setIsProcessing(true);
      const res = await paymentApi.createPaymentUrl(courseId);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (error) {
      console.error('Lỗi khi tạo payment request', error);
      void appAlert('Không thể tạo giao dịch. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueLearning = () => {
    if (courseId) {
      router.push(`/learning/${courseId}`);
    }
  };

  return (
    <div className="sticky top-[84px] space-y-5">
      {/* Main card */}
      <div className="glass-panel-elevated rounded-3xl overflow-hidden shadow-2xl shadow-[#006382]/10 border border-[#006382]/15">

        {/* Video preview */}
        <div className="relative h-44 overflow-hidden cursor-pointer group">
          <img
            src={course.thumbnailUrl}
            alt="Course preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center group-hover:bg-slate-950/40 transition-colors">
            <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl play-pulse">
              <span className="material-symbols-outlined text-[#006382] text-3xl ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="text-white text-[11px] font-bold bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full">
              ▶ Xem video giới thiệu · 3:42
            </span>
          </div>
        </div>

        {/* Pricing & Progress */}
        <div className="p-6 space-y-5">
          {!enrolled ? (
            <>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-[#252f43]">
                  ₫{course.price.toLocaleString('vi-VN')}
                </span>
                <div className="mb-1">
                  <span className="text-sm text-[#525b72] line-through">
                    ₫{course.originalPrice.toLocaleString('vi-VN')}
                  </span>
                  <span className="ml-2 text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#b31b25]/5 border border-[#b31b25]/20">
                <span className="material-symbols-outlined text-[#b31b25] text-lg">timer</span>
                <div>
                  <p className="text-xs font-bold text-[#b31b25]">Giá ưu đãi kết thúc sau:</p>
                  <p className="text-sm font-black text-[#b31b25]">{countdown}</p>
                </div>
              </div>
            </>
          ) : (
            /* Progress Bar for Enrolled Users */
            progress && (
              <div className="space-y-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-800">Tiến độ học tập</span>
                  <span className="font-black text-emerald-700">{progress.percent}%</span>
                </div>
                <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Đã hoàn thành <strong className="text-emerald-700 font-bold">{progress.completed}</strong>/{progress.total} bài học
                </p>
              </div>
            )
          )}

          {/* CTA Buttons */}
          {enrolled ? (
            <button
              onClick={handleContinueLearning}
              type="button"
              className="w-full py-4 bg-emerald-600 text-white font-black text-base rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Tiếp tục học
            </button>
          ) : (
            <button
              onClick={course.price > 0 ? handleBuy : handleEnroll}
              disabled={course.price > 0 ? isProcessing : enrolling}
              type="button"
              className="w-full py-4 bg-[#006382] text-white font-black text-base rounded-2xl shadow-xl shadow-[#006382]/30 hover:bg-[#005672] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {(course.price > 0 ? isProcessing : enrolling) ? 'hourglass_empty' : 'bolt'}
              </span>
              {(course.price > 0 ? isProcessing : enrolling) ? 'Đang xử lý...' : 'Đăng ký ngay'}
            </button>
          )}

          <p className="text-center text-[11px] text-[#525b72] flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            Đảm bảo hoàn tiền trong 30 ngày
          </p>
        </div>

        {/* Includes */}
        <div className="px-6 pb-6 space-y-3 border-t border-[#a3adc7]/20 pt-5">
          <h4 className="text-sm font-bold text-[#252f43]">Khóa học bao gồm:</h4>
          <div className="space-y-2.5">
            {calculatedIncludes.map((item) => (
              <div key={item.icon} className="flex items-center gap-3 text-sm text-[#525b72]">
                <span className="material-symbols-outlined text-base text-[#006382]">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share row */}
        <div className="px-6 pb-6 flex gap-3">
          {[
            { icon: 'bookmark', label: 'Lưu' },
            { icon: 'share',    label: 'Chia sẻ' },
            { icon: 'redeem',   label: 'Tặng' },
          ].map((btn) => (
            <button type="button"
              key={btn.icon}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#a3adc7]/40 text-sm text-[#525b72] hover:bg-[#e0e8ff] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Related courses */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <h4 className="text-sm font-bold text-[#252f43] px-2">Khóa học liên quan</h4>
        {coursesToRender.map((c, idx) => (
          <div 
            key={c.title + idx} 
            onClick={() => handleRelatedClick(c.id)}
            className="flex gap-3 hover:bg-[#006382]/5 p-2 rounded-xl transition-colors cursor-pointer group"
          >
            <img src={c.img} alt={c.title} className="w-16 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-100" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#252f43] group-hover:text-[#006382] transition-colors truncate">
                {c.title}
              </p>
              <p className="text-[10px] text-[#525b72]">{c.rating} ★ · {c.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
