'use client';

import { ClassroomProvider } from '@/contexts/ClassroomContext';

export default function ClassroomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClassroomProvider>{children}</ClassroomProvider>;
}
