'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getCourses, CourseListItem } from '@/api/courses';
import { Header } from '@/components/home/Header';

const PATHWAYS = [
  {
    id: 'web',
    icon: 'code',
    title: 'Lập trình Web',
    subtitle: 'Frontend & Backend Development',
    desc: 'Lộ trình từ người mới bắt đầu đến lập trình viên Fullstack chuyên nghiệp. Học React, NodeJS, TypeScript và các công nghệ web hiện đại nhất.',
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    duration: '6-12 tháng',
    level: 'Mọi cấp độ',
    steps: [
      { title: 'HTML & CSS Cơ bản', desc: 'Cấu trúc trang web, styling, Flexbox & Grid', duration: '4 tuần' },
      { title: 'JavaScript ES6+', desc: 'DOM, async/await, fetch API, modules', duration: '6 tuần' },
      { title: 'ReactJS', desc: 'Components, Hooks, State management, Routing', duration: '8 tuần' },
      { title: 'Backend với NodeJS', desc: 'REST API, Express, database, JWT auth', duration: '6 tuần' },
      { title: 'Fullstack Project', desc: 'Xây dựng sản phẩm hoàn chỉnh, deploy lên cloud', duration: '4 tuần' },
    ],
    keywords: ['web', 'react', 'javascript', 'html', 'css', 'nodejs', 'fullstack'],
  },
  {
    id: 'data',
    icon: 'analytics',
    title: 'Khoa học Dữ liệu',
    subtitle: 'Data Science & Machine Learning',
    desc: 'Từ Python cơ bản đến Machine Learning và Deep Learning. Phù hợp cho ai muốn trở thành Data Analyst hoặc Data Scientist.',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    duration: '8-14 tháng',
    level: 'Từ cơ bản',
    steps: [
      { title: 'Python Cơ bản', desc: 'Syntax, OOP, file I/O, thư viện chuẩn', duration: '4 tuần' },
      { title: 'Pandas & NumPy', desc: 'Xử lý và phân tích dữ liệu dạng bảng', duration: '4 tuần' },
      { title: 'Trực quan hóa dữ liệu', desc: 'Matplotlib, Seaborn, Plotly', duration: '3 tuần' },
      { title: 'Machine Learning', desc: 'Scikit-learn, Regression, Classification, Clustering', duration: '8 tuần' },
      { title: 'Deep Learning', desc: 'TensorFlow/PyTorch, Neural Networks, CNN, NLP', duration: '8 tuần' },
    ],
    keywords: ['python', 'data', 'machine learning', 'ai', 'analytics', 'sql'],
  },
  {
    id: 'design',
    icon: 'palette',
    title: 'Thiết kế UI/UX',
    subtitle: 'User Interface & Experience Design',
    desc: 'Học thiết kế giao diện chuyên nghiệp với Figma, xây dựng Design System và nghiên cứu trải nghiệm người dùng.',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    duration: '4-8 tháng',
    level: 'Mọi cấp độ',
    steps: [
      { title: 'Nguyên lý thiết kế', desc: 'Typography, Color, Layout, Gestalt principles', duration: '3 tuần' },
      { title: 'Figma cơ bản đến nâng cao', desc: 'Auto-layout, Components, Variants, Plugins', duration: '5 tuần' },
      { title: 'UI Components & Patterns', desc: 'Design System, Atomic Design, Dark mode', duration: '4 tuần' },
      { title: 'UX Research', desc: 'User interviews, Usability testing, Personas', duration: '4 tuần' },
      { title: 'Prototyping & Handoff', desc: 'Interactive prototypes, Dev handoff với Zeplin', duration: '2 tuần' },
    ],
    keywords: ['design', 'figma', 'ui', 'ux', 'prototype'],
  },
  {
    id: 'mobile',
    icon: 'smartphone',
    title: 'Lập trình Mobile',
    subtitle: 'iOS & Android Development',
    desc: 'Phát triển ứng dụng di động đa nền tảng với React Native hoặc Flutter. Từ cơ bản đến publish lên App Store.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    duration: '6-10 tháng',
    level: 'Cần biết JS cơ bản',
    steps: [
      { title: 'Mobile Fundamentals', desc: 'Native vs Cross-platform, UX mobile patterns', duration: '2 tuần' },
      { title: 'React Native Cơ bản', desc: 'Components, StyleSheet, Navigation', duration: '6 tuần' },
      { title: 'State & Data Management', desc: 'Redux Toolkit, Zustand, AsyncStorage', duration: '4 tuần' },
      { title: 'API Integration', desc: 'REST API, WebSocket, Push Notifications', duration: '3 tuần' },
      { title: 'Publish App', desc: 'App Store / Google Play, CI/CD với Fastlane', duration: '2 tuần' },
    ],
    keywords: ['mobile', 'react native', 'flutter', 'ios', 'android', 'app'],
  },
];

function PathwayContent() {
  const searchParams = useSearchParams();
  const trackId = searchParams.get('track') || 'web';
  const [active, setActive] = useState(trackId);
  const [relatedCourses, setRelatedCourses] = useState<CourseListItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const pathway = PATHWAYS.find((p) => p.id === active) || PATHWAYS[0];

  useEffect(() => {
    setActive(trackId);
  }, [trackId]);

  useEffect(() => {
    setLoadingCourses(true);
    getCourses({ limit: 3 }).then((res) => {
      if (res.success && res.data) setRelatedCourses(res.data.data.slice(0, 3));
      setLoadingCourses(false);
    });
  }, [active]);

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />
      <div className="pt-20">
        {/* Hero banner */}
        <div className={`bg-gradient-to-r ${pathway.color} py-16 px-6`}>
          <div className="max-w-5xl mx-auto text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{pathway.icon}</span>
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">{pathway.subtitle}</p>
                <h1 className="text-3xl font-black">{pathway.title}</h1>
              </div>
            </div>
            <p className="text-white/85 text-lg max-w-2xl leading-relaxed">{pathway.desc}</p>
            <div className="flex gap-4 flex-wrap pt-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {pathway.duration}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                {pathway.level}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">list_alt</span>
                {pathway.steps.length} giai đoạn
              </span>
            </div>
          </div>
        </div>

        {/* Track selector */}
        <div className="border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {PATHWAYS.map((p) => (
              <Link
                key={p.id}
                href={`/pathway?track=${p.id}`}
                onClick={() => setActive(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  active === p.id ? `bg-gradient-to-r ${p.color} text-white shadow-md` : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: active === p.id ? "'FILL' 1" : "'FILL' 0" }}>{p.icon}</span>
                {p.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
          {/* Roadmap steps */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-slate-900">Lộ trình học tập</h2>
            <div className="relative space-y-4">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-slate-200 to-transparent" />
              {pathway.steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${pathway.color} flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg z-10`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900">{step.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${pathway.bg} ${pathway.textColor} border ${pathway.borderColor}`}>
                        {step.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Related courses sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900">Khóa học liên quan</h2>
            {loadingCourses ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : relatedCourses.length > 0 ? (
              <div className="space-y-3">
                {relatedCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="flex gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-slate-200 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${pathway.color} opacity-30 flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-white">play_circle</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-sky-600 transition-colors">{course.title}</p>
                      <p className={`text-xs font-semibold mt-1 ${pathway.textColor}`}>
                        {Number(course.price) === 0 ? 'Miễn phí' : `$${Number(course.price).toFixed(2)}`}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link href="/courses" className={`block text-center text-sm font-semibold ${pathway.textColor} hover:underline pt-2`}>
                  Xem tất cả khóa học →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2 block">school</span>
                Chưa có khóa học phù hợp
              </div>
            )}

            <div className={`p-5 rounded-2xl bg-gradient-to-br ${pathway.color} text-white space-y-3`}>
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              <h4 className="font-black">Sẵn sàng bắt đầu?</h4>
              <p className="text-white/80 text-sm">Đăng ký ngay hôm nay và nhận quyền truy cập vào toàn bộ khoá học.</p>
              <Link href="/register" className="block text-center bg-white font-bold text-sm py-2.5 rounded-xl hover:bg-slate-50 transition-colors" style={{ color: '#006382' }}>
                Đăng ký miễn phí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PathwayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PathwayContent />
    </Suspense>
  );
}
