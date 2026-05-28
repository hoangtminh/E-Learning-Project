interface CourseOverviewTabProps {
  course?: any;
}

const colorMap: Record<string, string> = {
  primary:  'bg-[#006382]/10 text-[#006382]',
  tertiary: 'bg-[#6f4b94]/10 text-[#6f4b94]',
  secondary:'bg-[#346176]/10 text-[#346176]',
  emerald:  'bg-emerald-500/10 text-emerald-600',
};

export function CourseOverviewTab({ course }: CourseOverviewTabProps) {
  const totalSections = course?.sections?.length ?? 0;
  const videoLessons = course?.sections?.reduce(
    (acc: number, s: any) =>
      acc + (s.lessons?.filter((l: any) => l.type === 'video').length ?? 0),
    0,
  ) ?? 0;
  const quizLessons = course?.sections?.reduce(
    (acc: number, s: any) =>
      acc + (s.lessons?.filter((l: any) => l.type === 'quiz').length ?? 0),
    0,
  ) ?? 0;

  // Real course duration calculation
  const totalMin = course?.totalDurationMin || 0;
  let formattedDuration = '0 phút';
  if (totalMin > 0) {
    if (totalMin < 60) {
      formattedDuration = `${totalMin}m`;
    } else {
      const hours = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      formattedDuration = `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
  }

  const highlights = [
    { icon: 'play_lesson',       color: 'primary',   count: String(videoLessons),     label: 'Bài học video' },
    { icon: 'schedule',          color: 'tertiary',  count: formattedDuration,         label: 'Thời lượng' },
    { icon: 'quiz',              color: 'secondary', count: String(quizLessons),      label: 'Bài kiểm tra' },
    { icon: 'folder',            color: 'emerald',   count: String(totalSections),    label: 'Phần học' },
  ];

  const description = course?.description || '';
  const hasHtmlContent = description.includes('<') && description.includes('>');

  return (
    <div className="space-y-8">
      {/* Stats bento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {highlights.map((h) => (
          <div 
            key={h.label} 
            className={`glass-panel rounded-xl p-4 flex flex-col items-center text-center gap-2 relative ${
              h.label === 'Thời lượng' && course?.durationBreakdown ? 'group/duration cursor-help hover:z-40 transition-all' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[h.color]}`}>
              <span className="material-symbols-outlined">{h.icon}</span>
            </div>
            <span className="text-2xl font-black text-[#252f43]">{h.count}</span>
            <span className="text-xs text-[#525b72] font-medium">{h.label}</span>

            {/* Tooltip Breakdown for Duration */}
            {h.label === 'Thời lượng' && course?.durationBreakdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl text-left text-white opacity-0 pointer-events-none group-hover/duration:opacity-100 group-hover/duration:pointer-events-auto transition-all duration-300 transform translate-y-1 group-hover/duration:translate-y-0 z-30">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent w-0 h-0" style={{ borderBottomColor: 'rgba(15,23,42,0.95)' }}></div>
                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2.5">Phân bổ thời lượng</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-xs text-sky-400">play_circle</span> Học qua video</span>
                    <strong className="font-bold text-white">{Math.round((course.durationBreakdown.video || 0) / 60)} phút</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-xs text-emerald-400">article</span> Bài đọc & Tài liệu</span>
                    <strong className="font-bold text-white">{Math.round((course.durationBreakdown.text || 0) / 60)} phút</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-xs text-purple-400">quiz</span> Trắc nghiệm</span>
                    <strong className="font-bold text-white">{Math.round((course.durationBreakdown.quiz || 0) / 60)} phút</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Description from instructor */}
      {description ? (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-[#006382]/10 bg-white/60 shadow-sm relative overflow-hidden">
          {/* Subtle background gradient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-lg font-extrabold text-[#252f43] mb-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#006382]/10 text-[#006382] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_stories
              </span>
            </div>
            Mô tả khóa học
          </h2>
          
          <div className="border-l-2 border-[#006382]/20 pl-4 py-1 ml-4">
            {hasHtmlContent ? (
              <div
                className="text-sm text-[#525b72] leading-relaxed space-y-3 course-description font-medium"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <div className="text-sm text-[#525b72] leading-relaxed space-y-3.5 font-medium">
                {description.split('\n').filter(Boolean).map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel-elevated rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-[#006382]/20 bg-slate-50/30 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 shadow-sm border border-sky-100/50 relative z-10">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>
              auto_stories
            </span>
          </div>
          <div className="max-w-md space-y-1.5 relative z-10">
            <h3 className="font-bold text-[#252f43] text-base">Chưa có mô tả khóa học</h3>
            <p className="text-xs text-[#525b72] leading-relaxed">
              Giảng viên hiện chưa bổ sung phần mô tả chi tiết cho khóa học này. Tuy nhiên, bạn vẫn có thể xem đầy đủ danh sách bài học ở tab <strong>"Nội dung khóa học"</strong> bên cạnh để bắt đầu học tập ngay nhé!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
