import { apiGet, apiPatch, apiDelete, ApiResponse } from './client';

export interface NotificationCreator {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface NotificationDto {
  id: string;
  userId: string;
  creatorId: string | null;
  type: string; // 'call' | 'task' | 'file' | 'post' | 'chat'
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  creator?: NotificationCreator;
}

export const getNotifications = (): Promise<ApiResponse<NotificationDto[]>> =>
  apiGet<NotificationDto[]>('/notifications');

export const markNotificationAsRead = (
  id: string,
): Promise<ApiResponse<{ success: boolean }>> =>
  apiPatch<{ success: boolean }>(`/notifications/${id}/read`);

export const deleteNotification = (
  id: string,
): Promise<ApiResponse<{ success: boolean }>> =>
  apiDelete<{ success: boolean }>(`/notifications/${id}`);
