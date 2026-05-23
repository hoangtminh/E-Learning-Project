import { apiGet } from './client';

export interface TaskCreator {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  content: string | null;
  fileUrl: string | null;
  submittedAt: string;
  grade: number | null;
}

export interface TaskClassroom {
  id: string;
  title: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  creatorId: string;
  title: string | null;
  description: string | null;
  deadline: string | null;
  attachmentKey: string | null;
  attachmentName: string | null;
  createdAt: string;
  creator: TaskCreator;
  classroom: TaskClassroom;
  submissions: TaskSubmission[];
  _count: {
    submissions: number;
  };
}

export const getMyAssignments = async (): Promise<Assignment[]> => {
  const res = await apiGet<Assignment[]>('/assignments');
  if (!res.success || !res.data) {
    throw new Error(res.error || 'Failed to fetch assignments');
  }
  return res.data;
};

export const getAssignmentDetail = async (id: string): Promise<Assignment> => {
  const res = await apiGet<Assignment>(`/assignments/${id}`);
  if (!res.success || !res.data) {
    throw new Error(res.error || 'Failed to fetch assignment details');
  }
  return res.data;
};
