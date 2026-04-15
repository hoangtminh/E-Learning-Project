import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
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
    <html lang='vi' className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
          rel='stylesheet'
        />
      </head>
      <body className='min-h-full flex flex-col font-sans'>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
