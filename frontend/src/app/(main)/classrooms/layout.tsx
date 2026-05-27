'use client';

import { ClassroomProvider } from '@/contexts/ClassroomContext';
import { PostProvider } from '@/contexts/PostContext';

export default function ClassroomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClassroomProvider>
      <PostProvider>{children}</PostProvider>
    </ClassroomProvider>
  );
}
