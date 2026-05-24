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
        'flex items-center border gap-3 px-3.5 py-2 shadow-xs rounded-xl cursor-pointer transition-all duration-200 group',
        isActive
          ? 'bg-primary-container/20 border-primary/20 scale-[1.01] shadow-xs text-on-surface'
          : isUnread
          ? 'bg-primary-container/10 border-primary-container/30 hover:bg-primary-container/20 text-on-surface'
          : 'hover:bg-primary-container/15 text-on-surface border-transparent',
      )}
    >
      <Avatar
        className={cn(
          'h-11 w-11 border transition-colors border-outline-variant/20'
        )}
      >
        <AvatarImage src={avatarUrl} alt={title} />
        <AvatarFallback
          className={cn(
            isActive ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary',
          )}
        >
          {title[0]}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <div className='flex justify-between items-baseline mb-0.5'>
          <div
            className={cn(
              'truncate text-sm transition-colors flex items-center gap-1.5',
              isActive ? 'text-primary font-bold' : isUnread ? 'text-primary font-black' : 'text-on-surface font-semibold',
            )}
          >
            {title}
            {isUnread && (
              <span className='size-2 rounded-full bg-primary animate-pulse shrink-0' />
            )}
          </div>
          <div
            className={cn(
              'text-[10px] whitespace-nowrap ml-2 transition-colors text-on-surface-variant/50'
            )}
          >
            {}
          </div>
        </div>
        <div
          className={cn(
            'text-xs text-nowrap transition-colors max-w-[200px] overflow-hidden text-ellipsis',
            isActive ? 'text-on-surface-variant font-medium' : isUnread ? 'text-on-surface font-semibold' : 'text-on-surface-variant',
          )}
        >
          {lastMessage}
        </div>
      </div>
    </Link>
  );
};
