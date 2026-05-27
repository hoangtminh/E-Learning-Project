'use client';

import React from 'react';
import { ChatSidebar } from '@/app/(main)/chat/components/ChatSidebar';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showInfo } = useChat();

  return (
    <div className='flex h-full overflow-hidden bg-background'>
      <div className={cn(
        'transition-all duration-300 ease-in-out h-full flex flex-col flex-shrink-0',
        showInfo ? 'w-80' : 'w-96'
      )}>
        <ChatSidebar />
      </div>
      <div className='flex-1 flex flex-col overflow-hidden'>{children}</div>
    </div>
  );
}
