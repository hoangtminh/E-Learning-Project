import { Footer } from '@/components/home/Footer';
import { Header } from '@/components/home/Header';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='bg-white text-slate-900 selection:bg-sky-500/20 font-sans min-h-screen flex flex-col'>
      <Header />
      <div className='flex-1 flex flex-col'>{children}</div>
      <Footer />
    </div>
  );
}
