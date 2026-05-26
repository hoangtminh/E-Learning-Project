import { apiGet, apiPatch, apiDelete, apiPost } from './client';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  isSuspended: boolean;
  createdAt: string;
  _count?: {
    classroomMembers: number;
    courseMemberships: number;
    logs: number;
  };
}

export interface AdminUserDetail {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  isSuspended: boolean;
  createdAt: string;
  _count: {
    ownedClassrooms: number;
    classroomMembers: number;
    courseMemberships: number;
    coursesInstructing: number;
    taskSubmissions: number;
    transactions: number;
  };
  logs: {
    id: string;
    action: string;
    details: string | null;
    createdAt: string;
    level: string;
  }[];
}


export interface AdminLog {
  id: string;
  userId: string | null;
  action: string;
  details: string | null;
  level: string;
  ipAddress: string | null;
  userAgent: string | null;
  targetId: string | null;
  targetType: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
    role: string;
  } | null;
}

export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  instructorCount: number;
  userCount: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  totalLogs: number;
  totalTransactions: number;
  successTransactions: number;
}

export interface LogStats {
  timeline: { date: string; count: number }[];
  topActions: { action: string; count: number }[];
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

// ── Stats ──
export const adminGetStats = () => apiGet<AdminStats>('/admin/stats');
export const adminGetLogStats = (days = 14) =>
  apiGet<LogStats>(`/admin/stats/logs?days=${days}`);

// ── Users ──
export const adminGetUsers = (
  page = 1,
  limit = 10,
  search = '',
  role = '',
  status = '',
  sortBy = 'createdAt',
  sortDir = 'desc',
) =>
  apiGet<PaginatedResponse<AdminUser>>(
    `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}&status=${status}&sortBy=${sortBy}&sortDir=${sortDir}`,
  );

export const adminGetUserDetail = (userId: string) =>
  apiGet<AdminUserDetail>(`/admin/users/${userId}`);

export const adminCreateUser = (data: {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}) => apiPost('/admin/users', data);

export const adminUpdateUserRole = (userId: string, role: string) =>
  apiPatch(`/admin/users/${userId}/role`, { role });

export const adminSuspendUser = (userId: string, suspend: boolean) =>
  apiPatch(`/admin/users/${userId}/suspend`, { suspend });

export const adminResetPassword = (userId: string, newPassword: string) =>
  apiPatch(`/admin/users/${userId}/reset-password`, { newPassword });

export const adminDeleteUser = (userId: string) =>
  apiDelete(`/admin/users/${userId}`);

// ── Logs ──
export const adminGetLogs = (
  page = 1,
  limit = 20,
  filters: {
    action?: string;
    userId?: string;
    level?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.level ? { level: filters.level } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  });
  return apiGet<PaginatedResponse<AdminLog>>(`/admin/logs?${params}`);
};

export const adminGetDistinctActions = () =>
  apiGet<string[]>('/admin/logs/actions');

export const adminCreateLog = (action: string, details: string) =>
  apiPost('/admin/logs', { action, details });

export const adminBulkDeleteLogs = (olderThanDays: number) =>
  apiDelete('/admin/logs/bulk', { olderThanDays });
