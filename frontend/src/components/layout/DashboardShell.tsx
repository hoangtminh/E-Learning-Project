'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { SideNav } from '@/components/layout/SideNav';
import { MobileNav } from '@/components/layout/MobileNav';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main
        id="main-content"
        className={cn(
          'flex-1 flex flex-col min-h-screen pb-16 md:pb-0',
          'transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'md:ml-20' : 'md:ml-64'
        )}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
