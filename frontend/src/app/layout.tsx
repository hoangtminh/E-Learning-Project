import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AppDialogProvider } from '@/components/ui/app-dialog-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Glacier Learning - Học Tập Không Giới Hạn',
  description: 'Nền tảng học tập trực tuyến hàng đầu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='vi'
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
          rel='stylesheet'
        />
      </head>
      <body
        className='min-h-full flex flex-col font-sans'
        suppressHydrationWarning
      >
        <AuthProvider>
          <NotificationProvider>
            <AppDialogProvider>
              {children}
              <Toaster richColors position='top-right' closeButton />
            </AppDialogProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
