'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/main/AppShell';
import { AdminForbidden } from '@/components/ui/AdminForbidden';

export default function LearningGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (!isLoading && user?.role === 'admin') {
    return <AdminForbidden />;
  }

  return <AppShell contentClassName='bg-[#0f1524]'>{children}</AppShell>;
}
