'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { classroom } = useClassrooms();

  const adminTabs = [
    { name: 'Quản lý khóa học', path: `/classrooms/${classroom?.id || classroomId}/admin/courses`, icon: 'menu_book' },
    { name: 'Quản lý bài tập', path: `/classrooms/${classroom?.id || classroomId}/admin/tasks`, icon: 'assignment' },
    { name: 'Quản lý tài nguyên', path: `/classrooms/${classroom?.id || classroomId}/admin/files`, icon: 'folder' },
    { name: 'Quản lý thành viên', path: `/classrooms/${classroom?.id || classroomId}/admin/members`, icon: 'group' },
    { name: 'Cài đặt lớp học', path: `/classrooms/${classroom?.id || classroomId}/admin/settings`, icon: 'settings' },
  ];

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <div className='bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md'>
        <div className='flex items-center gap-3'>
          <span className='material-symbols-outlined text-indigo-400 text-3xl'>admin_panel_settings</span>
          <div>
            <h1 className='text-xl font-bold'>{classroom?.title || 'Dashboard Quản Trị'}</h1>
            <p className='text-slate-400 text-xs'>Khu vực dành riêng cho chủ lớp</p>
          </div>
        </div>
        <Link
          href={`/classrooms/${classroomId}`}
          className='flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-colors'
        >
          <span className='material-symbols-outlined text-[18px]'>arrow_back</span>
          Quay lại lớp học
        </Link>
      </div>

      <div className='flex flex-1 max-w-7xl mx-auto w-full px-6 py-8 gap-8'>
        {/* Sidebar */}
        <aside className='w-64 shrink-0'>
          <nav className='flex flex-col gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm'>
            {adminTabs.map((tab) => {
              const isActive = pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span
                    className='material-symbols-outlined'
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {tab.icon}
                  </span>
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content area */}
        <main className='flex-1 min-w-0'>
          {children}
        </main>
      </div>
    </div>
  );
}
