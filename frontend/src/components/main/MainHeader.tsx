'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { apiGet } from '@/api/client';

interface MainHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function MainHeader({ breadcrumbs }: MainHeaderProps = {}) {
  const pathname = usePathname();
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>(
    {},
  );

  const segments = pathname.split('/').filter(Boolean);

  useEffect(() => {
    const currentSegments = pathname.split('/').filter(Boolean);
    const fetchDynamicLabels = async () => {
      const newLabels: Record<string, string> = {};
      let hasNew = false;
      for (let i = 0; i < currentSegments.length; i++) {
        if (currentSegments[i] === 'classrooms' && currentSegments[i + 1]) {
          const id = currentSegments[i + 1];
          try {
            const res = await apiGet<any>(`/classrooms/${id}`);
            if (res.success && res.data) {
              newLabels[id] = res.data.title;
              hasNew = true;
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      if (hasNew) {
        setDynamicLabels((prev) => ({ ...prev, ...newLabels }));
      }
    };

    fetchDynamicLabels();
  }, [pathname]);

  const defaultBreadcrumbs = [
    ...segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      let label = segment.replace(/-/g, ' ');

      // Kiểm tra nếu segment giống định dạng của UUID hoặc dài hơn 20 kí tự
      const isIdPattern =
        segment.length >= 24 || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(segment);

      if (dynamicLabels[segment]) {
        label = dynamicLabels[segment];
      } else if (isIdPattern) {
        label = 'Đang tải...';
      }

      return { label, href };
    }),
  ];

  const displayBreadcrumbs =
    breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

  return (
    <header className='h-14 bg-[#7DD3FC] backdrop-blur-xl border-b border-sky-100 shadow-sm flex items-center justify-between px-8 z-10 sticky top-0 shrink-0'>
      <div className='flex items-center gap-2'>
        <nav
          className='flex items-center gap-2 capitalize'
          aria-label='Breadcrumb'
        >
          {displayBreadcrumbs.map((crumb, i) => (
            <span key={i} className='flex items-center gap-2'>
              {i > 0 && (
                <span className='material-symbols-outlined text-slate-800 text-sm'>
                  chevron_right
                </span>
              )}
              {crumb.href && i < displayBreadcrumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className='text-slate-900 hover:text-slate-900 font-semibold text-lg transition-colors'
                >
                  {crumb.label}
                </Link>
              ) : (
                <h2 className='text-xl font-bold text-slate-900 tracking-tight truncate max-w-xs'>
                  {crumb.label}
                </h2>
              )}
            </span>
          ))}
        </nav>
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
