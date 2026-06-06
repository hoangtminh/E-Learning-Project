'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client';
import {
  ClassroomMember,
  getMembers as apiGetMembers,
  removeMember as apiRemoveMember,
  addMemberByEmail as apiAddMemberByEmail,
  joinByCode as apiJoinByCode,
  getPendingMembers as apiGetPendingMembers,
  approveMember as apiApproveMember,
  rejectMember as apiRejectMember,
  updateMemberRole as apiUpdateMemberRole,
  leaveClassroom as apiLeaveClassroom,
  linkCourse as apiLinkCourse,
  unlinkCourse as apiUnlinkCourse,
  ClassroomMemberUser,
  ClassroomLinkedCourse,
  PendingClassroomRequest,
  getMyPendingClassrooms as apiGetMyPendingClassrooms,
  cancelJoinRequest as apiCancelJoinRequest,
  toggleClassroomNotifications as apiToggleClassroomNotifications,
} from '@/api/classroom';
import { useAuth } from './AuthContext';

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
  role?: 'owner' | 'admin' | 'member';
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
  addMemberByEmail: (classroomId: string, email: string) => Promise<void>;
  updateMemberRole: (
    classroomId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member',
  ) => Promise<void>;
  leaveClassroom: (classroomId: string) => Promise<void>;

  pendingMembers: PendingMember[];
  loadingPending: boolean;
  fetchPendingMembers: (classroomId: string) => Promise<void>;
  approveMember: (classroomId: string, userId: string) => Promise<void>;
  rejectMember: (classroomId: string, userId: string) => Promise<void>;

  linkCourse: (classroomId: string, courseId: string) => Promise<void>;
  unlinkCourse: (classroomId: string, courseId: string) => Promise<void>;

  // Pending join requests for the current user
  pendingClassrooms: PendingClassroomRequest[];
  loadingPendingClassrooms: boolean;
  fetchPendingClassrooms: () => Promise<void>;
  cancelJoinRequest: (classroomId: string, userId: string) => Promise<void>;
  toggleClassroomNotifications: (classroomId: string, enabled: boolean) => Promise<void>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(
  undefined,
);

export function ClassroomProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const currentUserId = user?.userId || user?.id;

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loadingClassroom, setLoadingClassroom] = useState(true);

  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const [pendingClassrooms, setPendingClassrooms] = useState<PendingClassroomRequest[]>([]);
  const [loadingPendingClassrooms, setLoadingPendingClassrooms] = useState(false);

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<Classroom[]>('/classrooms');
      if (res.success && res.data) {
        // Sanitize arrays safely with defaults
        const cleaned = res.data.map((c) => ({
          ...c,
          members: c.members ?? [],
          linkedCourses: c.linkedCourses ?? [],
        }));
        setClassrooms(cleaned);
      } else {
        console.error('Fetch classrooms failed:', res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClassroom = useCallback(async (
    title: string,
    description: string,
    isPublic = false,
  ) => {
    const res = await apiPost<Classroom>('/classrooms', { title, description, isPublic });
    if (!res.success) throw new Error(res.error || 'Tạo lớp thất bại');
    if (res.data) {
      setClassrooms((prev) => [res.data!, ...prev]);
    }
  }, []);

  const updateClassroom = useCallback(async (
    id: string,
    title: string,
    description?: string,
  ) => {
    const res = await apiPatch<Classroom>(`/classrooms/${id}`, { title, description });
    if (!res.success) throw new Error(res.error || 'Cập nhật thất bại');
    if (res.data) {
      setClassrooms((prev) => prev.map((c) => (c.id === id ? res.data! : c)));
      setClassroom((prev) => (prev && prev.id === id ? { ...prev, ...res.data! } : prev));
    }
  }, []);

  const deleteClassroom = useCallback(async (id: string) => {
    const res = await apiDelete(`/classrooms/${id}`);
    if (!res.success) throw new Error(res.error || 'Xóa thất bại');
    setClassrooms((prev) => prev.filter((c) => c.id !== id));
    setClassroom((prev) => (prev && prev.id === id ? null : prev));
  }, []);

  const joinByCode = useCallback(async (code: string) => {
    const res = await apiJoinByCode(code);
    if (!res.success) throw new Error(res.error || 'Tham gia thất bại');
    const classroomsRes = await apiGet<Classroom[]>('/classrooms');
    if (classroomsRes.success && classroomsRes.data) {
      setClassrooms(classroomsRes.data);
    }
    const pendingRes = await apiGetMyPendingClassrooms();
    if (pendingRes.success && pendingRes.data) {
      setPendingClassrooms(pendingRes.data);
    }
  }, []);

  const fetchPendingClassrooms = useCallback(async () => {
    setLoadingPendingClassrooms(true);
    try {
      const res = await apiGetMyPendingClassrooms();
      if (res.success && res.data) {
        setPendingClassrooms(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPendingClassrooms(false);
    }
  }, []);

  const cancelJoinRequest = useCallback(async (classroomId: string, userId: string) => {
    const res = await apiCancelJoinRequest(classroomId, userId);
    if (!res.success) throw new Error(res.error || 'Hủy yêu cầu thất bại');
    setPendingClassrooms((prev) => prev.filter((req) => req.classroom.id !== classroomId));
  }, []);

  const fetchClassroom = useCallback(async (id: string) => {
    setLoadingClassroom(true);
    try {
      const res = await apiGet<Classroom>(`/classrooms/${id}`);
      if (res.success && res.data) {
        // Sanitize array properties safely
        const cleaned = {
          ...res.data,
          members: res.data.members ?? [],
          linkedCourses: res.data.linkedCourses ?? [],
        };
        setClassroom(cleaned);
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

  const removeMember = useCallback(async (classroomId: string, userId: string) => {
    const res = await apiRemoveMember(classroomId, userId);
    if (!res.success) throw new Error(res.error || 'Xóa thành viên thất bại');
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  }, []);

  const addMemberByEmail = useCallback(async (classroomId: string, email: string) => {
    const res = await apiAddMemberByEmail(classroomId, email);
    if (!res.success) throw new Error(res.error || 'Thêm thành viên thất bại');
    if (res.data) {
      setMembers((prev) => [...prev, res.data!]);
    }
  }, []);

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

  const approveMember = useCallback(async (classroomId: string, userId: string) => {
    const res = await apiApproveMember(classroomId, userId);
    if (!res.success) throw new Error(res.error || 'Duyệt thành viên thất bại');
    setPendingMembers((prev) => prev.filter((m) => m.user.id !== userId));
    if (res.data) {
      setMembers((prev) => [...prev, res.data!]);
    }
  }, []);

  const rejectMember = useCallback(async (classroomId: string, userId: string) => {
    const res = await apiRejectMember(classroomId, userId);
    if (!res.success) throw new Error(res.error || 'Từ chối thành viên thất bại');
    setPendingMembers((prev) => prev.filter((m) => m.user.id !== userId));
  }, []);

  const updateMemberRole = useCallback(async (
    classroomId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member',
  ) => {
    const res = await apiUpdateMemberRole(classroomId, userId, role);
    if (!res.success) throw new Error(res.error || 'Cập nhật vai trò thất bại');
    if (res.data) {
      setMembers((prev) => prev.map((m) => (m.userId === userId ? res.data! : m)));
      setClassroom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members?.map((m) => (m.userId === userId ? res.data! : m)),
        };
      });
    }
  }, []);

  const leaveClassroom = useCallback(async (classroomId: string) => {
    const res = await apiLeaveClassroom(classroomId);
    if (!res.success) throw new Error(res.error || 'Rời lớp học thất bại');
    setClassrooms((prev) => prev.filter((c) => c.id !== classroomId));
    setClassroom((prev) => (prev && prev.id === classroomId ? null : prev));
  }, []);

  const linkCourse = useCallback(async (classroomId: string, courseId: string) => {
    const res = await apiLinkCourse(classroomId, courseId);
    if (!res.success) throw new Error(res.error || 'Liên kết khóa học thất bại');
    if (res.data) {
      setClassroom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          linkedCourses: [...(prev.linkedCourses || []), res.data as any],
        };
      });
    }
  }, []);

  const unlinkCourse = useCallback(async (classroomId: string, courseId: string) => {
    const res = await apiUnlinkCourse(classroomId, courseId);
    if (!res.success) throw new Error(res.error || 'Hủy liên kết khóa học thất bại');
    setClassroom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        linkedCourses: (prev.linkedCourses || []).filter((lc) => lc.course.id !== courseId),
      };
    });
  }, []);

  const toggleClassroomNotifications = useCallback(async (
    classroomId: string,
    enabled: boolean,
  ) => {
    const res = await apiToggleClassroomNotifications(classroomId, enabled);
    if (!res.success) throw new Error(res.error || 'Cập nhật thông báo thất bại');
    setClassroom((prev) => {
      if (!prev || prev.id !== classroomId) return prev;
      return {
        ...prev,
        members: prev.members?.map((m) =>
          m.userId === currentUserId ? { ...m, notificationsEnabled: enabled } : m
        ),
      };
    });
  }, [currentUserId]);

  const contextValue = useMemo(() => ({
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
    addMemberByEmail,
    updateMemberRole,
    leaveClassroom,
    pendingMembers,
    loadingPending,
    fetchPendingMembers,
    approveMember,
    rejectMember,
    linkCourse,
    unlinkCourse,
    pendingClassrooms,
    loadingPendingClassrooms,
    fetchPendingClassrooms,
    cancelJoinRequest,
    toggleClassroomNotifications,
  }), [
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
    addMemberByEmail,
    updateMemberRole,
    leaveClassroom,
    pendingMembers,
    loadingPending,
    fetchPendingMembers,
    approveMember,
    rejectMember,
    linkCourse,
    unlinkCourse,
    pendingClassrooms,
    loadingPendingClassrooms,
    fetchPendingClassrooms,
    cancelJoinRequest,
    toggleClassroomNotifications,
  ]);

  return (
    <ClassroomContext.Provider value={contextValue}>
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
