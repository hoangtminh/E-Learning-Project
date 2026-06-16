import { apiGet, apiPost } from './client';

export enum CallType {
  CHANNEL = 'channel',
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export enum CallStatus {
  ONGOING = 'ongoing',
  ENDED = 'ended',
  SCHEDULED = 'scheduled',
  CANCELED = 'canceled',
}

export interface Call {
  id: string;
  creatorId: string;
  title?: string;
  classroomId?: string;
  conversationId?: string;
  status: CallStatus;
  type: CallType;
  participantCount: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  creator?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

export const callsApi = {
  createCall: (data: {
    title?: string;
    type?: CallType;
    classroomId?: string;
    conversationId?: string;
  }) => apiPost<Call>('/calls', data),

  getCall: (id: string) => apiGet<Call>(`/calls/${id}`),

  getOngoingCalls: () => apiGet<Call[]>('/calls'),

  canJoinCall: (id: string) =>
    apiGet<{ allowed: boolean; requiresApproval?: boolean; reason?: string }>(
      `/calls/${id}/can-join`,
    ),

  approveParticipant: (id: string, userId: string) =>
    apiPost<{ success: boolean }>(`/calls/${id}/approve`, { userId }),

  transferHost: (id: string, newHostId: string) =>
    apiPost<{ success: boolean }>(`/calls/${id}/transfer-host`, { newHostId }),

  endCall: (id: string) => apiPost<Call>(`/calls/${id}/end`),

  getCallHistory: () => apiGet<Call[]>('/calls/history'),

  getIceServers: () => apiGet<any[]>('/calls/ice-servers'),

  searchUsers: (search: string) =>
    apiGet<
      {
        id: string;
        email: string;
        fullName: string | null;
        avatarUrl: string | null;
        role: string;
      }[]
    >(`/auth/users?search=${encodeURIComponent(search)}`),
};
