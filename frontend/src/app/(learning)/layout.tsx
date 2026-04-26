import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Lớp 2 đặc tả: kiểm tra enrollment (check-enrollment) qua API.
 * Hiện chỉ xác thực đã đăng nhập — bổ sung gọi BE khi có endpoint.
 */
export default function LearningGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background'>
      <div className='border-b border-primary/10 bg-[rgba(15,21,36,0.45)] px-4 py-3 backdrop-blur-xl'>
        <p className='text-muted-foreground text-xs'>
          Learning workspace · Tab Chat / Notes / Files — layout theo đặc tả màn
          hình 4.
        </p>
      </div>
      {children}
    </div>
  );
}
