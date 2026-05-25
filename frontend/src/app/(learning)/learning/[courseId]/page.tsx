'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourse, CourseDetail } from '@/api/courses';
import { checkEnrollment } from '@/api/enrollment';

export default function LearningCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAll();
  }, [courseId]);

  const fetchAll = async () => {
    try {
      setIsLoading(true);

      // Kiểm tra đã enroll chưa
      const enrollRes = await checkEnrollment(courseId);
      if (enrollRes.success && enrollRes.data && !enrollRes.data.enrolled) {
        router.push(`/courses/${courseId}`);
        return;
      }

      const courseRes = await getCourse(courseId);
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        // Mở rộng tất cả section mặc định
        setExpandedSections(new Set(courseRes.data.sections.map((s) => s.id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allLessons = course?.sections.flatMap((s) =>
    (s.lessons || []).map((l) => ({ ...l, sectionTitle: s.title }))
  ) ?? [];

  const totalLessons = allLessons.length;
  const firstLesson = allLessons[0];

  const typeIcon: Record<string, string> = {
    video: 'play_circle',
    text: 'article',
    quiz: 'quiz',
    file: 'attach_file',
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#0f1524]">
        <div className="w-8 h-8 border-4 border-indigo-800 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#0f1524]">
        <p className="text-slate-400">Không tìm thấy khóa học.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0f1524] text-white flex flex-col">
      {/* Top bar - chỉ back + nút học */}
      <header className="bg-[#161d2e] border-b border-white/10 px-5 py-3.5 flex items-center justify-between shrink-0">
        <Link
          href="/my-courses"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="hidden sm:inline">Khoá học của tôi</span>
        </Link>

        {firstLesson && (
          <Link
            href={`/learning/${courseId}/${firstLesson.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-base">play_arrow</span>
            Bắt đầu học
          </Link>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">

        {/* Course banner */}
        <div className="bg-[#161d2e] rounded-2xl overflow-hidden border border-white/10">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/20 text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </div>
          )}
          <div className="p-6">
            <h2 className="text-2xl font-black text-white">{course.title}</h2>
            {course.description && (
              <div
                className="text-slate-400 text-sm mt-2 leading-relaxed prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            )}
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">list</span>
                {course._count?.sections ?? course.sections.length} phần
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">play_lesson</span>
                {totalLessons} bài học
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">person</span>
                {course.instructor?.fullName || 'Giảng viên'}
              </span>
            </div>
          </div>
        </div>

        {/* Lesson list */}
        <div className="bg-[#161d2e] rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400">playlist_play</span>
              Nội dung khóa học
            </h3>
          </div>

          {course.sections.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
              <p className="text-sm">Khóa học chưa có bài học nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {course.sections.map((section, sIdx) => (
                <div key={section.id}>
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span
                      className={`material-symbols-outlined text-slate-500 text-sm transition-transform duration-200 ${expandedSections.has(section.id) ? 'rotate-90' : ''
                        }`}
                    >
                      chevron_right
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        Phần {sIdx + 1}: {section.title || 'Chưa đặt tên'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {(section.lessons || []).length} bài học
                      </p>
                    </div>
                  </button>

                  {/* Lessons */}
                  {expandedSections.has(section.id) && (
                    <div className="pb-2">
                      {(section.lessons || []).length === 0 ? (
                        <p className="px-14 py-3 text-xs text-slate-600">Phần học chưa có bài nào.</p>
                      ) : (
                        (section.lessons || []).map((lesson, lIdx) => (
                          <Link
                            key={lesson.id}
                            href={`/learning/${courseId}/${lesson.id}`}
                            className="flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors group border-l-2 border-transparent hover:border-indigo-500 ml-4"
                          >
                            {/* Lesson number */}
                            <span className="w-6 h-6 rounded-full bg-white/5 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                              {lIdx + 1}
                            </span>

                            {/* Type icon */}
                            <span
                              className={`material-symbols-outlined text-base shrink-0 ${lesson.type === 'video'
                                  ? 'text-blue-400'
                                  : lesson.type === 'quiz'
                                    ? 'text-purple-400'
                                    : lesson.type === 'file'
                                      ? 'text-amber-400'
                                      : 'text-emerald-400'
                                }`}
                            >
                              {(lesson.type && typeIcon[lesson.type]) || 'article'}
                            </span>

                            {/* Title */}
                            <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                              {lesson.title}
                            </span>

                            {/* Duration */}
                            {(lesson as any).durationSec && (
                              <span className="text-[11px] text-slate-600 shrink-0">
                                {Math.floor((lesson as any).durationSec / 60)}m
                              </span>
                            )}

                            {/* Arrow */}
                            <span className="material-symbols-outlined text-slate-700 text-sm group-hover:text-indigo-400 transition-colors shrink-0">
                              chevron_right
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
