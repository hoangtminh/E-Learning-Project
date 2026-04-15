interface CourseProgressBannerProps {
  course: {
    progress: number;
    completedLessons: number;
    totalLessons: number;
    remainingHours: number;
    nextLesson: string;
  };
}

export function CourseProgressBanner({ course }: CourseProgressBannerProps) {
  const { progress, completedLessons, totalLessons, remainingHours, nextLesson } = course;

  // SVG circle math: r=40, circumference = 2πr ≈ 251.2
  const circumference = 251.2;
  const dashOffset = circumference - (circumference * progress) / 100;

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 border border-[#006382]/20 shadow-lg shadow-[#006382]/5">
      {/* Circular progress ring */}
      <div className="relative flex-shrink-0">
        <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
          <circle cx="45" cy="45" r="40" fill="none" stroke="#e0e8ff" strokeWidth="8" />
          <circle
            cx="45" cy="45" r="40"
            fill="none"
            stroke="#006382"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-[#006382]">{progress}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-lg font-bold text-[#252f43]">Bạn đang học khóa này</h3>
        <p className="text-sm text-[#525b72] mt-1">
          Đã hoàn thành{' '}
          <strong className="text-[#006382]">{completedLessons} / {totalLessons} bài học</strong>
          {' '}· Còn{' '}
          <strong className="text-[#006382]">~{remainingHours} giờ</strong> để kết thúc
        </p>
        <div className="w-full bg-[#e0e8ff] rounded-full h-2 mt-3 mb-1 overflow-hidden">
          <div
            className="h-full bg-[#006382] rounded-full shadow-[0_0_12px_rgba(0,99,130,0.3)] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-[#525b72]">
          Bài học tiếp theo:{' '}
          <span className="font-semibold text-[#006382]">{nextLesson}</span>
        </p>
      </div>

      {/* CTA */}
      <button type="button" className="px-6 py-3 bg-[#006382] text-white rounded-xl font-bold shadow-lg shadow-[#006382]/25 hover:bg-[#005672] transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          play_circle
        </span>
        Tiếp tục học
      </button>
    </div>
  );
}
