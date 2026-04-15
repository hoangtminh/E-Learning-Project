'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen bg-slate-50 font-sans selection:bg-sky-500/20 text-slate-900 overflow-hidden'>
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <div className='flex-1 overflow-y-auto relative'>{children}</div>
      </div>
    </div>
  );
}
