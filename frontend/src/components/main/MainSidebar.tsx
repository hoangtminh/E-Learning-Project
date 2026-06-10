'use client';

import { memo, useState, useEffect } from 'react';
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
      { name: 'Bài kiểm tra', icon: 'quiz', path: '/quizzes' },
      { name: 'Ghi chú', icon: 'edit_note', path: '/notes' },
    ],
  },
  {
    label: 'Cộng đồng',
    items: [
      { name: 'Video Call', icon: 'videocam', path: '/call' },
      { name: 'Tin nhắn', icon: 'chat_bubble', path: '/chat' },
    ],
  },
];

const INSTRUCTOR_NAV_ITEM = {
  name: 'Instructor Studio',
  icon: 'workspace_premium',
  path: '/instructor/studio',
};

const MainSidebar = memo(({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px matches Tailwind md
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [pathname, isMobile]);

  const initials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const navSections =
    user?.role === 'instructor' || user?.role === 'admin'
      ? [
          ...NAV_SECTIONS,
          {
            label: 'Giảng dạy',
            items: [INSTRUCTOR_NAV_ITEM],
          },
        ]
      : NAV_SECTIONS;

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Backdrop for mobile drawer */}
        <AnimatePresence>
          {isMobile && isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black z-40 backdrop-blur-xs"
            />
          )}
        </AnimatePresence>

        <motion.aside
          initial={{ x: isMobile ? -240 : -50, opacity: 0 }}
          animate={{
            x: isMobile ? (isOpen ? 0 : -240) : 0,
            width: isMobile ? 240 : (isCollapsed ? 60 : 220),
            opacity: 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`h-screen bg-[#0a0e1a] text-slate-300 flex flex-col border-r border-white/10 shrink-0 ${
            isMobile ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'relative z-20'
          }`}
        >
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-3.5 bg-[#006382] border-2 border-[#0a0e1a] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-[#0091aa] z-50 transition-colors hidden md:flex"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          {/* Logo Section */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sky-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
              </div>
              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
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
            {isMobile && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close navigation sidebar"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-2 space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar">
            {navSections.map((section) => (
              <div key={section.label}>
                <AnimatePresence>
                  {(!isCollapsed || isMobile) && (
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
                        } ${(isCollapsed && !isMobile) ? 'justify-center px-2' : 'px-3'}`}
                      >
                        <span
                          className="material-symbols-outlined text-[20px] shrink-0"
                          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {item.icon}
                        </span>
                        {(!isCollapsed || isMobile) && <span className="text-sm">{item.name}</span>}
                      </Link>
                    );
                    return (isCollapsed && !isMobile) ? (
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
              className={`flex items-center gap-3 rounded-xl p-2 hover:bg-white/5 transition-colors ${(isCollapsed && !isMobile) ? 'justify-center' : ''}`}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-sky-400/30" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#006382] to-sky-400 flex items-center justify-center text-white text-xs font-black shrink-0 ring-2 ring-sky-400/30">
                  {initials}
                </div>
              )}
              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
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
      </>
    </TooltipProvider>
  );
});

MainSidebar.displayName = 'MainSidebar';
export { MainSidebar };
