import { Footer } from '@/components/home/Footer';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { CourseProvider } from '@/contexts/CourseContext';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CourseProvider>
      <div className='bg-white text-slate-900 selection:bg-sky-500/20 font-sans min-h-screen flex flex-col'>
        <HomeTopBar />
        <div className='flex-1 flex flex-col'>{children}</div>
        <Footer />
      </div>
    </CourseProvider>
  );
}
