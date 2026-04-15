'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Kho tài nguyên',
    description:
      'Thư viện kiến thức chuyên sâu, tài liệu thực hành và hướng dẫn thực tế để giúp bạn làm chủ mọi kỹ năng trong hành trình của mình.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB9gfOimTGP6ziVJw7dDPAg6lZfufMuEikWFNFVZYndZJp-3h6LGQDc70K9tEAyWfjPPcE1-PdkCBmlk8fzvICvwBZhK6ADT4noMBkL-FR_asYZGja7UfqxMEgGAI085q7VAdXlHDyE10OmAn6X58N7skqCVY-ssk2AeBj7nn8rC-enTbZewRg5cXvA0Pr1XThIJCCWcWI7JO0TUWYW26qKPXOM_8IF5DiVEbtx_B4ZNKPrUGqKNXvH9sTTQ_ZSK_pEruiVTJV71XH4',
  },
  {
    id: 2,
    title: 'Phát triển Web Fullstack',
    description:
      'Nắm vững quy trình xây dựng ứng dụng với React & Node.js qua các dự án thực tế, từ cấu trúc dữ liệu đến triển khai.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvL-3rWD6n1zTp6iNLoTplo5Tc13d92CXNgB694DGmIDFcAqxm20aWQ5zc2fWvYFhCDooaSoHvnZalMvXTNB8opUw6buL1VWStH1PbtrPyqBZ8MGsWdKNsloxManSL2fb1f3dsu-2bpINYJMZ3ha4nU7YJ2AcAjNdekAOYsiHuZMApDq13DRpgGIJQL6B4ItYPlA26VbvK5k2kqjRoRRiWmIB8yPbYH7XquZdb9jgCgMlcZMn8sMNf-V_sAQ1TOgpTkVcA5gtwTTur',
  },
  {
    id: 3,
    title: 'Mastering UI/UX Design',
    description:
      'Biến ý tưởng thành sản phẩm trực quan, thân thiện với người dùng thông qua các Case Study và bài tập thiết kế chuyên sâu.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ1oczZRpMZH5RjaohLMt9Cr3CgGNUqwsSG2tMlPHCEupfVNqLi3BrC3xjLbpXOJS11lK6k7lCmNyJvIfHs2ZsMgtb68GDPsX_o73qR088CWFt_AO70Z51zyxGsuwozWeuOVYdt4-cQLPaPkLaPfNCPiobmezmgqbjm8s-jwLX69Yj-guDcrVrD9zBTCugKqg3iezOpCqUUET4DOIRBC8MAE574zV02gWVxZpaEVUzF_zwIqc0D9X5IcAPJmXit9MMTk29eP60tnvo',
  },
];

const ARTICLES = [
  {
    id: 1,
    tag: 'ARTICLE',
    tagClass: 'bg-sky-100 text-sky-600',
    title: 'Tối ưu hiệu suất React với Server Components',
    description:
      'Khám phá cách thức hoạt động và lợi ích vượt trội của React Server Components trong việc giảm kích thước bundle.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJMy5oD1BbxFYSzQLwZas46KcxEVFsArVRp2YtAOYb8zW4WZf6z5E7Gxmxob_Mhq7-nqe5-PrCw87886dktCu_nsTXdT9Kb1vLMSV-hvMzTIX3WWC7m8-ZUaMcHacH-hYg4Xd3HsOV3LX9AkDNHouyMK6AE_snIkW-7Av0CgUUybc1HW3rBmhU1cmxg-EnlyFicjF1giFpVeYTI3iGs7Yw7FA3nM2_IfneY8q6G9pUpunu8XORGDfS9uxs13h93LYU4wnkWXtD-Bl8',
    meta: '5 phút đọc',
    actionColor: 'text-sky-500 hover:text-sky-600',
    actionIcon: 'arrow_forward',
    actionText: 'Đọc tiếp',
    hoverBorder: 'hover:border-sky-500/40',
  },
  {
    id: 2,
    tag: 'CASE STUDY',
    tagClass: 'bg-purple-100 text-purple-600',
    title: 'Case Study: Thiết kế lại hệ thống thanh toán Glacier',
    description:
      'Cách chúng tôi giảm tỷ lệ bỏ giỏ hàng 25% thông qua việc tái cấu trúc luồng người dùng.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuApCJCzJA_gTNTUSxnxJQ08ZnlTnz7_7ZhcGbl5dPFOrUiUwK05LiLoZV_5TDc9WY1vvUS6XRDaUFAOiet36gQbr2YXeBErfZp1OKtJyCG2tR9AYjA_v3ox4s7VOXwGx8iyFUZEV5IED0v0ilKWCOGcwHqebCSXfcoaS9yBOZbr-Pqo-TaV0nq7WU6N2XSIhAgS4lBeZt-cK828hFc26CYHe3wXO8gY0jg6vM9NcglmQ7jCInAdVhG3tfsirvtISxbDOoLlkqIUbVID',
    meta: '12 phút đọc',
    actionColor: 'text-purple-600 hover:text-purple-700',
    actionIcon: 'arrow_forward',
    actionText: 'Đọc tiếp',
    hoverBorder: 'hover:border-purple-500/40',
  },
  {
    id: 3,
    tag: 'WORKBOOK',
    tagClass: 'bg-sky-200 text-sky-800',
    title: 'Bộ tài liệu thực hành Design System v2.0',
    description:
      'Template Figma và code boilerplate giúp bạn xây dựng design system từ con số không.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJzLcx8KrXRLOaL41Q1hC6xZVrQMdgS10k46J8D4M-k81AAcATkGGK0f2ViV1oPLwW6xTDBf2dXW07qoHBOCxFM18JDcwxHxDpdQCC7r1he62ngI3bduTgHCR7UabzAFDb4TDsjdHej1gcXaWHRxog5wKjY0_aW8MRUzJSWQKh4TuJAUfasNSh8c9xE9wzrfCjrleNiqXcnME7E2GBNPHBQnP--z4DkUuyyGUcZm4eDCe0-Bg7vumH3jdtHemR7IIrBTsi19_vsYco',
    meta: 'Tài liệu thực hành',
    actionColor: 'text-sky-700 hover:text-sky-800',
    actionIcon: 'visibility',
    actionText: 'Xem mẫu',
    hoverBorder: 'hover:border-sky-500/40',
  },
  {
    id: 4,
    tag: 'ARTICLE',
    tagClass: 'bg-sky-100 text-sky-600',
    title: 'Ứng dụng LLMs vào sản phẩm SaaS thực tế',
    description:
      'Vượt qua các thách thức về độ trễ và chi phí khi tích hợp AI vào quy trình làm việc.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO1orFr6seAalCTR2d7f2r_Oz28NlXAZq1c5kko7WjjyJPwvRhjdrnjQN-gCIsDuF81g_qfRM5s9Sc4wx3cB1y2eWybjB4UIgZJscsJtngkgnwf2qTgK1cIcvdEoUxpLp020AZiai_WN--CAcoOKsbmLghgEWZZ6ei3qJfEG7k_6HI-CnQbKyOg9TUZasqJIxjkb973mG4tDsP8rlXDquYKZE4OFItEsMcXLCBEyaOA_DcKm35YkBv7mZBSbD85MigYreXVWAsApfv',
    meta: '8 phút đọc',
    actionColor: 'text-sky-500 hover:text-sky-600',
    actionIcon: 'arrow_forward',
    actionText: 'Đọc tiếp',
    hoverBorder: 'hover:border-sky-500/40',
  },
];

export default function ResourcePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className='flex-1 pt-24 pb-20 bg-[#f8fbff]'>
      {/* Hero Section */}
      <section className='max-w-7xl mx-auto px-6 mb-12'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.4 }}
        >
          <div className='relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl flex items-center'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className='absolute inset-0 z-0'
              >
                <img
                  alt={HERO_SLIDES[currentSlide].title}
                  className='w-full h-full object-cover brightness-[0.4]'
                  src={HERO_SLIDES[currentSlide].image}
                />
                <div className='absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent'></div>
              </motion.div>
            </AnimatePresence>

            <div className='relative z-10 max-w-2xl p-8 md:p-16'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className='text-4xl md:text-5xl font-bold text-sky-100 mb-4 tracking-tight'>
                    {HERO_SLIDES[currentSlide].title}
                  </h1>
                  <p className='text-sky-200/80 text-lg leading-relaxed'>
                    {HERO_SLIDES[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide Indicators */}
            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2'>
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'bg-sky-400 w-8'
                      : 'bg-white/50 hover:bg-white/80 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Mobile Search */}
      <section className='max-w-7xl mx-auto px-6 mb-8 lg:hidden'>
        <div className='relative'>
          <Input
            className='w-full bg-white/80 border-slate-200 pl-12 py-6 rounded-xl'
            placeholder='Tìm kiếm tài nguyên...'
          />
          <span className='material-symbols-outlined absolute left-4 top-3.5 text-slate-400'>
            search
          </span>
        </div>
      </section>

      {/* Resource Bento Grid */}
      <section className='max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8'>
        {/* Filters Sidebar */}
        <aside className='md:col-span-3 space-y-6'>
          <div className='bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 sticky top-28 shadow-sm'>
            <h3 className='text-sky-500 font-bold mb-4 flex items-center gap-2'>
              <span className='material-symbols-outlined'>filter_list</span> Bộ
              lọc
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2 block'>
                  Phân loại
                </label>
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-slate-700 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                      defaultChecked
                    />
                    <span className='group-hover:text-sky-500 transition-colors'>
                      Tất cả
                    </span>
                  </label>
                  <label className='flex items-center gap-2 text-slate-700 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                    />
                    <span className='group-hover:text-sky-500 transition-colors'>
                      Bài viết (124)
                    </span>
                  </label>
                  <label className='flex items-center gap-2 text-slate-700 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                    />
                    <span className='group-hover:text-sky-500 transition-colors'>
                      Ebooks (42)
                    </span>
                  </label>
                  <label className='flex items-center gap-2 text-slate-700 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                    />
                    <span className='group-hover:text-sky-500 transition-colors'>
                      Case Studies (18)
                    </span>
                  </label>
                  <label className='flex items-center gap-2 text-slate-700 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                    />
                    <span className='group-hover:text-sky-500 transition-colors'>
                      Thực hành (31)
                    </span>
                  </label>
                </div>
              </div>
              <div className='pt-4 border-t border-slate-200'>
                <label className='text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2 block'>
                  Chủ đề
                </label>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full cursor-pointer hover:bg-sky-200 transition-colors'>
                    Design
                  </span>
                  <span className='px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full cursor-pointer hover:bg-purple-200 transition-colors'>
                    Coding
                  </span>
                  <span className='px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full cursor-pointer hover:bg-teal-200 transition-colors'>
                    Product
                  </span>
                  <span className='px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full cursor-pointer hover:bg-slate-200 transition-colors'>
                    AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Resource Cards */}
        <div className='md:col-span-9 space-y-8'>
          {/* Featured Ebook (Large) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className='rounded-3xl overflow-hidden flex flex-col md:flex-row group border-2 border-sky-500/20 shadow-xl bg-white/60 backdrop-blur-xl'>
              <div className='md:w-2/5 relative h-64 md:h-auto overflow-hidden'>
                <img
                  alt='ebook cover'
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuBK4XMI8KAIwjRMdSJoL_hSSDYOza41muRrel53Z8IWuMLc6h-zYofSyakbLWtzVzGfvwmTJ9KzcNBDfA68KLpN2pCKvf6le9AEQYpwvviApGfEfFrabol1zMYrptjs8iZt4UGGVBodomMSnV4oyfPhwhdXuvXbLxuPGF5CNRWT-HAVhM5cjXu_IkDjvC3v6FFrUaR0H7yp1Q7n-j9z30pe2UcpsA73yOeLeuuYwivSVLquMfJADz2ubXj-OFzDPU2pnyRZ8tE62kbM'
                />
                <div className='absolute top-4 left-4 bg-sky-500 text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest'>
                  Ebook nổi bật
                </div>
              </div>
              <CardContent className='md:w-3/5 p-8 flex flex-col justify-center border-none border-0 pt-8 pb-8'>
                <span className='text-sky-500 font-semibold text-sm mb-2'>
                  PRODUCT MANAGEMENT
                </span>
                <h2 className='text-2xl font-bold text-slate-900 mb-4'>
                  Làm chủ quy trình phát triển sản phẩm 2024
                </h2>
                <p className='text-slate-500 mb-6 leading-relaxed'>
                  Hướng dẫn chi tiết từ A-Z cho Product Manager về việc xây dựng
                  roadmap, quản lý backlog và tối ưu hóa trải nghiệm người dùng.
                </p>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center'>
                      <span className='material-symbols-outlined text-sky-500'>
                        download
                      </span>
                    </div>
                    <span className='text-sm font-medium text-slate-500'>
                      1.2k lượt tải
                    </span>
                  </div>
                  <Button className='bg-sky-500 text-white rounded-xl shadow-md hover:bg-sky-600'>
                    Tải tài liệu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Articles Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {ARTICLES.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card
                  className={`rounded-2xl p-1 flex flex-col ${article.hoverBorder} transition-all duration-300 shadow-sm bg-white/60 backdrop-blur-md h-full`}
                >
                  <div className='h-48 rounded-xl overflow-hidden relative mb-4'>
                    <img
                      alt={article.title}
                      className='w-full h-full object-cover'
                      src={article.image}
                    />
                    <div
                      className={`absolute bottom-3 left-3 px-2 py-1 text-xs font-bold rounded ${article.tagClass}`}
                    >
                      {article.tag}
                    </div>
                  </div>
                  <CardContent className='p-4 flex flex-col flex-grow'>
                    <h3 className='text-lg font-bold text-slate-900 mb-2 leading-tight hover:text-sky-500 transition-colors'>
                      {article.title}
                    </h3>
                    <p className='text-slate-500 text-sm line-clamp-3 mb-4'>
                      {article.description}
                    </p>
                    <div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-200'>
                      <span className='text-xs text-slate-400'>
                        {article.meta}
                      </span>
                      <Link
                        href='#'
                        className={`${article.actionColor} text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all`}
                      >
                        {article.actionText}{' '}
                        <span className='material-symbols-outlined text-sm'>
                          {article.actionIcon}
                        </span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className='flex justify-center items-center gap-2 pt-8'>
            <Button
              variant='outline'
              size='icon'
              className='border-slate-200 text-slate-600 rounded-lg hover:bg-sky-500 hover:text-white hover:border-sky-500'
            >
              <span className='material-symbols-outlined'>chevron_left</span>
            </Button>
            <Button className='bg-sky-500 text-white font-bold w-10 h-10 rounded-lg'>
              1
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100'
            >
              2
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100'
            >
              3
            </Button>
            <span className='px-2 text-slate-400'>...</span>
            <Button
              variant='outline'
              size='icon'
              className='border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100'
            >
              12
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='border-slate-200 text-slate-600 rounded-lg hover:bg-sky-500 hover:text-white hover:border-sky-500'
            >
              <span className='material-symbols-outlined'>chevron_right</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className='max-w-7xl mx-auto px-6 mt-24'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.4 }}
          className='bg-sky-500 rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl'
        >
          <div className='absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32'></div>
          <div className='relative z-10 max-w-lg'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Cập nhật tài nguyên mới nhất
            </h2>
            <p className='text-sky-100'>
              Đăng ký bản tin hàng tuần để nhận những tài liệu chuyên sâu nhất
              trực tiếp vào hộp thư của bạn.
            </p>
          </div>
          <div className='relative z-10 w-full md:w-auto'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Input
                className='px-6 py-6 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-sky-100 outline-none focus-visible:ring-white/40 w-full sm:w-80'
                placeholder='Email của bạn...'
                type='email'
              />
              <Button className='bg-white text-sky-500 hover:bg-sky-50 px-8 py-6 rounded-xl font-bold shadow-md'>
                Đăng ký ngay
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
