'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CommunityPage() {
  return (
    <main className='flex-1 pt-16 min-h-screen bg-slate-50/50 pb-20'>
      {/* Hero Section: Community Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className='relative h-64 md:h-80 flex items-center justify-center overflow-hidden'
      >
        <div className='absolute inset-0 z-0'>
          <img
            className='w-full h-full object-cover'
            alt='vibrant modern co-working space'
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuCqjmbwaGNU_TKrWxoFlzid63rAIF6feUHrlx3l4cglExpYWWJf9uPSGxhqxfwEMZzhYw5y_BOrPeX_pkLyPk1Eu80KBKHOuBH49bVedoWcaUnETjYQhLubSCERGdCjI8-JeptD71GTJG7LHUBYr7_8i2WGSXPnuZRsYqAV2jS6rbxbgwwIrPIp-98lBRD1TXbxyrL1853xTGVfCmbBWhKT2m5BTwIo4v41MZaSbAGEdCZEBRpMMu1Flnbv7Hn9gsx14SvPVSbMZnnk'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/90 via-[#0a0e1a]/70 to-transparent'></div>
        </div>
        <div className='relative z-10 max-w-7xl mx-auto px-6 w-full'>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='max-w-2xl'
          >
            <h1 className='text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight'>
              Cộng đồng học viên
            </h1>
            <p className='text-sky-100/80 text-lg md:text-xl'>
              Kết nối, chia sẻ kiến thức và cùng nhau chinh phục những đỉnh cao
              mới trên hành trình học tập.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content Grid */}
      <div className='max-w-7xl mx-auto px-6 py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Left Column: Discussion & Feed */}
          <div className='lg:col-span-8 space-y-8'>
            {/* Discussion Categories/Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4 }}
              className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'
            >
              <Button className='rounded-full shadow-md bg-sky-500 text-white hover:bg-sky-600'>
                Tất cả
              </Button>
              <Button
                variant='outline'
                className='rounded-full bg-white/50 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-white'
              >
                Thảo luận chung
              </Button>
              <Button
                variant='outline'
                className='rounded-full bg-white/50 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-white'
              >
                Nhóm học tập
              </Button>
              <Button
                variant='outline'
                className='rounded-full bg-white/50 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-white'
              >
                Hỏi đáp
              </Button>
            </motion.div>

            {/* Discussion Feed */}
            <div className='space-y-6'>
              {/* Post Item 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className='bg-white/60 backdrop-blur-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl group'>
                  <CardContent className='p-6'>
                    <div className='flex items-start gap-4'>
                      <img
                        className='w-12 h-12 rounded-full object-cover shrink-0'
                        alt='Avatar'
                        src='https://lh3.googleusercontent.com/aida-public/AB6AXuBcyJJ71g2CiER_eYRyaDvE4A8K4RLw7SpBYlSN-81Kgpu-MKMqIUP7B2Kba-v63K_u_2WskC0XHYUfswxofUkHMjCoNYKSxhhasJ1Dj7nqnTKnflV2o9ydTs1AlcFjctTt5NdkU1aixzkGioCG2tsmrZS4FYVe1tHtISp5Zif2Ls7NlqxWXBrEoCyZ4gEtEyldLoOuhoZpS16hgN9Rbh3IFNleOLKY4ReWLtP0zBHLiqimORcyDDLgw2gHftv72YGcAeuGPhsFISyY'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-wrap items-center gap-2 mb-1'>
                          <span className='font-bold text-slate-900'>
                            Minh Nguyễn
                          </span>
                          <span className='text-xs text-slate-500'>
                            • 2 giờ trước
                          </span>
                          <span className='bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider'>
                            Hỏi đáp
                          </span>
                        </div>
                        <h3 className='text-lg font-bold text-sky-600 mb-2 group-hover:underline cursor-pointer leading-tight'>
                          Làm thế nào để tối ưu hóa thời gian học Pathway trong
                          Glacier?
                        </h3>
                        <p className='text-slate-600 text-sm line-clamp-2 mb-4'>
                          Chào mọi người, mình đang gặp khó khăn trong việc cân
                          bằng công việc và các khóa học Resources. Có ai có tip
                          gì về quản lý thời gian không?
                        </p>
                        <div className='flex items-center gap-6 text-slate-500 text-sm'>
                          <button className='flex items-center gap-1.5 hover:text-sky-500 transition-colors'>
                            <span className='material-symbols-outlined text-lg'>
                              thumb_up
                            </span>
                            <span>24</span>
                          </button>
                          <button className='flex items-center gap-1.5 hover:text-sky-500 transition-colors'>
                            <span className='material-symbols-outlined text-lg'>
                              chat_bubble
                            </span>
                            <span>12 bình luận</span>
                          </button>
                          <button className='flex items-center gap-1.5 hover:text-sky-500 transition-colors ml-auto'>
                            <span className='material-symbols-outlined text-lg'>
                              share
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Post Item 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className='bg-white/60 backdrop-blur-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl group'>
                  <CardContent className='p-6'>
                    <div className='flex items-start gap-4'>
                      <img
                        className='w-12 h-12 rounded-full object-cover shrink-0'
                        alt='Avatar'
                        src='https://lh3.googleusercontent.com/aida-public/AB6AXuCzvGNwETFIzaNRoN6yk50tejNM1UXyn4vAqe7hoGvL6ycYgMlB3ms19QX2QQ5Y8NUvfsLPEyg1ZRxRjJ0h0yKCaRoylDppiVqgerIkyvVBQFCeA28eNNLeOdcQW59kBDLr-KrRX6BCBuNZm_MdxxUpEB9jI5T-WNzzwC-PcA9WCGR4SVGmfqrvdEginR7PPBs43MtdSp4YtHvULVTF-GdfI1MrkeLIjPx31blu5rJ3xrRfs1FfDTdvDN2yhCN0RRLmWPN_0xNor4Cx'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-wrap items-center gap-2 mb-1'>
                          <span className='font-bold text-slate-900'>
                            Lan Anh
                          </span>
                          <span className='text-xs text-slate-500'>
                            • 5 giờ trước
                          </span>
                          <span className='bg-teal-100 text-teal-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider'>
                            Thành tựu
                          </span>
                        </div>
                        <h3 className='text-lg font-bold text-sky-600 mb-2 group-hover:underline cursor-pointer leading-tight'>
                          Vừa hoàn thành chứng chỉ Pathway cấp độ 3!
                        </h3>
                        <p className='text-slate-600 text-sm line-clamp-2 mb-4'>
                          Sau 3 tháng nỗ lực, cuối cùng mình cũng đạt được mục
                          tiêu. Cảm ơn sự hỗ trợ của cộng đồng Glacier rất
                          nhiều.
                        </p>
                        <img
                          className='w-full h-48 object-cover rounded-xl mb-4 shadow-sm'
                          alt='Celebration'
                          src='https://lh3.googleusercontent.com/aida-public/AB6AXuA1EF8LLchbEQ1k8dVz1OMwwOrQXV32zFrqTgTh0vT7pR2UyZsL4q_Znc54OtRIbiUe9huAK1E3j2rzt7e300F4pW3p1H4LG0cvccSeFGYuHMTi3-KphozFth2NN9V0Dbh8E5dYZLbxig2RSrIpAWIoM0_xHhzUAhfdDABeL2Xmc9mK4QYUhcnWHCfCtK9kyF-41o7I2CWGt7o-EpWJu3J-UJZSTlvZYDWIDotGQJMS79OLmLLTL4di378v5bq386VqieZXvCS9p1Vz'
                        />
                        <div className='flex items-center gap-6 text-slate-500 text-sm'>
                          <button className='flex items-center gap-1.5 text-sky-500 font-semibold'>
                            <span
                              className='material-symbols-outlined text-lg'
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              thumb_up
                            </span>
                            <span>156</span>
                          </button>
                          <button className='flex items-center gap-1.5 hover:text-sky-500 transition-colors'>
                            <span className='material-symbols-outlined text-lg'>
                              chat_bubble
                            </span>
                            <span>45 bình luận</span>
                          </button>
                          <button className='flex items-center gap-1.5 hover:text-sky-500 transition-colors ml-auto'>
                            <span className='material-symbols-outlined text-lg'>
                              share
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Post Item 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className='bg-white/60 backdrop-blur-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl group'>
                  <CardContent className='p-6'>
                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center shrink-0'>
                        <span className='material-symbols-outlined text-sky-600'>
                          school
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-wrap items-center gap-2 mb-1'>
                          <span className='font-bold text-slate-900'>
                            Glacier Official
                          </span>
                          <span className='text-xs text-slate-500'>
                            • 1 ngày trước
                          </span>
                          <span className='bg-sky-100 text-sky-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider'>
                            Thông báo
                          </span>
                        </div>
                        <h3 className='text-lg font-bold text-sky-600 mb-2 group-hover:underline cursor-pointer leading-tight'>
                          Cập nhật lộ trình học tập mới cho tháng 10
                        </h3>
                        <p className='text-slate-600 text-sm mb-4'>
                          Chúng tôi vừa bổ sung thêm 5 chuyên đề mới vào Pathway
                          ngành Thiết kế đồ họa. Khám phá ngay!
                        </p>
                        <div className='flex items-center gap-6 text-slate-500 text-sm'>
                          <button className='flex items-center gap-1.5 hover:text-sky-500 transition-colors'>
                            <span className='material-symbols-outlined text-lg'>
                              thumb_up
                            </span>
                            <span>89</span>
                          </button>
                          <button className='flex items-center gap-1.5 hover:text-sky-500 transition-colors'>
                            <span className='material-symbols-outlined text-lg'>
                              chat_bubble
                            </span>
                            <span>8 bình luận</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Events & Sidebar */}
          <div className='lg:col-span-4 space-y-8'>
            {/* Events Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className='bg-slate-50 p-6 rounded-3xl border border-sky-500/10 shadow-sm'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='font-bold text-lg text-slate-900 flex items-center gap-2'>
                    <span className='material-symbols-outlined text-sky-500'>
                      calendar_month
                    </span>
                    Lịch sự kiện
                  </h2>
                  <button className='text-xs font-semibold text-sky-500 hover:underline'>
                    Xem tất cả
                  </button>
                </div>
                <div className='space-y-4'>
                  <div className='flex gap-4 group cursor-pointer'>
                    <div className='flex-shrink-0 w-12 h-14 bg-white rounded-lg flex flex-col items-center justify-center border border-slate-200 shadow-sm group-hover:border-sky-500 transition-colors'>
                      <span className='text-[10px] font-bold text-sky-500 uppercase'>
                        Thg 9
                      </span>
                      <span className='text-xl font-extrabold text-slate-900'>
                        28
                      </span>
                    </div>
                    <div>
                      <h4 className='text-sm font-bold text-slate-900 group-hover:text-sky-500 transition-colors'>
                        Workshop: Tư duy hệ thống trong UI/UX
                      </h4>
                      <p className='text-xs text-slate-500 mt-1 flex items-center gap-1'>
                        <span className='material-symbols-outlined text-[14px]'>
                          schedule
                        </span>{' '}
                        19:30 - Zoom Meeting
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-4 group cursor-pointer'>
                    <div className='flex-shrink-0 w-12 h-14 bg-white rounded-lg flex flex-col items-center justify-center border border-slate-200 shadow-sm group-hover:border-sky-500 transition-colors'>
                      <span className='text-[10px] font-bold text-sky-500 uppercase'>
                        Thg 10
                      </span>
                      <span className='text-xl font-extrabold text-slate-900'>
                        05
                      </span>
                    </div>
                    <div>
                      <h4 className='text-sm font-bold text-slate-900 group-hover:text-sky-500 transition-colors'>
                        Giao lưu cộng đồng Glacier Hà Nội
                      </h4>
                      <p className='text-xs text-slate-500 mt-1 flex items-center gap-1'>
                        <span className='material-symbols-outlined text-[14px]'>
                          location_on
                        </span>{' '}
                        Hub Cafe, Quận 1
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Top Members */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className='bg-sky-500/5 p-6 rounded-3xl border border-sky-500/10 shadow-sm'>
                <h2 className='font-bold text-lg text-slate-900 mb-6 flex items-center gap-2'>
                  <span className='material-symbols-outlined text-sky-500'>
                    workspace_premium
                  </span>
                  Thành viên tích cực
                </h2>
                <div className='space-y-5'>
                  {/* Top Members can be mapped. I've placed inline items to match your static design quickly */}
                  {[
                    {
                      name: 'Trần Việt',
                      role: 'Gold Contributor',
                      pts: '2.4k pts',
                      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDasDNZgI0JiimaHZwUk64CXlglYCCsIhCTPalx5TtGJa8RgnRZPNu88dTPpdnsganau7S1r3PIfwHL40ftKtSZAQELN9zojmG9gyo7UQUIUQtpdFIdS1VhG7A0J5i4c221mKH7nNj-7vqtkKthNvIf97W1Jcyu5ibZ2J7fqnnM7a6TaicJlrEKPrXIFGZUUTvXceiQKanbBBhhPtXkse0B4jXEi3Z0BsuusZ73SYRXCdy3MNwEXBo7FWIUAIbsK4jRBNKiW2Ss0csU',
                      rankColor: 'bg-yellow-400',
                    },
                    {
                      name: 'Hà My',
                      role: 'Active Mentor',
                      pts: '1.8k pts',
                      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmFwdEnPXYg4M8Dq14yvhtwdDdVQoFnL19TRSrHAjHnCv3IT3v0NX72PKzdSSRsckV67_KKiHqxxul5UO2E4gG4SsEfTtljHx6SpKNlUDLr3alU0OjTkSVrIoqOxNWyKDQVaNhAFRthrvpYd4xxXk1V2ABRfGhZE4XKjtUidLXXsTrqTRekLhw3U0TtRXO9zDzOIlRuic0zGq74AEVjiEn7t053hAaezsDbbhsxY4s_or1-z6G1hB2xI5kHjnz95FqcQ9Q0lx0Wy-K',
                      rankColor: 'bg-slate-300',
                    },
                    {
                      name: 'Quốc Bảo',
                      role: 'Rising Star',
                      pts: '1.2k pts',
                      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTOVgPx6ZBPjVoMzkJuQtAK5cuzozTo0T7AU3PmSYJzulazuwbvF2q58jDTJTLVyq1lrRxPAqBHS4aXrfq9fXvaur2uSv0Pk6MoLohXOSerczGK9EdjnmZLt_mqoMtwV5JN5wy4Y6avgDG98lYPKUqkv-3kwEZZK2rBKM0msNh1VyMRRWngL7RKBFY1Gdauxs_43feeuW8pHHfq6Filb2mpbr_v_xP-HZVGzvEXwJUfN9HN3yK8Zoxruy_SxxTnCX-LYFZKWUgbJDU',
                      rankColor: 'bg-amber-600',
                    },
                  ].map((user, idx) => (
                    <div key={idx} className='flex items-center gap-3'>
                      <div className='relative'>
                        <img
                          className='w-10 h-10 rounded-full object-cover shadow-sm'
                          alt={user.name}
                          src={user.img}
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 ${user.rankColor} w-4 h-4 rounded-full border-2 border-white flex items-center justify-center`}
                        >
                          <span className='text-[8px] font-bold text-white'>
                            {idx + 1}
                          </span>
                        </div>
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-bold text-slate-900'>
                          {user.name}
                        </p>
                        <p className='text-[10px] text-slate-500 uppercase tracking-wider font-semibold'>
                          {user.role}
                        </p>
                      </div>
                      <div className='text-right'>
                        <span className='text-xs font-bold text-sky-500'>
                          {user.pts}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className='relative rounded-3xl overflow-hidden aspect-video group cursor-pointer shadow-lg'>
                <img
                  className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                  alt='Group study'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuBpsTKcALFaHMOicEDmK8g4M9HH2dmERJDuEfUaQCkxUpX3R9c98WIwBjFY0frY-5_6nzApt3T2j4keJOAXU8OJgqrQejuqBO5Zo__4KPkF_MlvtVPNcmlRF7r9TlhmeNvL4l3A5dG8QYfgaKdspoxkVeMiaxZGSs5GNkrhXK95U9ZaCWyBjypoFZuvP1d7b-W0ppIsdXkGijb_cHMqwUv0m81M3TAFJdJJZodipg_C3pDv7AygSaKgmM_tRITdp2TD_KbNsX29qeDO'
                />
                <div className='absolute inset-0 bg-sky-600/70 flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-[2px]'>
                  <h3 className='text-xl font-bold mb-2'>
                    Bắt đầu nhóm học tập riêng?
                  </h3>
                  <p className='text-xs mb-4 opacity-90'>
                    Kết nối với những người cùng mục tiêu để tiến xa hơn.
                  </p>
                  <Button
                    variant='secondary'
                    className='bg-white text-sky-600 rounded-full text-xs font-bold hover:bg-sky-50 transition-colors'
                  >
                    Tạo nhóm ngay
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAB (Floating Action Button) */}
      <Button
        size='icon'
        className='fixed bottom-8 right-8 w-14 h-14 bg-sky-500 text-white rounded-full shadow-2xl hover:bg-sky-600 hover:scale-110 active:scale-95 transition-all z-40'
      >
        <span className='material-symbols-outlined text-2xl'>edit</span>
      </Button>
    </main>
  );
}
