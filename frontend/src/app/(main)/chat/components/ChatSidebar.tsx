'use client';

import React, { useState } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationItem } from './ConversationItem';
import { useChat } from '@/contexts/ChatContext';

import { CreateChatDialog } from './CreateChatDialog';
import { useAuth } from '@/contexts/AuthContext';

export const ChatSidebar = () => {
  const {
    conversations,
    currentConversation,
    setCurrentConversationById,
    isLoading,
  } = useChat();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const getDisplayTitle = (conv: any) => {
    if (conv.title) return conv.title;
    const otherMember = conv.members.find(
      (m: any) => m.userId !== user?.userId,
    );
    return otherMember?.user.fullName || 'Trò chuyện';
  };

  const getDisplayAvatar = (conv: any) => {
    const otherMember = conv.members.find(
      (m: any) => m.userId !== user?.userId,
    );
    return otherMember?.user.avatarUrl || '';
  };

  const filteredConversations = conversations.filter((c) =>
    getDisplayTitle(c).toLowerCase().includes(search.toLowerCase()),
  );

  console.log(conversations);

  return (
    <div className='flex-1 h-full border-r border-outline-variant flex flex-col bg-surface-container-low/30'>
      <div className='flex gap-2 h-12 justify-around items-center px-4 border-b border-outline-variant'>
        <div className='relative w-full'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 size-4' />
          <Input
            placeholder='Tìm kiếm cuộc trò chuyện...'
            className='w-full pl-9 bg-surface-container-lowest border-outline-variant rounded-xl h-8 text-sm focus-visible:ring-primary/20'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CreateChatDialog />
      </div>

      <ScrollArea className='flex-1 px-1.5'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <Loader2 className='animate-spin text-primary/50' size={24} />
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className='p-2 space-y-1.5'>
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                id={conv.id}
                title={getDisplayTitle(conv)}
                lastMessage={conv.lastMessage || 'Chưa có tin nhắn'}
                avatarUrl={getDisplayAvatar(conv)}
                isActive={currentConversation?.id === conv.id}
                onClick={() => setCurrentConversationById(conv.id)}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
            <p className='text-sm text-on-surface-variant/50'>
              {search
                ? 'Không tìm thấy cuộc trò chuyện nào'
                : 'Chưa có cuộc trò chuyện nào'}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
