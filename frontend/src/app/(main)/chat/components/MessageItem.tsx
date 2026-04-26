'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { Trash2 } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

interface MessageItemProps {
  id: string;
  content: string;
  isMe: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  senderName?: string;
  isFirstOfGroup?: boolean;
  isLastOfGroup?: boolean;
  status?: 'pending' | 'sent' | 'error';
  createdAt?: string;
  showTimeSeparator?: boolean;
}

export const MessageItem = React.memo(
  ({
    content,
    isMe,
    showAvatar,
    avatarUrl,
    senderName,
    isFirstOfGroup,
    isLastOfGroup,
    status,
    createdAt,
    showTimeSeparator,
  }: MessageItemProps) => {
    const formatTime = (dateStr?: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <div
        className={cn(
          'flex w-full items-end gap-3 group/msg transition-all duration-300',
          isMe ? 'flex-row-reverse' : 'flex-row',
          isFirstOfGroup && 'mt-4',
          status === 'pending' && 'opacity-50',
        )}
      >
        {/* Avatar space */}
        <div className={cn('w-9 h-9 shrink-0', isMe && 'hidden')}>
          {!isMe && showAvatar && (
            <Avatar className='h-9 w-9 shadow-sm'>
              <AvatarImage src={avatarUrl} alt={senderName} />
              <AvatarFallback className='bg-primary/10 text-primary font-bold'>
                {senderName?.[0]}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Message bubble container */}
        <div
          className={cn(
            'flex flex-col max-w-[75%] relative',
            isMe ? 'items-end' : 'items-start',
          )}
        >
          {!isMe && isFirstOfGroup && (
            <span className='text-[11px] font-medium text-on-surface-variant/70 ml-1 mb-1'>
              {senderName}
            </span>
          )}
          <div className='flex items-center gap-2'>
            <div
              className={cn(
                'px-4 py-2.5 text-[0.95rem] leading-relaxed wrap-break-words shadow-sm relative',
                isMe
                  ? 'bg-primary text-white rounded-l-2xl'
                  : 'bg-surface-container-high text-on-surface rounded-r-2xl',
                status === 'error' &&
                  'bg-error text-white border-2 border-error-container',
                isFirstOfGroup && isMe && 'rounded-tr-2xl',
                isLastOfGroup && isMe && 'rounded-br-2xl',

                isFirstOfGroup && !isMe && 'rounded-tl-2xl',
                isLastOfGroup && !isMe && 'rounded-bl-2xl',
              )}
            >
              {content}

              {/* Time on hover */}

              <div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] text-on-surface-variant/60 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 pointer-events-none',
                  isMe ? 'right-full mr-3' : 'left-full ml-3',
                )}
              >
                {/* {isMe && status !== 'pending' && (
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => deleteMessage(id)}
                    className='size-7 rounded-full opacity-0 group-hover/msg:opacity-100 transition-opacity text-error hover:bg-error/10'
                  >
                    <Trash2 size={14} />
                  </Button>
                )} */}
                {formatTime(createdAt)}
              </div>
            </div>
          </div>
          {status === 'error' && (
            <span className='text-[10px] text-error font-medium mt-1 mr-1'>
              Gửi lỗi. Vui lòng thử lại.
            </span>
          )}
        </div>
      </div>
    );
  },
);
