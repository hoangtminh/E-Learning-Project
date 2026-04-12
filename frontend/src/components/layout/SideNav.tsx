'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/',             icon: 'dashboard',    label: 'Dashboard' },
  { href: '/courses',      icon: 'storefront',   label: 'Course Store' },
  { href: '/my-courses/1',   icon: 'library_books',label: 'My Courses',  filled: true },
  { href: '/classrooms',   icon: 'groups',       label: 'Classrooms' },
  { href: '/messages',     icon: 'chat',         label: 'Chats' },
  { href: '/assignments',  icon: 'assignment',   label: 'Assignments' },
  { href: '/live',         icon: 'live_tv',      label: 'Live Study' },
];

export function SideNav() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      id="sidebar"
      className={cn(
        'fixed left-0 top-0 h-full flex flex-col z-50 border-r border-sky-300/10',
        'bg-slate-900/75 backdrop-blur-2xl shadow-2xl text-sm font-medium',
        'hidden md:flex transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed ? 'sidebar-collapsed w-20' : 'w-64'
      )}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          'sidebar-header flex items-center gap-3 px-6 py-8',
          collapsed && 'justify-center px-0'
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-sky-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            ac_unit
          </span>
        </div>
        <div className="sidebar-header-text">
          <h1 className="text-2xl font-black text-sky-400 tracking-tight leading-none">
            Glacier
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-sky-300/60 font-bold">
            E-Learning
          </p>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                collapsed ? 'justify-center px-0' : '',
                isActive
                  ? 'bg-sky-300/20 text-sky-300 border-r-2 border-sky-300'
                  : 'text-slate-400 hover:text-sky-100 hover:bg-white/5 border-r-2 border-transparent'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span
                className="material-symbols-outlined flex-shrink-0"
                style={
                  isActive && item.filled
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="sidebar-text truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Actions ── */}
      <div className="px-4 py-4 border-t border-sky-300/10 space-y-1">
        <button type="button" className="sidebar-text w-full mb-3 py-3 px-4 rounded-xl bg-sky-400/10 border border-sky-400/30 text-sky-300 hover:bg-sky-400/20 transition-all font-semibold flex items-center justify-center gap-2 text-sm">
          <span className="material-symbols-outlined text-sm">add</span>
          <span>New Study Session</span>
        </button>

        <Link
          href="/settings"
          className={cn(
            'nav-item flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-sky-100 hover:bg-white/5 transition-all',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="sidebar-text">Settings</span>
        </Link>

        <Link
          href="/profile"
          className={cn(
            'nav-item flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-sky-100 hover:bg-white/5 transition-all',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Profile' : undefined}
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="sidebar-text">Profile</span>
        </Link>

        {/* Toggle Button */}
        <button type="button"
          onClick={toggle}
          className={cn(
            'nav-item flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-sky-100 hover:bg-white/5 transition-all w-full',
            collapsed && 'justify-center px-0'
          )}
          title="Toggle Sidebar"
        >
          <span className="material-symbols-outlined">
            {collapsed ? 'menu' : 'menu_open'}
          </span>
          <span className="sidebar-text">Toggle Sidebar</span>
        </button>
      </div>
    </aside>
  );
}
