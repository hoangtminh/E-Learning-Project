'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className='bg-white text-slate-900 selection:bg-sky-500/20 font-sans min-h-screen flex flex-col'>
      <main className='flex-1'>
        {/* Hero Section */}
        <section className='relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#f8fbff]'>
          {/* Background Decorative Elements */}
          <div className='absolute top-0 left-1/4 w-125 h-125 bg-sky-500/10 rounded-full blur-[120px] -z-10'></div>
          <div className='absolute bottom-0 right-1/4 w-150 h-150 bg-purple-600/5 rounded-full blur-[140px] -z-10'></div>

          <div className='max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className='text-left space-y-8'
            >
              <div className='inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 text-xs font-bold tracking-wide uppercase'>
                <span className='material-symbols-outlined text-sm'>
                  auto_awesome
                </span>
                <span>Kỷ nguyên học tập mới</span>
              </div>
              <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900'>
                Học Tập{' '}
                <span className='bg-linear-to-r from-sky-500 to-purple-600 bg-clip-text text-transparent'>
                  Không Giới Hạn
                </span>
              </h1>
              <p className='text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed'>
                Nâng tầm tri thức với nền tảng E-learning thế hệ mới. Trải
                nghiệm học tập đỉnh cao trong không gian kỹ thuật số tinh tế và
                hiện đại.
              </p>
              <div className='flex flex-wrap gap-4'>
                <Button
                  size='lg'
                  className='bg-sky-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 h-auto py-4 px-8 flex items-center space-x-2'
                >
                  <span>Khám phá ngay</span>
                  <span className='material-symbols-outlined'>
                    arrow_forward
                  </span>
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  asChild
                  className='bg-sky-50/70 backdrop-blur-md border-sky-500/10 text-slate-700 rounded-xl font-bold text-lg hover:bg-white shadow-sm h-auto py-4 px-8 flex items-center space-x-2'
                >
                  <Link href='/call'>
                    <span className='material-symbols-outlined'>
                      video_camera_front
                    </span>
                    <span>Test WebRTC Call</span>
                  </Link>
                </Button>
              </div>
              <div className='flex items-center space-x-4 pt-4'>
                <div className='flex -space-x-3'>
                  <div className='w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm'>
                    <img
                      className='w-full h-full object-cover'
                      alt='Student'
                      src='https://lh3.googleusercontent.com/aida-public/AB6AXuCoLcZt8R31CwX3UiyL5JxZf-X251KAIKT8ZXC5YlL4nUC870JjR0Km4WzFJsip6_pzz0hPTJki_YMdT4TZSVrOZl3RRjcBKEVDVGR6t1x6AsCFBvw6Bl6tIbGWcfu5t9eyI21LtKP0t6YpJPKsV71m8LX8rJSARv-_dVEgT0Gb4NkiEUAp6LQN7RWNKKBkG8X25KKbMzZ4fyxFfCJSWvY0ucPclgX3kUJ0r_IjGymPsg6Xk5RfsyGYhGxDUKl4opdReA3vi4IBvTK3'
                    />
                  </div>
                  <div className='w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm'>
                    <img
                      className='w-full h-full object-cover'
                      alt='Student'
                      src='https://lh3.googleusercontent.com/aida-public/AB6AXuCkO_Nqjs9J1sadJXPGkTo5mQJ2_LFmmkOfSSfpU2-pbpemIdug4Za0KLe2FGnQMb6FLCc3gNWTyBLV9K5iiCFvXvati_Pxv8S_NZWQbVGrAd41-NTJUc6_a1ZjLdzALtx9IqLXsiqNrrgd00w1Aw1jtY9uC9ygea6t4EVAUTAu-zvcJBQI47ftl8xWJuAXOyq2Gt68EB5eKqFB8nlJnB59YueTteLgm9YdhcT9J46HR2KvQQG4y22WrxaFUxGW7rGTxfVw8QxjTj6I'
                    />
                  </div>
                  <div className='w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm'>
                    <img
                      className='w-full h-full object-cover'
                      alt='Instructor'
                      src='https://lh3.googleusercontent.com/aida-public/AB6AXuDRnnukvkmBxnY72y0nXXhU9TgyYgW2WdZiZHWphwbuQldiCQBJYXqWHyAzTyIWCK_bN-X6Xx3b_oXPCwID4pO20utCSnqD5Ra5NXLEHGWQhBy1SCwUadme-uJDNOHg3cM-tiYgyTMtTltMarGgtvBA3-dWq6YXtJSXJgApHtTBSNcyT1xsA8SXTDL2ee-YJgw0M8UTtGR1N_lz_1pIJjcba5sA14Izp9Pkw6pOYnfVdWHxBN9whiaxjlLIRoa6E-MMPAep9rCxtp3v'
                    />
                  </div>
                </div>
                <p className='text-sm text-slate-500 font-medium'>
                  Tham gia cùng{' '}
                  <span className='text-sky-500 font-bold'>10,000+</span> học
                  viên khác
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='relative'
            >
              <div className='bg-white/85 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-4 rotate-3 transform transition-transform hover:rotate-0 duration-500 shadow-2xl'>
                <img
                  className='rounded-2xl w-full h-full object-cover shadow-inner'
                  alt='Dashboard Dashboard'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuDsShA9-Xp_8PjhhBjFkZHA1jDKOvzkXeHp3I7H7B-gqYFuWcFn6RJPdvLVEXVqBWocqAAZZJIBeOe-xo-wLAOJVLCJ81R2ShE6LhJOJ8pX3Ao6IcoDMZFnOUAO8QuqSUoIS27bME35VU3h9gKol4s8wE9EzwzqMKbDlcGJgUI87dRSKc7qCStrP2kdQI7Mqaae2X7R_y9kd4DCW0mQeu9DNBscURf5BDIQ9nmQt0HJdc-OowxZ8-__FtxxqSD-yZgSdMP7_CjfEmo6'
                />
                <div className='absolute -bottom-6 -left-6 bg-white/85 backdrop-blur-xl border border-sky-500/20 p-4 rounded-2xl shadow-xl flex items-center space-x-4 animate-bounce-slow'>
                  <div className='w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center'>
                    <span className='material-symbols-outlined text-sky-500'>
                      verified
                    </span>
                  </div>
                  <div>
                    <p className='text-xs text-slate-500'>Chứng chỉ quốc tế</p>
                    <p className='font-bold text-slate-900'>Đạt chuẩn ISO</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trending Courses Section */}
        <section className='py-24 max-w-7xl mx-auto px-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className='flex flex-col md:flex-row justify-between items-end mb-12 gap-6'
          >
            <div className='space-y-4'>
              <h2 className='text-4xl font-bold tracking-tight text-slate-900'>
                Khóa học xu hướng
              </h2>
              <p className='text-slate-600 max-w-lg'>
                Khám phá những khóa học được cộng đồng quan tâm nhất trong tuần
                qua.
              </p>
            </div>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='icon'
                className='bg-sky-50/70 backdrop-blur-md border-sky-500/10 rounded-lg hover:bg-sky-500/10 text-slate-700'
              >
                <span className='material-symbols-outlined'>chevron_left</span>
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='bg-sky-50/70 backdrop-blur-md border-sky-500/10 rounded-lg hover:bg-sky-500/10 text-slate-700'
              >
                <span className='material-symbols-outlined'>chevron_right</span>
              </Button>
            </div>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Course Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='h-full'
            >
              <Card className='bg-white border border-slate-100 group rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-sky-500/5 hover:border-sky-500/20 transition-all duration-300 flex flex-col h-full'>
                <div className='relative h-48 overflow-hidden'>
                  <img
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    alt='Web Development'
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuDvL-3rWD6n1zTp6iNLoTplo5Tc13d92CXNgB694DGmIDFcAqxm20aWQ5zc2fWvYFhCDooaSoHvnZalMvXTNB8opUw6buL1VWStH1PbtrPyqBZ8MGsWdKNsloxManSL2fb1f3dsu-2bpINYJMZ3ha4nU7YJ2AcAjNdekAOYsiHuZMApDq13DRpgGIJQL6B4ItYPlA26VbvK5k2kqjRoRRiWmIB8yPbYH7XquZdb9jgCgMlcZMn8sMNf-V_sAQ1TOgpTkVcA5gtwTTur'
                  />
                  <div className='absolute top-4 left-4 bg-sky-50/70 backdrop-blur-md border border-sky-500/10 px-3 py-1 rounded-full text-[10px] font-bold text-sky-500 uppercase'>
                    Phát triển Web
                  </div>
                </div>
                <CardContent className='p-6 space-y-4 grow flex flex-col'>
                  <h3 className='text-xl font-bold leading-tight text-slate-900 group-hover:text-sky-500 transition-colors'>
                    Fullstack Web Development với React & Node.js
                  </h3>
                  <div className='flex items-center space-x-4 text-sm text-slate-500'>
                    <div className='flex items-center space-x-1'>
                      <span
                        className='material-symbols-outlined text-[16px] text-amber-500'
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className='font-semibold text-slate-900'>4.9</span>
                      <span>(1.2k)</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <span className='material-symbols-outlined text-[16px]'>
                        schedule
                      </span>
                      <span>48 Giờ</span>
                    </div>
                  </div>
                  <div className='pt-4 mt-auto border-t border-slate-50 flex justify-between items-center'>
                    <span className='text-2xl font-bold text-sky-500'>
                      $199.00
                    </span>
                    <Button
                      variant='secondary'
                      size='icon'
                      className='bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white rounded-lg transition-all shadow-sm'
                    >
                      <span className='material-symbols-outlined'>
                        add_shopping_cart
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='h-full'
            >
              <Card className='bg-white border border-slate-100 group rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-sky-500/5 hover:border-sky-500/20 transition-all duration-300 flex flex-col h-full'>
                <div className='relative h-48 overflow-hidden'>
                  <img
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    alt='UI/UX Design'
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuBJ1oczZRpMZH5RjaohLMt9Cr3CgGNUqwsSG2tMlPHCEupfVNqLi3BrC3xjLbpXOJS11lK6k7lCmNyJvIfHs2ZsMgtb68GDPsX_o73qR088CWFt_AO70Z51zyxGsuwozWeuOVYdt4-cQLPaPkLaPfNCPiobmezmgqbjm8s-jwLX69Yj-guDcrVrD9zBTCugKqg3iezOpCqUUET4DOIRBC8MAE574zV02gWVxZpaEVUzF_zwIqc0D9X5IcAPJmXit9MMTk29eP60tnvo'
                  />
                  <div className='absolute top-4 left-4 bg-sky-50/70 backdrop-blur-md border border-sky-500/10 px-3 py-1 rounded-full text-[10px] font-bold text-sky-500 uppercase'>
                    Thiết kế UI/UX
                  </div>
                </div>
                <CardContent className='p-6 space-y-4 grow flex flex-col'>
                  <h3 className='text-xl font-bold leading-tight text-slate-900 group-hover:text-sky-500 transition-colors'>
                    Mastering Figma: Từ cơ bản đến nâng cao
                  </h3>
                  <div className='flex items-center space-x-4 text-sm text-slate-500'>
                    <div className='flex items-center space-x-1'>
                      <span
                        className='material-symbols-outlined text-[16px] text-amber-500'
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className='font-semibold text-slate-900'>4.8</span>
                      <span>(850)</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <span className='material-symbols-outlined text-[16px]'>
                        schedule
                      </span>
                      <span>32 Giờ</span>
                    </div>
                  </div>
                  <div className='pt-4 mt-auto border-t border-slate-50 flex justify-between items-center'>
                    <span className='text-2xl font-bold text-sky-500'>
                      $149.00
                    </span>
                    <Button
                      variant='secondary'
                      size='icon'
                      className='bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white rounded-lg transition-all shadow-sm'
                    >
                      <span className='material-symbols-outlined'>
                        add_shopping_cart
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='h-full'
            >
              <Card className='bg-white border border-slate-100 group rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-sky-500/5 hover:border-sky-500/20 transition-all duration-300 flex flex-col h-full'>
                <div className='relative h-48 overflow-hidden'>
                  <img
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    alt='Data Science'
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuB5m84Q-9rjedfa6f6DpNCsWN3Dmi-0-kENCNGiuixU3dkVWdCkAavD_Vz1Kn-5M9l1Gmk3cS-NLkvQhviQ2YQVOxPG7b75__aaxITshn1QWOzja-1E72Hvgi8QDNxJ8Kpru5UHMVe0WhpEv40QrRiev47-DVoekuhkXmkPRpwSCu4fFKZMCi7IBI0FV2tUb3AEKMs7CzcipYbXKhQDuv_D11IBsMESPyc3xZjlFBcJHb2kDkXyR1YMTbpmlxqrA3rWaMZKJdqGd2PF'
                  />
                  <div className='absolute top-4 left-4 bg-sky-50/70 backdrop-blur-md border border-sky-500/10 px-3 py-1 rounded-full text-[10px] font-bold text-sky-500 uppercase'>
                    Data Science
                  </div>
                </div>
                <CardContent className='p-6 space-y-4 grow flex flex-col'>
                  <h3 className='text-xl font-bold leading-tight text-slate-900 group-hover:text-sky-500 transition-colors'>
                    Phân tích dữ liệu kinh doanh với Python
                  </h3>
                  <div className='flex items-center space-x-4 text-sm text-slate-500'>
                    <div className='flex items-center space-x-1'>
                      <span
                        className='material-symbols-outlined text-[16px] text-amber-500'
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className='font-semibold text-slate-900'>4.7</span>
                      <span>(540)</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <span className='material-symbols-outlined text-[16px]'>
                        schedule
                      </span>
                      <span>56 Giờ</span>
                    </div>
                  </div>
                  <div className='pt-4 mt-auto border-t border-slate-50 flex justify-between items-center'>
                    <span className='text-2xl font-bold text-sky-500'>
                      $210.00
                    </span>
                    <Button
                      variant='secondary'
                      size='icon'
                      className='bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white rounded-lg transition-all shadow-sm'
                    >
                      <span className='material-symbols-outlined'>
                        add_shopping_cart
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className='py-24 bg-[#f0f9ff] relative overflow-hidden'>
          <div className='absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-sky-500/20 to-transparent -z-10'></div>
          <div className='max-w-7xl mx-auto px-6'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className='text-center mb-16 space-y-4'
            >
              <h2 className='text-4xl font-bold text-slate-900'>
                Học viên nói gì về chúng tôi
              </h2>
              <p className='text-slate-600 max-w-2xl mx-auto'>
                Hàng ngàn câu chuyện thành công bắt đầu từ Glacier Learning. Hãy
                nghe họ chia sẻ về hành trình của mình.
              </p>
            </motion.div>
            <div className='grid md:grid-cols-3 gap-8'>
              {/* Testimonial 1 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className='h-full'
              >
                <Card className='bg-white rounded-3xl relative group shadow-sm hover:shadow-md transition-all border border-sky-100 h-full'>
                  <CardContent className='p-8 space-y-6'>
                    <span className='material-symbols-outlined text-5xl text-sky-500/10 absolute top-4 right-8'>
                      format_quote
                    </span>
                    <p className='text-slate-700 italic leading-relaxed relative z-10'>
                      "Khóa học Fullstack thực sự thay đổi tư duy của mình. Nội
                      dung rất cập nhật và hỗ trợ từ instructor cực kỳ nhiệt
                      tình. Xứng đáng đầu tư!"
                    </p>
                    <div className='flex items-center space-x-4'>
                      <img
                        className='w-12 h-12 rounded-full object-cover ring-2 ring-sky-500/20'
                        alt='Student'
                        src='https://lh3.googleusercontent.com/aida-public/AB6AXuAdF7D4MLkDQiLI0YDnAq-bnWFjqXx4uQzIQj5BKAqucb-25OjodqmhkWuHwWrk-tBkpzWVJz9M4G0NMpN05c63BsnGdXep_T-o7kd6bd6GHuAEpIeFSri054OqI4ypBFJJT255i05mU1I-IaRnaPBB9I3rWbNdedkUnxYHHul3P7TS8TC7BG9kC_frq5zasGIZ2Guat29eAy0FuvJ_-oB6dXjG-Ti_0tXPU9wvX4gQytZGfZTvR1vG51hIUS0Jcb_CWSM0IrGLfEzw'
                      />
                      <div>
                        <h4 className='font-bold text-slate-900'>Minh Trần</h4>
                        <p className='text-xs text-slate-500'>
                          Software Engineer tại FPT
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='h-full'
              >
                <Card className='bg-white rounded-3xl relative group shadow-sm hover:shadow-md transition-all border border-sky-100 md:translate-y-8 h-full'>
                  <CardContent className='p-8 space-y-6'>
                    <span className='material-symbols-outlined text-5xl text-sky-500/10 absolute top-4 right-8'>
                      format_quote
                    </span>
                    <p className='text-slate-700 italic leading-relaxed relative z-10'>
                      "Giao diện học tập rất mượt mà và hiện đại. Cảm giác như
                      đang sống trong một không gian tương lai. Học không hề
                      thấy mệt mỏi."
                    </p>
                    <div className='flex items-center space-x-4'>
                      <img
                        className='w-12 h-12 rounded-full object-cover ring-2 ring-sky-500/20'
                        alt='Student'
                        src='https://lh3.googleusercontent.com/aida-public/AB6AXuB8IGSpeqMI1y6ud1EQSwv71ap9UEootJjxsjINxCvJJYbGcFP4urkEDPuxPtKVStOrAFKgz020ySUZZtM2k5M-3DMlnJFjd2PSWt882frgQB6UZI29-9JfodpBS4VlymHe4YGWUdAfSL-P1O0rSltedhM5LOROuIISJXHBlYSitYHK3EhR2Lg8WGfgwhFd-BzngZoYQUcW6rrcmUG15VZ3E2ymhGmiwdCKJIeiQ1O1AiDpr23jGUXpfwPZY-nYkMMXOjsQBDro2fZp'
                      />
                      <div>
                        <h4 className='font-bold text-slate-900'>
                          Linh Nguyễn
                        </h4>
                        <p className='text-xs text-slate-500'>UI/UX Designer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Testimonial 3 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className='h-full'
              >
                <Card className='bg-white rounded-3xl relative group shadow-sm hover:shadow-md transition-all border border-sky-100 h-full'>
                  <CardContent className='p-8 space-y-6'>
                    <span className='material-symbols-outlined text-5xl text-sky-500/10 absolute top-4 right-8'>
                      format_quote
                    </span>
                    <p className='text-slate-700 italic leading-relaxed relative z-10'>
                      "Lộ trình học tập rõ ràng, giúp mình từ một người không
                      biết gì về dữ liệu đã có thể tự tin ứng tuyển vào các công
                      ty lớn."
                    </p>
                    <div className='flex items-center space-x-4'>
                      <img
                        className='w-12 h-12 rounded-full object-cover ring-2 ring-sky-500/20'
                        alt='Student'
                        src='https://lh3.googleusercontent.com/aida-public/AB6AXuC5Hn5fWsm1MhRPXa3QAy-wpDyPKS4Fpg2UmqL565so-lJSfLSk-rWnV126swdBamHZF99Cg5Qwi-MAVWbMwSkrCdWpciF9ZE0KNPDhJtJ7QcJfnq0mf0RIfpbtGgRNDvP7Edkksg9GbjeizdYnIHT2h0mJ6paVAR8Gnfjy4G43r1Hlw9W43rKFrMg6-5vx8cyB7Feft-pd1ZOQMQlGY0fTqJ8sIN92iJe5dyyP9j3WW2BjeqY9a90eIqhG9c2Q2S_RAU48JGk8rVGF'
                      />
                      <div>
                        <h4 className='font-bold text-slate-900'>Hoàng Nam</h4>
                        <p className='text-xs text-slate-500'>Data Analyst</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
