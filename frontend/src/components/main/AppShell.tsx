'use client';

import { useState } from 'react';
import { MainHeader } from '@/components/main/MainHeader';
import { MainSidebar } from '@/components/main/MainSidebar';
import { cn } from '@/lib/utils';

export function AppShell({
  children,
  contentClassName,
}: {
  children: React.ReactNode;
  contentClassName?: string;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className='flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-sky-500/20'>
      <MainSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <MainHeader onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />
        <main
          className={cn('relative min-h-0 flex-1 overflow-y-auto', contentClassName)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
