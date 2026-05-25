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
        <motion.aside
          initial={{ width: 220, opacity: 0, x: -50 }}
          animate={{ width: isCollapsed ? 60 : 220, opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="h-screen bg-[#0a0e1a] text-slate-300 flex flex-col border-r border-white/10 relative z-20 shrink-0"
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-6 bg-[#006382] border-2 border-[#0a0e1a] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-[#0091aa] z-50 transition-colors focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          {/* Logo */}
          <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-sky-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-black text-lg text-white whitespace-nowrap overflow-hidden"
                >
                  Glacier <span className="text-sky-400 font-bold text-xs uppercase tracking-wider ml-0.5">Admin</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-2 space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar">
            <div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1"
                  >
                    Quản trị viên
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  const link = (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-400 font-semibold'
                          : 'hover:bg-white/5 hover:text-white text-slate-400'
                      } ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}
                    >
                      <span
                        className="material-symbols-outlined text-[20px] shrink-0"
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="text-sm">{item.label}</span>}
                    </Link>
                  );
                  return isCollapsed ? (
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white font-medium ml-2">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={item.label}>{link}</div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Sidebar bottom: Về trang chủ */}
          <div className="border-t border-white/10 p-3 shrink-0">
            {isCollapsed ? (
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
            ) : (
              <Link
                href="/"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span className="text-sm font-medium">Về trang chủ</span>
              </Link>
            )}
          </div>
        </motion.aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {navItems.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label ?? 'Admin'}
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
                  <button onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer text-left focus:outline-none">
                    <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

