'use client';

import { AppShell } from '@/components/main/AppShell';
import { AdminForbidden } from '@/components/ui/AdminForbidden';
import { useAuth } from '@/contexts/AuthContext';

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
