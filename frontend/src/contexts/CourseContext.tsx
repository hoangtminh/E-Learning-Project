'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  Course,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  CreateCourseDto,
  UpdateCourseDto,
} from '@/api/course';

interface CourseContextType {
  courses: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  createNewCourse: (data: CreateCourseDto) => Promise<Course | null>;
  updateExistingCourse: (id: string, data: UpdateCourseDto) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Advanced Patterns',
    slug: 'react-advanced-patterns',
    description:
      'Master advanced React patterns like HOCs, Render Props, and Compound Components.',
    price: 499000,
    visibility: 'PUBLIC',
    instructorId: 'inst-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Next.js 15 Fullstack Mastery',
    slug: 'nextjs-15-mastery',
    description:
      'Build modern full-stack applications with Next.js 15, App Router, and Server Actions.',
    price: 799000,
    visibility: 'PUBLIC',
    instructorId: 'inst-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Node.js & NestJS Backend Engineering',
    slug: 'nestjs-backend',
    description:
      'Scalable backend development with NestJS, Prisma, and PostgreSQL.',
    price: 0,
    visibility: 'PUBLIC',
    instructorId: 'inst-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCourses();
      if (res.success && res.data && res.data.length > 0) {
        setCourses(res.data);
      } else if (!res.success) {
        // Log error but keep mock data for UI demo
        console.warn('API fetch failed, using mock data:', res.error);
        // We don't set error state here to avoid blocking UI with error message when mock data is present
      }
    } catch (err: any) {
      console.error('Fetch error, using mock data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCourseById(id);
      if (res.success && res.data) {
        setCurrentCourse(res.data);
      } else {
        setError(res.error || 'Failed to fetch course');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewCourse = async (data: CreateCourseDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await createCourse(data);
      if (res.success && res.data) {
        setCourses((prev) => [...prev, res.data!]);
        return res.data;
      } else {
        setError(res.error || 'Failed to create course');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExistingCourse = async (id: string, data: UpdateCourseDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await updateCourse(id, data);
      if (res.success && res.data) {
        setCourses((prev) => prev.map((c) => (c.id === id ? res.data! : c)));
        if (currentCourse?.id === id) {
          setCurrentCourse(res.data);
        }
      } else {
        setError(res.error || 'Failed to update course');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const removeCourse = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deleteCourse(id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        if (currentCourse?.id === id) {
          setCurrentCourse(null);
        }
      } else {
        setError(res.error || 'Failed to delete course');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
