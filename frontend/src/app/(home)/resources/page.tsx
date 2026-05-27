'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatePresence, motion } from 'framer-motion';
import { useCourses } from '@/contexts/CourseContext';
import { CourseListItem } from '@/api/courses';
import { CourseCard } from '@/components/course/CourseCard';
import { Search, Filter, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';

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

const fallbackCourses: CourseListItem[] = [
  {
    id: 'fallback-1',
    title: 'Fullstack Web Development với React & Node.js',
    description: 'Khóa học toàn diện về phát triển web fullstack và các công nghệ hiện đại.',
    thumbnailUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvL-3rWD6n1zTp6iNLoTplo5Tc13d92CXNgB694DGmIDFcAqxm20aWQ5zc2fWvYFhCDooaSoHvnZalMvXTNB8opUw6buL1VWStH1PbtrPyqBZ8MGsWdKNsloxManSL2fb1f3dsu-2bpINYJMZ3ha4nU7YJ2AcAjNdekAOYsiHuZMApDq13DRpgGIJQL6B4ItYPlA26VbvK5k2kqjRoRRiWmIB8yPbYH7XquZdb9jgCgMlcZMn8sMNf-V_sAQ1TOgpTkVcA5gtwTTur',
    price: 199,
    visibility: 'public',
    createdAt: '',
    instructor: { id: '', fullName: 'Glacier Team', avatarUrl: null },
    owner: { id: '', fullName: 'Glacier Team', avatarUrl: null },
    _count: { sections: 12, members: 1200 },
  },
  {
    id: 'fallback-2',
    title: 'Mastering Figma: Từ cơ bản đến nâng cao',
    description: 'Thiết kế UI/UX chuyên nghiệp với Figma từ con số không.',
    thumbnailUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ1oczZRpMZH5RjaohLMt9Cr3CgGNUqwsSG2tMlPHCEupfVNqLi3BrC3xjLbpXOJS11lK6k7lCmNyJvIfHs2ZsMgtb68GDPsX_o73qR088CWFt_AO70Z51zyxGsuwozWeuOVYdt4-cQLPaPkLaPfNCPiobmezmgqbjm8s-jwLX69Yj-guDcrVrD9zBTCugKqg3iezOpCqUUET4DOIRBC8MAE574zV02gWVxZpaEVUzF_zwIqc0D9X5IcAPJmXit9MMTk29eP60tnvo',
    price: 149,
    visibility: 'public',
    createdAt: '',
    instructor: { id: '', fullName: 'Glacier Team', avatarUrl: null },
    owner: { id: '', fullName: 'Glacier Team', avatarUrl: null },
    _count: { sections: 8, members: 850 },
  },
  {
    id: 'fallback-3',
    title: 'Phân tích dữ liệu kinh doanh với Python',
    description: 'Khóa học Data Science thực chiến dành cho mọi cấp độ.',
    thumbnailUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB5m84Q-9rjedfa6f6DpNCsWN3Dmi-0-kENCNGiuixU3dkVWdCkAavD_Vz1Kn-5M9l1Gmk3cS-NLkvQhviQ2YQVOxPG7b75__aaxITshn1QWOzja-1E72Hvgi8QDNxJ8Kpru5UHMVe0WhpEv40QrRiev47-DVoekuhkXmkPRpwSCu4fFKZMCi7IBI0FV2tUb3AEKMs7CzcipYbXKhQDuv_D11IBsMESPyc3xZjlFBcJHb2kDkXyR1YMTbpmlxqrA3rWaMZKJdqGd2PF',
    price: 210,
    visibility: 'public',
    createdAt: '',
    instructor: { id: '', fullName: 'Glacier Team', avatarUrl: null },
    owner: { id: '', fullName: 'Glacier Team', avatarUrl: null },
    _count: { sections: 14, members: 540 },
  },
  {
    id: 'fallback-4',
    title: 'Ứng dụng LLMs vào sản phẩm SaaS thực tế',
    description: 'Vượt qua các thách thức về độ trễ và chi phí khi tích hợp AI vào quy trình làm việc.',
    thumbnailUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO1orFr6seAalCTR2d7f2r_Oz28NlXAZq1c5kko7WjjyJPwvRhjdrnjQN-gCIsDuF81g_qfRM5s9Sc4wx3cB1y2eWybjB4UIgZJscsJtngkgnwf2qTgK1cIcvdEoUxpLp020AZiai_WN--CAcoOKsbmLghgEWZZ6ei3qJfEG7k_6HI-CnQbKyOg9TUZasqJIxjkb973mG4tDsP8rlXDquYKZE4OFItEsMcXLCBEyaOA_DcKm35YkBv7mZBSbD85MigYreXVWAsApfv',
    price: 0,
    visibility: 'public',
    createdAt: '',
    instructor: { id: '', fullName: 'Glacier Team', avatarUrl: null },
    owner: { id: '', fullName: 'Glacier Team', avatarUrl: null },
    _count: { sections: 5, members: 920 },
  },
];

export default function ResourcePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { courses: dbCourses, isLoading } = useCourses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const coursesToRender = dbCourses && dbCourses.length > 0 ? dbCourses : (isLoading ? [] : fallbackCourses);

  // Restore dynamic filtering
  const filteredCourses = coursesToRender.filter((course) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = course.title.toLowerCase().includes(query);
      const matchDesc = course.description?.toLowerCase().includes(query) || false;
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Type Filter (Free/Paid)
    if (selectedTypes.length > 0) {
      const isFree = Number(course.price) === 0;
      if (selectedTypes.includes('free') && !selectedTypes.includes('paid') && !isFree) return false;
      if (selectedTypes.includes('paid') && !selectedTypes.includes('free') && isFree) return false;
    }

    return true;
  });

  // Pagination for all filtered courses
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTypes, selectedTopics]);

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
            placeholder='Tìm kiếm khóa học...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className='absolute left-4 top-4.5 text-slate-400 size-5' />
        </div>
      </section>

      {/* Resource Bento Grid */}
      <section className='max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8'>
        {/* Filters Sidebar */}
        <aside className='md:col-span-3 space-y-6'>
          <div className='bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 sticky top-28 shadow-sm'>
            <h3 className='text-sky-500 font-bold mb-4 flex items-center gap-2'>
              <Filter className='size-5' /> Bộ lọc
            </h3>

            {/* Desktop Search */}
            <div className='relative mb-6'>
              <Input
                className='w-full bg-white border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm'
                placeholder='Tìm kiếm khóa học...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className='absolute left-3 top-2.5 text-slate-400 size-4' />
            </div>

            <div className='space-y-6'>
              <div>
                <Label className='text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2 block'>
                  Phân loại
                </Label>
                <div className='space-y-2'>
                  <Label className='flex items-center gap-2 text-slate-700 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                      checked={selectedTypes.length === 0}
                      onChange={() => setSelectedTypes([])}
                    />
                    <span className='group-hover:text-sky-500 transition-colors'>
                      Tất cả
                    </span>
                  </Label>
                  <Label className='flex items-center gap-2 text-slate-700 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                      checked={selectedTypes.includes('free')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes(prev => [...prev.filter(t => t !== 'free'), 'free']);
                        } else {
                          setSelectedTypes(prev => prev.filter(t => t !== 'free'));
                        }
                      }}
                    />
                    <span className='group-hover:text-sky-500 transition-colors'>
                      Khóa học miễn phí
                    </span>
                  </Label>
                  <Label className='flex items-center gap-2 text-slate-700 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='rounded border-slate-300 text-sky-500 focus:ring-sky-500'
                      checked={selectedTypes.includes('paid')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes(prev => [...prev.filter(t => t !== 'paid'), 'paid']);
                        } else {
                          setSelectedTypes(prev => prev.filter(t => t !== 'paid'));
                        }
                      }}
                    />
                    <span className='group-hover:text-sky-500 transition-colors'>
                      Khóa học trả phí
                    </span>
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Resource Cards */}
        <div className='md:col-span-9 space-y-8'>
          {isLoading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='h-72 bg-slate-200 animate-pulse rounded-2xl' />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className='text-center py-20 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-sm grow flex flex-col items-center justify-center space-y-4'>
              <SearchX className='text-slate-300 size-12' />
              <h3 className='text-xl font-bold text-slate-700'>
                Không tìm thấy khóa học nào phù hợp
              </h3>
              <p className='text-slate-500 max-w-sm'>
                Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc để tìm được các khóa học mong muốn.
              </p>
              <Button
                variant='outline'
                className='border-sky-500 text-sky-500 hover:bg-sky-500/10'
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTypes([]);
                  setSelectedTopics([]);
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          ) : (
            <div className='w-full space-y-8'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {paginatedCourses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex justify-center items-center gap-2 pt-8'>
                  <Button
                    variant='outline'
                    size='icon'
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className='border-slate-200 text-slate-600 rounded-lg hover:bg-sky-500 hover:text-white hover:border-sky-500 disabled:opacity-50 disabled:pointer-events-none'
                  >
                    <ChevronLeft className='size-4' />
                  </Button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`font-bold w-10 h-10 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-sky-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant='outline'
                    size='icon'
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className='border-slate-200 text-slate-600 rounded-lg hover:bg-sky-500 hover:text-white hover:border-sky-500 disabled:opacity-50 disabled:pointer-events-none'
                  >
                    <ChevronRight className='size-4' />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
