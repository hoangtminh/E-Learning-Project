'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  CourseListItem,
  CourseListResponse,
  getCourses,
  getCourse,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse,
  CourseDetail,
} from '@/api/courses';
import { unenrollCourse as apiUnenrollCourseAction } from '@/api/enrollment';

interface CourseContextType {
  courses: CourseListItem[];
  currentCourse: CourseDetail | null;
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  createNewCourse: (data: Parameters<typeof apiCreateCourse>[0]) => Promise<CourseDetail | null>;
  updateExistingCourse: (id: string, data: Parameters<typeof apiUpdateCourse>[1]) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
  unenrollCourse: (id: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [currentCourse, setCurrentCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCourses();
      if (res.success && res.data) {
        // Backend returns { data: CourseListItem[], meta: {...} }
        const payload = res.data as CourseListResponse;
        if (payload.data && Array.isArray(payload.data)) {
          setCourses(payload.data);
        } else if (Array.isArray(res.data)) {
          // Fallback: if backend returns array directly
          setCourses(res.data as any);
        }
      } else if (!res.success) {
        setError(res.error || 'Không thể tải danh sách khóa học');
      }
    } catch (err: unknown) {
      console.error('Fetch courses error:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCourse(id);
      if (res.success && res.data) {
        setCurrentCourse(res.data);
      } else {
        setError(res.error || 'Failed to fetch course');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewCourse = async (data: Parameters<typeof apiCreateCourse>[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCreateCourse(data);
      if (res.success && res.data) {
        await fetchCourses(); // Refresh the list
        return res.data;
      } else {
        setError(res.error || 'Failed to create course');
        return null;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExistingCourse = async (id: string, data: Parameters<typeof apiUpdateCourse>[1]) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiUpdateCourse(id, data);
      if (res.success && res.data) {
        await fetchCourses(); // Refresh
        if (currentCourse?.id === id) {
          setCurrentCourse(res.data);
        }
      } else {
        setError(res.error || 'Failed to update course');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const removeCourse = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiDeleteCourse(id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        if (currentCourse?.id === id) {
          setCurrentCourse(null);
        }
      } else {
        setError(res.error || 'Failed to delete course');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const unenrollCourse = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiUnenrollCourseAction(id);
      if (res.success) {
        // Just refresh the list
        await fetchCourses();
      } else {
        setError(res.error || 'Failed to unenroll from course');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <CourseContext.Provider
      value={{
        courses,
        currentCourse,
        isLoading,
        error,
        fetchCourses,
        fetchCourseById,
        createNewCourse,
        updateExistingCourse,
        removeCourse,
        unenrollCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}
