'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Home } from 'lucide-react';

export function AdminForbidden() {
  return (
    <div className='flex min-h-[80vh] flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300'>
      <div className='bg-white max-w-lg w-full rounded-3xl p-10 shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col items-center'>
        <div className='w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-6'>
          <ShieldAlert className='w-10 h-10 text-rose-500' />
        </div>
        
        <h1 className='text-2xl font-black text-slate-900 mb-3'>
          Khu vực hạn chế cho Admin
        </h1>
        
        <p className='text-slate-500 leading-relaxed mb-8'>
          Tài khoản quản trị viên không được phép truy cập vào các tính năng dành cho học viên và giảng viên tại đây để đảm bảo an toàn hệ thống.
        </p>

        <div className='flex flex-col w-full gap-3'>
          <Link
            href='/administrator'
            className='flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]'
          >
            <span>Đến Bảng Điều Khiển Admin</span>
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
      
      <div className='mt-8 flex items-center gap-2 text-slate-400 text-sm font-medium'>
        <div className='w-2 h-2 rounded-full bg-rose-500 animate-pulse'></div>
        Hệ thống đang bảo vệ các vùng dữ liệu quan trọng
      </div>
    </div>
  );
}
