'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getCourses, CourseListItem } from '@/api/courses';

const PATHWAYS = [
  {
    id: 'web',
    icon: 'code',
    title: 'Lập trình Web',
    desc: 'Từ HTML/CSS đến React, NodeJS và Fullstack hiện đại',
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    tags: ['React', 'NodeJS', 'TypeScript', 'NextJS'],
    steps: ['HTML & CSS cơ bản', 'JavaScript ES6+', 'ReactJS', 'Backend với NodeJS', 'Fullstack Project'],
  },
  {
    id: 'data',
    icon: 'analytics',
    title: 'Khoa học Dữ liệu',
    desc: 'Python, Machine Learning và phân tích dữ liệu thực chiến',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    tags: ['Python', 'Pandas', 'ML', 'SQL'],
    steps: ['Python cơ bản', 'Pandas & NumPy', 'Trực quan hóa dữ liệu', 'Machine Learning', 'Deep Learning'],
  },
  {
    id: 'design',
    icon: 'palette',
    title: 'Thiết kế UI/UX',
    desc: 'Figma, Prototyping và Design System chuyên nghiệp',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    tags: ['Figma', 'Prototyping', 'Design System', 'UX Research'],
    steps: ['Nguyên lý thiết kế', 'Figma cơ bản', 'UI Components', 'UX Research', 'Design System'],
  },
  {
    id: 'mobile',
    icon: 'smartphone',
    title: 'Lập trình Mobile',
    desc: 'React Native, Flutter và phát triển ứng dụng di động',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    tags: ['React Native', 'Flutter', 'iOS', 'Android'],
    steps: ['Mobile fundamentals', 'React Native cơ bản', 'Navigation & State', 'API Integration', 'Publish App'],
  },
];

export default function Home() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCourses, setTotalCourses] = useState(0);
  const [selectedPathway, setSelectedPathway] = useState('web');

  useEffect(() => {
    getCourses({ limit: 6 }).then((res) => {
      if (res.success && res.data) {
        setCourses(res.data.data);
        setTotalCourses(res.data.meta?.total || res.data.data.length);
      }
      setIsLoading(false);
    });
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-sky-500/20">
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-gradient-to-b from-[#f0f9ff] to-white">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] -z-10" />

          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center py-16">
            <motion.div {...fadeUp} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-xs font-bold uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Kỷ nguyên học tập mới
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900">
                Học Tập{' '}
                <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                  Không Giới Hạn
                </span>
              </h1>

              <p className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed">
                Nâng tầm tri thức với nền tảng E-learning thế hệ mới. Lộ trình học rõ ràng, giảng viên chuyên nghiệp, cộng đồng sôi động.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 bg-sky-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-xl shadow-sky-500/25 hover:bg-sky-600 hover:shadow-sky-500/40 transition-all"
                >
                  Khám phá ngay
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white border border-sky-200 text-slate-700 font-bold text-lg py-4 px-8 rounded-xl shadow-sm hover:bg-sky-50 transition-all"
                >
                  <span className="material-symbols-outlined">person_add</span>
                  Đăng ký miễn phí
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {['AB6AXuCoLcZt8R31', 'AB6AXuCkO_Nqjs9J1', 'AB6AXuDRnnukvkmBxn'].map((key, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-sky-300 to-indigo-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Tham gia cùng <span className="text-sky-500 font-bold">{totalCourses > 0 ? `${totalCourses * 120}+` : '10,000+'}</span> học viên khác
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="bg-white/85 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-4 rotate-2 hover:rotate-0 duration-500 transition-transform shadow-2xl">
                <div className="rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto shadow-xl">
                      <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    </div>
                    <p className="text-slate-600 font-semibold">Glacier Learning Platform</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {['React', 'Python', 'Figma', 'NodeJS'].map(tag => (
                        <span key={tag} className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 font-medium border border-sky-200">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl border border-sky-200 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Chứng chỉ quốc tế</p>
                    <p className="font-bold text-slate-900 text-sm">Được công nhận toàn cầu</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-14 bg-gradient-to-r from-[#006382] to-[#0091aa]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
              {[
                { icon: 'menu_book', value: totalCourses > 0 ? `${totalCourses}+` : '50+', label: 'Khóa học' },
                { icon: 'groups', value: totalCourses > 0 ? `${totalCourses * 120}+` : '10,000+', label: 'Học viên' },
                { icon: 'school', value: '20+', label: 'Giảng viên' },
                { icon: 'workspace_premium', value: '100%', label: 'Hài lòng' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="space-y-2"
                >
                  <span className="material-symbols-outlined text-white/70 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                  <p className="text-4xl font-black">{stat.value}</p>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trending Courses ── */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wide">
                <span className="w-6 h-0.5 bg-sky-500 rounded-full" />
                Nổi bật nhất
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">Khóa học xu hướng</h2>
              <p className="text-slate-600 max-w-lg">Khám phá những khóa học được cộng đồng quan tâm nhất.</p>
            </div>
            <Link href="/courses" className="flex items-center gap-2 text-sky-600 font-semibold hover:underline shrink-0">
              Xem tất cả <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
                ))
              : courses.length > 0
              ? courses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.5, delay: 0.08 * i }}
                  >
                    <Link href={`/courses/${course.id}`} className="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-sky-500/8 hover:border-sky-200 transition-all duration-300 h-full">
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-sky-300">play_circle</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-sky-600 border border-sky-100">
                          {course._count?.sections || 0} Chương
                        </div>
                        {Number(course.price) === 0 && (
                          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">MIỄN PHÍ</div>
                        )}
                      </div>
                      <div className="p-6 space-y-3">
                        <h3 className="text-base font-bold leading-tight text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">{course.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {course.instructor?.fullName || 'Giảng viên'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">group</span>
                            {course._count?.members || 0} học viên
                          </span>
                        </div>
                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-xl font-black text-sky-600">
                            {Number(course.price) === 0 ? 'Miễn phí' : `$${Number(course.price).toFixed(2)}`}
                          </span>
                          <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
                            Xem ngay →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              : (
                <div className="col-span-3 text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-slate-300">school</span>
                  <p className="text-slate-500 mt-3">Chưa có khóa học nào. <Link href="/register" className="text-sky-500 underline">Đăng ký để cập nhật!</Link></p>
                </div>
              )}
          </div>
        </section>

        {/* ── Pathways ── */}
        <section className="py-24 bg-[#f8fbff]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div {...fadeUp} className="text-center mb-14 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wide">
                <span className="w-6 h-0.5 bg-sky-500 rounded-full" />
                Lộ trình học tập
                <span className="w-6 h-0.5 bg-sky-500 rounded-full" />
              </div>
              <h2 className="text-4xl font-bold text-slate-900">Chọn lộ trình phù hợp với bạn</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Mỗi lộ trình được thiết kế bởi chuyên gia, giúp bạn đi từ cơ bản đến thành thạo một cách có hệ thống.</p>
            </motion.div>

            {/* Pathway selector */}
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {PATHWAYS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPathway(p.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                    selectedPathway === p.id
                      ? 'bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-500/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: selectedPathway === p.id ? "'FILL' 1" : "'FILL' 0" }}>{p.icon}</span>
                  {p.title}
                </button>
              ))}
            </div>

            {/* Pathway detail */}
            {PATHWAYS.filter((p) => p.id === selectedPathway).map((pathway) => (
              <motion.div
                key={pathway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pathway.color} flex items-center justify-center shadow-xl`}>
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{pathway.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{pathway.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{pathway.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pathway.tags.map(tag => (
                      <span key={tag} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${pathway.bg} text-slate-700 border border-slate-200`}>{tag}</span>
                    ))}
                  </div>
                  <Link
                    href={`/pathway?track=${pathway.id}`}
                    className={`inline-flex items-center gap-2 text-white font-bold py-3 px-7 rounded-xl bg-gradient-to-r ${pathway.color} shadow-lg hover:opacity-90 transition-opacity`}
                  >
                    Bắt đầu lộ trình
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>

                <div className="space-y-3">
                  {pathway.steps.map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-100 transition-all group"
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${pathway.color} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md`}>
                        {i + 1}
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{step}</span>
                      {i === 0 && <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Bắt đầu</span>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-gradient-to-br from-[#006382] via-[#0079a0] to-[#005672] text-white relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
            <motion.div {...fadeUp} className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black leading-tight">Sẵn sàng bắt đầu<br />hành trình của bạn?</h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto">Tham gia cùng hàng nghìn học viên đang chinh phục kiến thức mỗi ngày trên Glacier Learning.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/register" className="bg-white text-[#006382] font-black py-4 px-10 rounded-xl text-lg shadow-xl hover:bg-sky-50 transition-colors">
                Đăng ký miễn phí
              </Link>
              <Link href="/courses" className="bg-white/10 border border-white/30 text-white font-bold py-4 px-10 rounded-xl text-lg hover:bg-white/20 transition-colors backdrop-blur-sm">
                Xem khóa học
              </Link>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-400/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
              </div>
              <span className="text-white font-black text-xl">Glacier</span>
            </div>
            <p className="text-sm leading-relaxed">Nền tảng học tập E-learning thế hệ mới, nơi tri thức không có giới hạn.</p>
          </div>
          {[
            { title: 'Học tập', links: [{ label: 'Khóa học', href: '/courses' }, { label: 'Lộ trình', href: '/pathway' }, { label: 'Tài nguyên', href: '/resources' }] },
            { title: 'Tài khoản', links: [{ label: 'Đăng nhập', href: '/login' }, { label: 'Đăng ký', href: '/register' }, { label: 'Dashboard', href: '/dashboard' }] },
            { title: 'Liên hệ', links: [{ label: 'Email: hello@glacier.vn', href: '#' }, { label: 'Facebook', href: '#' }] },
          ].map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-white font-semibold text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-xs text-center">
          © {new Date().getFullYear()} Glacier Learning. Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
