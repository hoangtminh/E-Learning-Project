import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// ── Types ───────────────────────────────────────────────────────────────────

export type ClassroomMemberUser = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
};

export type ClassroomMember = {
  id: string;
  classroomId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user: ClassroomMemberUser;
};

export type TaskSubmission = {
  id: string;
  taskId: string;
  userId: string;
  content: string | null;
  fileUrl: string | null;
  submittedAt: string;
  grade: number | null;
};

export type ClassroomTask = {
  id: string;
  classroomId: string;
  creatorId: string;
  title: string;
  description: string | null;
  deadline: string | null;
  createdAt: string;
  creator: { id: string; fullName: string | null; avatarUrl: string | null };
  submissions: TaskSubmission[]; // only current user's submission
  _count: { submissions: number };
};

export type CourseRef = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
};

export type ClassroomLinkedCourse = {
  course: CourseRef;
};

// ── Members ──────────────────────────────────────────────────────────────────

export const getMembers = (classroomId: string) =>
  apiGet<ClassroomMember[]>(`/classrooms/${classroomId}/members`);

export const removeMember = (classroomId: string, userId: string) =>
  apiDelete(`/classrooms/${classroomId}/members/${userId}`);

export const joinByCode = (code: string) =>
  apiPost('/classrooms/join-by-code', { code });

export const getPendingMembers = (classroomId: string) =>
  apiGet<{ id: string; user: ClassroomMemberUser }[]>(
    `/classrooms/${classroomId}/members/pending`,
  );

export const approveMember = (classroomId: string, userId: string) =>
  apiPatch(`/classrooms/${classroomId}/members/${userId}/approve`, {});

export const rejectMember = (classroomId: string, userId: string) =>
  apiDelete(`/classrooms/${classroomId}/members/pending/${userId}`);

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const getTasks = (classroomId: string) =>
  apiGet<ClassroomTask[]>(`/classrooms/${classroomId}/tasks`);

export const createTask = (
  classroomId: string,
  payload: { title: string; description?: string; deadline?: string },
) => apiPost<ClassroomTask>(`/classrooms/${classroomId}/tasks`, payload);

export const deleteTask = (classroomId: string, taskId: string) =>
  apiDelete(`/classrooms/${classroomId}/tasks/${taskId}`);

export const submitTask = (
  classroomId: string,
  taskId: string,
  payload: { content?: string; fileUrl?: string },
) =>
  apiPost<TaskSubmission>(
    `/classrooms/${classroomId}/tasks/${taskId}/submit`,
    payload,
  );

export const getSubmissions = (classroomId: string, taskId: string) =>
  apiGet(`/classrooms/${classroomId}/tasks/${taskId}/submissions`);

export const gradeSubmission = (
  classroomId: string,
  taskId: string,
  submissionId: string,
  grade: number,
) =>
  apiPatch(
    `/classrooms/${classroomId}/tasks/${taskId}/submissions/${submissionId}/grade`,
    { grade },
  );

// ── Courses ───────────────────────────────────────────────────────────────────

export const linkCourse = (classroomId: string, courseId: string) =>
  apiPost(`/classrooms/${classroomId}/courses/${courseId}`, {});

export const unlinkCourse = (classroomId: string, courseId: string) =>
  apiDelete(`/classrooms/${classroomId}/courses/${courseId}`);

