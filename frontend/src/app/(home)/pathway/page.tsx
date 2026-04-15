'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PathwayPage() {
  return (
    <main className='flex-1 pt-24 pb-16 px-6 max-w-7xl mx-auto w-full'>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mb-16 text-center'
      >
        <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6'>
          Định Hướng Lộ Trình Phát Triển
        </h1>
        <p className='text-slate-500 max-w-2xl mx-auto text-lg'>
          Khám phá các lộ trình học tập được thiết kế chuyên sâu để giúp bạn làm
          chủ các kỹ năng công nghệ hàng đầu hiện nay.
        </p>
      </motion.section>

      {/* Pathway Grid (Bento Style) */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-6 mb-16'>
        {/* Fullstack Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.4 }}
          className='md:col-span-8'
        >
          <Card className='relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border-sky-500/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-3xl -z-10 rounded-full'></div>
            <CardContent className='p-8'>
              <div className='flex flex-col md:flex-row gap-8 items-start'>
                <div className='flex-1'>
                  <span className='inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-4'>
                    POPULAR
                  </span>
                  <h2 className='text-3xl font-bold mb-4 text-slate-900'>
                    Fullstack Web Development
                  </h2>
                  <p className='text-slate-500 mb-6'>
                    Từ Frontend linh hoạt đến Backend mạnh mẽ. Làm chủ toàn bộ
                    quy trình xây dựng ứng dụng hiện đại.
                  </p>
                  <div className='flex flex-wrap gap-3'>
                    <span className='flex items-center gap-1 text-sm bg-slate-100 px-3 py-1 rounded-lg text-slate-600'>
                      <span className='material-symbols-outlined text-base'>
                        timer
                      </span>{' '}
                      12 Tháng
                    </span>
                    <span className='flex items-center gap-1 text-sm bg-slate-100 px-3 py-1 rounded-lg text-slate-600'>
                      <span className='material-symbols-outlined text-base'>
                        layers
                      </span>{' '}
                      4 Giai đoạn
                    </span>
                  </div>
                </div>
                <div className='w-full md:w-48 h-48 rounded-xl overflow-hidden shrink-0 shadow-md'>
                  <img
                    alt='Code on screen'
                    className='w-full h-full object-cover'
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuCOHeyBSKw8dKbuaEsd6QcF8w714axv76vyGcIstGYbu3da5QfiaMud1NLhAf19jHRd2cWSwhyxTuG8757swh9Tvhf3byWEO_-FIJMY0dlmLrUXz7HLfLU-bIz1cg0P7BPIh60aZMEflCSvewwBujGbFxr4GK34hzGoR0UDDWivCaCLdosCgwSO1JsDfHZF_Ep3pJGqyWPPgMwDIl1Q-XimyUymXraSLDjFmUT5VxEJIhJkuoUthMUFdNuNhmIvjjR5EXGamX9EYmNO'
                  />
                </div>
              </div>

              {/* Visual Pathway Steps */}
              <div className='mt-12 relative'>
                {/* Dashed Connecting Line (Desktop) */}
                <div className='hidden md:block absolute top-6 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-sky-300/60 z-0'></div>
                {/* Dashed Connecting Line (Mobile) */}
                <div className='md:hidden absolute left-1/2 top-6 bottom-6 border-l-2 border-dashed border-sky-300/60 -translate-x-1/2 z-0'></div>

                <div className='grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4'>
                  {[
                    { step: 1, title: 'FRONTEND', color: 'bg-sky-500' },
                    { step: 2, title: 'BACKEND', color: 'bg-sky-500' },
                    { step: 3, title: 'DATABASE', color: 'bg-sky-500' },
                    { step: 4, title: 'DEPLOY', color: 'bg-slate-700' },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className='relative z-10 flex flex-col items-center text-center'
                    >
                      <div
                        className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-white font-bold mb-2 shadow-lg ring-4 ring-white`}
                      >
                        {item.step}
                      </div>
                      <span className='text-xs font-bold text-slate-700'>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* UI/UX Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className='md:col-span-4'
        >
          <Card className='bg-purple-50/50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full rounded-3xl'>
            <CardContent className='p-8 flex flex-col h-full'>
              <span
                className='material-symbols-outlined text-4xl text-purple-500 mb-6'
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                palette
              </span>
              <h2 className='text-2xl font-bold mb-4 text-slate-900'>
                UI/UX Design Specialist
              </h2>
              <p className='text-slate-500 mb-8'>
                Kiến tạo trải nghiệm người dùng tuyệt vời qua tư duy thiết kế và
                giao diện hiện đại.
              </p>
              <div className='space-y-4 mb-8'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs'>
                    A
                  </div>
                  <span className='text-sm font-medium text-slate-700'>
                    Design Thinking
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs'>
                    B
                  </div>
                  <span className='text-sm font-medium text-slate-700'>
                    Visual Design & Prototyping
                  </span>
                </div>
              </div>
              <Button className='mt-auto w-full py-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md'>
                Bắt đầu ngay
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Science Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className='md:col-span-5'
        >
          <Card className='bg-teal-50 border-teal-200 shadow-lg rounded-3xl overflow-hidden relative h-full'>
            <div className='absolute -bottom-10 -right-10 opacity-10 transform rotate-12'>
              <span className='material-symbols-outlined text-[120px] text-teal-600'>
                database
              </span>
            </div>
            <CardContent className='p-8 relative z-10 flex flex-col h-full justify-center'>
              <h2 className='text-2xl font-bold mb-2 text-slate-900'>
                Data Science
              </h2>
              <p className='text-slate-500 mb-6'>
                Khai phá sức mạnh của dữ liệu và AI.
              </p>
              <Link
                href='#'
                className='flex items-center gap-2 text-teal-600 font-semibold hover:gap-3 transition-all mt-auto w-max'
              >
                <span>Xem lộ trình chi tiết</span>
                <span className='material-symbols-outlined'>arrow_forward</span>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cyber Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className='md:col-span-7'
        >
          <Card className='bg-white/60 backdrop-blur-xl border-slate-200 shadow-lg rounded-3xl h-full flex items-center'>
            <CardContent className='p-8 flex flex-col md:flex-row gap-6 items-center w-full'>
              <div className='flex-1 text-center md:text-left'>
                <h2 className='text-2xl font-bold mb-2 text-slate-900'>
                  Cyber Security
                </h2>
                <p className='text-slate-500'>
                  Bảo mật hệ thống và dữ liệu trong kỷ nguyên số.
                </p>
                <div className='mt-4 flex flex-wrap justify-center md:justify-start gap-2'>
                  <span className='px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium'>
                    Ethical Hacking
                  </span>
                  <span className='px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium'>
                    Networking
                  </span>
                </div>
              </div>
              <div className='flex -space-x-4'>
                <img
                  alt='Avatar 1'
                  className='w-12 h-12 rounded-full border-4 border-white object-cover'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuCTGacKIl7Cr0IvXMarpaJA7tl0dNQTkmAJ9skYJiBuHrDT0sSKbJJiL6VHw8XfT82fZRGUTCFJQfc6QNU__2OsJycWuO6dXepscCiB7PeJXYeIlf42T8w_wrZW4WUaHWjmjkkV4uKxwZFqDVvVWLGRsDL_7r3_GJuHiD1Ugf3LB8t83QUug4IWyShjOf0y3T6pmjtbYMxZAgz6xgpsmU-YZ1ZeqL9z5CruGL2UzDgS62afS_SWhbsAhG9KpkXrkDaKfWAKzcoUqSb8'
                />
                <img
                  alt='Avatar 2'
                  className='w-12 h-12 rounded-full border-4 border-white object-cover'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuCxjczxpOxX9xo6K_gdHjw_2Lgnea2qaK6Vptxy21hp-QTvOqGfde2GdabaKEk8Vb3mncZDBNr9TcPdkaP_XkbnaGxh-4opzAnfIJVTeRtCKWYQ6sv9HUg4o_WrDDQ6DnJp2od1xQ3lfr4S5dmewGadEEspmwc8Eu8QkGP-fB9LNgZa9YWbcQT9NA9vgh5moAyHqY8266L0q3wkx_mZot3kGje9WgNljb4gBmbF0pZdK7ScmIBLoJco7kSvwDmUV0t_qCIi6nLNr5HW'
                />
                <div className='w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs border-4 border-white font-bold z-10'>
                  +2k
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Section: Why Choose Us (Pastel Background) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className='rounded-3xl bg-slate-50 p-12 mb-16 overflow-hidden relative shadow-inner border border-slate-100'
      >
        <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-500/5 to-purple-500/5'></div>
        <div className='relative z-10 text-center mb-12'>
          <h2 className='text-3xl font-bold text-slate-900'>
            Tại sao nên chọn Glacier Pathway?
          </h2>
        </div>
        <div className='relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='text-center p-6 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/60 shadow-sm'>
            <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-sky-500'>
              <span className='material-symbols-outlined text-3xl'>
                verified
              </span>
            </div>
            <h3 className='font-bold mb-2 text-slate-900'>Chứng chỉ uy tín</h3>
            <p className='text-sm text-slate-500'>
              Chứng nhận hoàn thành có giá trị cao trong mắt nhà tuyển dụng.
            </p>
          </div>
          <div className='text-center p-6 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/60 shadow-sm'>
            <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-sky-500'>
              <span className='material-symbols-outlined text-3xl'>groups</span>
            </div>
            <h3 className='font-bold mb-2 text-slate-900'>Mentor đồng hành</h3>
            <p className='text-sm text-slate-500'>
              Hỗ trợ 1-1 và review code từ các chuyên gia trong ngành.
            </p>
          </div>
          <div className='text-center p-6 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/60 shadow-sm'>
            <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-sky-500'>
              <span className='material-symbols-outlined text-3xl'>
                terminal
              </span>
            </div>
            <h3 className='font-bold mb-2 text-slate-900'>Dự án thực tế</h3>
            <p className='text-sm text-slate-500'>
              Xây dựng portfolio với các dự án bám sát yêu cầu thực tế.
            </p>
          </div>
        </div>
      </motion.section>

      {/* FAQ or Help CTA */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.4 }}
      >
        <Card className='bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-lg'>
          <CardContent className='p-8 flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='text-center md:text-left'>
              <h3 className='text-xl font-bold text-slate-900 mb-2'>
                Bạn chưa chọn được lộ trình phù hợp?
              </h3>
              <p className='text-slate-500'>
                Hãy để chuyên gia của chúng tôi tư vấn cho bạn hoàn toàn miễn
                phí.
              </p>
            </div>
            <Button className='px-8 py-6 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:bg-slate-800 w-full md:w-auto'>
              Liên hệ tư vấn
            </Button>
          </CardContent>
        </Card>
      </motion.section>
    </main>
  );
}
