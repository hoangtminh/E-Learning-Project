'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getCourse, CourseDetail } from '@/api/courses';
import { toast } from 'sonner';

interface CourseCurriculumTabProps {
  courseId: string;
  enrolled?: boolean;
}

function LessonStatusIcon({ type }: { type: string }) {
  const stylesMap: Record<string, string> = {
    quiz: 'bg-purple-500/10 text-purple-600 border border-purple-100/50',
    text: 'bg-emerald-500/10 text-emerald-600 border border-emerald-100/50',
    video: 'bg-sky-500/10 text-sky-600 border border-sky-100/50',
  };
  const currentStyle = stylesMap[type] || stylesMap.video;

  return (
    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105', currentStyle)}>
      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
        {type === 'quiz' ? 'quiz' : type === 'text' ? 'article' : 'play_circle'}
      </span>
    </div>
  );
}

function SectionRow({ section, sIdx, courseId, enrolled }: { section: any; sIdx: number; courseId: string; enrolled?: boolean }) {
  const [open, setOpen] = useState(sIdx === 0);
  const router = useRouter();

  const handleLessonClick = (lessonId: string) => {
    if (!enrolled) {
      toast.error('Vui lòng đăng ký khóa học để truy cập bài học này.', {
        position: 'bottom-right',
      });
      return;
    }
    // Navigate to learning workspace. 
    router.push(`/learning/${courseId}/${lessonId}`);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md">
      <button type="button"
        className="w-full flex items-center justify-between px-6 py-4 bg-[#f8fafc]/80 hover:bg-[#006382]/5 transition-colors text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#006382] to-[#008ba8] text-white text-xs font-black flex items-center justify-center flex-shrink-0 shadow-md shadow-[#006382]/20">
            {sIdx + 1}
          </span>
          <div>
            <h3 className="font-extrabold text-[#252f43] text-sm md:text-base leading-snug">{section.title || 'Chưa đặt tên'}</h3>
            <p className="text-[11px] text-[#525b72] font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-[12px] text-[#006382]">school</span>
              {section.lessons?.length || 0} bài học
            </p>
          </div>
        </div>
        <span className={cn('material-symbols-outlined text-[#525b72] transition-transform duration-300 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/50', open && 'rotate-180')}>
          expand_more
        </span>
      </button>

      {open && section.lessons && section.lessons.length > 0 && (
        <div className="border-t border-[#a3adc7]/10 bg-white">
          {section.lessons.map((lesson: any, i: number) => (
            <div
              key={lesson.id}
              onClick={() => handleLessonClick(lesson.id)}
              className={cn(
                'flex items-center gap-4 px-6 py-4 transition-all duration-300 relative border-b border-[#a3adc7]/5 last:border-b-0 overflow-hidden',
                enrolled 
                  ? 'cursor-pointer hover:bg-[#006382]/5 group hover:pl-8' 
                  : 'cursor-not-allowed opacity-80 hover:bg-slate-50/50'
              )}
            >
              {/* Left hover indicator line */}
              {enrolled && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#006382] opacity-0 group-hover:opacity-100 transition-all duration-300" />
              )}
              
              <LessonStatusIcon type={lesson.type} />
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-semibold transition-colors',
                  enrolled ? 'text-[#252f43] group-hover:text-[#006382]' : 'text-slate-500'
                )}>
                  {lesson.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
                  {lesson.type === 'quiz' ? 'Quiz · Trắc nghiệm' : lesson.type === 'text' ? 'Document · Văn bản' : 'Video · Bài giảng'}
                </p>
              </div>
              
              {lesson.durationSec != null && (
                <span className="text-xs text-[#525b72] whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md font-bold">
                  {Math.floor(lesson.durationSec / 60)}m
                </span>
              )}
              
              {enrolled ? (
                <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 material-symbols-outlined text-sm text-[#006382] transition-all duration-300">
                  arrow_forward
                </span>
              ) : (
                <span className="material-symbols-outlined text-sm text-slate-400">
                  lock
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (!section.lessons || section.lessons.length === 0) && (
        <div className="border-t border-[#a3adc7]/10 px-6 py-4 text-sm text-[#525b72] bg-white">
          Phần học này chưa có bài giảng.
        </div>
      )}
    </div>
  );
}

export function CourseCurriculumTab({ courseId, enrolled = false }: CourseCurriculumTabProps) {
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

  const videoCount = sections.reduce((acc: number, s: any) => acc + (s.lessons?.filter((l: any) => l.type === 'video').length || 0), 0);
  const quizCount = sections.reduce((acc: number, s: any) => acc + (s.lessons?.filter((l: any) => l.type === 'quiz').length || 0), 0);
  const textCount = sections.reduce((acc: number, s: any) => acc + (s.lessons?.filter((l: any) => l.type === 'text').length || 0), 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006382]" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
          <span className="text-sm text-[#252f43] font-extrabold">{sections.length} phần học</span>
        </div>
        <div className="flex flex-wrap gap-3.5 text-xs text-[#525b72] font-semibold">
          {videoCount > 0 && (
            <span className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg border border-sky-100">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              {videoCount} bài học video
            </span>
          )}
          {quizCount > 0 && (
            <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
              {quizCount} bài kiểm tra
            </span>
          )}
          {textCount > 0 && (
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>article</span>
              {textCount} tài liệu
            </span>
          )}
        </div>
      </div>

      <div>
        {sections.map((section: any, idx: number) => (
          <SectionRow key={section.id} section={section} sIdx={idx} courseId={courseId} enrolled={enrolled} />
        ))}
      </div>
    </div>
  );
}
