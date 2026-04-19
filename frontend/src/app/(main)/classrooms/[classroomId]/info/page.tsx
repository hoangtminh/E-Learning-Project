'use client';

import { useState } from 'react';
import { useClassrooms } from '@/contexts/ClassroomContext';

export default function ClassroomInfoPage() {
  const { classroom } = useClassrooms();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (classroom?.id) {
      navigator.clipboard.writeText(classroom.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto w-full'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* Left Column - Member Lists & General Info */}
        <div className='lg:col-span-8 space-y-8'>
          {/* General Information Section */}
          <section>
            <div className='flex items-center justify-between mb-4 px-2'>
              <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
                <span
                  className='material-symbols-outlined text-sky-600'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  info
                </span>
                Thông tin chung
              </h2>
            </div>
            <div className='p-6 bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 space-y-6 shadow-sm'>
              <div>
                <h3 className='text-sm font-bold text-slate-500 uppercase tracking-wider'>
                  Tên lớp học
                </h3>
                <p className='text-lg text-slate-800 font-semibold mt-1'>
                  {classroom?.title}
                </p>
              </div>
              <div>
                <h3 className='text-sm font-bold text-slate-500 uppercase tracking-wider'>
                  Mô tả chi tiết
                </h3>
                <p className='text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed'>
                  {classroom?.description ||
                    'Chưa có mô tả nào cho lớp học này.'}
                </p>
              </div>
              <div>
                <h3 className='text-sm font-bold text-slate-500 uppercase tracking-wider'>
                  Ngày khởi tạo
                </h3>
                <p className='text-slate-700 mt-1'>
                  {classroom?.createdAt
                    ? new Date(classroom.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </section>

          {/* Instructor Section */}
          <section>
            <div className='flex items-center justify-between mb-4 px-2'>
              <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
                <span
                  className='material-symbols-outlined text-sky-600'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  school
                </span>
                Giảng viên (Instructor)
              </h2>
            </div>
            <div className='bg-white/60 backdrop-blur-md rounded-xl p-4 md:p-6 border border-slate-200 shadow-sm'>
              <div className='flex flex-col md:flex-row items-center gap-6'>
                <div className='relative'>
                  <div className='w-24 h-24 rounded-full border-2 border-sky-600 p-1 bg-white'>
                    <img
                      alt='Instructor'
                      className='w-full h-full object-cover rounded-full'
                      src='https://lh3.googleusercontent.com/aida-public/AB6AXuB84xFB0ZTx0u8MLyDlhj2tim9QdDBxhKh4sq2-eIf024FJIvy2qf6mixWUyPWo3jXBLVRL0gIyCAi2Ov_tXLAJXXjmwFhqKVcNpSDVvxUJsy_HD-uXCoLu4bh2PkPWdKtJFq7jYv1bllSvMwB0A4gZOPoDti0zcXkvI0tnJUZnWAiVTQUQ2UGNjpVwr0RqLl5ZvIoyci4D9MmL04Qc8cFGIAW3Z0Jht3t84hznAzRc5bsmemkUxNLadWsLaPdTzXey-sVYRiqQZO4k'
                    />
                  </div>
                  <div className='absolute bottom-0 right-0 bg-sky-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg'>
                    PRO
                  </div>
                </div>
                <div className='flex-1 text-center md:text-left'>
                  <h3 className='text-xl font-bold text-slate-800'>
                    Alex Thompson
                  </h3>
                  <p className='text-sky-600 text-sm font-medium mb-2'>
                    Senior Full-stack Developer & Vercel Ambassador
                  </p>
                  <p className='text-slate-500 text-sm leading-relaxed max-w-lg'>
                    Chuyên gia với 10 năm kinh nghiệm phát triển ứng dụng Web.
                    Hướng dẫn hơn 50.000 học viên trên toàn cầu về Next.js và
                    React.
                  </p>
                </div>
                <button className='px-5 py-2.5 bg-sky-50 text-sky-600 border border-sky-200 rounded-lg font-semibold text-sm hover:bg-sky-100 transition-all active:scale-95'>
                  Xem hồ sơ
                </button>
              </div>
            </div>
          </section>

          {/* Students Section */}
          <section>
            <div className='flex items-center justify-between mb-4 px-2'>
              <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
                <span
                  className='material-symbols-outlined text-purple-600'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  group
                </span>
                Học viên (Students)
              </h2>
              <div className='flex items-center gap-2'>
                <div className='bg-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-600'>
                  124 Members
                </div>
                <button className='material-symbols-outlined text-slate-500 hover:text-sky-600 p-1'>
                  filter_list
                </button>
              </div>
            </div>
            {/* Bento-style Member Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className='bg-white/60 backdrop-blur-md border border-slate-200 p-4 rounded-xl flex items-center gap-4 hover:border-sky-500/40 transition-colors group shadow-sm'
                >
                  {i === 4 ? (
                    <div className='w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold'>
                      QD
                    </div>
                  ) : (
                    <img
                      alt={`Student ${i}`}
                      className='w-12 h-12 rounded-full object-cover'
                      src={`https://lh3.googleusercontent.com/aida-public/AB6AXuB1Va4Y-5hMb4_cN7ba1syRD4nBkt89pLCNasX0QzFAa2FGYMJ-IBF23QPvFJo30_q6LIne3YLBJUO2t7nxrpmXzOZB9OaCBMnum6F0lmTKUb2mDebe5Oxhgn-_aL96BdBGyHQvtcoyTd6Ozj-NhxgxwCOJEKSR7fyXNUJne0GyBPFIqCJAp8N2tGVVPEHLHULuOkCH9Nqodnex0FCim01kYROQ57oUxj0bWA_QX7aswPtvtikNWrD9w1-tR31eoN8LgZ6o4_0KvjQO`}
                    />
                  )}
                  <div className='flex-1'>
                    <h4 className='font-bold text-slate-800 group-hover:text-sky-600 transition-colors'>
                      Học viên {i}
                    </h4>
                    <p className='text-[11px] text-slate-500 font-medium'>
                      Tham gia: 1{i} Th02, 2024
                    </p>
                  </div>
                  <button className='material-symbols-outlined text-slate-500 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity'>
                    more_vert
                  </button>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className='mt-8 flex justify-center'>
              <div className='bg-white/60 backdrop-blur-md border border-slate-200 px-2 py-2 rounded-lg flex items-center gap-1 shadow-sm'>
                <button className='w-10 h-10 flex items-center justify-center rounded hover:bg-sky-100 transition-colors text-slate-600'>
                  <span className='material-symbols-outlined'>
                    chevron_left
                  </span>
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded bg-sky-600 text-white font-bold'>
                  1
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded hover:bg-sky-100 transition-colors text-slate-600'>
                  2
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded hover:bg-sky-100 transition-colors text-slate-600'>
                  3
                </button>
                <span className='px-2 text-slate-500'>...</span>
                <button className='w-10 h-10 flex items-center justify-center rounded hover:bg-sky-100 transition-colors text-slate-600'>
                  12
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded hover:bg-sky-100 transition-colors text-slate-600'>
                  <span className='material-symbols-outlined'>
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Invite Widget */}
          <div className='bg-white/80 backdrop-blur-lg border border-sky-200 shadow-lg p-6 rounded-2xl'>
            <h3 className='text-lg font-bold text-slate-800 mb-4'>
              Mời thành viên
            </h3>
            <p className='text-sm text-slate-500 mb-4'>
              Mời thêm đồng nghiệp hoặc bạn bè tham gia lớp học này bằng mã lớp
              học.
            </p>
            <div className='flex flex-col gap-3'>
              <div className='relative'>
                <input
                  className='w-full bg-slate-100 border-0 rounded-lg px-4 py-3 text-sm font-medium text-slate-800 pr-12 focus:ring-2 focus:ring-sky-500/50 outline-none'
                  readOnly
                  type='text'
                  value={classroom?.id || 'Đang tải...'}
                />
                <button
                  onClick={handleCopy}
                  title='Sao chép'
                  className='absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sky-600 hover:scale-110 transition-transform'
                >
                  {copied ? 'check' : 'content_copy'}
                </button>
              </div>
              <button
                onClick={handleCopy}
                className='w-full bg-sky-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-sky-600/20 hover:brightness-110 active:scale-[0.98] transition-all'
              >
                {copied ? 'Đã sao chép!' : 'Sao chép mã lớp học'}
              </button>
            </div>
          </div>

          {/* Learning Support */}
          <div className='bg-gradient-to-br from-purple-100 to-sky-100 p-6 rounded-2xl relative overflow-hidden shadow-sm group border border-sky-200/50'>
            <div className='absolute -right-4 -top-4 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700'></div>
            <h3 className='text-lg font-bold text-purple-900 mb-2 relative z-10'>
              Hỗ trợ học tập
            </h3>
            <p className='text-sm text-purple-800/80 mb-4 relative z-10'>
              Bạn gặp khó khăn trong quá trình học? Đừng ngần ngại liên hệ đội
              ngũ trợ giảng.
            </p>
            <button className='bg-white/90 text-purple-600 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white transition-colors relative z-10'>
              <span className='material-symbols-outlined text-sm'>
                support_agent
              </span>{' '}
              Chat với Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
