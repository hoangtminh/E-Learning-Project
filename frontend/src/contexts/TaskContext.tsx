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
  deleteTask as apiDeleteTask,
  submitTask as apiSubmitTask,
  gradeSubmission as apiGrade,
} from '@/api/classroom';

interface TaskContextType {
  tasks: ClassroomTask[];
  loadingTasks: boolean;
  fetchTasks: (classroomId: string) => Promise<void>;
  createTask: (
    classroomId: string,
    payload: { title: string; description?: string; deadline?: string },
  ) => Promise<void>;
  deleteTask: (classroomId: string, taskId: string) => Promise<void>;
  submitTask: (
    classroomId: string,
    taskId: string,
    payload: { content?: string; fileUrl?: string },
  ) => Promise<void>;
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

  const deleteTask = async (classroomId: string, taskId: string) => {
    const res = await apiDeleteTask(classroomId, taskId);
    if (!res.success) throw new Error(res.error || 'Xóa bài tập thất bại');
    await fetchTasks(classroomId);
  };

  const submitTask = async (
    classroomId: string,
    taskId: string,
    payload: { content?: string; fileUrl?: string },
  ) => {
    const res = await apiSubmitTask(classroomId, taskId, payload);
    if (!res.success) throw new Error(res.error || 'Nộp bài thất bại');
    await fetchTasks(classroomId);
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
        deleteTask,
        submitTask,
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
