'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldX, ArrowRight, Home } from 'lucide-react';

export function UserForbidden() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-50 animate-in fade-in zoom-in duration-300'>
      <div className='bg-white max-w-lg w-full rounded-3xl p-10 shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col items-center'>
        <div className='w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-6'>
          <ShieldX className='w-10 h-10 text-amber-500' />
        </div>
        
        <h1 className='text-2xl font-black text-slate-900 mb-3'>
          403 — Truy cập bị từ chối
        </h1>
        
        <p className='text-slate-500 leading-relaxed mb-8'>
          Bạn không có quyền quản trị viên để truy cập vào khu vực này. Vui lòng quay lại trang dành cho học viên hoặc trang chủ.
        </p>

        <div className='flex flex-col w-full gap-3'>
          <Link
            href='/dashboard'
            className='flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-sky-700 transition-all active:scale-[0.98]'
          >
            <span>Về Bảng Điều Khiển Học Viên</span>
            <ArrowRight className='w-4 h-4' />
          </Link>
          
          <Link
            href='/'
            className='flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]'
          >
            <Home className='w-4 h-4' />
            <span>Về Trang Chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
