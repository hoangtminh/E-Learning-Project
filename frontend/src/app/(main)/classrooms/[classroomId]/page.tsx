'use client';

import { useClassrooms } from '@/contexts/ClassroomContext';

export default function ClassroomDetailPage() {
  const { classroom } = useClassrooms();
  if (!classroom) return null;

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 w-full'>
      {/* Left Column: Announcements & Pinned */}
      <div className='lg:col-span-4 space-y-6'>
        {/* New Announcement Card */}
        <div className='p-6 rounded-xl shadow-sm bg-white/60 backdrop-blur-md border border-slate-200'>
          <h3 className='text-sm font-bold text-sky-700 mb-4 flex items-center gap-2'>
            <span className='material-symbols-outlined text-lg'>campaign</span>
            TẠO THÔNG BÁO
          </h3>
          <textarea
            className='w-full bg-slate-100 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all min-h-[100px] resize-none text-slate-800'
            placeholder='Chia sẻ gì đó với lớp học...'
          ></textarea>
          <div className='mt-4 flex justify-between items-center'>
            <button className='p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-lg transition-all flex items-center justify-center'>
              <span className='material-symbols-outlined'>attach_file</span>
            </button>
            <button className='bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-sky-700 transition-all'>
              Đăng tin
            </button>
          </div>
        </div>

        {/* Pinned Messages */}
        <div className='p-6 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200'>
          <h3 className='text-xs font-bold text-slate-500 tracking-widest uppercase mb-4'>
            Tin nhắn đã ghim
          </h3>
          <div className='space-y-4'>
            <div className='flex gap-3 items-start p-3 bg-sky-50 rounded-lg border border-sky-100'>
              <span className='material-symbols-outlined text-sky-600 text-xl'>
                push_pin
              </span>
              <div>
                <p className='text-xs font-semibold text-sky-700'>
                  Lịch học tuần này
                </p>
                <p className='text-xs text-slate-600 mt-1'>
                  Buổi 4: Server Components & Actions sẽ bắt đầu vào 20:00 tối
                  nay.
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-100'>
              <span className='material-symbols-outlined text-slate-400 text-xl'>
                push_pin
              </span>
              <div>
                <p className='text-xs font-semibold text-slate-700'>
                  Tài liệu Module 3
                </p>
                <p className='text-xs text-slate-500 mt-1'>
                  Đã cập nhật PDF hướng dẫn Deployment lên Vercel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Activity Feed */}
      <div className='lg:col-span-8 space-y-6'>
        {/* Feed Item 1 (Image/Post) */}
        <article className='rounded-xl overflow-hidden bg-white/60 backdrop-blur-md border border-slate-200 shadow-sm'>
          <div className='p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <img
                alt='Avatar'
                className='w-10 h-10 rounded-full object-cover'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuBobpKi9V91ABkvXKBPiz6aAhlpQXZMR2bdgNdVK72ScFTQ2Da6R9ygz6s5wXu4bPj0YwUX8cESMVV8Cu6c6I_kaKSI0yDO0BiCXgupJ6NNWx9tWGDa2K61Hb-VEJX7COmjkFp40G-6ZGRfOJ_4iYku2YYl4zK0CSWVqLavMqlQKCrI3WMtK4OBqBhkaXU5LpVMnRrKlCxMui03ETQpPNNWYTYq6G8cSPPfzGCBhMwhY_JnJWcEDWwCQ5QEI_FcfDojeR4AapYpnrvo'
              />
              <div>
                <h4 className='text-sm font-bold text-slate-800'>
                  Alex Nguyen{' '}
                  <span className='text-xs font-normal text-slate-500 ml-2'>
                    Giảng viên
                  </span>
                </h4>
                <p className='text-[10px] text-slate-400 uppercase font-semibold'>
                  2 giờ trước
                </p>
              </div>
            </div>
            <p className='text-sm text-slate-700 mb-4 leading-relaxed'>
              Chào cả lớp, mình vừa cập nhật repository mẫu cho Project cuối
              khóa. Các bạn có thể fork về và bắt đầu lên ý tưởng nhé. Có thắc
              mắc gì cứ comment bên dưới nha! 🚀
            </p>
            <div className='rounded-lg overflow-hidden border border-slate-200'>
              <img
                alt='Post image'
                className='w-full h-64 object-cover'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuBUZur3nYJ0DroKRVaKHhrynHkEHNtixGhztwjHCB8Y26L25XHDmeq-YSZ1VuKg6RkKJkguxqMpxXTmzoYe2CFKvxpb4PJiiDEWbkbx6-TeCfRVcU2hG3L6rl-DjQUdjO5yY3r5dwb-xlAqhVLTPpMgUWiPQN-Fwrq3s5Qr2aHXMPb_1qPbA-EuzObhBkefsnuPqPxLkomzsDeibJfVAwhGYNpYCj-gf99JA_8KZYDeOSgHP4RD-WgDFxNZThIH8I_XPfArhpba1Q2V'
              />
            </div>
          </div>
          <div className='px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200'>
            <div className='flex gap-4'>
              <button className='flex items-center gap-1.5 text-slate-500 hover:text-sky-600 transition-colors'>
                <span className='material-symbols-outlined text-lg'>
                  thumb_up
                </span>
                <span className='text-xs font-medium'>12</span>
              </button>
              <button className='flex items-center gap-1.5 text-slate-500 hover:text-sky-600 transition-colors'>
                <span className='material-symbols-outlined text-lg'>
                  chat_bubble
                </span>
                <span className='text-xs font-medium'>4</span>
              </button>
            </div>
            <button className='text-slate-500 hover:text-sky-600 transition-colors'>
              <span className='material-symbols-outlined text-lg'>share</span>
            </button>
          </div>
        </article>

        {/* Feed Item 2 (System Notification/Exercise) */}
        <article className='p-6 rounded-xl flex gap-4 border-l-4 border-l-purple-500 bg-white/60 backdrop-blur-md shadow-sm'>
          <div className='w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0'>
            <span className='material-symbols-outlined text-purple-600'>
              assignment
            </span>
          </div>
          <div className='flex-1'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-slate-700'>
                  <span className='font-bold'>Hệ thống</span> đã đăng bài tập
                  mới:{' '}
                  <span className='font-semibold text-sky-600'>
                    Lab 5: Optimization with Next.js
                  </span>
                </p>
                <p className='text-[10px] text-slate-400 uppercase font-semibold mt-1'>
                  Hôm nay, 09:15 AM
                </p>
              </div>
              <span className='px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded border border-red-200'>
                HẠN: 2 NGÀY
              </span>
            </div>
            <div className='mt-4 p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-sm'>
              <div className='flex items-center gap-3'>
                <span className='material-symbols-outlined text-slate-400'>
                  description
                </span>
                <span className='text-xs font-medium text-slate-700'>
                  lab-5-instructions.pdf
                </span>
              </div>
              <button className='text-sky-600 hover:underline text-xs font-bold'>
                Xem chi tiết
              </button>
            </div>
          </div>
        </article>

        {/* Feed Item 3 (Discussion Thread) */}
        <article className='p-6 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <img
              alt='Avatar'
              className='w-10 h-10 rounded-full object-cover'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuAJywxLeC6lKX52cHOO8id2AWbQPsfqSS1iBEe-vy_-QIoM4WeaKDa6CLrfBfkdze7uhYL48C7KZ45W9SAYdkTLbDr6l_Y-eJVtpH7EWLMjOoifW6RtQz-hAn9-AufPMKrfvKmxhM0YFrJl_Z2-_No4ly-zQKCJKpWwbylh5IzPnqU4g2oVDUw01hKxcK62N7ZIUtuNxhjZfT5ZU6yDfxgrPTNSxHGMsJiVUPR8mA-XNwTgCr8yIT-C2eDhkwe6GYq9qH0db78wbBwF'
            />
            <div>
              <h4 className='text-sm font-bold text-slate-800'>
                Minh Tran{' '}
                <span className='text-xs font-normal text-slate-500 ml-2'>
                  Học viên
                </span>
              </h4>
              <p className='text-[10px] text-slate-400 uppercase font-semibold'>
                1 ngày trước
              </p>
            </div>
          </div>
          <p className='text-sm text-slate-700 leading-relaxed'>
            Mọi người cho mình hỏi, có ai gặp lỗi khi dùng{' '}
            <code className='bg-slate-100 px-1.5 py-0.5 rounded text-red-500 font-mono text-xs'>
              revalidateTag
            </code>{' '}
            trong Next 14 không? Mình debug mãi mà cache không chịu update.
          </p>
          <div className='mt-4 pl-4 border-l-2 border-slate-200 space-y-4'>
            <div className='flex gap-3'>
              <img
                alt='Avatar'
                className='w-7 h-7 rounded-full object-cover'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuDFEJekvb7eNFnIDatHdaICd1uzZ868GmK76CurcC9MuidcHroNucjG_ersKbmdgMlEJYnIIBt0dqFoHONjzDE7rtim1LpSSoRac-ZTGQ4AQwYDITG4crMaX1XM6lDtf_aULG6255Jp0CslBGO-7znASq4l0UZhE8ac-s8OaBi2dngf8b3CoOsBIT4z1F1sGP59BpG0LkHIEh0Bo12_-aHsai6yteq60crHYLHaTsT1TK3vjqeQ8RHiMjrUmE7gi34giSNj7zKJdT0a'
              />
              <div className='bg-slate-50 p-3 rounded-xl flex-1 border border-slate-100'>
                <p className='text-xs font-bold text-slate-800'>Linh Dan</p>
                <p className='text-xs text-slate-600 mt-1'>
                  Bạn check xem trong{' '}
                  <code className='text-[10px] font-mono bg-white px-1 rounded border border-slate-200'>
                    fetch
                  </code>{' '}
                  đã truyền đúng tag chưa? Thường là do gõ sai string tag đó.
                </p>
              </div>
            </div>
            <div className='flex gap-3'>
              <div className='w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0'>
                <span className='material-symbols-outlined text-sm text-sky-600'>
                  add_comment
                </span>
              </div>
              <input
                className='flex-1 bg-transparent border-none text-xs focus:ring-0 placeholder:text-slate-400'
                placeholder='Viết phản hồi...'
                type='text'
              />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
