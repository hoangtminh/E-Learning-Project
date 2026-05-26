'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
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

        // Play sound or pop elegant Sonner alert
        toast.info(notification.content, {
          description: 'Thông báo mới từ lớp học',
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

    notificationSocket.on('notification:new', handleNewNotification);

    return () => {
      notificationSocket.off('notification:new', handleNewNotification);
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
