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
import { motion, AnimatePresence } from 'framer-motion';

import { callsApi, CallStatus, CallType } from '@/api/calls';
import { toast } from 'sonner';

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
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [callStatuses, setCallStatuses] = useState<Record<string, CallStatus>>({});


  const callInvitationIds = useMemo(() => {
    const ids = new Set<string>();
    messages.forEach((message) => {
      const content = message.content || '';
      if (!content.startsWith('[CALL_INVITATION]:')) return;
      const [, callId] = content.split(':');
      if (callId) ids.add(callId);
    });
    return Array.from(ids);
  }, [messages]);

  useEffect(() => {
    if (callInvitationIds.length === 0) return;

    let cancelled = false;

    const refreshCallStatuses = async () => {
      const entries = await Promise.all(
        callInvitationIds.map(async (callId) => {
          const res = await callsApi.getCall(callId);
          return res.success && res.data
            ? ([callId, res.data.status] as const)
            : null;
        }),
      );

      if (cancelled) return;
      setCallStatuses((prev) => {
        const next = { ...prev };
        entries.forEach((entry) => {
          if (entry) next[entry[0]] = entry[1];
        });
        return next;
      });
    };

    void refreshCallStatuses();
    const interval = window.setInterval(refreshCallStatuses, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [callInvitationIds]);

  const handleStartCall = async () => {
    if (!currentConversation?.id) return;
    setIsStartingCall(true);
    try {
      const res = await callsApi.createCall({
        title: `Cuộc họp nhóm - ${currentConversation.title || 'Trò chuyện'}`,
        type: CallType.CHANNEL,
        conversationId: currentConversation.id,
      });

      if (res.success && res.data) {
        toast.success('Khởi động cuộc họp nhóm thành công!');
        
        // Auto-send call invitation card message to the chat
        const inviteContent = `[CALL_INVITATION]:${res.data.id}:${currentConversation.title || 'Cuộc họp nhóm'}`;
        await sendMessage(inviteContent);

        window.open(`/call/${res.data.id}`, '_blank');
      } else {
        toast.error(res.error || 'Khởi tạo cuộc gọi thất bại!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi hệ thống khi bắt đầu cuộc gọi.');
    } finally {
      setIsStartingCall(false);
    }
  };

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
      <div className='flex-2 flex flex-col bg-surface-container-low relative border-r border-outline-variant/10'>
        {/* Header */}
        <div className='h-14 px-6 flex items-center justify-between border-b border-outline-variant/60 bg-white shadow-[0_0_30px_rgba(125,211,252,0.05)] z-10'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8 border border-outline-variant/20'>
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
              <div className='font-semibold text-on-surface text-sm'>
                {currentConversation.title ||
                  currentConversation.members.find(
                    (m) => m.userId !== user?.userId,
                  )?.user.fullName ||
                  'Trò chuyện'}
              </div>
              <div className='text-[10px] text-green-600 font-medium'>
                Đang hoạt động
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleStartCall}
              disabled={isStartingCall}
              className='text-on-surface-variant bg-surface-container-low/70 hover:bg-surface-container-high rounded-xl h-9 w-9 transition-colors'
            >
              {isStartingCall ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Phone size={18} />
              )}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleStartCall}
              disabled={isStartingCall}
              className='text-on-surface-variant bg-surface-container-low/70 hover:bg-surface-container-high rounded-xl h-9 w-9 transition-colors'
            >
              {isStartingCall ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Video size={18} />
              )}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                'rounded-xl h-9 w-9 transition-all',
                showInfo
                  ? 'bg-primary text-on-primary hover:bg-primary-dim shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              <Info size={18} />
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
            <div className='flex flex-col items-center pt-8'>
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

              const callId = msg.content?.startsWith('[CALL_INVITATION]:')
                ? msg.content.split(':')[1]
                : undefined;

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
                    callStatus={callId ? callStatuses[callId] : undefined}
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
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full flex-shrink-0 overflow-hidden"
          >
            <ChatInfo onClose={() => setShowInfo(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
