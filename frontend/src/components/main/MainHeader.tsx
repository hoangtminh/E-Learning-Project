'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function MainHeader() {
  const pathname = usePathname();
  // Hàm định dạng đường dẫn thành Title hiển thị đơn giản
  const pageTitle =
    pathname.split('/').filter(Boolean).pop()?.toUpperCase() || 'DASHBOARD';

  return (
    <header className='h-16 bg-[#88b6cf] backdrop-blur-xl border-b border-sky-100 shadow-sm flex items-center justify-between px-8 z-10 sticky top-0 shrink-0'>
      <div className='flex items-center gap-4'>
        <h2 className='text-xl font-bold text-slate-900 tracking-tight'>
          {pageTitle}
        </h2>
      </div>
      <div className='flex items-center gap-5'>
        <div className='relative'>
          <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm'>
            search
          </span>
          <input
            className='bg-slate-100 border border-slate-200 rounded-full py-1.5 pl-9 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-sky-500/20 outline-none w-48 transition-all'
            placeholder='Tìm kiếm...'
            type='text'
          />
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='text-slate-500 hover:text-sky-500 bg-slate-100 hover:bg-sky-50 rounded-full'
        >
          <span className='material-symbols-outlined text-xl'>
            notifications
          </span>
        </Button>
        <div className='flex items-center gap-3 border-l border-slate-200 pl-5'>
          <div className='text-right hidden sm:block'>
            <p className='text-sm font-bold text-slate-800 leading-tight'>
              Admin
            </p>
            <p className='text-[10px] text-slate-500 font-medium'>
              admin@glacier.com
            </p>
          </div>
          <div className='w-10 h-10 rounded-full border-2 border-sky-200 overflow-hidden shadow-sm cursor-pointer'>
            <img
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuCTGacKIl7Cr0IvXMarpaJA7tl0dNQTkmAJ9skYJiBuHrDT0sSKbJJiL6VHw8XfT82fZRGUTCFJQfc6QNU__2OsJycWuO6dXepscCiB7PeJXYeIlf42T8w_wrZW4WUaHWjmjkkV4uKxwZFqDVvVWLGRsDL_7r3_GJuHiD1Ugf3LB8t83QUug4IWyShjOf0y3T6pmjtbYMxZAgz6xgpsmU-YZ1ZeqL9z5CruGL2UzDgS62afS_SWhbsAhG9KpkXrkDaKfWAKzcoUqSb8'
              alt='User Avatar'
              className='w-full h-full object-cover'
            />
          </div>
        </div>
      </div>
    </header>
  );
}
