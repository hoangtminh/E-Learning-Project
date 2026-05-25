'use client';

import Link from 'next/link';
import { AppShell } from '@/components/main/AppShell';
import { useAuth } from '@/contexts/AuthContext';

export default function InstructorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6'>
        <div className='bg-white max-w-md rounded-2xl p-8 text-center shadow-sm border border-slate-200'>
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">lock</span>
          <h1 className='text-lg font-semibold text-slate-800'>403 — Không có quyền</h1>
          <p className='text-slate-500 mt-2 text-sm'>
            Khu vực giảng viên. Yêu cầu role instructor hoặc admin.
          </p>
          <Link
            href='/dashboard'
            className='text-sky-600 mt-4 inline-block text-sm font-medium hover:underline'
          >
            Về dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
