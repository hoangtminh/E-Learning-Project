'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  ClassroomTask,
  TaskSubmission,
  getTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  submitTask as apiSubmitTask,
  getSubmissions as apiGetSubmissions,
  getTaskAttachmentPresignedUpload as apiGetTaskAttachmentPresignedUpload,
  getTaskAttachmentDownloadUrl as apiGetTaskAttachmentDownloadUrl,
  getSubmissionPresignedUpload as apiGetSubmissionPresignedUpload,
  getSubmissionDownloadUrl as apiGetSubmissionDownloadUrl,
  getMySubmissionDownloadUrl as apiGetMySubmissionDownloadUrl,
  gradeSubmission as apiGrade,
} from '@/api/classroom';

export type SubmissionWithUser = TaskSubmission & {
  user: { id: string; fullName: string | null; avatarUrl: string | null; email: string };
};

interface TaskContextType {
  tasks: ClassroomTask[];
  loadingTasks: boolean;
  fetchTasks: (classroomId: string) => Promise<void>;

  createTask: (
    classroomId: string,
    payload: { title: string; description?: string; deadline?: string },
  ) => Promise<void>;

  updateTask: (
    classroomId: string,
    taskId: string,
    payload: { title?: string; description?: string; deadline?: string | null; attachmentKey?: string; attachmentName?: string },
  ) => Promise<void>;

  deleteTask: (classroomId: string, taskId: string) => Promise<void>;

  submitTask: (
    classroomId: string,
    taskId: string,
    payload: { content?: string; fileUrl?: string; fileName?: string },
  ) => Promise<void>;

  /** Admin: get presigned upload URL for task attachment */
  getTaskAttachmentPresignedUpload: (
    classroomId: string,
    taskId: string,
    filename: string,
    mimeType: string,
  ) => Promise<{ url: string; s3Key: string; filename: string }>;

  /** Any member: get presigned download URL for task attachment */
  getTaskAttachmentDownloadUrl: (classroomId: string, taskId: string) => Promise<string>;

  /** Returns { url, s3Key } for direct PUT to S3 */
  getSubmissionPresignedUpload: (
    classroomId: string,
    taskId: string,
    filename: string,
    mimeType: string,
  ) => Promise<{ url: string; s3Key: string; filename: string }>;

  /** Admin: get download URL for a student's file */
  getSubmissionDownloadUrl: (
    classroomId: string,
    taskId: string,
    submissionId: string,
  ) => Promise<string>;

  /** Student: get download URL for their own submitted file */
  getMySubmissionDownloadUrl: (
    classroomId: string,
    taskId: string,
  ) => Promise<string>;

  getSubmissions: (
    classroomId: string,
    taskId: string,
  ) => Promise<SubmissionWithUser[]>;

  gradeSubmission: (
    classroomId: string,
    taskId: string,
    submissionId: string,
    grade: number,
  ) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<ClassroomTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const fetchTasks = useCallback(async (classroomId: string) => {
    setLoadingTasks(true);
    try {
      const res = await getTasks(classroomId);
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const createTask = async (
    classroomId: string,
    payload: { title: string; description?: string; deadline?: string },
  ) => {
    const res = await apiCreateTask(classroomId, payload);
    if (!res.success) throw new Error(res.error || 'Tạo bài tập thất bại');
    await fetchTasks(classroomId);
  };

  const updateTask = async (
    classroomId: string,
    taskId: string,
    payload: { title?: string; description?: string; deadline?: string | null; attachmentKey?: string; attachmentName?: string },
  ) => {
    const res = await apiUpdateTask(classroomId, taskId, payload);
    if (!res.success) throw new Error(res.error || 'Cập nhật bài tập thất bại');
    await fetchTasks(classroomId);
  };

  const getTaskAttachmentPresignedUpload = async (
    classroomId: string,
    taskId: string,
    filename: string,
    mimeType: string,
  ): Promise<{ url: string; s3Key: string; filename: string }> => {
    const res = await apiGetTaskAttachmentPresignedUpload(classroomId, taskId, filename, mimeType);
    if (!res.success || !res.data) throw new Error(res.error || 'Lấy URL upload thất bại');
    return res.data;
  };

  const getTaskAttachmentDownloadUrl = async (
    classroomId: string,
    taskId: string,
  ): Promise<string> => {
    const res = await apiGetTaskAttachmentDownloadUrl(classroomId, taskId);
    if (!res.success || !res.data) throw new Error(res.error || 'Lấy URL tải xuống thất bại');
    return res.data.url;
  };

  const deleteTask = async (classroomId: string, taskId: string) => {
    const res = await apiDeleteTask(classroomId, taskId);
    if (!res.success) throw new Error(res.error || 'Xóa bài tập thất bại');
    await fetchTasks(classroomId);
  };

  const submitTask = async (
    classroomId: string,
    taskId: string,
    payload: { content?: string; fileUrl?: string; fileName?: string },
  ) => {
    const res = await apiSubmitTask(classroomId, taskId, payload);
    if (!res.success) throw new Error(res.error || 'Nộp bài thất bại');
    await fetchTasks(classroomId);
  };

  const getSubmissionPresignedUpload = async (
    classroomId: string,
    taskId: string,
    filename: string,
    mimeType: string,
  ): Promise<{ url: string; s3Key: string; filename: string }> => {
    const res = await apiGetSubmissionPresignedUpload(classroomId, taskId, filename, mimeType);
    if (!res.success || !res.data) throw new Error(res.error || 'Lấy URL upload thất bại');
    return res.data;
  };

  const getSubmissionDownloadUrl = async (
    classroomId: string,
    taskId: string,
    submissionId: string,
  ): Promise<string> => {
    const res = await apiGetSubmissionDownloadUrl(classroomId, taskId, submissionId);
    if (!res.success || !res.data) throw new Error(res.error || 'Lấy URL tải xuống thất bại');
    return res.data.url;
  };

  const getMySubmissionDownloadUrl = async (
    classroomId: string,
    taskId: string,
  ): Promise<string> => {
    const res = await apiGetMySubmissionDownloadUrl(classroomId, taskId);
    if (!res.success || !res.data) throw new Error(res.error || 'Lấy URL tải xuống thất bại');
    return res.data.url;
  };

  const getSubmissions = async (
    classroomId: string,
    taskId: string,
  ): Promise<SubmissionWithUser[]> => {
    const res = await apiGetSubmissions(classroomId, taskId);
    if (!res.success || !res.data) throw new Error(res.error || 'Tải bài nộp thất bại');
    return res.data;
  };

  const gradeSubmission = async (
    classroomId: string,
    taskId: string,
    submissionId: string,
    grade: number,
  ) => {
    const res = await apiGrade(classroomId, taskId, submissionId, grade);
    if (!res.success) throw new Error(res.error || 'Chấm điểm thất bại');
    await fetchTasks(classroomId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loadingTasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        submitTask,
        getTaskAttachmentPresignedUpload,
        getTaskAttachmentDownloadUrl,
        getSubmissionPresignedUpload,
        getSubmissionDownloadUrl,
        getMySubmissionDownloadUrl,
        getSubmissions,
        gradeSubmission,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider');
  return ctx;
}
