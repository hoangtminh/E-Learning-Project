'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Video,
  Loader2,
  Info,
  Send,
  Sparkles,
  ArrowLeft,
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
  const router = useRouter();
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    [hasMore, isLoadingMessages, loadMoreMessages],
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
      <div className='flex-1 flex items-center justify-center bg-surface-container-lowest text-on-surface-variant/50 relative'>
        <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
        <div className='text-center relative z-10'>
          <div className='w-16 h-16 bg-surface rounded-2xl border border-outline-variant/30 flex items-center justify-center mx-auto mb-4'>
            <Send size={28} className='text-primary/45' />
          </div>
          <p className='text-base font-bold text-on-surface mb-1'>Chọn cuộc trò chuyện</p>
          <p className='text-xs text-on-surface-variant/70'>Hãy chọn một cuộc hội thoại từ danh sách để bắt đầu trao đổi học tập.</p>
        </div>
      </div>
    );
  }

  const conversationName = currentConversation.title ||
    currentConversation.members.find(
      (m) => m.userId !== user?.userId,
    )?.user.fullName ||
    'Trò chuyện';

  return (
    <div className='flex-1 flex overflow-hidden w-full relative bg-[#f8fafc]'>
      <div className='flex-1 flex flex-col min-w-0 bg-[#f8fafc] relative border-r border-slate-200/50'>
        {/* Header */}
        <div className='h-14 px-4 sm:px-6 flex items-center justify-between border-b border-slate-100 bg-white relative z-20'>
          <div className='flex items-center gap-2 sm:gap-3.5 min-w-0'>
            {/* Back button on mobile */}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push('/chat')}
              className='md:hidden text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl h-9 w-9 transition-colors mr-1 cursor-pointer border-0 bg-transparent shrink-0'
              aria-label="Back to chat list"
            >
              <ArrowLeft className="size-5" />
            </Button>

            <Avatar className='h-9 w-9 border border-outline-variant/20 shrink-0'>
              <AvatarImage
                src={
                  currentConversation.members.find(
                    (m) => m.userId !== user?.userId,
                  )?.user.avatarUrl || ''
                }
                alt={conversationName}
              />
              <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs uppercase'>
                {conversationName[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <div className='font-bold text-on-surface text-xs sm:text-sm truncate leading-snug'>
                {conversationName}
              </div>
              <div className='text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5'>
                <span className='w-1 h-1 rounded-full bg-green-500 animate-pulse' />
                <span>Đang hoạt động</span>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleStartCall}
              disabled={isStartingCall}
              className='text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl h-9 w-9 transition-colors cursor-pointer border-0 bg-transparent'
              title='Gọi âm thanh'
            >
              {isStartingCall ? (
                <Loader2 className='size-4 animate-spin text-primary' />
              ) : (
                <Phone size={16} />
              )}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleStartCall}
              disabled={isStartingCall}
              className='text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl h-9 w-9 transition-colors cursor-pointer border-0 bg-transparent'
              title='Gọi video'
            >
              {isStartingCall ? (
                <Loader2 className='size-4 animate-spin text-primary' />
              ) : (
                <Video size={16} />
              )}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                'rounded-xl h-9 w-9 transition-all cursor-pointer border-0',
                showInfo
                  ? 'bg-primary text-white hover:bg-primary-dim shadow-xs'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-primary bg-transparent'
              )}
              title='Thông tin cuộc trò chuyện'
            >
              <Info size={16} />
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
            <div className='flex justify-center py-5'>
              <Loader2 className='animate-spin text-primary' size={20} strokeWidth={2} />
            </div>
          )}
          {messageLoadingError && !isLoadingMessages && (
            <div className='flex flex-col items-center py-6 px-4 bg-error/5 rounded-2xl border border-error/15 mx-6 mb-4'>
              <p className='text-xs text-error font-bold uppercase tracking-wider mb-3'>
                Không thể tải tin nhắn
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => retryLoadMessages()}
                className='border-error/20 text-error hover:bg-error/5 rounded-xl px-5 py-1 text-xs cursor-pointer'
              >
                Thử lại
              </Button>
            </div>
          )}
          {!hasMore && !messageLoadingError && messages.length > 0 && (
            <div className='flex flex-col items-center pt-8 mb-4'>
              <div className='h-px w-full bg-slate-200/50 mb-4' />
              <p className='text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-200/40 shadow-2xs'>
                Đầu cuộc hội thoại
              </p>
            </div>
          )}
          <div className='flex flex-col-reverse gap-1 min-h-full pb-4'>
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
                    <div className='flex justify-center my-5'>
                      <span className='px-3 py-1 rounded-lg bg-white text-[10px] font-bold text-slate-400 border border-slate-200/40 shadow-2xs'>
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

        {/* Footer Input Bar */}
        <ChatInput
          onSend={sendMessage}
          members={currentConversation?.members?.map((m) => ({
            id: m.user.id,
            name: m.user.fullName || 'User',
          }))}
        />
      </div>

      {/* Chat Info Sidebar */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMobile ? '100%' : 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              "h-full flex-shrink-0 overflow-hidden relative border-l border-outline-variant/20 bg-white",
              isMobile ? "absolute inset-y-0 right-0 w-full z-30" : "z-10"
            )}
          >
            <ChatInfo onClose={() => setShowInfo(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
