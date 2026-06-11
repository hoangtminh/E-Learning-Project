import type { Metadata } from 'next';
import {
  fetchCourseForMetadata,
  stripHtml,
} from '@/lib/server-api';

type Props = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  const course = await fetchCourseForMetadata(courseId);

  if (!course) {
    return {
      title: 'Khóa học không tồn tại | Glacier Learning',
      robots: { index: false, follow: false },
    };
  }

  const description =
    stripHtml(course.description) ||
    'Khóa học trực tuyến chất lượng trên Glacier Learning.';

  return {
    title: `${course.title} | Glacier Learning`,
    description,
    openGraph: {
      title: course.title,
      description,
      type: 'website',
      ...(course.thumbnailUrl ? { images: [{ url: course.thumbnailUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      description,
      ...(course.thumbnailUrl ? { images: [course.thumbnailUrl] } : {}),
    },
  };
}

export default function CourseDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
