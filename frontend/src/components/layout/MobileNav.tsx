'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mobileNavItems = [
  { href: '/',            icon: 'dashboard',    label: 'Home' },
  { href: '/my-courses',  icon: 'library_books',label: 'Courses',  filled: true },
  { href: '/messages',    icon: 'chat',         label: 'Chats' },
  { href: '/profile',     icon: 'account_circle',label: 'Profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-xl border-t border-sky-300/10 flex items-center justify-around z-50">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={`material-symbols-outlined ${isActive ? 'text-sky-300' : 'text-slate-400'}`}
              style={isActive && item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] font-${isActive ? 'bold' : 'normal'} ${isActive ? 'text-sky-300' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
