'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { notificationSocket } from '@/lib/socket';
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification as apiDeleteNotification,
  NotificationDto,
} from '@/api/notification';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    const types = ['chat', 'post', 'call', 'task', 'file'];
    const mapping: Record<string, string> = {
      chat: '/noti_sound/sound-1.mp3',
      post: '/noti_sound/sound-2.mp3',
      call: '/noti_sound/sound-3.mp3',
      task: '/noti_sound/sound-4.mp3',
      file: '/noti_sound/sound-5.mp3',
    };
    types.forEach((type) => {
      try {
        const audio = new Audio(mapping[type]);
        audio.load();
        audioCache.current[type] = audio;
      } catch (e) {
        console.error(`Failed to preload audio for ${type}:`, e);
      }
    });

    // Unlock audio on first user interaction to bypass autoplay policy
    const unlock = () => {
      types.forEach((type) => {
        const audio = audioCache.current[type];
        if (audio) {
          audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
          }).catch(() => {});
        }
      });
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const playNotificationSound = useCallback((type: string) => {
    try {
      const audio = audioCache.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((e) => console.log('Audio play failed:', e));
      } else {
        let soundFile = '/noti_sound/sound-2.mp3'; // Default post
        if (type === 'chat') {
          soundFile = '/noti_sound/sound-1.mp3';
        } else if (type === 'call') {
          soundFile = '/noti_sound/sound-3.mp3';
        } else if (type === 'task') {
          soundFile = '/noti_sound/sound-4.mp3';
        } else if (type === 'file') {
          soundFile = '/noti_sound/sound-5.mp3';
        }
        const fallbackAudio = new Audio(soundFile);
        fallbackAudio.play().catch((e) => console.log('Fallback Audio play failed:', e));
      }
    } catch (err) {
      console.error('Failed to play sound:', err);
    }
  }, []);

  const isCurrentRoom = useCallback((link: string | null, type: string) => {
    if (!link) return false;
    const currentPath = pathnameRef.current;
    if (!currentPath) return false;

    // For chat: check if current URL starts with or matches /chat/conversationId
    if (type === 'chat') {
      const match = link.match(/\/chat\/([a-zA-Z0-9-]+)/);
      if (match) {
        const conversationId = match[1];
        return currentPath === `/chat/${conversationId}` || currentPath.startsWith(`/chat/${conversationId}/`);
      }
    }
    
    // For classroom: check if current URL starts with or matches /classrooms/classroomId
    if (['post', 'call', 'task', 'file'].includes(type)) {
      const match = link.match(/\/classrooms\/([a-zA-Z0-9-]+)/);
      if (match) {
        const classroomId = match[1];
        return currentPath === `/classrooms/${classroomId}` || currentPath.startsWith(`/classrooms/${classroomId}/`);
      }
    }

    return false;
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await markNotificationAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const res = await apiDeleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success('Đã xóa thông báo thành công!');
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Không thể xóa thông báo');
    }
  }, []);

  // Sync / Connect to Socket when user is logged in
  useEffect(() => {
    if (!user) {
      if (notificationSocket.connected) {
        notificationSocket.disconnect();
      }
      setNotifications([]);
      return;
    }

    // Set auth payload using userId or id
    const userId = user.userId || user.id;
    notificationSocket.auth = { userId };

    if (!notificationSocket.connected) {
      notificationSocket.connect();
    }

    const handleNewNotification = (notification: NotificationDto) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) {
          return prev;
        }

        const isCurrent = isCurrentRoom(notification.link, notification.type);

        if (isCurrent) {
          // Add it to the notifications list immediately as read
          // and mark it read on the backend
          setTimeout(() => {
            markAsRead(notification.id);
          }, 0);

          // Dispatch classroom post refresh event
          if (['post', 'call', 'task', 'file'].includes(notification.type)) {
            const match = notification.link?.match(/\/classrooms\/([a-zA-Z0-9-]+)/);
            if (match) {
              const classroomId = match[1];
              window.dispatchEvent(
                new CustomEvent('classroom:refresh-posts', {
                  detail: { classroomId },
                })
              );
            }
          }

          return [{ ...notification, isRead: true }, ...prev];
        }

        // If not in current room, play sound and pop alert
        playNotificationSound(notification.type);

        toast.info(notification.content, {
          description:
            notification.type === 'chat'
              ? 'Tin nhắn mới'
              : notification.type === 'call'
              ? 'Cuộc gọi mới từ lớp học'
              : notification.type === 'task'
              ? 'Bài tập mới'
              : notification.type === 'file'
              ? 'Tài liệu mới'
              : 'Thông báo mới từ lớp học',
          action: notification.link
            ? {
                label: 'Xem',
                onClick: () => {
                  window.location.href = notification.link!;
                },
              }
            : undefined,
        });

        return [notification, ...prev];
      });
    };

    const handleClassroomRefresh = (data: { classroomId: string }) => {
      window.dispatchEvent(
        new CustomEvent('classroom:refresh-posts', {
          detail: { classroomId: data.classroomId },
        })
      );
    };

    notificationSocket.on('notification:new', handleNewNotification);
    notificationSocket.on('classroom:refresh-posts', handleClassroomRefresh);

    return () => {
      notificationSocket.off('notification:new', handleNewNotification);
      notificationSocket.off('classroom:refresh-posts', handleClassroomRefresh);
    };
  }, [user]);

  // Load initial notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
}
