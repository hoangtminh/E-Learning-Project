'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { name: 'Courses', icon: 'school', path: '/courses' },
  { name: 'Video Call', icon: 'video_camera_front', path: '/call' },
  { name: 'Community', icon: 'forum', path: '/community' },
  { name: 'Settings', icon: 'settings', path: '/settings' },
];

export function MainSidebar() {
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
            className='absolute -right-4.5 top-4.5 bg-sky-500 border-white border text-white rounded-full p-0.5 shadow-md hover:bg-sky-400 z-50 flex items-center justify-center transition-colors'
          >
            <span className='material-symbols-outlined text-sm'>
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        )}

        {/* Logo */}
        <div
          className='h-16 flex items-center justify-center border-b border-white/10 shrink-0'
          onClick={() => (isCollapsed ? setIsCollapsed(!isCollapsed) : null)}
        >
          <div className='w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20 shrink-0'>
            G
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
                <span
                  className='material-symbols-outlined shrink-0'
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
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
}
