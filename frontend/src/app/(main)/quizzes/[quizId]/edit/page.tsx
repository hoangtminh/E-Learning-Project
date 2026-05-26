'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuizEditor } from '@/app/(main)/quizzes/components/QuizEditor';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz } from '@/api/quizzes';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function EditQuizPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { fetchQuiz } = useQuiz();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await fetchQuiz(quizId as string);
        setQuiz(data);
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId, fetchQuiz]);

  const isOwner = quiz ? (quiz.creatorId === user?.userId || quiz.creatorId === user?.id || user?.role === 'admin') : false;

  useEffect(() => {
    if (!authLoading && quiz && !isOwner) {
      router.push('/quizzes');
    }
  }, [quiz, authLoading, isOwner, router]);

  if (loading || authLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='size-10 animate-spin text-primary' />
      </div>
    );
  }

  if (!quiz || !isOwner) {
    return null;
  }

  return (
    <div className='p-6'>
      <QuizEditor quiz={quiz} />
    </div>
  );
}
