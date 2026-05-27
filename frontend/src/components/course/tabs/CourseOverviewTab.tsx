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
  const totalLessons = course?.sections?.reduce(
    (acc: number, s: any) => acc + (s.lessons?.length ?? 0),
    0,
  ) ?? 0;
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
  const totalHours = Math.round(totalLessons * 0.5);

  const highlights = [
    { icon: 'play_lesson',       color: 'primary',   count: String(videoLessons),     label: 'Bài học video' },
    { icon: 'schedule',          color: 'tertiary',  count: `${totalHours}h`,         label: 'Thời lượng' },
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
          <div key={h.label} className="glass-panel rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[h.color]}`}>
              <span className="material-symbols-outlined">{h.icon}</span>
            </div>
            <span className="text-2xl font-black text-[#252f43]">{h.count}</span>
            <span className="text-xs text-[#525b72] font-medium">{h.label}</span>
          </div>
        ))}
      </div>

      {/* Description from instructor */}
      {description ? (
        <div>
          <h2 className="text-xl font-bold text-[#252f43] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006382]" style={{ fontVariationSettings: "'FILL' 1" }}>
              description
            </span>
            Mô tả khóa học
          </h2>
          {hasHtmlContent ? (
            <div
              className="text-sm text-[#525b72] leading-relaxed course-description"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <div className="text-sm text-[#525b72] leading-relaxed space-y-3">
              {description.split('\n').filter(Boolean).map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
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
