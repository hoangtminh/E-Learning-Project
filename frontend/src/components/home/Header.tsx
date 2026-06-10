'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const linked = [
    {
      path: 'Browse',
      link: '/',
    },
    {
      path: 'Resources',
      link: '/resources',
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
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
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

        {/* Desktop actions */}
        <div className='hidden md:flex items-center space-x-4'>
          {isLoading ? (
            <div className='h-9 w-20 bg-slate-100 animate-pulse rounded-lg' />
          ) : isAuthenticated ? (
            <>
              <div className='hidden sm:flex flex-col items-end leading-tight'>
                <span className='text-sm font-bold text-slate-800 max-w-[150px] truncate'>
                  {user?.fullName || 'Học viên'}
                </span>
                <span className='text-[11px] text-slate-500 max-w-[150px] truncate'>
                  {user?.email}
                </span>
              </div>
              <Button
                className='bg-sky-500 text-white hover:bg-sky-500/90 rounded-lg shadow-lg shadow-sky-500/20 font-semibold'
                onClick={() => router.push(user?.role === 'admin' ? '/administrator' : '/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant='ghost'
                className='text-slate-600 hover:text-red-600 hover:bg-red-50 font-semibold'
                onClick={() => void logout()}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='ghost'
                className='text-slate-600 hover:text-sky-500 hover:bg-transparent font-medium'
                onClick={() => router.push('/login')}
              >
                Sign in
              </Button>
              <Button
                className='bg-sky-500 text-white hover:bg-sky-500/90 rounded-lg shadow-lg shadow-sky-500/20 font-semibold'
                onClick={() => router.push('/register')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className='flex md:hidden items-center'>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='w-11 h-11 flex items-center justify-center text-slate-600 hover:text-sky-500 hover:bg-sky-50/50 rounded-lg focus:outline-none transition-colors'
            aria-label='Toggle menu'
          >
            <span className='material-symbols-outlined text-[28px]'>
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-sky-100 bg-white/95 backdrop-blur-xl px-6 py-5 space-y-5 shadow-lg overflow-hidden"
          >
            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-4">
              {linked.map((item, index) => (
                <Link
                  className={`text-base font-semibold py-1 transition-colors ${
                    isActive(item.link) ? 'text-sky-500 border-l-4 border-sky-500 pl-3' : 'text-slate-600 hover:text-sky-500 pl-4'
                  }`}
                  href={item.link}
                  key={index}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.path}
                </Link>
              ))}
            </div>

            <div className="h-px bg-sky-100/50" />

            {/* Mobile Auth Actions */}
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className='h-10 w-full bg-slate-100 animate-pulse rounded-lg' />
              ) : isAuthenticated ? (
                <>
                  <div className='flex flex-col leading-tight pb-1 px-4'>
                    <span className='text-sm font-bold text-slate-800 truncate'>
                      {user?.fullName || 'Học viên'}
                    </span>
                    <span className='text-xs text-slate-500 truncate'>
                      {user?.email}
                    </span>
                  </div>
                  <Button
                    className='w-full bg-sky-500 text-white hover:bg-sky-500/90 rounded-lg shadow-lg shadow-sky-500/20 font-semibold py-5'
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(user?.role === 'admin' ? '/administrator' : '/dashboard');
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant='ghost'
                    className='w-full text-slate-600 hover:text-red-600 hover:bg-red-50 font-semibold justify-center py-5'
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      void logout();
                    }}
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant='ghost'
                    className='w-full text-slate-600 hover:text-sky-500 hover:bg-slate-50 font-semibold py-5 justify-center'
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/login');
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    className='w-full bg-sky-500 text-white hover:bg-sky-500/90 rounded-lg shadow-lg shadow-sky-500/20 font-semibold py-5'
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/register');
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
