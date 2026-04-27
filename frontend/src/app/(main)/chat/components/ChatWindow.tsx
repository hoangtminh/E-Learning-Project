'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { cn } from '@/lib/utils';
import {
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  Smile,
  Send,
  Loader2,
  MoreHorizontal,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import ChatInput from './ChatInput';
import { MessageItem } from './MessageItem';
import { ChatInfo } from './ChatInfo';

export const ChatWindow = () => {
  const {
    currentConversation,
    messages,
    isLoadingMessages,
    hasMore,
    messageLoadingError,
    loadMoreMessages,
    retryLoadMessages,
    sendMessage,
    showInfo,
    setShowInfo,
  } = useChat();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  const handleScroll = useCallback(
    async (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (target.scrollTop === 0 && hasMore && !isLoadingMessages) {
        setPrevScrollHeight(target.scrollHeight);
        await loadMoreMessages();
      }
    },
    [hasMore, isLoadingMessages],
  );

  const formatSeparatorTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      ) as HTMLElement;
      if (scrollContainer) {
        if (prevScrollHeight > 0) {
          // Maintain scroll position after loading more
          scrollContainer.scrollTop =
            scrollContainer.scrollHeight - prevScrollHeight;
          setPrevScrollHeight(0);
        } else if (messages.length > 0) {
          // Scroll to bottom on first load or new message
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }
  }, [messages, prevScrollHeight]);

  if (!currentConversation) {
    return (
      <div className='flex-1 flex items-center justify-center bg-background/50 text-on-surface-variant/50'>
        <div className='text-center'>
          <div className='w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Send size={40} className='text-primary/20' />
          </div>
          <p className='text-lg font-medium'>
            Chọn một cuộc trò chuyện để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex overflow-hidden'>
      <div className='flex-2 flex flex-col bg-background relative border-r border-outline-variant'>
        {/* Header */}
        <div className='h-12 px-6 flex items-center justify-between border-b border-outline-variant bg-surface-container-low/50 backdrop-blur-md z-10'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8 border border-outline-variant'>
              <AvatarImage
                src={
                  currentConversation.members.find(
                    (m) => m.userId !== user?.userId,
                  )?.user.avatarUrl || ''
                }
                alt={currentConversation.title || 'Chat'}
              />
              <AvatarFallback>
                {(currentConversation.title ||
                  currentConversation.members.find(
                    (m) => m.userId !== user?.userId,
                  )?.user.fullName)?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='font-semibold text-on-surface'>
                {currentConversation.title ||
                  currentConversation.members.find(
                    (m) => m.userId !== user?.userId,
                  )?.user.fullName ||
                  'Trò chuyện'}
              </div>
              <div className='text-xs text-green-500 font-medium'>
                Đang hoạt động
              </div>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='text-on-surface-variant hover:bg-primary/5 rounded-full'
            >
              <Phone size={20} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='text-on-surface-variant hover:bg-primary/5 rounded-full'
            >
              <Video size={20} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                'text-on-surface-variant hover:bg-primary/5 rounded-full',
                showInfo && 'bg-primary/10 text-primary',
              )}
            >
              <MoreHorizontal size={22} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea
          ref={scrollRef}
          className='flex-1 px-6 h-full overflow-hidden'
          onScrollCapture={handleScroll}
        >
          {isLoadingMessages && (
            <div className='flex justify-center py-4'>
              <Loader2 className='animate-spin text-primary' size={20} />
            </div>
          )}
          {messageLoadingError && !isLoadingMessages && (
            <div className='flex flex-col items-center py-6 px-4 bg-error-container/20 rounded-2xl border border-error/10 mx-6 mb-4'>
              <p className='text-sm text-error font-medium mb-3'>
                Không thể tải tin nhắn
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => retryLoadMessages()}
                className='border-error/20 text-error hover:bg-error/5 rounded-full px-6'
              >
                Thử lại
              </Button>
            </div>
          )}
          {!hasMore && !messageLoadingError && messages.length > 0 && (
            <div className='flex flex-col items-center py-8 opacity-50'>
              <div className='h-px w-full bg-linear-to-r from-transparent via-outline-variant to-transparent mb-4' />
              <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 bg-surface px-4 py-1 rounded-full border border-outline-variant/30'>
                Đã tải hết tin nhắn
              </p>
            </div>
          )}
          <div className='flex flex-col-reverse gap-1 min-h-full'>
            {[...messages].map((msg, index, reversedArray) => {
              const isMe = msg.senderId === user?.userId;

              const olderMsg = reversedArray[index + 1];
              const newerMsg = reversedArray[index - 1];

              const isFirstOfGroup =
                !olderMsg || olderMsg.senderId !== msg.senderId;
              const isLastOfGroup =
                !newerMsg || newerMsg.senderId !== msg.senderId;

              // Check if we should show a time separator between this message and the older one
              let showTimeSeparator = false;
              if (olderMsg && msg.createdAt && olderMsg.createdAt) {
                const diff =
                  new Date(msg.createdAt).getTime() -
                  new Date(olderMsg.createdAt).getTime();
                if (diff > 10 * 60 * 1000) {
                  showTimeSeparator = true;
                }
              } else if (!olderMsg) {
                showTimeSeparator = true;
              }

              return (
                <React.Fragment key={msg.id}>
                  <MessageItem
                    id={msg.id}
                    content={msg.content || ''}
                    isMe={isMe}
                    showAvatar={!isMe && isLastOfGroup}
                    avatarUrl={msg.sender?.avatarUrl || undefined}
                    senderName={msg.sender?.fullName || 'Người dùng'}
                    isFirstOfGroup={isFirstOfGroup}
                    isLastOfGroup={isLastOfGroup}
                    status={msg.status}
                    createdAt={msg.createdAt}
                    showTimeSeparator={showTimeSeparator}
                  />
                  {showTimeSeparator && msg.createdAt && (
                    <div className='flex justify-center my-6'>
                      <span className='px-3 py-1 rounded-full bg-surface-container text-[11px] font-medium text-on-surface-variant/70 border border-outline-variant/20 shadow-sm'>
                        {formatSeparatorTime(msg.createdAt)}
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className='pt-2'></div>
        </ScrollArea>

        {/* Footer */}
        <ChatInput onSend={sendMessage} />
      </div>

      {/* Chat Info Sidebar */}
      {showInfo && <ChatInfo onClose={() => setShowInfo(false)} />}
    </div>
  );
};
