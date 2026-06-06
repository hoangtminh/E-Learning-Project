'use client';

import React from 'react';
import { ChatSidebar } from '@/app/(main)/chat/components/ChatSidebar';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showInfo } = useChat();
  const params = useParams();
  const isChatRoomActive = !!params?.chatId;

  return (
    <div className='flex h-full overflow-hidden bg-background w-full relative'>
      {/* Sidebar - hidden on mobile when a chat room is active */}
      <div className={cn(
        'transition-all duration-300 ease-in-out h-full flex flex-col flex-shrink-0 w-full md:w-96 border-r border-outline-variant/10',
        isChatRoomActive ? 'hidden md:flex' : 'flex'
      )}>
        <ChatSidebar />
      </div>
      
      {/* Chat window/placeholder - hidden on mobile when no chat room is active */}
      <div className={cn(
        'flex-1 flex flex-col overflow-hidden w-full h-full',
        isChatRoomActive ? 'flex' : 'hidden md:flex'
      )}>
        {children}
      </div>
    </div>
  );
}

