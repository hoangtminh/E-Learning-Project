import Image from 'next/image';

interface CourseHeroProps {
  course: {
    title: string;
    subtitle: string;
    category: string;
    level: string;
    rating: number;
    reviewCount: number;
    studentCount: number;
    totalHours: number;
    updatedAt: string;
    isBestSeller: boolean;
    hasCertificate: boolean;
    thumbnailUrl: string;
    instructor: {
      name: string;
      avatarUrl: string;
    };
  };
}

function StarRating({ rating, size = 'xl' }: { rating: number; size?: string }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={i} className={`material-symbols-outlined text-amber-400 text-${size} star-filled`}>
          star
        </span>
      ))}
      {hasHalf && (
        <span className={`material-symbols-outlined text-amber-400 text-${size} star-filled`}>
          star_half
        </span>
      )}
    </div>
  );
}

export function CourseHero({ course }: CourseHeroProps) {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 400 }}>
      {/* Background image */}
      <img
        src={course.thumbnailUrl}
        alt={course.title}
        className="absolute inset-0 w-full h-full object-cover scale-105"
        style={{ filter: 'saturate(0.7) brightness(0.45)' }}
      />
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-72 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20 flex flex-col gap-6">

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {course.hasCertificate && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/90 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              Chứng chỉ
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold uppercase tracking-wider">
            {course.level}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#6f4b94]/80 text-[#fbefff] text-[10px] font-bold uppercase tracking-wider">
            {course.category}
          </span>
          {course.isBestSeller && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/80 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                trending_up
              </span>
              Best Seller
            </span>
          )}
        </div>

        {/* Title */}
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            {course.title.split('&').map((part, i) =>
              i === 0 ? (
                <span key={i}>{part}</span>
              ) : (
                <span key={i} className="text-sky-300">&amp;{part}</span>
              )
            )}
          </h1>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed max-w-xl">{course.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <StarRating rating={course.rating} />
            <span className="text-amber-400 font-black text-lg">{course.rating}</span>
            <span className="text-slate-400 text-sm">({(course.reviewCount / 1000).toFixed(1)}k đánh giá)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 text-sm">
            <span className="material-symbols-outlined text-base">group</span>
            <span><strong className="text-white font-bold">{course.studentCount.toLocaleString('vi-VN')}</strong> học viên</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 text-sm">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span><strong className="text-white font-bold">{course.totalHours}</strong> giờ nội dung</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 text-sm">
            <span className="material-symbols-outlined text-base">update</span>
            <span>Cập nhật <strong className="text-white font-bold">{course.updatedAt}</strong></span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-3">
          <img
            src={course.instructor.avatarUrl}
            alt={course.instructor.name}
            className="w-10 h-10 rounded-full border-2 border-sky-400/40 object-cover"
          />
          <div>
            <p className="text-xs text-slate-400">Giảng viên</p>
            <p className="text-white font-semibold text-sm">{course.instructor.name}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
