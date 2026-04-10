import { TopNav } from '@/components/layout/TopNav';
import { CourseHero } from '@/components/course/CourseHero';
import { CourseProgressBanner } from '@/components/course/CourseProgressBanner';
import { CourseTabs } from '@/components/course/CourseTabs';
import { CourseBuyCard } from '@/components/course/CourseBuyCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chi Tiết Khóa Học - Advanced Cybersecurity & Network Defense',
  description:
    'Nắm vững các kỹ năng an toàn mạng nâng cao, phát hiện mối đe dọa và chiến lược bảo mật toàn diện.',
};

// Mock data — sau này sẽ fetch từ API theo params.courseId
const course = {
  id: '1',
  title: 'Advanced Cybersecurity & Network Defense 2024',
  subtitle:
    'Làm chủ các kỹ thuật tấn công & phòng thủ mạng hiện đại, bảo mật hệ thống doanh nghiệp, phân tích mối đe dọa và chiến lược ứng phó sự cố.',
  category: 'Cybersecurity',
  level: 'Intermediate',
  rating: 4.8,
  reviewCount: 3200,
  studentCount: 12480,
  totalHours: 42,
  updatedAt: 'Tháng 10, 2024',
  isBestSeller: true,
  hasCertificate: true,
  thumbnailUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBzSG5WgMwmYcg9d0BesgTRKe-NbPZAnaUymKQoqWZV1eJDmt-gOTnJtNSuCVrpFthyZTAISu0R5JT1VFzifhS8JhOY2ZRKGDEqZbnjUuIEeGHCQwaV1NfSmLTO1VfBDMsPr1uQkVBdP0SLWjWhOMuabB6adMamcHN9gBt0G37bO3CWWMPa-2A039N3bwmA0ysu5AzGdg33gYnup-RidAr0Ab1OmF7J4_Z5gL7OnHZHOikCdw6h4TiADlvitCFMLEjbo0xHUMhOK0NU',
  instructor: {
    name: 'TS. Nguyễn Văn Khoa',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEaD6AYiPTA5D20zrCZ26iXsbBTk7A7n0Re-vB5zoaLF1WPwpiZyeZ_M6A5mWWe2YuY1IWgUkuTM7XS6njCXVZQXaCx-QYfjVj6OP_45Etglz_LF4PfWTX5kR73GixfBzh7aWCAAGsacJALg2ROk4zALBi7Uc7bGNr22lqlIUDqp8_2DLtT0juDR9fo7PYopJws8INS5QmSYWskox6VFaHwdfvcWbYFE6DZrJVzWy3QrQohA3aHSXcYJk2uZb6s-FbDm0SkXnLJ1gj',
    title: 'Chuyên gia An toàn Thông tin · Cố vấn Bảo mật Doanh nghiệp',
  },
  price: 1299000,
  originalPrice: 2599000,
  progress: 65,
  completedLessons: 26,
  totalLessons: 40,
  nextLesson: 'Bài 27 – Penetration Testing Frameworks',
  remainingHours: 15,
};

export default function CourseDetailPage() {
  return (
    <>
      <TopNav
        breadcrumbs={[
          { label: 'My Courses', href: '/my-courses' },
          { label: 'Advanced Cybersecurity & Network Defense' },
        ]}
      />

      {/* Hero Banner */}
      <CourseHero course={course} />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-10">
          <CourseProgressBanner course={course} />
          <CourseTabs courseId={course.id} />
        </div>

        {/* Right column — Buy card */}
        <div className="lg:col-span-1">
          <CourseBuyCard course={course} />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-sky-400/10 bg-slate-950 mt-8">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-lg font-bold text-sky-300">Glacier</span>
            <p className="text-xs text-slate-500 mt-2">
              © 2024 Glacier E-Learning. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'Contact Support', 'Blog'].map((link) => (
              <a key={link} href="#" className="text-xs text-slate-500 hover:text-sky-200 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
