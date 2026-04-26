'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-slate-50 text-slate-900 min-h-screen flex flex-col relative font-sans'>
      <main className='grow flex flex-col md:flex-row h-screen'>
        {/* Left Side: Login Form */}
        <section className='w-full md:w-[40%] flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-slate-50 z-10 relative overflow-y-auto'>
          <div className='relative z-10 w-full max-w-md mx-auto py-12'>
            <header className='mb-4'>
              <h1 className='text-3xl font-extrabold text-sky-600 tracking-tight mb-2'>
                Welcome Back
              </h1>
              <p className='text-slate-500 text-sm'>
                Please enter your details to access Glacier.
              </p>
            </header>

            <form onSubmit={onSubmit} className='space-y-6'>
              <div className='space-y-1.5'>
                <label
                  className='text-xs font-semibold text-slate-500 tracking-wide uppercase'
                  htmlFor='email'
                >
                  Email Address
                </label>
                <div className='relative'>
                  <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none group-focus-within:text-sky-600 transition-colors'>
                    <Mail className='w-5 h-5' />
                  </span>
                  <input
                    id='email'
                    type='email'
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className='pl-11 pr-4 h-10 w-full bg-slate-50 border border-slate-300 rounded-xl focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all placeholder:text-slate-400'
                    placeholder='name@company.com'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <div className='flex justify-between items-center'>
                  <label
                    className='text-xs font-semibold text-slate-500 tracking-wide uppercase'
                    htmlFor='password'
                  >
                    Password
                  </label>
                  <Link
                    className='text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors'
                    href='#'
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className='relative'>
                  <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg'>
                    <Lock className='w-5 h-5' />
                  </span>
                  <input
                    id='password'
                    type='password'
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className='pl-11 pr-4 h-10 w-full bg-slate-50 border border-slate-300 rounded-xl focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all placeholder:text-slate-400'
                    placeholder='••••••••'
                  />
                </div>
              </div>

              {error && (
                <p className='text-sm text-red-500 font-medium'>{error}</p>
              )}

              <div className='flex items-center space-x-2'>
                <input
                  id='remember'
                  type='checkbox'
                  className='w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600'
                />
                <label className='text-xs text-slate-500' htmlFor='remember'>
                  Remember me for 30 days
                </label>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-sky-600 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-sky-600/20 hover:bg-sky-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70'
              >
                <span>
                  {isSubmitting ? 'Logging in...' : 'Login to Dashboard'}
                </span>
                {!isSubmitting && <ArrowRight className='w-4 h-4' />}
              </button>
            </form>

            <div className='mt-4'>
              <div className='relative mb-4'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-slate-200'></div>
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-slate-50 px-4 text-slate-500 font-medium'>
                    Or continue with
                  </span>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <button
                  type='button'
                  className='flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-lg hover:bg-sky-50 transition-colors'
                >
                  <img
                    alt='Google'
                    className='w-5 h-5'
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuBAcSQrRSpNczi7aKTsugGKQ_nFYn8f5xwnLfsvvkVRAj-xbZr9nqxBAnNeKG4oVxAIolWs0UrcogEfYqwtl3WZfDEKfQ7zBTXAWDKMpP1nlam0uFJBjesnwXSAig7Mf8Ru_U1xTtiWn5nH3Jv4hSBCY8GNOqc3UKfdnCoe_dbUVgueQGPlYAYwC-fyjLB4JagPjV4kUiKRAxv3o2BBZeYEcSGVuj2ph6GxVZ_-yKn3dF_rhg-PzteH5GH4UpbKZmkb8aCyi37-aHpc'
                  />
                  <span className='text-sm font-medium text-slate-900'>
                    Google
                  </span>
                </button>
                <button
                  type='button'
                  className='flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-lg hover:bg-sky-50 transition-colors'
                >
                  <img
                    alt='Facebook'
                    className='w-5 h-5'
                    src='https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' // Assuming a local Facebook icon or a CDN link
                  />
                  <span className='text-sm font-medium text-slate-900'>
                    Facebook
                  </span>
                </button>
              </div>
            </div>

            <p className='mt-10 text-center text-sm text-slate-500'>
              Don't have an account?{' '}
              <Link
                className='text-sky-600 font-bold hover:underline'
                href='/register'
              >
                Join Glacier Community
              </Link>
            </p>
          </div>
        </section>

        {/* Right Side: Immersive Visual */}
        <section className='hidden md:flex w-full md:w-[60%] relative bg-primary-surface items-center justify-center p-12 overflow-hidden'>
          {' '}
          {/* Changed bg-inverse-surface to a specific color for consistency */}
          {/* Background Image */}
          <div className='absolute inset-0 z-0'>
            <img
              alt='Glacier Abstract'
              className='w-full h-full object-cover opacity-60'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuAcj7nUC5N9mBC6bm_i2tVj-DKzZtdKDOgc_hC8iBTatA3NpPe8_7wFih-0NVqopYXLtChwneZSmJfHw4pItX7Trg5VSpgM8jMgos7-2EsVZRmz0JPh42FrdkjUYVwU-dsrHFH4HScstCPVxchsLaI8RIwtUNKkCKaUID1BxLf4OqPJxk8hXumWZTlIVHQLBK6jDJ_LBbk0cJUiGk3LOZ4or1gYQkUu33G_l806CZmgAOq5OJBofzSUxLetpGz1IDO9f667FyQGHAdo'
            />
            <div className='absolute inset-0 bg-linear-to-tr from-inverse-surface via-primary-surface/40 to-transparent'></div>
          </div>
          {/* Content Overlay */}
          <div className='relative z-10 max-w-2xl text-white'>
            <div className='mb-12 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10'>
              <div className='w-2 h-2 rounded-full bg-sky-300 animate-pulse'></div>
              <span className='text-xs font-medium tracking-wider uppercase text-white'>
                New Learning Experience
              </span>
            </div>
            <h2 className='text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight'>
              Nâng tầm tri thức cùng{' '}
              <span className='text-sky-300'>Glacier</span>
            </h2>
            <p className='text-lg lg:text-xl text-white/80 font-light leading-relaxed mb-10 max-w-xl'>
              Discover a premium ecosystem of knowledge where expert instructors
              and a global community converge to transform the way you learn.
            </p>
            <div className='grid grid-cols-2 gap-8 pt-8 border-t border-white/10'>
              <div>
                <p className='text-3xl font-bold text-sky-300'>500+</p>
                <p className='text-sm text-white/60'>Expert Instructors</p>
              </div>
              <div>
                <p className='text-3xl font-bold text-sky-300'>50k+</p>
                <p className='text-sm text-white/60'>Active Students</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
