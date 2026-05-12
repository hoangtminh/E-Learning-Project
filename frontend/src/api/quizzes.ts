import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client';

// --- Types ---

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text';

export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  content: string;
  orderIndex: number;
  points: number;
  options: QuestionOption[];
  correctText?: string;
}

export interface Quiz {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  duration: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
  _count?: {
    memberships: number;
    questions: number;
    submissions: number;
  };
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  score: number | null;
  timeSpent: number | null;
  submittedAt: string;
  quiz?: Quiz;
}

export interface CreateQuizDto {
  title: string;
  description?: string;
  isPublic?: boolean;
  duration?: number;
  startDate?: string;
  endDate?: string;
  questions?: any[]; // Simplified for creation
}

export interface SubmitQuizDto {
  timeSpent: number;
  answers: {
    questionId: string;
    selectedOptionIds?: string[];
    textAnswer?: string;
  }[];
}

export interface SubmitQuizResponse {
  id: string;
  quizId: string;
  userId: string;
  score: string | number;
  timeSpent: number | null;
  submittedAt: string;
  quiz: Quiz;
  answers: {
    id: string;
    submissionId: string;
    questionId: string;
    textAnswer: string | null;
    isCorrect: boolean;
    points: number;
    maxPoints: number;
    selectedOptions: {
      id: string;
      userAnswerId: string;
      optionId: string;
    }[];
    question: Question;
  }[];
}

// --- API Functions ---

export function getCreatedQuizzes() {
  return apiGet<Quiz[]>('/quizzes/created');
}

export function getJoinedQuizzes() {
  return apiGet<Quiz[]>('/quizzes/joined');
}

export function getPublicQuizzes(page: number = 1, limit: number = 20) {
  return apiGet<Quiz[]>(`/quizzes/public?page=${page}&limit=${limit}`);
}

export function getQuiz(id: string) {
  return apiGet<Quiz>(`/quizzes/${id}`);
}

export function createQuiz(data: CreateQuizDto) {
  return apiPost<Quiz>('/quizzes', data);
}

export function updateQuiz(id: string, data: Partial<CreateQuizDto>) {
  return apiPatch<Quiz>(`/quizzes/${id}`, data);
}

export function deleteQuiz(id: string) {
  return apiDelete(`/quizzes/${id}`);
}

export function shareQuiz(id: string, email: string) {
  return apiPost(`/quizzes/${id}/share`, { email });
}

export function submitQuiz(id: string, data: SubmitQuizDto) {
  return apiPost<SubmitQuizResponse>(`/quizzes/${id}/submit`, data);
}

export function getQuizSubmissions(id: string) {
  return apiGet<QuizSubmission[]>(`/quizzes/${id}/submissions`);
}

export function getSubmissionDetails(quizId: string, submissionId: string) {
  return apiGet<SubmitQuizResponse>(
    `/quizzes/${quizId}/submissions/${submissionId}`,
  );
}
