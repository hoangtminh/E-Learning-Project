'use client';

import dynamic from 'next/dynamic';
import { LessonWorkspaceClient } from './ui/lesson-workspace-client';

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className='glass flex aspect-video w-full items-center justify-center rounded-xl text-sm text-muted-foreground'>
      Đang tải trình phát…
    </div>
  ),
});

type PageProps = {
  params: { courseId: string; lessonId: string };
};

export default function LearningLessonPage({ params }: PageProps) {
  return (
    <div className='mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]'>
      <div className='space-y-4'>
        <div className='relative aspect-video w-full overflow-hidden rounded-xl border border-primary/10'>
          <ReactPlayer
            src='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
            width='100%'
            height='100%'
            controls
            className='absolute inset-0'
          />
        </div>
        <LessonWorkspaceClient
          courseId={params.courseId}
          lessonId={params.lessonId}
        />
      </div>
      <aside className='glass-elevated h-fit rounded-xl p-4 text-sm text-muted-foreground lg:sticky lg:top-4'>
        <p className='font-medium text-foreground'>Lesson sidebar</p>
        <p className='mt-2'>
          Danh sách bài trong section — nối Prisma{' '}
          <code className='text-primary/90'>lessons</code>.
        </p>
      </aside>
    </div>
  );
}
