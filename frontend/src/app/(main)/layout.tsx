import { AppShell } from '@/components/main/AppShell';
import { ChatProvider } from '@/contexts/ChatContext';
import { CourseProvider } from '@/contexts/CourseContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <CourseProvider>
        <AppShell>{children}</AppShell>
      </CourseProvider>
    </ChatProvider>
  );
}
