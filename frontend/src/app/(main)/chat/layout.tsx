'use client';

import React from 'react';
import { ChatSidebar } from '@/app/(main)/chat/components/ChatSidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-full overflow-hidden bg-background'>
      <div className='flex-2'>
        <ChatSidebar />
      </div>
      <div className='flex-5 flex flex-col overflow-hidden'>{children}</div>
    </div>
  );
}
