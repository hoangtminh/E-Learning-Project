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
  onClick?: () => void;
}

export const ConversationItem = ({
  id,
  title,
  lastMessage,
  avatarUrl,
  isActive,
  onClick,
}: ConversationItemProps) => {
  return (
    <Link
      href={`/chat/${id}`}
      onClick={onClick}
      className={cn(
        'flex items-center border gap-3 px-3.5 py-2 shadow-sm rounded-xl cursor-pointer transition-all duration-200 group',
        isActive
          ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
          : 'hover:bg-surface-container-high/80 text-on-surface',
      )}
    >
      <Avatar
        className={cn(
          'h-11 w-11 border transition-colors',
          isActive ? 'border-white/20' : 'border-outline-variant/20',
        )}
      >
        <AvatarImage src={avatarUrl} alt={title} />
        <AvatarFallback
          className={cn(
            isActive ? 'bg-white/20 text-white' : 'bg-primary/5 text-primary',
          )}
        >
          {title[0]}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <div className='flex justify-between items-baseline mb-0.5'>
          <div
            className={cn(
              'font-bold truncate text-sm transition-colors',
              isActive ? 'text-white' : 'text-on-surface',
            )}
          >
            {title}
          </div>
          <div
            className={cn(
              'text-[10px] whitespace-nowrap ml-2 transition-colors',
              isActive ? 'text-white/60' : 'text-on-surface-variant/50',
            )}
          >
            {}
          </div>
        </div>
        <div
          className={cn(
            'text-xs truncate transition-colors',
            isActive ? 'text-white/80' : 'text-on-surface-variant',
          )}
        >
          {lastMessage}
        </div>
      </div>
    </Link>
  );
};
