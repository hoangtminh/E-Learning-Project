'use client';

import { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { classroom, loadingClassroom, fetchClassroom } = useClassrooms();

  useEffect(() => {
    if (classroomId && (!classroom || classroom.id !== classroomId)) {
      fetchClassroom(classroomId);
    }
  }, [classroomId, classroom, fetchClassroom]);

  const isAdminOrOwner = classroom?.role === 'owner' || classroom?.role === 'admin';

  if (loadingClassroom) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-slate-50'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-slate-500 text-sm font-medium'>Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAdminOrOwner) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-slate-50 p-6'>
        <div className='max-w-md w-full bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl rounded-3xl p-8 text-center flex flex-col items-center relative overflow-hidden'>
          <div className='absolute -top-10 -left-10 w-40 h-40 bg-red-500/5 rounded-full blur-2xl'></div>
          <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl'></div>
          
          <div className='w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center shadow-inner mb-6 relative z-10 animate-bounce'>
            <span className='material-symbols-outlined text-3xl font-bold'>lock</span>
          </div>
          
          <h2 className='text-2xl font-black text-slate-800 mb-3 relative z-10 tracking-tight'>
            Không Có Quyền Truy Cập
          </h2>
          
          <p className='text-sm text-slate-500 mb-8 leading-relaxed relative z-10'>
            Bạn không có quyền quản trị để vào khu vực này. Chỉ chủ lớp học và quản trị viên mới có thể truy cập các cài đặt nâng cao.
          </p>
          
          <Link
            href={`/classrooms/${classroomId}`}
            className='w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98]'
          >
            Quay lại lớp học
          </Link>
        </div>
      </div>
    );
  }

  const adminTabs = [

    { name: 'Quản lý bài tập', path: `/classrooms/${classroom?.id || classroomId}/admin/tasks`, icon: 'assignment' },
    { name: 'Quản lý tài nguyên', path: `/classrooms/${classroom?.id || classroomId}/admin/files`, icon: 'folder' },
    { name: 'Quản lý thành viên', path: `/classrooms/${classroom?.id || classroomId}/admin/members`, icon: 'group' },
    { name: 'Cài đặt lớp học', path: `/classrooms/${classroom?.id || classroomId}/admin/settings`, icon: 'settings' },
  ];

  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <div className='bg-slate-900 text-white px-3 md:px-6 py-2.5 md:py-4 flex justify-between items-center shadow-md gap-3 shrink-0'>
        <div className='flex items-center gap-2 md:gap-3 min-w-0'>
          <span className='material-symbols-outlined text-indigo-400 text-2xl md:text-3xl shrink-0'>admin_panel_settings</span>
          <div className='min-w-0'>
            <h1 className='text-sm md:text-xl font-bold truncate'>{classroom?.title || 'Dashboard Quản Trị'}</h1>
            <p className='text-slate-400 text-[10px] md:text-xs truncate'>Khu vực dành riêng cho chủ lớp</p>
          </div>
        </div>
        
        <div className='flex items-center gap-2 shrink-0'>
          {/* Mobile Admin Navigation Dropdown */}
          <div className='md:hidden'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors border-0 cursor-pointer' aria-label="Admin menu">
                  <span className='material-symbols-outlined text-[20px]'>settings</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-50'>
                {adminTabs.map((tab) => {
                  const isActive = pathname.startsWith(tab.path);
                  return (
                    <DropdownMenuItem key={tab.path} asChild>
                      <Link
                        href={tab.path}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className='material-symbols-outlined text-[18px]'>{tab.icon}</span>
                        {tab.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link
            href={`/classrooms/${classroomId}`}
            className='flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors text-white shrink-0'
          >
            <span className='material-symbols-outlined text-[16px] md:text-[18px]'>arrow_back</span>
            <span className='hidden xs:inline'>Quay lại</span>
          </Link>
        </div>
      </div>

      <div className='flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full px-3 md:px-6 py-4 md:py-8 gap-4 md:gap-8 min-h-0'>
        {/* Sidebar (Desktop only) */}
        <aside className='hidden md:block w-64 shrink-0'>
          <nav className='flex flex-col gap-1.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-20'>
            {adminTabs.map((tab) => {
              const isActive = pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
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
