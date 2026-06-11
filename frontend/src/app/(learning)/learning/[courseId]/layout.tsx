import type { Metadata } from 'next';
import { checkEnrollmentServer, fetchCourseForMetadata } from '@/lib/server-api';

type Props = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  const enrolled = await checkEnrollmentServer(courseId);

  if (!enrolled) {
    return {
      title: 'Học tập | Glacier Learning',
      description: 'Nội dung học tập chỉ dành cho học viên đã đăng ký khóa học.',
      robots: { index: false, follow: false },
    };
  }

  const course = await fetchCourseForMetadata(courseId);
  return {
    title: course ? `${course.title} — Học tập | Glacier Learning` : 'Học tập | Glacier Learning',
    robots: { index: false, follow: false },
  };
}

export default function LearningCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
