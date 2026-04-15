const highlights = [
  { icon: 'play_lesson',       color: 'primary',   count: '40',   label: 'Bài học video' },
  { icon: 'schedule',          color: 'tertiary',  count: '42h',  label: 'Video nội dung' },
  { icon: 'quiz',              color: 'secondary', count: '12',   label: 'Bài kiểm tra' },
  { icon: 'workspace_premium', color: 'emerald',   count: '1',    label: 'Chứng chỉ' },
];

const learnings = [
  'Phân tích và phát hiện các mối đe dọa mạng tinh vi',
  'Triển khai kiến trúc Zero Trust trong doanh nghiệp',
  'Kỹ thuật Penetration Testing (Ethical Hacking)',
  'Xây dựng quy trình ứng phó sự cố (Incident Response)',
  'Bảo mật hạ tầng Cloud (AWS, Azure, GCP)',
  'Phân tích mã độc & kỹ thuật Reverse Engineering',
  'Chuẩn bị cho chứng chỉ CompTIA Security+ & CEH',
  'Thiết lập SIEM & hệ thống giám sát bảo mật',
];

const requirements = [
  'Kiến thức cơ bản về mạng máy tính (TCP/IP, DNS, HTTP/S)',
  'Đã hoàn thành khóa học "Networking Fundamentals" hoặc tương đương',
  'Quen thuộc với hệ điều hành Linux (command line cơ bản)',
  'Máy tính với RAM tối thiểu 8GB để chạy các máy ảo lab',
];

const colorMap: Record<string, string> = {
  primary:  'bg-[#006382]/10 text-[#006382]',
  tertiary: 'bg-[#6f4b94]/10 text-[#6f4b94]',
  secondary:'bg-[#346176]/10 text-[#346176]',
  emerald:  'bg-emerald-500/10 text-emerald-600',
};

export function CourseOverviewTab() {
  return (
    <div className="space-y-8">
      {/* What you'll learn */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-[#006382]/10">
        <h2 className="text-xl font-bold text-[#252f43] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006382]" style={{ fontVariationSettings: "'FILL' 1" }}>
            emoji_objects
          </span>
          Bạn sẽ học được gì?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {learnings.map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span
                className="material-symbols-outlined text-[#006382] flex-shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="text-sm text-[#525b72] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

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

      {/* Requirements */}
      <div>
        <h2 className="text-xl font-bold text-[#252f43] mb-4">Yêu cầu đầu vào</h2>
        <ul className="space-y-2">
          {requirements.map((req, i) => (
            <li key={i} className="flex gap-3 items-center text-sm text-[#525b72]">
              <span className="material-symbols-outlined text-[#6d778e] text-base flex-shrink-0">
                arrow_right
              </span>
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-bold text-[#252f43] mb-4">Mô tả khóa học</h2>
        <div className="text-sm text-[#525b72] leading-relaxed space-y-3">
          <p>
            Trong bối cảnh các cuộc tấn công mạng ngày càng tinh vi và phức tạp, khóa học này cung cấp cho bạn bộ kỹ năng toàn diện – từ hiểu rõ tâm lý & kỹ thuật của hacker, đến xây dựng hàng phòng thủ vững chắc cho tổ chức của mình.
          </p>
          <p>
            Với hơn <strong className="text-[#252f43]">42 giờ nội dung video chất lượng cao</strong>, các bài lab thực hành trong môi trường ảo hóa hoàn chỉnh và 12 bài kiểm tra đánh giá, bạn sẽ sẵn sàng cho các chứng chỉ quốc tế như CompTIA Security+, CEH, và OSCP.
          </p>
        </div>
      </div>
    </div>
  );
}
