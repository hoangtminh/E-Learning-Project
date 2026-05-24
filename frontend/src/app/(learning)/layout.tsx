import { AppShell } from '@/components/main/AppShell';

export default function LearningGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell contentClassName='bg-[#0f1524]'>{children}</AppShell>;
}
