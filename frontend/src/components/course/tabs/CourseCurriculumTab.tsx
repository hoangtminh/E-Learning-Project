'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getCourse, CourseDetail } from '@/api/courses';

interface CourseCurriculumTabProps {
  courseId: string;
}

function LessonStatusIcon({ type }: { type: string }) {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#e0e8ff] flex items-center justify-center flex-shrink-0">
      <span className="material-symbols-outlined text-[#525b72] text-sm">
        {type === 'quiz' ? 'quiz' : type === 'text' ? 'article' : 'play_circle'}
      </span>
    </div>
  );
}

function SectionRow({ section, sIdx, courseId }: { section: any; sIdx: number; courseId: string }) {
  const [open, setOpen] = useState(sIdx === 0);
  const router = useRouter();

  const handleLessonClick = (lessonId: string) => {
    // Navigate to learning workspace. 
    // If not enrolled, learning workspace will redirect back.
    router.push(`/learning/${courseId}/${lessonId}`);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden mb-4">
      <button type="button"
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#006382]/5 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 text-left">
          <span className="w-7 h-7 rounded-lg bg-[#006382]/10 text-[#006382] text-xs font-black flex items-center justify-center flex-shrink-0">
            {sIdx + 1}
          </span>
          <div>
            <h3 className="font-bold text-[#252f43] text-sm">{section.title || 'Chưa đặt tên'}</h3>
            <p className="text-[11px] text-[#525b72]">
              {section.lessons?.length || 0} bài học
            </p>
          </div>
        </div>
        <span className={cn('material-symbols-outlined text-[#525b72] transition-transform duration-300', open && 'rotate-180')}>
          expand_more
        </span>
      </button>

      {open && section.lessons && section.lessons.length > 0 && (
        <div className="border-t border-[#a3adc7]/10">
          {section.lessons.map((lesson: any, i: number) => (
            <div
              key={lesson.id}
              onClick={() => handleLessonClick(lesson.id)}
              className={cn(
                'flex items-center gap-4 px-6 py-3.5 hover:bg-[#006382]/5 transition-colors cursor-pointer group',
                i < section.lessons.length - 1 && 'border-b border-[#a3adc7]/5'
              )}
            >
              <LessonStatusIcon type={lesson.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#252f43] truncate group-hover:text-[#006382] transition-colors">
                  {lesson.title}
                </p>
                <p className="text-[11px] text-[#525b72]">
                  {lesson.type === 'quiz' ? 'Quiz' : lesson.type === 'text' ? 'Văn bản' : 'Video'}
                </p>
              </div>
              {lesson.durationSec != null && (
                <span className="text-[11px] text-[#525b72] whitespace-nowrap">
                  {Math.floor(lesson.durationSec / 60)} phút
                </span>
              )}
              <span className="opacity-0 group-hover:opacity-100 material-symbols-outlined text-sm text-[#006382] transition-opacity">
                arrow_forward
              </span>
            </div>
          ))}
        </div>
      )}

      {open && (!section.lessons || section.lessons.length === 0) && (
        <div className="border-t border-[#a3adc7]/10 px-6 py-4 text-sm text-[#525b72]">
          Phần học này chưa có bài giảng.
        </div>
      )}
    </div>
  );
}

export function CourseCurriculumTab({ courseId }: CourseCurriculumTabProps) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      getCourse(courseId).then((res) => {
        if (res.success && res.data) {
          setCourse(res.data);
        }
        setIsLoading(false);
      });
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !course.sections || course.sections.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-slate-200 shadow-sm">
        <span className="material-symbols-outlined text-4xl text-slate-300">library_books</span>
        <p className="text-slate-500 mt-2 text-sm">Khóa học này chưa có nội dung nào.</p>
      </div>
    );
  }

  const sections = course.sections;
  const totalLessons = sections.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#525b72]">
          <strong className="text-[#252f43]">{sections.length} phần học</strong>
          {' '}·{' '}
          <strong className="text-[#252f43]">{totalLessons} bài giảng</strong>
        </p>
      </div>

      <div>
        {sections.map((section: any, idx: number) => (
          <SectionRow key={section.id} section={section} sIdx={idx} courseId={courseId} />
        ))}
      </div>
    </div>
  );
}
