'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserForbidden } from '@/components/ui/UserForbidden';
import { 
  Users, 
  History, 
  LayoutDashboard, 
  LogOut, 
  Home,
  ShieldCheck
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <UserForbidden />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">GLACIER <span className="text-sky-400">ADMIN</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link 
            href="/administrator" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Tổng quan</span>
          </Link>
          <Link 
            href="/administrator/users" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Quản lý người dùng</span>
          </Link>
          <Link 
            href="/administrator/logs" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <History className="w-5 h-5" />
            <span className="font-medium">Nhật ký hệ thống</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Về Trang chủ</span>
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-bold text-slate-800">Bảng điều khiển quản trị</h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</p>
            </div>
            <img 
              src={user.avatarUrl || 'https://ui-avatars.com/api/?name=' + user.fullName} 
              alt={user.fullName || ''} 
              className="w-10 h-10 rounded-full border border-slate-200"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
