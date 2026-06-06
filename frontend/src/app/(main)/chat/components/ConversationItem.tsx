'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface ConversationItemProps {
  id: string;
  title: string;
  lastMessage: string;
  avatarUrl?: string;
  isActive?: boolean;
  isUnread?: boolean;
  onClick?: () => void;
}

export const ConversationItem = ({
  id,
  title,
  lastMessage,
  avatarUrl,
  isActive,
  isUnread = false,
  onClick,
}: ConversationItemProps) => {
  return (
    <Link
      href={`/chat/${id}`}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer border transition-all duration-250 relative group active:scale-[0.99]',
        isActive
          ? 'bg-primary/10 border-primary/20 text-on-surface shadow-xs'
          : isUnread
            ? 'bg-primary/5 border-primary/10 hover:bg-primary/10 text-on-surface font-bold'
            : 'bg-transparent border-transparent hover:bg-surface-container-low text-on-surface-variant',
      )}
    >
      {/* Active Left Indicator Bar */}
      {isActive && (
        <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md' />
      )}

      <Avatar
        className={cn(
          'h-10 w-10 border transition-colors border-outline-variant/20 shrink-0'
        )}
      >
        <AvatarImage src={avatarUrl} alt={title} />
        <AvatarFallback
          className={cn(
            isActive ? 'bg-primary/20 text-primary font-bold text-xs uppercase' : 'bg-primary/10 text-primary font-bold text-xs uppercase',
          )}
        >
          {title[0]}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <div className='flex justify-between items-baseline mb-0.5'>
          <div
            className={cn(
              'truncate text-xs sm:text-sm transition-colors flex items-center gap-1.5',
              isActive ? 'text-primary font-bold' : isUnread ? 'text-primary font-black' : 'text-on-surface font-semibold',
            )}
          >
            {title}
            {isUnread && (
              <span className='size-1.5 rounded-full bg-primary shrink-0 animate-pulse' />
            )}
          </div>
        </div>
        <div
          className={cn(
            'text-[11px] sm:text-xs text-nowrap transition-colors max-w-[190px] overflow-hidden text-ellipsis truncate leading-snug',
            isActive 
              ? 'text-on-surface-variant/80 font-medium' 
              : isUnread 
                ? 'text-on-surface font-semibold' 
                : 'text-on-surface-variant/70',
          )}
        >
          {lastMessage}
        </div>
      </div>
    </Link>
  );
};
