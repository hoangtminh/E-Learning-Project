'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronRight,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGet } from '@/api/client';
import Link from 'next/link';

interface MainHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function MainHeader({ breadcrumbs }: MainHeaderProps = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
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
    <header className='h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm flex items-center justify-between px-8 z-10 sticky top-0 shrink-0'>
      <div className='flex items-center gap-2'>
        <nav
          className='flex items-center gap-2 capitalize'
          aria-label='Breadcrumb'
        >
          {displayBreadcrumbs.map((crumb, i) => (
            <span key={i} className='flex items-center gap-2'>
              {i > 0 && <ChevronRight className='size-4 text-slate-400' />}

              {crumb.href && i < displayBreadcrumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className='text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors'
                >
                  {crumb.label}
                </Link>
              ) : (
                <h2 className='text-sm font-semibold text-slate-900 truncate max-w-xs'>
                  {crumb.label}
                </h2>
              )}
            </span>
          ))}
        </nav>
      </div>
      <div className='flex items-center gap-4'>
        <div className='relative hidden md:block'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4' />
          <input
            className='bg-slate-100 border-none rounded-full py-1.5 pl-9 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-sky-500/20 outline-none w-48 transition-all'
            placeholder='Tìm kiếm...'
            type='text'
          />
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-full'
        >
          <Bell className='size-5' />
        </Button>
        <div className='h-6 w-px bg-slate-200 mx-1' />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='flex items-center gap-3 cursor-pointer group'>
              <div className='text-right hidden sm:block'>
                <p className='text-sm font-semibold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors'>
                  {user?.name || 'User'}
                </p>
                <p className='text-[10px] text-slate-500 font-medium'>
                  {user?.email || 'user@glacier.com'}
                </p>
              </div>
              <Avatar className='h-9 w-9 border-2 border-slate-100 group-hover:border-sky-200 transition-all shadow-sm'>
                <AvatarImage src={(user as any)?.avatar} alt={user?.name} />
                <AvatarFallback className='bg-sky-50 text-sky-600 font-bold'>
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-auto ring-1 ring-slate-500'
          >
            <DropdownMenuItem
              className='cursor-pointer gap-2 hover:bg-sky-200 focus:bg-sky-200 focus:text-sky-600'
              onClick={() => router.push('/profile')}
            >
              <User className='size-4' />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='cursor-pointer gap-2 hover:bg-sky-200 focus:bg-sky-200 focus:text-sky-600'
              onClick={() => router.push('/settings')}
            >
              <Settings className='size-4' />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              className='cursor-pointer gap-2 hover:bg-red-200'
              onClick={logout}
            >
              <LogOut className='size-4 text-red-600' />
              <span className='text-red-600'>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
