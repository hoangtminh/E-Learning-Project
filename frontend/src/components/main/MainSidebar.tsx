'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';

const NAV_SECTIONS = [
  {
    label: 'Học tập',
    items: [
      { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
      { name: 'Khóa học', icon: 'school', path: '/courses' },
      { name: 'Khoá học của tôi', icon: 'bookmark', path: '/my-courses' },
      { name: 'Lớp học', icon: 'groups', path: '/classrooms' },
      { name: 'Bài tập', icon: 'assignment', path: '/assignments' },
    ],
  },
  {
    label: 'Cộng đồng',
    items: [
      { name: 'Video Call', icon: 'videocam', path: '/call' },
      { name: 'Tin nhắn', icon: 'chat_bubble', path: '/chat' },
    ],
  },
  {
    label: 'Cá nhân',
    items: [
      { name: 'Hồ sơ', icon: 'person', path: '/profile' },
      { name: 'Cài đặt', icon: 'settings', path: '/settings' },
    ],
  },
];

const MainSidebar = memo(() => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={{ width: 220, opacity: 0, x: -50 }}
        animate={{ width: isCollapsed ? 60 : 220, opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="h-screen bg-[#0a0e1a] text-slate-300 flex flex-col border-r border-white/10 relative z-20 shrink-0"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-6 bg-[#006382] border-2 border-[#0a0e1a] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-[#0091aa] z-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-sky-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-black text-lg text-white whitespace-nowrap overflow-hidden"
              >
                Glacier
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1"
                  >
                    {section.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                  const link = (
                    <Link
                      href={item.path}
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
                      {!isCollapsed && <span className="text-sm">{item.name}</span>}
                    </Link>
                  );
                  return isCollapsed ? (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white font-medium ml-2">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={item.name}>{link}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User bottom */}
        <div className="border-t border-white/10 p-3 shrink-0">
          <Link
            href="/profile"
            className={`flex items-center gap-3 rounded-xl p-2 hover:bg-white/5 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-sky-400/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#006382] to-sky-400 flex items-center justify-center text-white text-xs font-black shrink-0 ring-2 ring-sky-400/30">
                {initials}
              </div>
            )}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-bold text-white whitespace-nowrap truncate max-w-[110px]">{user?.fullName || 'Học viên'}</p>
                  <p className="text-[10px] text-slate-500 whitespace-nowrap truncate max-w-[110px]">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
});

MainSidebar.displayName = 'MainSidebar';
export { MainSidebar };
