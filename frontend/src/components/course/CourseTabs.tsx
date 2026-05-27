'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CourseOverviewTab } from './tabs/CourseOverviewTab';
import { CourseCurriculumTab } from './tabs/CourseCurriculumTab';
import { CourseInstructorTab } from './tabs/CourseInstructorTab';
import { CourseReviewsTab } from './tabs/CourseReviewsTab';

const tabs = [
  { id: 'overview',    label: 'Tổng quan' },
  { id: 'curriculum',  label: 'Nội dung khóa học' },
  { id: 'instructor',  label: 'Giảng viên' },
  { id: 'reviews',     label: 'Đánh giá' },
] as const;

type TabId = typeof tabs[number]['id'];

interface CourseTabsProps {
  courseId: string;
  course?: any;
  enrolled?: boolean;
}

export function CourseTabs({ courseId, course, enrolled = false }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div>
      {/* Tab nav */}
      <div
        className="flex gap-6 border-b border-[#a3adc7]/30 pb-0 overflow-x-auto no-scrollbar"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button type="button"
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'tab-btn pb-3 text-sm font-semibold whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'tab-active text-[#006382]'
                : 'text-[#525b72] hover:text-[#252f43]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="pt-8">
        {activeTab === 'overview'   && <CourseOverviewTab course={course} />}
        {activeTab === 'curriculum' && <CourseCurriculumTab courseId={courseId} enrolled={enrolled} />}
        {activeTab === 'instructor' && <CourseInstructorTab course={course} />}
        {activeTab === 'reviews'    && <CourseReviewsTab />}
      </div>
    </div>
  );
}
