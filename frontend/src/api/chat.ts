import { apiGet, apiPost, apiDelete, ApiResponse } from './client';

export enum ConversationType {
  CLASSROOM_COMMON = 'classroom_common',
  PRIVATE_DIRECT = 'private_direct',
  CUSTOM_GROUP = 'custom_group',
}

export interface UserSummary {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  content: string | null;
  createdAt: string;
  senderId: string;
  conversationId: string;
  fileUrl: string | null;
  sender: UserSummary;
  status?: 'pending' | 'sent' | 'error';
}

export interface ConversationMember {
  userId: string;
  conversationId: string;
  joinedAt: string;
  user: UserSummary;
}

export interface Conversation {
  id: string;
  title: string | null;
  type: ConversationType;
  classroomId: string | null;
  createdAt: string;
  updatedAt: string;
  members: ConversationMember[];
  messages: Message[]; // Usually contains the last message(s)
  lastMessage?: string; // Optional helper for UI
}

export const chatApi = {
  getConversations: () => 
    apiGet<Conversation[]>('/chat/conversations'),
  
  getConversation: (id: string) => 
    apiGet<Conversation>(`/chat/conversations/${id}`),
  
  getMessages: (conversationId: string, page: number, limit: number = 20) => 
    apiGet<Message[]>(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),
  
  sendMessage: (conversationId: string, content: string) => 
    apiPost<Message>(`/chat/messages`, { conversationId, content }),
  
  deleteMessage: (messageId: string) => 
    apiDelete<void>(`/chat/messages/${messageId}`),
  
  createConversation: (data: { title: string; participantEmails: string[]; type: ConversationType }) => 
    apiPost<Conversation>('/chat/conversations', data),
  
  addMember: (conversationId: string, userId: string) => 
    apiPost<void>(`/chat/conversations/${conversationId}/members`, { userId }),
  
  removeMember: (conversationId: string, userId: string) => 
    apiDelete<void>(`/chat/conversations/${conversationId}/members/${userId}`),
};
