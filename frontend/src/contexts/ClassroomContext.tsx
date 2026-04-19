'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client';

export type Classroom = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
};

interface ClassroomContextType {
  classrooms: Classroom[];
  loading: boolean;
  fetchClassrooms: () => Promise<void>;
  createClassroom: (title: string, description: string) => Promise<void>;
  updateClassroom: (id: string, title: string) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;

  classroom: Classroom | null;
  loadingClassroom: boolean;
  fetchClassroom: (id: string) => Promise<void>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(
  undefined,
);

export function ClassroomProvider({ children }: { children: ReactNode }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loadingClassroom, setLoadingClassroom] = useState(true);

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<Classroom[]>('/classrooms');
      if (res.success && res.data) {
        setClassrooms(res.data);
      } else {
        console.error('Fetch classrooms failed:', res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClassroom = async (title: string, description: string) => {
    const res = await apiPost('/classrooms', { title, description });
    if (!res.success) throw new Error(res.error || 'Tạo lớp thất bại');
    await fetchClassrooms();
  };

  const updateClassroom = async (id: string, title: string) => {
    const res = await apiPatch(`/classrooms/${id}`, { title });
    if (!res.success) throw new Error(res.error || 'Cập nhật thất bại');
    await fetchClassrooms();
  };

  const deleteClassroom = async (id: string) => {
    const res = await apiDelete(`/classrooms/${id}`);
    if (!res.success) throw new Error(res.error || 'Xóa thất bại');
    await fetchClassrooms();
  };

  const fetchClassroom = useCallback(async (id: string) => {
    setLoadingClassroom(true);
    try {
      const res = await apiGet<Classroom>(`/classrooms/${id}`);
      if (res.success && res.data) {
        setClassroom(res.data);
      } else {
        console.error('Fetch classroom failed:', res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingClassroom(false);
    }
  }, []);

  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        loading,
        fetchClassrooms,
        createClassroom,
        updateClassroom,
        deleteClassroom,
        classroom,
        loadingClassroom,
        fetchClassroom,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
}

export function useClassrooms() {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error('useClassrooms must be used within a ClassroomProvider');
  }
  return context;
}
