'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className='w-full py-16 mt-auto bg-[#0f172a] border-t border-white/10'>
      <div className='max-w-7xl mx-auto px-6'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'
        >
          <div className='col-span-1 md:col-span-1 space-y-6'>
            <span className='text-2xl font-bold text-white'>
              Glacier Learning
            </span>
            <p className='text-sky-100/60 text-sm leading-relaxed'>
              Nền tảng học tập trực tuyến hàng đầu, mang đến những kiến thức
              thực tế và kỹ năng cần thiết cho tương lai số.
            </p>
            <div className='flex space-x-4'>
              <Button
                variant='outline'
                size='icon'
                asChild
                className='bg-white/5 border-transparent rounded-lg hover:text-sky-500 hover:bg-white/10 text-sky-100/70'
              >
                <Link href='#'>
                  <span className='material-symbols-outlined text-xl'>
                    language
                  </span>
                </Link>
              </Button>
              <Button
                variant='outline'
                size='icon'
                asChild
                className='bg-white/5 border-transparent rounded-lg hover:text-sky-500 hover:bg-white/10 text-sky-100/70'
              >
                <Link href='#'>
                  <span className='material-symbols-outlined text-xl'>
                    share
                  </span>
                </Link>
              </Button>
            </div>
          </div>
          <div className='space-y-6'>
            <h4 className='text-white font-bold'>Khám phá</h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  className='text-sky-100/60 hover:text-white transition-colors'
                  href='#'
                >
                  Tất cả khóa học
                </Link>
              </li>
              <li>
                <Link
                  className='text-sky-100/60 hover:text-white transition-colors'
                  href='#'
                >
                  Lộ trình học tập
                </Link>
              </li>
              <li>
                <Link
                  className='text-sky-100/60 hover:text-white transition-colors'
                  href='#'
                >
                  Cộng đồng học viên
                </Link>
              </li>
              <li>
                <Link
                  className='text-sky-100/60 hover:text-white transition-colors'
                  href='#'
                >
                  Giảng viên
                </Link>
              </li>
            </ul>
          </div>
          <div className='space-y-6'>
            <h4 className='text-white font-bold'>Hỗ trợ</h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  className='text-sky-100/60 hover:text-white transition-colors'
                  href='#'
                >
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link
                  className='text-sky-100/60 hover:text-white transition-colors'
                  href='#'
                >
                  Hướng dẫn đăng ký
                </Link>
              </li>
              <li>
                <Link
                  className='text-sky-100/60 hover:text-white transition-colors'
                  href='#'
                >
                  Chính sách hoàn tiền
                </Link>
              </li>
              <li>
                <Link
                  className='text-sky-100/60 hover:text-white transition-colors'
                  href='#'
                >
                  Liên hệ chúng tôi
                </Link>
              </li>
            </ul>
          </div>
          <div className='space-y-6'>
            <h4 className='text-white font-bold'>Newsletter</h4>
            <p className='text-sky-100/60 text-sm'>
              Nhận thông báo về các khóa học mới nhất và ưu đãi đặc biệt.
            </p>
            <div className='flex flex-col space-y-2'>
              <Input
                className='bg-white/5 border-white/10 placeholder:text-sky-100/30 text-white focus-visible:ring-sky-500/40 rounded-lg'
                placeholder='Email của bạn'
                type='email'
              />
              <Button className='w-full bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-500/90 shadow-md shadow-sky-500/10'>
                Đăng ký
              </Button>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6'
        >
          <span className='text-xs text-sky-100/40'>
            © 2024 Glacier E-Learning. All rights reserved.
          </span>
          <div className='flex space-x-6 text-xs text-sky-100/40'>
            <Link className='hover:text-white transition-colors' href='#'>
              Terms of Service
            </Link>
            <Link className='hover:text-white transition-colors' href='#'>
              Privacy Policy
            </Link>
            <Link className='hover:text-white transition-colors' href='#'>
              Cookie Settings
            </Link>
            <Link className='hover:text-white transition-colors' href='#'>
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
