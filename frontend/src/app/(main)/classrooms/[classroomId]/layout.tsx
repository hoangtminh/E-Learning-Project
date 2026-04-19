'use client';

import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';

export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { classroomId } = useParams();
  const pathname = usePathname();
  const { classroom, loadingClassroom, fetchClassroom } = useClassrooms();

  useEffect(() => {
    if (classroomId) fetchClassroom(classroomId as string);
  }, [classroomId, fetchClassroom]);

  if (loadingClassroom)
    return (
      <div className='p-8 text-center text-slate-500'>
        Đang tải thông tin lớp học...
      </div>
    );
  if (!classroom)
    return (
      <div className='p-8 text-center text-red-500'>Không tìm thấy lớp học</div>
    );

  const tabs = [
    { name: 'Bảng tin', path: `/classrooms/${classroomId}`, exact: true },
    { name: 'Bài tập', path: `/classrooms/${classroomId}/tasks`, exact: false },
    {
      name: 'Tài liệu',
      path: `/classrooms/${classroomId}/files`,
      exact: false,
    },
    {
      name: 'Thông tin',
      path: `/classrooms/${classroomId}/info`,
      exact: false,
    },
  ];

  return (
    <div className='flex flex-col min-h-screen bg-slate-50 text-slate-800'>
      {/* Sub-navigation Tabs */}
      <nav className='sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 border-b border-slate-200'>
        <div className='flex gap-8'>
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.path
              : pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`py-4 text-sm transition-all ${isActive ? 'font-semibold border-b-2 border-sky-600 text-sky-600' : 'font-medium text-slate-500 hover:text-sky-600'}`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className='w-full'>{children}</div>
    </div>
  );
}
