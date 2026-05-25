import { apiGet, apiPatch } from './client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

export function getMyProfile() {
  return apiGet<UserProfile>('/auth/me');
}

export function updateMyProfile(data: { fullName?: string; avatarUrl?: string }) {
  return apiPatch<UserProfile>('/users/profile', data);
}

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiPatch('/users/change-password', data);
}
