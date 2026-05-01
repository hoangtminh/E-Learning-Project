'use client';

import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { classroomId } = useParams();
  const pathname = usePathname();
  const { classroom, loadingClassroom, fetchClassroom } = useClassrooms();
  const { user } = useAuth();

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

  const currentUserId = user?.userId || user?.id;
  const isOwner = !!currentUserId && currentUserId === classroom.ownerId;

  const tabs = [
    { name: 'Bảng tin', path: `/classrooms/${classroomId}`, exact: true },
    { name: 'Bài tập', path: `/classrooms/${classroomId}/tasks`, exact: false },
    {
      name: 'Tài liệu',
      path: `/classrooms/${classroomId}/files`,
      exact: false,
    },
    {
      name: 'Thành viên',
      path: `/classrooms/${classroomId}/info`,
      exact: false,
    },
    {
      name: 'Khóa học',
      path: `/classrooms/${classroomId}/courses`,
      exact: false,
    },
  ];

  // Do not show tabs if in admin area
  const isAdminArea = pathname.includes('/admin');

  return (
    <TaskProvider>
      <div className='flex flex-col min-h-screen bg-slate-50 text-slate-800'>
        {/* Classroom header banner */}
        {!isAdminArea && (
          <div className='bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-white flex justify-between items-center'>
            <div>
              <h1 className='text-xl font-bold'>{classroom.title}</h1>
              {classroom.description && (
                <p className='text-sky-100 text-sm mt-0.5 opacity-80'>
                  {classroom.description}
                </p>
              )}
            </div>
            {isOwner && (
              <Link
                href={`/classrooms/${classroomId}/admin`}
                className='bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 backdrop-blur-sm'
              >
                <span className='material-symbols-outlined text-[20px]'>admin_panel_settings</span>
                Dashboard Admin
              </Link>
            )}
          </div>
        )}

        {/* Sub-navigation Tabs */}
        {!isAdminArea && (
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
        )}
        <div className='w-full'>{children}</div>
      </div>
    </TaskProvider>
  );
}
