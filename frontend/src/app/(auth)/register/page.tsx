'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  BadgeCheck,
  Users,
  User,
  Mail,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ fullName, email, password });
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Đăng ký thất bại. Vui lòng thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-slate-50 text-slate-900 min-h-screen overflow-x-hidden selection:bg-sky-200 selection:text-sky-900'>
      <div className='flex min-h-screen'>
        {/* Left Side: Narrative & Visual */}
        <div className='hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 py-8 overflow-hidden'>
          <div className='relative z-10 space-y-12'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='space-y-4'
            >
              <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-sm font-semibold tracking-wide uppercase'>
                <Sparkles className='w-[18px] h-[18px]' />
                Glacier E-Learning
              </div>
              <h1 className='text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.1]'>
                Bắt đầu hành trình
                <span className='text-sky-600'> của bạn.</span>
              </h1>
              <p className='text-lg text-slate-500 max-w-md leading-relaxed'>
                Khám phá tri thức không giới hạn với nền tảng học tập hiện đại
                nhất.
              </p>
            </motion.div>

            {/* Key Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='grid grid-cols-2 gap-6'
            >
              <div className='p-6 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow'>
                <div className='w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600'>
                  <BadgeCheck className='w-6 h-6' />
                </div>
                <h3 className='font-bold text-lg text-slate-900'>
                  Chứng chỉ quốc tế
                </h3>
                <p className='text-sm text-slate-500'>
                  Được công nhận bởi các đối tác công nghệ hàng đầu thế giới.
                </p>
              </div>
              <div className='p-6 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow'>
                <div className='w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600'>
                  <Users className='w-6 h-6' />
                </div>
                <h3 className='font-bold text-lg text-slate-900'>
                  Cộng đồng 10,000+
                </h3>
                <p className='text-sm text-slate-500'>
                  Kết nối và cùng học hỏi với hàng ngàn học viên trên toàn cầu.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className='w-full lg:w-1/2 flex items-center justify-center py-8 px-6 md:px-12 lg:px-24 bg-white relative'>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className='w-[80%] max-w-md space-y-4 relative z-10'
          >
            <div className='text-center lg:text-left mb-4'>
              <h2 className='text-3xl font-bold text-slate-900 tracking-tight'>
                Tạo tài khoản mới
              </h2>
            </div>

            <form onSubmit={onSubmit} className='space-y-6'>
              <div className='space-y-4'>
                {/* Full Name */}
                <div className='group'>
                  <label
                    className='block text-sm font-medium text-slate-600 ml-1'
                    htmlFor='fullname'
                  >
                    Họ và Tên
                  </label>
                  <div className='relative'>
                    <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none group-focus-within:text-sky-600 transition-colors'>
                      <User className='w-5 h-5' />
                    </span>
                    <Input
                      id='fullname'
                      type='text'
                      required
                      minLength={2}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className='pl-11 pr-4 h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all placeholder:text-slate-400'
                      placeholder='Nguyễn Văn A'
                    />
                  </div>
                </div>

                {/* Email */}
                <div className='group'>
                  <label
                    className='block text-sm font-medium text-slate-600 ml-1'
                    htmlFor='email'
                  >
                    Địa chỉ Email
                  </label>
                  <div className='relative'>
                    <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none group-focus-within:text-sky-600 transition-colors'>
                      <Mail className='w-5 h-5' />
                    </span>
                    <Input
                      id='email'
                      type='email'
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='pl-11 pr-4 h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all placeholder:text-slate-400'
                      placeholder='example@glacier.edu'
                    />
                  </div>
                </div>

                {/* Password */}
                <div className='group'>
                  <label
                    className='block text-sm font-medium text-slate-600 ml-1'
                    htmlFor='password'
                  >
                    Mật khẩu
                  </label>
                  <div className='relative'>
                    <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none group-focus-within:text-sky-600 transition-colors'>
                      <Lock className='w-5 h-5' />
                    </span>
                    <Input
                      id='password'
                      type='password'
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='pl-11 pr-4 h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all placeholder:text-slate-400'
                      placeholder='••••••••'
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className='group'>
                  <label
                    className='block text-sm font-medium text-slate-600 ml-1'
                    htmlFor='confirm-password'
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className='relative'>
                    <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none group-focus-within:text-sky-600 transition-colors'>
                      <ShieldCheck className='w-5 h-5' />
                    </span>
                    <Input
                      id='confirm-password'
                      type='password'
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className='pl-11 pr-4 h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all placeholder:text-slate-400'
                      placeholder='••••••••'
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className='text-sm text-red-500 font-medium px-1'
                >
                  {error}
                </motion.p>
              )}

              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-sky-600 text-white font-bold h-10 rounded-xl shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-[0.98] disabled:opacity-70'
              >
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </Button>
            </form>

            <div className='relative flex items-center'>
              <div className='grow border-t border-slate-200'></div>
              <span className='shrink mx-4 text-sm text-slate-400'>
                Hoặc đăng ký bằng
              </span>
              <div className='grow border-t border-slate-200'></div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Button
                variant='outline'
                className='flex items-center justify-center gap-2 h-12 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors'
              >
                <img
                  alt='Google'
                  className='w-5 h-5'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuBmfr16wEzDkmSIS5eSpqk1N_YoMByzvNWyaodaBrmKhuuIz4pXPx9iT62lUWI1Ixr-ZIbyXStNgx5MCkiIbSlFx2JgnIAGLhSnhy6nm3h8-2BGwWVEg2IHmhZfbI2gqDbYHql3Qa9kda7o6-DDjsmkgs_gQzI3hjR7RE5AKrjeZZz8_I1Dvqm4_DlkM3A1xAbLH2CqLzFY6-e5WY6kS18jzMxIOtJOKSrzKtcV_O9KH_j5SDA9AtBL4Xv_G1riA0N8f1OfIyVslM-B'
                />
                <span className='text-sm font-medium'>Google</span>
              </Button>
              <Button
                variant='outline'
                className='flex items-center justify-center gap-2 h-12 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors'
              >
                <img
                  alt='LinkedIn'
                  className='w-5 h-5'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuBVW3kp7wW26rPpIEtgMfSvywcDcuKPWIA4jeM4jnUvPJYILwIZQIcCx9O9rz1L6lakvTzGewus48nspPc3mui-YYHgkZRMMXXfk-gaNWiRaKYg9RcINIg1tWa2tBdtshurPgbMcYjXajTnTon0wjWeCWQlN8UUNB3X7NGEse7u4ORkOro7zD4d9MIyYC7fnSturB6rPQnoTIQBMVYAv8K4WxrEnW4PD3RJdateEPN_HcubBxq4K4sVmj34kCwE2_3958KNGnQxtubs'
                />
                <span className='text-sm font-medium'>LinkedIn</span>
              </Button>
            </div>

            <p className='text-center text-slate-500'>
              Đã có tài khoản?{' '}
              <Link
                className='text-sky-600 font-bold hover:underline ml-1'
                href='/login'
              >
                Đăng nhập ngay
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
