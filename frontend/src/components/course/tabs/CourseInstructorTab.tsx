interface CourseInstructorTabProps {
  course?: any;
}

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCoLcZt8R31CwX3UiyL5JxZf-X251KAIKT8ZXC5YlL4nUC870JjR0Km4WzFJsip6_pzz0hPTJki_YMdT4TZSVrOZl3RRjcBKEVDVGR6t1x6AsCFBvw6Bl6tIbGWcfu5t9eyI21LtKP0t6YpJPKsV71m8LX8rJSARv-_dVEgT0Gb4NkiEUAp6LQN7RWNKKBkG8X25KKbMzZ4fyxFfCJSWvY0ucPclgX3kUJ0r_IjGymPsg6Xk5RfsyGYhGxDUKl4opdReA3vi4IBvTK3';

export function CourseInstructorTab({ course }: CourseInstructorTabProps) {
  const instructor = course?.instructor ?? course?.owner;

  if (!instructor) {
    return (
      <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">person_off</span>
        <p className="text-slate-400 text-sm">Chưa có thông tin giảng viên.</p>
      </div>
    );
  }

  const name = instructor.fullName || 'Giảng viên';
  const avatarUrl = instructor.avatarUrl || DEFAULT_AVATAR;
  const email = instructor.email || null;

  const totalSections = course?.sections?.length ?? 0;
  const totalLessons = course?.sections?.reduce(
    (acc: number, s: any) => acc + (s.lessons?.length ?? 0),
    0,
  ) ?? 0;
  const memberCount = course?._count?.members ?? 0;

  const stats = [
    { value: String(memberCount), label: 'Học viên',   color: 'text-[#006382]' },
    { value: String(totalSections), label: 'Phần học', color: 'text-[#252f43]' },
    { value: String(totalLessons), label: 'Bài học',   color: 'text-[#252f43]' },
  ];

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8">
      {/* Avatar + stats */}
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <img
          src={avatarUrl}
          alt={name}
          className="w-28 h-28 rounded-2xl object-cover shadow-xl border-2 border-[#006382]/20"
        />
        <div className="grid grid-cols-3 gap-3 w-full text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#e0e8ff] rounded-xl p-3">
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-[#525b72] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="flex-1">
        <h2 className="text-2xl font-black text-[#252f43]">{name}</h2>
        <p className="text-[#006382] font-semibold text-sm mt-1">Giảng viên khóa học</p>
        {email && (
          <p className="text-sm text-[#525b72] mt-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#a3adc7]">mail</span>
            {email}
          </p>
        )}
        <div className="mt-5 space-y-3">
          <p className="text-sm text-[#525b72] leading-relaxed">
            Giảng viên phụ trách khóa học <strong className="text-[#252f43]">"{course?.title}"</strong>.
            Khóa học hiện có <strong className="text-[#252f43]">{totalSections} phần học</strong> với
            tổng cộng <strong className="text-[#252f43]">{totalLessons} bài học</strong>,
            và đã có <strong className="text-[#252f43]">{memberCount} học viên</strong> đăng ký tham gia.
          </p>
        </div>
      </div>
    </div>
  );
}
