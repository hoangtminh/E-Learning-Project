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

const renderChatMessage = (text: string, isMeMessage: boolean) => {
  if (!text) return '';
  
  // Split by mentions (e.g. @all or @[name](id))
  const regex = /(@all|@\[.*?\]\(.*?\))/gi;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === '@all') {
      return (
        <span
          key={index}
          className={
            isMeMessage 
              ? 'px-1.5 py-0.5 rounded font-extrabold text-[11px] inline-flex items-center gap-0.5 mx-0.5 bg-white/20 text-white border border-white/10' 
              : 'px-1.5 py-0.5 rounded font-semibold text-[11px] inline-flex items-center gap-0.5 mx-0.5 bg-primary/10 text-primary border border-primary/20'
          }
        >
          @all
        </span>
      );
    }
    
    if (part.startsWith('@[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/@\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, label] = match;
        return (
          <span
            key={index}
            className={
              isMeMessage 
                ? 'px-1.5 py-0.5 rounded font-extrabold text-[11px] inline-flex items-center gap-0.5 mx-0.5 bg-white/20 text-white border border-white/10' 
                : 'px-1.5 py-0.5 rounded font-semibold text-[11px] inline-flex items-center gap-0.5 mx-0.5 bg-primary/10 text-primary border border-primary/20'
            }
          >
            @{label}
          </span>
        );
      }
    }
    
    return part;
  });
};

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
              <Avatar className='h-9 w-9 border border-outline-variant/30 shadow-xs'>
                <AvatarImage src={avatarUrl} alt={senderName} />
                <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs uppercase'>
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
              <span className='text-[10px] font-bold text-on-surface-variant/70 ml-1 mb-1 uppercase tracking-wider'>
                {senderName}
              </span>
            )}
            <div className='flex items-center gap-2'>
              <div
                className={cn(
                  'p-4.5 rounded-2xl border shadow-sm flex flex-col gap-4 min-w-[260px] max-w-[320px] transition-all duration-200 relative',
                  hasEnded || isCheckingCall
                    ? 'bg-slate-50 text-slate-400 border-slate-200/40'
                    : isMe
                      ? 'bg-primary text-white border-primary-dim/15 shadow-sm shadow-primary/5'
                      : 'bg-white border-slate-200/50 text-on-surface',
                )}
              >
                <div className='flex items-center gap-3.5'>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border relative overflow-hidden',
                      hasEnded || isCheckingCall 
                        ? 'bg-slate-200/50 border-slate-300/30' 
                        : isMe 
                          ? 'bg-white/10 border-white/10' 
                          : 'bg-primary/10 border-primary/15',
                    )}
                  >
                    {canJoinCall && (
                      <span className='absolute inset-0 bg-primary/10 animate-ping opacity-70 rounded-full' />
                    )}
                    <Video
                      size={18}
                      className={hasEnded || isCheckingCall ? 'text-on-surface-variant/60' : isMe ? 'text-white' : 'text-primary'}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4
                      className={cn(
                        'text-xs sm:text-sm font-bold truncate leading-snug',
                        hasEnded || isCheckingCall ? 'text-on-surface-variant/90' : isMe ? 'text-white' : 'text-on-surface',
                      )}
                    >
                      {callTitle}
                    </h4>
                    <p
                      className={cn(
                        'text-[9px] mt-0.5 font-bold uppercase tracking-wider flex items-center gap-1.5',
                        hasEnded || isCheckingCall ? 'text-on-surface-variant/60' : isMe ? 'text-white/80' : 'text-primary',
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
                      'w-full py-2 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] border shadow-xs h-9 cursor-pointer',
                      isMe
                        ? 'bg-white text-primary hover:bg-white/95 border-white/10'
                        : 'bg-primary text-white hover:bg-primary-dim border-primary/15',
                    )}
                  >
                    <Video size={12} />
                    Tham gia cuộc họp
                  </Button>
                )}

                {/* Time on hover */}
                <div
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-medium text-on-surface-variant/60 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 pointer-events-none',
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
            <Avatar className='h-9 w-9 border border-outline-variant/30 shadow-xs'>
              <AvatarImage src={avatarUrl} alt={senderName} />
              <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs uppercase'>
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
            <span className='text-[10px] font-bold text-on-surface-variant/70 ml-1 mb-1 uppercase tracking-wider'>
              {senderName}
            </span>
          )}
          <div className='flex items-center gap-2'>
            <div
              className={cn(
                'px-4 py-2.5 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap [word-break:break-word] relative shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200',
                isMe
                  ? 'bg-primary text-white rounded-2xl rounded-tr-none border border-primary-dim/15 shadow-sm shadow-primary/5'
                  : 'bg-white border border-slate-200/50 text-on-surface rounded-2xl rounded-tl-none',
                status === 'error' &&
                  'bg-error text-white border-2 border-error-container',
              )}
            >
              {renderChatMessage(content, isMe)}

              {/* Time on hover */}
              <div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-medium text-on-surface-variant/60 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 pointer-events-none',
                  isMe ? 'right-full mr-3' : 'left-full ml-3',
                )}
              >
                {formatTime(createdAt)}
              </div>
            </div>
          </div>
          {status === 'error' && (
            <span className='text-[10px] text-error font-semibold mt-1 mr-1'>
              Gửi lỗi. Vui lòng thử lại.
            </span>
          )}
        </div>
      </div>
    );
  },
);

MessageItem.displayName = "MessageItem";
