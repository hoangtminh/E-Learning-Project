'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Quiz,
  getCreatedQuizzes,
  getJoinedQuizzes,
  getPublicQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getSubmissionDetails,
  SubmitQuizDto,
  SubmitQuizResponse,
} from '@/api/quizzes';

interface QuizContextType {
  createdQuizzes: Quiz[];
  joinedQuizzes: Quiz[];
  publicQuizzes: Quiz[];
  loading: boolean;
  fetchCreatedQuizzes: () => Promise<void>;
  fetchJoinedQuizzes: () => Promise<void>;
  fetchPublicQuizzes: (page?: number, limit?: number) => Promise<void>;
  fetchQuiz: (id: string) => Promise<Quiz>;
  getSubmissionDetails: (quizId: string, submissionId: string) => Promise<SubmitQuizResponse>;
  handleAddQuiz: (data: any) => Promise<void>;
  handleUpdateQuiz: (id: string, data: any) => Promise<void>;
  handleDeleteQuiz: (id: string) => Promise<void>;
  handleSubmitQuiz: (
    id: string,
    data: SubmitQuizDto,
  ) => Promise<SubmitQuizResponse>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [createdQuizzes, setCreatedQuizzes] = useState<Quiz[]>([]);
  const [joinedQuizzes, setJoinedQuizzes] = useState<Quiz[]>([]);
  const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCreatedQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCreatedQuizzes();
      if (res.success && res.data) {
        setCreatedQuizzes(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching created quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJoinedQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getJoinedQuizzes();
      if (res.success && res.data) {
        setJoinedQuizzes(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching joined quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPublicQuizzes = useCallback(
    async (page: number = 1, limit: number = 20) => {
      setLoading(true);
      try {
        const res = await getPublicQuizzes(page, limit);
        if (res.success && res.data) {
          setPublicQuizzes(res.data || []);
        }
      } catch (error) {
        console.error('Error fetching public quizzes:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchQuiz = useCallback(async (id: string) => {
    const res = await getQuiz(id);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to fetch quiz');
  }, []);

  const handleAddQuiz = async (data: any) => {
    try {
      console.log(data);
      const res = await createQuiz(data);
      if (res.success && res.data) {
        setCreatedQuizzes((prev) => [res.data!, ...prev]);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  };

  const handleUpdateQuiz = async (id: string, data: any) => {
    try {
      const res = await updateQuiz(id, data);
      if (res.success && res.data) {
        setCreatedQuizzes((prev) =>
          prev.map((q) => (q.id === id ? res.data! : q)),
        );
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      const res = await deleteQuiz(id);
      if (res.success) {
        setCreatedQuizzes((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  };

  const handleSubmitQuiz = async (id: string, data: SubmitQuizDto) => {
    try {
      console.log(data, id);
      const res = await submitQuiz(id, data);
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.error || 'Failed to submit quiz');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  };

  const handleGetSubmissionDetails = useCallback(async (quizId: string, submissionId: string) => {
    const res = await getSubmissionDetails(quizId, submissionId);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to fetch submission details');
  }, []);

  return (
    <QuizContext.Provider
      value={{
        createdQuizzes,
        joinedQuizzes,
        publicQuizzes,
        loading,
        fetchCreatedQuizzes,
        fetchJoinedQuizzes,
        fetchPublicQuizzes,
        fetchQuiz,
        getSubmissionDetails: handleGetSubmissionDetails,
        handleAddQuiz,
        handleUpdateQuiz,
        handleDeleteQuiz,
        handleSubmitQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
