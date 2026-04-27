'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'quiz';
  duration: string;
  status: 'completed' | 'watching' | 'locked';
}

interface Section {
  id: string;
  number: number;
  title: string;
  lessonCount: number;
  duration: string;
  color: string;
  lessons: Lesson[];
}

const sections: Section[] = [
  {
    id: 's1',
    number: 1,
    title: 'Nền tảng An toàn Thông tin',
    lessonCount: 5,
    duration: '4h 30m',
    color: 'bg-[#006382]/10 text-[#006382]',
    lessons: [
      { id: 'l1', title: 'Bài 1 – Tổng quan về An toàn Thông tin', type: 'video', duration: '45:00', status: 'completed' },
      { id: 'l2', title: 'Bài 2 – Mô hình CIA Triad & Các nguyên tắc bảo mật', type: 'video', duration: '52:00', status: 'watching' },
      { id: 'l3', title: 'Bài 3 – Các loại hình tấn công mạng phổ biến', type: 'video', duration: '38:00', status: 'locked' },
      { id: 'l4', title: 'Bài kiểm tra nhanh – Phần 1', type: 'quiz', duration: '~15 phút', status: 'locked' },
      { id: 'l5', title: 'Bài 4 – Xây dựng môi trường Lab (VirtualBox / VMware)', type: 'video', duration: '1:05:00', status: 'locked' },
    ],
  },
  {
    id: 's2',
    number: 2,
    title: 'Penetration Testing Basics',
    lessonCount: 6,
    duration: '6h 15m',
    color: 'bg-[#6f4b94]/10 text-[#6f4b94]',
    lessons: [
      { id: 'l6', title: 'Bài 6 – Quy trình Penetration Testing theo PTES', type: 'video', duration: '58:00', status: 'locked' },
      { id: 'l7', title: 'Bài 7 – Reconnaissance & Information Gathering', type: 'video', duration: '1:20:00', status: 'locked' },
      { id: 'l8', title: 'Bài 8 – Scanning & Enumeration với Nmap & Metasploit', type: 'video', duration: '1:35:00', status: 'locked' },
    ],
  },
  {
    id: 's3',
    number: 3,
    title: 'Cloud Security & Zero Trust Architecture',
    lessonCount: 5,
    duration: '5h 10m',
    color: 'bg-[#346176]/10 text-[#346176]',
    lessons: [],
  },
];

function LessonStatusIcon({ status, type }: { status: Lesson['status']; type: Lesson['type'] }) {
  if (status === 'completed') {
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-emerald-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>
    );
  }
  if (status === 'watching') {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#006382]/10 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[#006382] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          play_circle
        </span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-[#e0e8ff] flex items-center justify-center flex-shrink-0">
      <span className="material-symbols-outlined text-[#525b72] text-sm">
        {type === 'quiz' ? 'quiz' : 'lock'}
      </span>
    </div>
  );
}

function SectionRow({ section }: { section: Section }) {
  const [open, setOpen] = useState(section.number === 1);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <button type="button"
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#006382]/5 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 text-left">
          <span className={cn('w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0', section.color)}>
            {section.number}
          </span>
          <div>
            <h3 className="font-bold text-[#252f43] text-sm">{section.title}</h3>
            <p className="text-[11px] text-[#525b72]">{section.lessonCount} bài · {section.duration}</p>
          </div>
        </div>
        <span className={cn('material-symbols-outlined text-[#525b72] transition-transform duration-300', open && 'rotate-180')}>
          expand_more
        </span>
      </button>

      {open && section.lessons.length > 0 && (
        <div className="border-t border-[#a3adc7]/10">
          {section.lessons.map((lesson, i) => (
            <div
              key={lesson.id}
              className={cn(
                'flex items-center gap-4 px-6 py-3.5 hover:bg-[#006382]/5 transition-colors cursor-pointer',
                i < section.lessons.length - 1 && 'border-b border-[#a3adc7]/5',
                lesson.status === 'watching' && 'bg-[#006382]/5'
              )}
            >
              <LessonStatusIcon status={lesson.status} type={lesson.type} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', lesson.status === 'watching' ? 'text-[#006382] font-bold' : 'text-[#252f43]')}>
                  {lesson.title}
                </p>
                <p className={cn('text-[11px]', lesson.status === 'watching' ? 'text-[#006382]/60' : 'text-[#525b72]')}>
                  {lesson.type === 'quiz' ? 'Quiz' : 'Video'}
                  {lesson.status === 'watching' && ' · Đang học'}
                </p>
              </div>
              {lesson.status === 'watching' && (
                <span className="text-[10px] font-bold text-[#006382] bg-[#006382]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Đang xem
                </span>
              )}
              <span className="text-[11px] text-[#525b72] whitespace-nowrap">{lesson.duration}</span>
            </div>
          ))}
        </div>
      )}

      {open && section.lessons.length === 0 && (
        <div className="border-t border-[#a3adc7]/10 px-6 py-4 text-sm text-[#525b72]">
          Mở rộng để xem chi tiết các bài học.
        </div>
      )}
    </div>
  );
}

export function CourseCurriculumTab() {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-[#525b72]">
          <strong className="text-[#252f43]">8 phần học</strong>
          {' '}·{' '}
          <strong className="text-[#252f43]">40 bài giảng</strong>
          {' '}·{' '}
          <strong className="text-[#252f43]">42 giờ</strong> tổng thời lượng
        </p>
        <button type="button"
          className="text-[#006382] text-sm font-semibold hover:underline"
          onClick={() => {/* expand all */}}
        >
          Mở rộng tất cả
        </button>
      </div>

      {sections.map((section) => (
        <SectionRow key={section.id} section={section} />
      ))}

      <p className="text-center text-sm text-[#525b72] pt-2">
        ... và <strong className="text-[#006382]">5 phần học</strong> khác
        (Incident Response, Malware Analysis, SIEM, Forensics, Capstone Lab)
      </p>
    </div>
  );
}
