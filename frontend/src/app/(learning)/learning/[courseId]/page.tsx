'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getContinueLearning } from '@/api/progress';

export default function CourseLearningRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchLastLessonAndRedirect = async () => {
      try {
        const res = await getContinueLearning(courseId);
        if (res.success && res.data && res.data.lessonId) {
          router.replace(`/learning/${courseId}/${res.data.lessonId}`);
        } else {
          // If no lesson is found (empty course), redirect back to course details
          setError('Khóa học này hiện chưa có bài học nào.');
          setTimeout(() => {
            router.replace(`/courses/${courseId}`);
          }, 3000);
        }
      } catch (err) {
        console.error('Lỗi khi lấy bài học tiếp theo:', err);
        setError('Đã xảy ra lỗi khi tải bài học tiếp theo.');
        setTimeout(() => {
          router.replace(`/courses/${courseId}`);
        }, 3000);
      }
    };

    fetchLastLessonAndRedirect();
  }, [courseId, router]);

  return (
    <div className="min-h-screen bg-[#0f1524] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <span className="material-symbols-outlined text-3xl text-red-400">warning</span>
            </div>
            <h2 className="text-lg font-bold text-slate-200">Không tìm thấy bài học</h2>
            <p className="text-sm text-slate-400">{error}</p>
            <p className="text-xs text-slate-500">Đang quay lại trang chi tiết khóa học...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Premium Loader */}
            <div className="relative w-20 h-20 mx-auto">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 scale-110" style={{ filter: 'blur(2px)' }} />
              {/* Spinning gradient ring */}
              <div className="w-full h-full rounded-full border-4 border-transparent border-t-indigo-400 border-r-indigo-500 border-b-purple-500 animate-spin" />
              {/* Core icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-indigo-400">auto_stories</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white animate-pulse">Đang chuẩn bị lớp học</h2>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Hệ thống đang mở lại bài học gần nhất của bạn. Vui lòng chờ trong giây lát...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
