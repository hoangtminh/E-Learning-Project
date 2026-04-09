'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { login } from '@/lib/auth-api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('current_user', JSON.stringify(result.user));
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-md items-center px-6'>
      <div className='w-full rounded-xl border p-6 shadow-sm'>
        <h1 className='text-2xl font-semibold'>Login</h1>
        <p className='mt-1 text-sm text-zinc-600'>
          Sign in to continue learning.
        </p>

        <form onSubmit={onSubmit} className='mt-6 space-y-4'>
          <div className='space-y-1'>
            <label className='text-sm font-medium' htmlFor='email'>
              Email
            </label>
            <input
              id='email'
              type='email'
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className='w-full rounded-md border px-3 py-2 outline-none ring-0 focus:border-zinc-800'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-sm font-medium' htmlFor='password'>
              Password
            </label>
            <input
              id='password'
              type='password'
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='w-full rounded-md border px-3 py-2 outline-none ring-0 focus:border-zinc-800'
            />
          </div>

          {error ? <p className='text-sm text-red-600'>{error}</p> : null}

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded-md bg-zinc-900 px-3 py-2 text-white disabled:opacity-60'
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='mt-4 text-sm text-zinc-600'>
          No account yet?{' '}
          <Link className='text-zinc-900 underline' href='/register'>
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
