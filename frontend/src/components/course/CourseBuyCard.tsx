'use client';

import { useState, useEffect } from 'react';

interface CourseBuyCardProps {
  course: {
    price: number;
    originalPrice: number;
    thumbnailUrl: string;
  };
}

const includes = [
  { icon: 'ondemand_video', text: '42 giờ video theo yêu cầu' },
  { icon: 'terminal',       text: 'Môi trường Lab thực hành ảo' },
  { icon: 'description',    text: '18 tài liệu & cheat sheets' },
  { icon: 'quiz',           text: '12 bài kiểm tra & 3 bài thi thử' },
  { icon: 'all_inclusive',  text: 'Truy cập trọn đời trên mọi thiết bị' },
  { icon: 'workspace_premium', text: 'Chứng chỉ hoàn thành khóa học' },
];

const relatedCourses = [
  {
    title: 'Ethical Hacking: Complete Guide',
    rating: 4.6,
    price: '₫799.000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKHijFMHOx0bIFYYQrZnot196AFa7OhCG6g6THug372jJSk0j6sNBmVt6nV5aPetnnjbKYY_b94N-WR6lqDd2J9SGHoUMnrLZ7uz7QVCq5A5kkd9hEYzMjfaA8LVtOn9zfGD_D4ylDtJfxrmhGM2O6RZwew0t6i4mJc1_NBOHQbl8szoljBhEsmcIOaqxsH5cZ93krU9JICraqFVKql8jS6McURJonNLQ8tnu9KKoE-Tv4Qfhi0VAMz2Ta9UGPqjzOTrW9H2v4on1S',
  },
  {
    title: 'AWS Cloud Security Masterclass',
    rating: 4.7,
    price: '₫1.099.000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDswEDQ066iTZQviul9gS07MDXaKky7Jg4B3KlXc10oYITBpe2RuY0k7tjQEQvQwoBXknOOKw_T7MeJReJaQd9t2EcbAUbkr_Yn-2ZvAM7FfdfHs9_GAcQJlrA0PdcrVTuQGKjEVLSDuvqtE63HMfd0oz-W2KLCxQ0KQmyCHANQnUiqyh9KYbirEaxjae3N8PMCuUD5WdwuUTZ0vexUacLwaz0yqX1wTJfFi7z38Gr-xdcKHcobdtbbpsk-zvox6nNEY9-N2l-z-93O',
  },
];

function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return `${d} ngày ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CourseBuyCard({ course }: CourseBuyCardProps) {
  const discount = Math.round((1 - course.price / course.originalPrice) * 100);
  const countdown = useCountdown(38528000); // ~10.7 hours

  return (
    <div className="sticky top-[84px] space-y-5">
      {/* Main card */}
      <div className="glass-panel-elevated rounded-3xl overflow-hidden shadow-2xl shadow-[#006382]/10 border border-[#006382]/15">

        {/* Video preview */}
        <div className="relative h-44 overflow-hidden cursor-pointer group">
          <img
            src={course.thumbnailUrl}
            alt="Course preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center group-hover:bg-slate-950/40 transition-colors">
            <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl play-pulse">
              <span className="material-symbols-outlined text-[#006382] text-3xl ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="text-white text-[11px] font-bold bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full">
              ▶ Xem video giới thiệu · 3:42
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="p-6 space-y-5">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-[#252f43]">
              ₫{course.price.toLocaleString('vi-VN')}
            </span>
            <div className="mb-1">
              <span className="text-sm text-[#525b72] line-through">
                ₫{course.originalPrice.toLocaleString('vi-VN')}
              </span>
              <span className="ml-2 text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#b31b25]/5 border border-[#b31b25]/20">
            <span className="material-symbols-outlined text-[#b31b25] text-lg">timer</span>
            <div>
              <p className="text-xs font-bold text-[#b31b25]">Giá ưu đãi kết thúc sau:</p>
              <p className="text-sm font-black text-[#b31b25]">{countdown}</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <button type="button" className="w-full py-4 bg-[#006382] text-white font-black text-base rounded-2xl shadow-xl shadow-[#006382]/30 hover:bg-[#005672] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            Đăng ký ngay
          </button>
          <button type="button" className="w-full py-3 border-2 border-[#006382] text-[#006382] font-bold rounded-2xl hover:bg-[#006382]/5 transition-all active:scale-[0.98]">
            Thử miễn phí 7 ngày
          </button>

          <p className="text-center text-[11px] text-[#525b72] flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            Đảm bảo hoàn tiền trong 30 ngày
          </p>
        </div>

        {/* Includes */}
        <div className="px-6 pb-6 space-y-3 border-t border-[#a3adc7]/20 pt-5">
          <h4 className="text-sm font-bold text-[#252f43]">Khóa học bao gồm:</h4>
          <div className="space-y-2.5">
            {includes.map((item) => (
              <div key={item.icon} className="flex items-center gap-3 text-sm text-[#525b72]">
                <span className="material-symbols-outlined text-base text-[#006382]">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share row */}
        <div className="px-6 pb-6 flex gap-3">
          {[
            { icon: 'bookmark', label: 'Lưu' },
            { icon: 'share',    label: 'Chia sẻ' },
            { icon: 'card_gift',label: 'Tặng' },
          ].map((btn) => (
            <button type="button"
              key={btn.icon}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#a3adc7]/40 text-sm text-[#525b72] hover:bg-[#e0e8ff] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Related courses */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <h4 className="text-sm font-bold text-[#252f43] px-2">Khóa học liên quan</h4>
        {relatedCourses.map((c) => (
          <div key={c.title} className="flex gap-3 hover:bg-[#006382]/5 p-2 rounded-xl transition-colors cursor-pointer group">
            <img src={c.img} alt={c.title} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#252f43] group-hover:text-[#006382] transition-colors truncate">
                {c.title}
              </p>
              <p className="text-[10px] text-[#525b72]">{c.rating} ★ · {c.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
