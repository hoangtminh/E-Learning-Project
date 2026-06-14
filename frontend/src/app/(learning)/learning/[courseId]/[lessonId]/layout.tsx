import type { Metadata } from 'next';
import {
  checkEnrollmentServer,
  fetchCourseForMetadata,
  stripHtml,
} from '@/lib/server-api';

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId, lessonId } = await params;
  const enrolled = await checkEnrollmentServer(courseId);

  if (!enrolled) {
    return {
      title: 'Học tập | Glacier Learning',
      description: 'Nội dung học tập chỉ dành cho học viên đã đăng ký khóa học.',
      robots: { index: false, follow: false },
    };
  }

  const course = await fetchCourseForMetadata(courseId);
  let lessonTitle = 'Bài học';

  if (course?.sections) {
    for (const section of course.sections) {
      const lesson = section.lessons?.find((l) => l.id === lessonId);
      if (lesson?.title) {
        lessonTitle = lesson.title;
        break;
      }
    }
  }

  const courseTitle = course?.title ?? 'Khóa học';
  const description = course
    ? stripHtml(course.description) || `Học ${lessonTitle} trong khóa ${courseTitle}.`
    : `Học ${lessonTitle} trên Glacier Learning.`;

  return {
    title: `${lessonTitle} — ${courseTitle} | Glacier Learning`,
    description,
    robots: { index: false, follow: false },
  };
}

export default function LearningLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
