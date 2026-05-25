import { apiGet, apiPatch, apiDelete, apiPost } from './client';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  userId: string | null;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminGetUsers = (page = 1, limit = 10, search = '') =>
  apiGet<PaginatedResponse<AdminUser>>(`/admin/users?page=${page}&limit=${limit}&search=${search}`);

export const adminUpdateUserRole = (userId: string, role: string) =>
  apiPatch(`/admin/users/${userId}/role`, { role });

export const adminDeleteUser = (userId: string) =>
  apiDelete(`/admin/users/${userId}`);

export const adminGetLogs = (page = 1, limit = 20) =>
  apiGet<PaginatedResponse<AdminLog>>(`/admin/logs?page=${page}&limit=${limit}`);

export const adminCreateLog = (action: string, details: string) =>
  apiPost('/admin/logs', { action, details });
