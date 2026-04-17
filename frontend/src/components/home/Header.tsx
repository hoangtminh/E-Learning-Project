'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const linked = [
    {
      path: 'Browse',
      link: '/',
    },
    {
      path: 'Pathway',
      link: '/pathway',
    },
    {
      path: 'Resources',
      link: '/resources',
    },
    {
      path: 'Community',
      link: '/community',
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm'
          : 'bg-sky-100 backdrop-blur-none border-b border-transparent'
      }`}
    >
      <div
        className={`flex items-center justify-between px-6 py-3 w-full max-w-7xl mx-auto transition-all duration-500`}
      >
        <div className='flex items-center space-x-8'>
          <span className='text-2xl font-bold tracking-tight text-sky-500'>
            Glacier Learning
          </span>
          <div className='hidden md:flex space-x-6 items-center'>
            {linked.map((item, index) => (
              <Link
                className={`${isActive(item.link) ? 'text-sky-500 border-b-2 border-sky-500 pb-1' : 'text-slate-600'} hover:text-sky-500 transition-colors font-medium`}
                href={item.link}
                key={index}
              >
                {item.path}
              </Link>
            ))}
          </div>
        </div>
        <div className='flex items-center space-x-4'>
          <Button
            variant='ghost'
            className='text-slate-600 hover:text-sky-500 hover:bg-transparent font-medium'
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
          <Button
            className='bg-sky-500 text-white hover:bg-sky-500/90 rounded-lg shadow-lg shadow-sky-500/20 font-semibold'
            onClick={() => router.push('/register')}
          >
            Join for Free
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
