'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationDto } from '@/api/notification';
import {
  Bell,
  Video,
  FileText,
  FolderOpen,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) {
      return 'Vừa xong';
    } else if (diffMin < 60) {
      return `${diffMin} phút trước`;
    } else if (diffHr < 24) {
      return `${diffHr} giờ trước`;
    } else if (diffDays < 30) {
      return `${diffDays} ngày trước`;
    } else {
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    }
  } catch (err) {
    return 'Gần đây';
  }
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Video className="size-4 text-rose-500" />;
      case 'task':
        return <FileText className="size-4 text-emerald-500" />;
      case 'file':
        return <FolderOpen className="size-4 text-amber-500" />;
      default:
        return <MessageSquare className="size-4 text-sky-500" />;
    }
  };

  const handleNotificationClick = async (n: NotificationDto) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-full relative transition-all"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white font-bold text-[9px] size-4 rounded-full flex items-center justify-center border border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] max-w-[calc(100vw-32px)] p-0 border border-slate-200 shadow-xl rounded-xl overflow-hidden bg-white/95 backdrop-blur-md z-[9999]"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <DropdownMenuLabel className="p-0 text-sm font-bold text-slate-800 flex items-center gap-1.5">
            Thông báo
            {unreadCount > 0 && (
              <span className="bg-sky-100 text-sky-700 font-semibold text-[11px] px-2 py-0.5 rounded-full">
                {unreadCount} mới
              </span>
            )}
          </DropdownMenuLabel>
        </div>

        <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Bell className="size-8 stroke-[1.25] mb-2 text-slate-300" />
              <p className="text-xs">Chưa có thông báo nào</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex gap-3 p-3.5 border-b border-slate-100 hover:bg-slate-50/80 transition-all cursor-pointer relative group ${
                  !n.isRead ? 'bg-sky-50/30' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-0.5 size-7 rounded-full bg-slate-100 flex items-center justify-center">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  {n.link ? (
                    <Link href={n.link} className="block">
                      <p className={`text-xs text-slate-700 break-words leading-relaxed ${!n.isRead ? 'font-semibold text-slate-900' : ''}`}>
                        {n.content}
                      </p>
                    </Link>
                  ) : (
                    <p className={`text-xs text-slate-700 break-words leading-relaxed ${!n.isRead ? 'font-semibold text-slate-900' : ''}`}>
                      {n.content}
                    </p>
                  )}
                  
                  <span className="text-[10px] text-slate-400 block mt-1.5">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>

                {/* Read indicator or actions */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {!n.isRead && (
                    <span className="size-2 rounded-full bg-sky-500 block group-hover:hidden" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
