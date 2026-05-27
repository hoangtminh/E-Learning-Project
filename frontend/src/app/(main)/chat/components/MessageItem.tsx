'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { CallStatus } from '@/api/calls';

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
  callStatus?: CallStatus;
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
    callStatus,
  }: MessageItemProps) => {
    const formatTime = (dateStr?: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const isCallInvitation = content.startsWith('[CALL_INVITATION]:');
    let callId = '';
    let callTitle = 'Cuộc họp nhóm';

    if (isCallInvitation) {
      const [, parsedCallId, ...titleParts] = content.split(':');
      callId = parsedCallId || '';
      callTitle = titleParts.join(':') || 'Cuộc họp nhóm';
    }

    if (isCallInvitation) {
      const isCheckingCall = callStatus === undefined;
      const hasEnded = callStatus === CallStatus.ENDED || callStatus === CallStatus.CANCELED;
      const canJoinCall = callStatus === CallStatus.ONGOING;
      const statusLabel = isCheckingCall
        ? 'Đang kiểm tra trạng thái cuộc họp...'
        : hasEnded
          ? 'Cuộc họp đã kết thúc'
          : canJoinCall
            ? 'Cuộc họp trực tuyến đang diễn ra'
            : 'Cuộc họp chưa sẵn sàng';

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

          {/* Call card invitation container */}
          <div
            className={cn(
              'flex flex-col max-w-[85%] relative',
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
                  'p-4 rounded-3xl border shadow-md flex flex-col gap-4 min-w-[260px] max-w-[320px] transition-all duration-300 relative',
                  hasEnded || isCheckingCall
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : isMe
                      ? 'bg-linear-to-br from-primary/95 to-primary text-white border-primary/20 hover:shadow-xl hover:scale-[1.02]'
                      : 'bg-linear-to-br from-surface-container-high to-surface-container border-outline-variant/30 text-on-surface hover:shadow-xl hover:scale-[1.02]',
                )}
              >
                <div className='flex items-center gap-3.5'>
                  <div
                    className={cn(
                      'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden',
                      hasEnded || isCheckingCall ? 'bg-slate-200' : isMe ? 'bg-white/20' : 'bg-primary/10',
                    )}
                  >
                    {canJoinCall && (
                      <span className='absolute inset-0 bg-primary/5 animate-ping opacity-70 rounded-full' />
                    )}
                    <Video
                      size={20}
                      className={hasEnded || isCheckingCall ? 'text-slate-500' : isMe ? 'text-white' : 'text-primary'}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4
                      className={cn(
                        'text-sm font-bold truncate',
                        hasEnded || isCheckingCall ? 'text-slate-700' : isMe ? 'text-white' : 'text-on-surface',
                      )}
                    >
                      {callTitle}
                    </h4>
                    <p
                      className={cn(
                        'text-[10px] mt-0.5 font-medium flex items-center gap-1.5',
                        hasEnded || isCheckingCall ? 'text-slate-500' : isMe ? 'text-white/80' : 'text-primary',
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          canJoinCall ? 'bg-green-500 animate-pulse' : 'bg-slate-400',
                        )}
                      />
                      <span>{statusLabel}</span>
                    </p>
                  </div>
                </div>

                {canJoinCall && (
                  <Button
                    onClick={() => window.open(`/call/${callId}`, '_blank')}
                    className={cn(
                      'w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md border',
                      isMe
                        ? 'bg-white text-primary hover:bg-white/95 hover:shadow-lg border-white/10'
                        : 'bg-primary text-white hover:bg-primary-dim hover:shadow-lg border-primary/15',
                    )}
                  >
                    <Video size={14} />
                    Tham gia cuộc họp
                  </Button>
                )}

                {/* Time on hover */}
                <div
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] text-on-surface-variant/60 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 pointer-events-none',
                    isMe ? 'right-full mr-3' : 'left-full ml-3',
                  )}
                >
                  {formatTime(createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
                  ? 'bg-primary text-on-primary rounded-2xl rounded-tr-none shadow-md'
                  : 'bg-surface-container-highest text-on-surface rounded-2xl rounded-tl-none shadow-sm',
                status === 'error' &&
                  'bg-error text-white border-2 border-error-container',
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

MessageItem.displayName = "MessageItem";
