'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
    unreadConversations,
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

  return (
    <div className='flex-1 h-full bg-white border-r border-outline-variant/30 flex flex-col overflow-hidden'>
      <div className='p-4.5 border-b border-outline-variant/20 flex flex-col gap-3.5'>
        <div className='flex items-center justify-between'>
          <h3 className='font-black text-on-surface text-sm sm:text-base uppercase tracking-wider'>
            Hội thoại
          </h3>
          <CreateChatDialog />
        </div>
        <div className='relative w-full'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 size-4' />
          <Input
            placeholder='Tìm kiếm trò chuyện...'
            className='w-full pl-9 bg-surface-container-lowest border-outline-variant/40 rounded-xl h-9 text-xs focus-visible:ring-primary/20 focus:bg-white transition-colors'
            value={search}
            onChange={(e) => setSearch(setSearch => setSearch = e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className='flex-1 px-2 py-2.5'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-10 gap-2'>
            <Loader2 className='size-5 animate-spin text-primary' />
            <p className='text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-wider'>Đang tải...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className='space-y-1'>
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                id={conv.id}
                title={getDisplayTitle(conv)}
                lastMessage={conv.lastMessage || 'Chưa có tin nhắn'}
                avatarUrl={getDisplayAvatar(conv)}
                isActive={currentConversation?.id === conv.id}
                isUnread={!!unreadConversations[conv.id]}
                onClick={() => setCurrentConversationById(conv.id)}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
            <p className='text-xs text-on-surface-variant/60 font-medium'>
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
