'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, Settings, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { apiGet } from '@/api/client';
import Link from 'next/link';

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  courses: 'Khóa học',
  'my-courses': 'Khoá học của tôi',
  classrooms: 'Lớp học',
  assignments: 'Bài tập',
  call: 'Video Call',
  chat: 'Tin nhắn',
  profile: 'Hồ sơ',
  settings: 'Cài đặt',
  notes: 'Ghi chú',
  quizzes: 'Bài kiểm tra',
  resources: 'Tài nguyên',
  pathway: 'Lộ trình',
  community: 'Cộng đồng',
  instructor: 'Giảng dạy',
  studio: 'Studio',
  learning: 'Học bài',
  new: 'Tạo mới',
  edit: 'Chỉnh sửa',
  take: 'Làm bài',
  result: 'Kết quả',
};

export function MainHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const segments = pathname.split('/').filter(Boolean);

  // Fetch dynamic labels (classroom/course names) for breadcrumb
  useEffect(() => {
    const fetchDynamicLabels = async () => {
      const newLabels: Record<string, string> = {};
      let changed = false;
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (dynamicLabels[seg]) continue;
        const isId = seg.length >= 20 || /^[0-9a-f-]{24,}/i.test(seg);
        if (!isId) continue;
        const parent = segments[i - 1];
        const grandparent = segments[i - 2];
        let endpoint = '';
        if (parent === 'classrooms') endpoint = `/classrooms/${seg}`;
        else if (parent === 'courses') endpoint = `/courses/${seg}`;
        // learning/[courseId] → fetch course title
        else if (parent === 'learning') endpoint = `/courses/${seg}`;
        if (endpoint) {
          try {
            const res = await apiGet<any>(endpoint);
            if (res.success && res.data?.title) {
              newLabels[seg] = res.data.title;
              changed = true;
              // If this is a lesson (grandparent = 'learning'), fetch lesson name too
              if (grandparent === 'learning' && res.data?.sections) {
                // Already handled by course fetch - lesson id is current seg's NEXT segment
              }
            }
          } catch { /* ignore */ }
        }
        // learning/[courseId]/[lessonId] → fetch lesson title from course sections
        if (grandparent === 'learning' && !newLabels[seg]) {
          const courseId = segments[i - 1];
          try {
            const res = await apiGet<any>(`/courses/${courseId}`);
            if (res.success && res.data?.sections) {
              const allLessons = res.data.sections.flatMap((s: any) => s.lessons || []);
              const lesson = allLessons.find((l: any) => l.id === seg);
              if (lesson?.title) {
                newLabels[seg] = lesson.title;
                changed = true;
              }
            }
          } catch { /* ignore */ }
        }
      }
      if (changed) setDynamicLabels((prev) => ({ ...prev, ...newLabels }));
    };
    fetchDynamicLabels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Một số segment không có trang index, redirect về trang khác
  const SEGMENT_HREF_OVERRIDES: Record<string, string> = {
    learning: '/my-courses',
    instructor: '/instructor/studio',
  };

  const breadcrumbs = segments.map((seg, i) => {
    const defaultHref = '/' + segments.slice(0, i + 1).join('/');
    const href = SEGMENT_HREF_OVERRIDES[seg] ?? defaultHref;
    const isId = seg.length >= 20;
    let label = SEGMENT_LABELS[seg] || seg.replace(/-/g, ' ');
    if (dynamicLabels[seg]) label = dynamicLabels[seg];
    else if (isId) label = 'Chi tiết';
    return { label, href };
  });

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const initials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-10 sticky top-0 shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        {breadcrumbs.length === 0 ? (
          <Link href='/' className='font-black text-slate-900 hover:text-sky-600 transition-colors'>
            Glacier Learning
          </Link>
        ) : (
          breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 text-slate-400" />}
              {i < breadcrumbs.length - 1 ? (
                <Link href={crumb.href} className="text-slate-500 hover:text-slate-900 font-medium capitalize transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-bold text-slate-900 capitalize">{crumb.label}</span>
              )}
            </span>
          ))
        )}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-slate-100 rounded-full py-1.5 pl-9 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-[#006382]/20 focus:bg-white outline-none w-44 transition-all focus:w-56 border border-transparent focus:border-[#006382]/20"
            placeholder="Tìm kiếm khóa học..."
            type="text"
          />
        </div>

        <NotificationBell />
        <div className="h-5 w-px bg-slate-200" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 cursor-pointer group outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#006382] transition-colors truncate max-w-[120px]">
                  {user?.fullName || 'Học viên'}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{user?.email}</p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-slate-100 group-hover:border-[#006382]/30 transition-all shadow-sm">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-[#006382] to-sky-400 text-white font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 ring-1 ring-slate-200 shadow-xl rounded-2xl p-1.5">
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || 'Học viên'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 rounded-xl hover:bg-[#006382]/10 focus:bg-[#006382]/10 hover:text-[#006382] focus:text-[#006382] text-slate-700"
              onClick={() => router.push('/profile')}
            >
              <User className="size-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 rounded-xl hover:bg-[#006382]/10 focus:bg-[#006382]/10 hover:text-[#006382] focus:text-[#006382] text-slate-700"
              onClick={() => router.push('/settings')}
            >
              <Settings className="size-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 rounded-xl text-slate-700 hover:bg-red-50 focus:bg-red-50 hover:text-red-600 focus:text-red-600"
              onClick={logout}
            >
              <LogOut className="size-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
