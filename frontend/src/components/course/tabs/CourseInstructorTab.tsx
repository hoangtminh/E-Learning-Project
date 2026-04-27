const instructor = {
  name: 'TS. Nguyễn Văn Khoa',
  title: 'Chuyên gia An toàn Thông tin · Cố vấn Bảo mật Doanh nghiệp',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCEaD6AYiPTA5D20zrCZ26iXsbBTk7A7n0Re-vB5zoaLF1WPwpiZyeZ_M6A5mWWe2YuY1IWgUkuTM7XS6njCXVZQXaCx-QYfjVj6OP_45Etglz_LF4PfWTX5kR73GixfBzh7aWCAAGsacJALg2ROk4zALBi7Uc7bGNr22lqlIUDqp8_2DLtT0juDR9fo7PYopJws8INS5QmSYWskox6VFaHwdfvcWbYFE6DZrJVzWy3QrQohA3aHSXcYJk2uZb6s-FbDm0SkXnLJ1gj',
  stats: [
    { value: '4.8', label: 'Đánh giá TB',  color: 'text-[#006382]' },
    { value: '32k', label: 'Học viên',      color: 'text-[#252f43]' },
    { value: '8',   label: 'Khóa học',      color: 'text-[#252f43]' },
    { value: '15+', label: 'Năm KN',        color: 'text-[#6f4b94]' },
  ],
  certs: [
    { label: 'CISSP', cls: 'bg-[#006382]/10 text-[#006382]' },
    { label: 'CEH',   cls: 'bg-[#6f4b94]/10 text-[#6f4b94]' },
    { label: 'OSCP',  cls: 'bg-[#346176]/10 text-[#346176]' },
    { label: 'AWS Security', cls: 'bg-emerald-100 text-emerald-700' },
  ],
  bio: [
    'Tiến sĩ Khoa học Máy tính, Đại học Bách Khoa TP.HCM. Với hơn 15 năm kinh nghiệm trong lĩnh vực an toàn thông tin, ông từng là chuyên gia bảo mật cấp cao tại các tập đoàn công nghệ quốc tế như Microsoft Vietnam và Cisco. Hiện là Giám đốc Bảo mật (CISO) của một tập đoàn viễn thông lớn và là giảng viên thỉnh giảng tại các trường đại học hàng đầu.',
    'Phong cách giảng dạy của ông kết hợp giữa lý thuyết nền tảng vững chắc và các tình huống thực chiến từ kinh nghiệm thực tế, giúp học viên không chỉ nắm lý thuyết mà còn có khả năng xử lý các sự cố bảo mật trong môi trường doanh nghiệp thực sự.',
  ],
};

export function CourseInstructorTab() {
  return (
    <div className="glass-panel-elevated rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8">
      {/* Avatar + stats */}
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <img
          src={instructor.avatarUrl}
          alt={instructor.name}
          className="w-28 h-28 rounded-2xl object-cover shadow-xl border-2 border-[#006382]/20"
        />
        <div className="grid grid-cols-2 gap-3 w-full text-center">
          {instructor.stats.map((stat) => (
            <div key={stat.label} className="bg-[#e0e8ff] rounded-xl p-3">
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-[#525b72] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="flex-1">
        <h2 className="text-2xl font-black text-[#252f43]">{instructor.name}</h2>
        <p className="text-[#006382] font-semibold text-sm mt-1">{instructor.title}</p>
        <div className="flex flex-wrap gap-2 mt-3 mb-5">
          {instructor.certs.map((cert) => (
            <span key={cert.label} className={`px-3 py-1 rounded-full text-[11px] font-bold ${cert.cls}`}>
              {cert.label}
            </span>
          ))}
        </div>
        {instructor.bio.map((para, i) => (
          <p key={i} className={`text-sm text-[#525b72] leading-relaxed ${i > 0 ? 'mt-3' : ''}`}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
