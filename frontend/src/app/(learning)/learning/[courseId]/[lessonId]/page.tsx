'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getCourse, CourseDetail } from '@/api/courses';
import { checkEnrollment } from '@/api/enrollment';
import { SectionWithLessons, LessonItem } from '@/api/instructor';

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-900 text-slate-400 text-sm">
      <div className="w-6 h-6 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

export default function LearningLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any | null>(null);
  const [sections, setSections] = useState<SectionWithLessons[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'discuss' | 'notes' | 'resources'>('notes');

  useEffect(() => {
    fetchAll();
  }, [courseId, lessonId]);

  const fetchAll = async () => {
    try {
      setIsLoading(true);

      // Check enrollment
      const enrollRes = await checkEnrollment(courseId);
      if (enrollRes.success && enrollRes.data && !enrollRes.data.enrolled) {
        router.push(`/courses/${courseId}`);
        return;
      }

      // Fetch course with sections & lessons
      const courseRes = await getCourse(courseId);
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        const sects = courseRes.data.sections || [];
        setSections(sects as any);
        setExpandedSections(new Set(sects.map((s: any) => s.id)));

        // Find current lesson
        for (const section of sects) {
          const found = (section as any).lessons?.find((l: any) => l.id === lessonId);
          if (found) {
            setCurrentLesson(found);
            break;
          }
        }
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

  // Find prev/next lesson
  const allLessons: { lesson: any; sectionTitle: string }[] = [];
  sections.forEach((s: any) => {
    (s.lessons || []).forEach((l: any) => {
      allLessons.push({ lesson: l, sectionTitle: s.title });
    });
  });
  const currentIndex = allLessons.findIndex((item) => item.lesson.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Total lessons and completed count
  const totalLessons = allLessons.length;
  const completedPercent = totalLessons > 0 ? Math.round(((currentIndex + 1) / totalLessons) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1524]">
        <div className="w-8 h-8 border-4 border-indigo-800 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1524] text-white flex flex-col">
      {/* Top bar */}
      <header className="bg-[#161d2e] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">{course?.title}</h1>
            <p className="text-[11px] text-slate-400 truncate">{currentLesson?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>{currentIndex + 1}/{totalLessons}</span>
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${completedPercent}%` }} />
            </div>
            <span>{completedPercent}%</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video / Content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video player */}
          <div className="relative aspect-video w-full bg-black shrink-0">
            {currentLesson?.type === 'video' && currentLesson?.contentUrl ? (
              <ReactPlayer
                src={currentLesson.contentUrl}
                width="100%"
                height="100%"
                controls
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            ) : currentLesson?.type === 'quiz' && currentLesson?.contentUrl ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-[#1a2235]">
                <div className="text-center space-y-4">
                  <span className="material-symbols-outlined text-5xl text-purple-500">quiz</span>
                  <h3 className="text-xl font-bold text-white">Bài kiểm tra</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">Bài học này là một bài kiểm tra trắc nghiệm. Hãy làm bài để đánh giá kiến thức của bạn.</p>
                  <Link href={`/quizzes/${currentLesson.contentUrl}`} target="_blank" className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                    Làm bài Quiz ngay
                  </Link>
                </div>
              </div>
            ) : currentLesson?.type === 'text' || currentLesson?.body ? (
              <div className="absolute inset-0 overflow-y-auto p-8 bg-[#1a2235]">
                <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
                  <h2>{currentLesson.title}</h2>
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.body || '<p class="text-slate-400">Nội dung trống.</p>' }} />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <div className="text-center space-y-2">
                  <span className="material-symbols-outlined text-4xl">play_disabled</span>
                  <p className="text-sm">Bài học chưa có nội dung video.</p>
                  {currentLesson?.contentUrl && (
                    <a href={currentLesson.contentUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline text-sm">
                      Mở link nội dung →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-white/5">
            {prevLesson ? (
              <Link
                href={`/learning/${courseId}/${prevLesson.lesson.id}`}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Bài trước
              </Link>
            ) : <div />}
            {nextLesson ? (
              <Link
                href={`/learning/${courseId}/${nextLesson.lesson.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Bài tiếp theo
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            ) : (
              <span className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Đã hoàn thành khóa học!
              </span>
            )}
          </div>

          {/* Bottom tabs */}
          <div className="border-t border-white/10 px-6">
            <div className="flex gap-6 pt-1">
              {[
                { id: 'discuss' as const, label: 'Thảo luận', icon: 'forum' },
                { id: 'notes' as const, label: 'Ghi chú', icon: 'edit_note' },
                { id: 'resources' as const, label: 'Tài nguyên', icon: 'folder' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="py-6 text-sm text-slate-400">
              {activeTab === 'discuss' && (
                <div className="space-y-3">
                  <p>Khu vực thảo luận — sẽ tích hợp Socket.io chat trong phiên bản tiếp theo.</p>
                </div>
              )}
              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <p>Ghi chú cá nhân — liên kết với timestamp video. Tính năng đang phát triển.</p>
                </div>
              )}
              {activeTab === 'resources' && (
                <div className="space-y-3">
                  <p>Tài liệu đính kèm bài giảng. Tính năng đang phát triển.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar — Lesson list */}
        <aside className="w-80 bg-[#161d2e] border-l border-white/10 overflow-y-auto hidden lg:block shrink-0">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-sm font-bold text-white">Nội dung khóa học</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{totalLessons} bài học</p>
          </div>

          <div className="divide-y divide-white/5">
            {sections.map((section: any, sIdx: number) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <span className={`material-symbols-outlined text-slate-500 text-sm transition-transform ${expandedSections.has(section.id) ? 'rotate-90' : ''}`}>
                    chevron_right
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-300 truncate">
                      Phần {sIdx + 1}: {section.title || 'Chưa đặt tên'}
                    </p>
                    <p className="text-[10px] text-slate-500">{section.lessons?.length || 0} bài</p>
                  </div>
                </button>

                {expandedSections.has(section.id) && (
                  <div className="pb-2">
                    {(section.lessons || []).map((lesson: any) => {
                      const isActive = lesson.id === lessonId;
                      return (
                        <Link
                          key={lesson.id}
                          href={`/learning/${courseId}/${lesson.id}`}
                          className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-indigo-500/15 text-indigo-400 border-l-2 border-indigo-500'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                            {lesson.type === 'video' ? 'play_circle' : lesson.type === 'quiz' ? 'quiz' : 'article'}
                          </span>
                          <span className="truncate text-xs">{lesson.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
