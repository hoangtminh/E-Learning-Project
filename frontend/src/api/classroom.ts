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
  attachmentKey: string | null;
  attachmentName: string | null;
  createdAt: string;
  creator: { id: string; fullName: string | null; avatarUrl: string | null };
  submissions: TaskSubmission[];
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

export type PendingClassroomRequest = {
  requestId: string;
  createdAt: string;
  classroom: {
    id: string;
    title: string;
    description: string | null;
    isPublic: boolean;
    inviteCode: string | null;
    createdAt: string;
    ownerId: string;
    _count: { members: number };
    owner: ClassroomMemberUser;
  };
};

export const getMyPendingClassrooms = () =>
  apiGet<PendingClassroomRequest[]>('/classrooms/my-pending');

export const cancelJoinRequest = (classroomId: string, userId: string) =>
  apiDelete(`/classrooms/${classroomId}/members/pending/${userId}`);

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const getTasks = (classroomId: string) =>
  apiGet<ClassroomTask[]>(`/classrooms/${classroomId}/tasks`);

export const createTask = (
  classroomId: string,
  payload: { title: string; description?: string; deadline?: string },
) => apiPost<ClassroomTask>(`/classrooms/${classroomId}/tasks`, payload);

export const updateTask = (
  classroomId: string,
  taskId: string,
  payload: { title?: string; description?: string; deadline?: string | null; attachmentKey?: string; attachmentName?: string },
) => apiPatch<ClassroomTask>(`/classrooms/${classroomId}/tasks/${taskId}`, payload);

export const deleteTask = (classroomId: string, taskId: string) =>
  apiDelete(`/classrooms/${classroomId}/tasks/${taskId}`);

export const submitTask = (
  classroomId: string,
  taskId: string,
  payload: { content?: string; fileUrl?: string; fileName?: string },
) =>
  apiPost<TaskSubmission>(
    `/classrooms/${classroomId}/tasks/${taskId}/submit`,
    payload,
  );

export const getSubmissions = (classroomId: string, taskId: string) =>
  apiGet<(TaskSubmission & { user: { id: string; fullName: string | null; avatarUrl: string | null; email: string } })[]>(
    `/classrooms/${classroomId}/tasks/${taskId}/submissions`,
  );

/** Admin: presigned upload URL for task attachment file */
export const getTaskAttachmentPresignedUpload = (
  classroomId: string,
  taskId: string,
  filename: string,
  mimeType: string,
) =>
  apiGet<{ url: string; s3Key: string; filename: string }>(
    `/classrooms/${classroomId}/tasks/${taskId}/attachment/presigned-upload?filename=${encodeURIComponent(filename)}&mimeType=${encodeURIComponent(mimeType)}`,
  );

/** Any member: presigned download URL for task attachment */
export const getTaskAttachmentDownloadUrl = (classroomId: string, taskId: string) =>
  apiGet<{ url: string; filename: string | null }>(
    `/classrooms/${classroomId}/tasks/${taskId}/attachment/download`,
  );

/** Get a presigned S3 upload URL for a student's submission file */
export const getSubmissionPresignedUpload = (
  classroomId: string,
  taskId: string,
  filename: string,
  mimeType: string,
) =>
  apiGet<{ url: string; s3Key: string; filename: string }>(
    `/classrooms/${classroomId}/tasks/${taskId}/submissions/presigned-upload?filename=${encodeURIComponent(filename)}&mimeType=${encodeURIComponent(mimeType)}`,
  );

/** Admin gets a presigned download URL for a student's submission file */
export const getSubmissionDownloadUrl = (
  classroomId: string,
  taskId: string,
  submissionId: string,
) =>
  apiGet<{ url: string }>(
    `/classrooms/${classroomId}/tasks/${taskId}/submissions/${submissionId}/download`,
  );

/** Student downloads their own submission file */
export const getMySubmissionDownloadUrl = (classroomId: string, taskId: string) =>
  apiGet<{ url: string }>(
    `/classrooms/${classroomId}/tasks/${taskId}/my-submission/download`,
  );

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

// ── Files ─────────────────────────────────────────────────────────────────────

export type ClassroomFile = {
  id: string;
  name: string;
  s3Key: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  uploader: { fullName: string | null; avatarUrl: string | null };
};

export const getFiles = (classroomId: string) =>
  apiGet<ClassroomFile[]>(`/classrooms/${classroomId}/files`);

export const getPresignedUploadUrl = (classroomId: string, filename: string, mimeType: string) =>
  apiPost<{ url: string; s3Key: string }>(`/classrooms/${classroomId}/files/presigned-upload`, { filename, mimeType });

export const confirmFileUpload = (classroomId: string, s3Key: string, name: string, sizeBytes: number, mimeType: string) =>
  apiPost<ClassroomFile>(`/classrooms/${classroomId}/files/confirm`, { s3Key, name, sizeBytes, mimeType });

export const getPresignedDownloadUrl = (classroomId: string, fileId: string) =>
  apiGet<{ url: string }>(`/classrooms/${classroomId}/files/${fileId}/download`);

export const renameFile = (classroomId: string, fileId: string, name: string) =>
  apiPatch(`/classrooms/${classroomId}/files/${fileId}`, { name });

export const deleteFile = (classroomId: string, fileId: string) =>
  apiDelete(`/classrooms/${classroomId}/files/${fileId}`);
