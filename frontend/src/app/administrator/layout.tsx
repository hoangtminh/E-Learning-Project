'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserForbidden } from '@/components/ui/UserForbidden';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LogOut, ChevronDown, Home } from 'lucide-react';

const navItems = [
  { href: '/administrator', label: 'Tổng quan', icon: 'dashboard', exact: true },
  { href: '/administrator/users', label: 'Quản lý người dùng', icon: 'groups', exact: false },
  { href: '/administrator/logs', label: 'Nhật ký hệ thống', icon: 'history', exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return <UserForbidden />;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen overflow-hidden bg-slate-50 flex font-sans">
        {/* Backdrop for mobile */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-20 h-screen bg-[#0a0e1a] text-slate-300 flex flex-col border-r border-white/10 shrink-0 transition-all duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'lg:w-[60px]' : 'lg:w-[220px]'} w-[220px]`}
        >
          {/* Collapse toggle (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-6 bg-[#006382] border-2 border-[#0a0e1a] text-white rounded-full w-7 h-7 hidden lg:flex items-center justify-center shadow-md hover:bg-[#0091aa] z-50 transition-colors focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          {/* Logo & Close Button */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sky-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
              </div>
              <span className={`font-black text-lg text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                Glacier <span className="text-sky-400 font-bold text-xs uppercase tracking-wider ml-0.5">Admin</span>
              </span>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] block">close</span>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-2 space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar">
            <div>
              <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 transition-all duration-300 ${isCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
                Quản trị viên
              </p>
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  const link = (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-400 font-semibold'
                          : 'hover:bg-white/5 hover:text-white text-slate-400'
                      } ${isCollapsed ? 'lg:justify-center lg:px-2' : 'px-3'}`}
                    >
                      <span
                        className="material-symbols-outlined text-[20px] shrink-0"
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {item.icon}
                      </span>
                      <span className={`text-sm transition-all duration-300 ${isCollapsed ? 'lg:hidden' : 'block'}`}>{item.label}</span>
                    </Link>
                  );
                  return (
                    <div key={item.label}>
                      {/* Tooltip for desktop collapsed */}
                      <div className={isCollapsed ? 'hidden lg:block' : 'hidden'}>
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white font-medium ml-2">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {/* Normal link for mobile & desktop expanded */}
                      <div className={isCollapsed ? 'block lg:hidden' : 'block'}>
                        {link}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Sidebar bottom: Về trang chủ */}
          <div className="border-t border-white/10 p-3 shrink-0">
            <div className={isCollapsed ? 'hidden lg:block' : 'hidden'}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className="flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">home</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white font-medium ml-2">
                  Về trang chủ
                </TooltipContent>
              </Tooltip>
            </div>
            <div className={isCollapsed ? 'block lg:hidden' : 'block'}>
              <Link
                href="/"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span className="text-sm font-medium">Về trang chủ</span>
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
            <div className="flex items-center gap-3">
              {/* Hamburger Toggle Button */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px] block">menu</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                {navItems.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label ?? 'Admin'}
              </div>
            </div>
            <div className="flex items-center gap-3 relative">
              <button onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 px-2.5 rounded-xl transition-all border border-slate-100 hover:border-slate-200 cursor-pointer text-left focus:outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{user?.fullName || 'Admin'}</p>
                  <p className="text-xs text-sky-600 font-bold uppercase tracking-wider">Administrator</p>
                </div>
                <img
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'A')}&background=0ea5e9&color=fff`}
                  alt={user?.fullName || ''}
                  className="w-10 h-10 rounded-full border-2 border-sky-200 object-cover"
                />
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-48 overflow-hidden py-1">
                  <Link href="/" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Home className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Về trang chủ</span>
                  </Link>
                  <hr className="border-slate-100" />
                  <button onClick={() => { void logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer text-left focus:outline-none">
                    <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

