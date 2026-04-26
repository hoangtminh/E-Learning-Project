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
import {
  ChevronRight,
  ChevronLeft,
  Snowflake,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Video,
  MessagesSquare,
  MessageSquare,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { name: 'Courses', icon: <GraduationCap size={20} />, path: '/courses' },
  { name: 'My Courses', icon: <BookOpen size={20} />, path: '/my-courses' },
  { name: 'Classrooms', icon: <Users size={20} />, path: '/classrooms' },
  { name: 'Video Call', icon: <Video size={20} />, path: '/call' },
  { name: 'Chat', icon: <MessageSquare size={20} />, path: '/chat' },
  { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];


const MainSidebar = memo(() => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={{ width: 260, opacity: 0, x: -50 }}
        animate={{ width: isCollapsed ? 60 : 220, opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className='h-screen bg-[#0a0e1a] text-slate-300 flex flex-col border-r border-white/10 relative z-20 shrink-0'
      >
        {/* Toggle Button */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='absolute -right-4.5 top-3 bg-sky-500 border-white border text-white rounded-full p-0.5 shadow-md hover:bg-sky-400 z-50 flex items-center justify-center transition-colors'
          >
            <span className='material-symbols-outlined text-sm'>
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        )}

        {/* Logo */}

        <div className='h-14 flex items-center justify-center border-b border-white/10 shrink-0'>
          <div className='w-9 h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0 hover:cursor-pointer'>
            {isCollapsed ? (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className='bg-sky-500 border-white border text-white rounded-full p-0.5 shadow-md hover:bg-sky-400 z-50 flex items-center justify-center transition-colors'
              >
                <ChevronRight className='text-sm' />
              </button>
            ) : (
              <Snowflake
                className='text-sky-400'
                size={22} // Standard size to match a 10rem/40px container
                fill='currentColor' // Use this if you want the 'FILL 1' look
              />
            )}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className='ml-3 font-bold text-xl text-white whitespace-nowrap overflow-hidden'
              >
                Glacier
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <nav className='flex-1 flex flex-col gap-2 p-2 mt-4 overflow-y-auto overflow-x-hidden scrollbar-hide'>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + '/');

            const linkContent = (
              <Link
                href={item.path}
                className={`flex items-center gap-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 font-semibold shadow-[0_0_20px_rgba(125,211,252,0.05)]'
                    : 'hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center' : 'px-4'}`}
              >
                <div
                  className='shrink-0'
                >
                  {item.icon}
                </div>
                <span className={`${isCollapsed ? 'hidden' : 'block'}`}>
                  {item.name}
                </span>
              </Link>
            );

            return isCollapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent
                  side='right'
                  className='bg-slate-800 border-slate-700 text-white font-medium ml-2'
                >
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.name}>{linkContent}</div>
            );
          })}
        </nav>
      </motion.aside>
    </TooltipProvider>
  );
},)

MainSidebar.displayName = 'MainSidebar';

export { MainSidebar };
