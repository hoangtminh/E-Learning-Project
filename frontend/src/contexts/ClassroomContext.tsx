'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client';
import {
  ClassroomMember,
  getMembers as apiGetMembers,
  removeMember as apiRemoveMember,
  joinByCode as apiJoinByCode,
  getPendingMembers as apiGetPendingMembers,
  approveMember as apiApproveMember,
  rejectMember as apiRejectMember,
  linkCourse as apiLinkCourse,
  unlinkCourse as apiUnlinkCourse,
  ClassroomMemberUser,
  ClassroomLinkedCourse,
} from '@/api/classroom';

export type Classroom = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  inviteCode: string | null;
  createdAt: string;
  ownerId: string;
  members?: ClassroomMember[];
  _count?: { members: number };
  owner?: { id: string; fullName: string | null; avatarUrl: string | null; email: string };
  linkedCourses?: ClassroomLinkedCourse[];
};

export type PendingMember = {
  id: string;
  user: ClassroomMemberUser;
};

interface ClassroomContextType {
  classrooms: Classroom[];
  loading: boolean;
  fetchClassrooms: () => Promise<void>;
  createClassroom: (title: string, description: string, isPublic?: boolean) => Promise<void>;
  updateClassroom: (id: string, title: string, description?: string) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
  joinByCode: (code: string) => Promise<void>;

  classroom: Classroom | null;
  loadingClassroom: boolean;
  fetchClassroom: (id: string) => Promise<void>;

  members: ClassroomMember[];
  loadingMembers: boolean;
  fetchMembers: (classroomId: string) => Promise<void>;
  removeMember: (classroomId: string, userId: string) => Promise<void>;

  pendingMembers: PendingMember[];
  loadingPending: boolean;
  fetchPendingMembers: (classroomId: string) => Promise<void>;
  approveMember: (classroomId: string, userId: string) => Promise<void>;
  rejectMember: (classroomId: string, userId: string) => Promise<void>;

  linkCourse: (classroomId: string, courseId: string) => Promise<void>;
  unlinkCourse: (classroomId: string, courseId: string) => Promise<void>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(
  undefined,
);

export function ClassroomProvider({ children }: { children: ReactNode }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loadingClassroom, setLoadingClassroom] = useState(true);

  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

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

  const createClassroom = async (
    title: string,
    description: string,
    isPublic = false,
  ) => {
    const res = await apiPost('/classrooms', { title, description, isPublic });
    if (!res.success) throw new Error(res.error || 'Tạo lớp thất bại');
    await fetchClassrooms();
  };

  const updateClassroom = async (
    id: string,
    title: string,
    description?: string,
  ) => {
    const res = await apiPatch(`/classrooms/${id}`, { title, description });
    if (!res.success) throw new Error(res.error || 'Cập nhật thất bại');
    await fetchClassrooms();
  };

  const deleteClassroom = async (id: string) => {
    const res = await apiDelete(`/classrooms/${id}`);
    if (!res.success) throw new Error(res.error || 'Xóa thất bại');
    await fetchClassrooms();
  };

  const joinByCode = async (code: string) => {
    const res = await apiJoinByCode(code);
    if (!res.success) throw new Error(res.error || 'Tham gia thất bại');
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

  const fetchMembers = useCallback(async (classroomId: string) => {
    setLoadingMembers(true);
    try {
      const res = await apiGetMembers(classroomId);
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const removeMember = async (classroomId: string, userId: string) => {
    const res = await apiRemoveMember(classroomId, userId);
    if (!res.success) throw new Error(res.error || 'Xóa thành viên thất bại');
    await fetchMembers(classroomId);
  };

  const fetchPendingMembers = useCallback(async (classroomId: string) => {
    setLoadingPending(true);
    try {
      const res = await apiGetPendingMembers(classroomId);
      if (res.success && res.data) {
        setPendingMembers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  const approveMember = async (classroomId: string, userId: string) => {
    const res = await apiApproveMember(classroomId, userId);
    if (!res.success) throw new Error(res.error || 'Duyệt thành viên thất bại');
    await fetchPendingMembers(classroomId);
    await fetchMembers(classroomId);
  };

  const rejectMember = async (classroomId: string, userId: string) => {
    const res = await apiRejectMember(classroomId, userId);
    if (!res.success) throw new Error(res.error || 'Từ chối thành viên thất bại');
    await fetchPendingMembers(classroomId);
  };

  const linkCourse = async (classroomId: string, courseId: string) => {
    const res = await apiLinkCourse(classroomId, courseId);
    if (!res.success) throw new Error(res.error || 'Liên kết khóa học thất bại');
    await fetchClassroom(classroomId);
  };

  const unlinkCourse = async (classroomId: string, courseId: string) => {
    const res = await apiUnlinkCourse(classroomId, courseId);
    if (!res.success) throw new Error(res.error || 'Hủy liên kết khóa học thất bại');
    await fetchClassroom(classroomId);
  };

  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        loading,
        fetchClassrooms,
        createClassroom,
        updateClassroom,
        deleteClassroom,
        joinByCode,
        classroom,
        loadingClassroom,
        fetchClassroom,
        members,
        loadingMembers,
        fetchMembers,
        removeMember,
        pendingMembers,
        loadingPending,
        fetchPendingMembers,
        approveMember,
        rejectMember,
        linkCourse,
        unlinkCourse,
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
