import { MainHeader } from '@/components/main/MainHeader';
import { MainSidebar } from '@/components/main/MainSidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen bg-slate-50 font-sans selection:bg-sky-500/20 text-slate-900 overflow-hidden'>
      <MainSidebar />
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <MainHeader />
        <div className='flex-1 overflow-y-auto relative'>{children}</div>
      </div>
    </div>
  );
}
