'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/main/AppShell';
import { ChatProvider } from '@/contexts/ChatContext';
import { CourseProvider } from '@/contexts/CourseContext';
import { AdminForbidden } from '@/components/ui/AdminForbidden';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (!isLoading && user?.role === 'admin') {
    return <AdminForbidden />;
  }

  return (
    <ChatProvider>
      <CourseProvider>
        <AppShell>{children}</AppShell>
      </CourseProvider>
    </ChatProvider>
  );
}
