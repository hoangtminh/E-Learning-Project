'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QuizEditor } from '@/components/main/quizzes/QuizEditor';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz } from '@/api/quizzes';
import { Loader2 } from 'lucide-react';

export default function EditQuizPage() {
  const { quizId } = useParams();
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

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='size-10 animate-spin text-primary' />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-muted-foreground'>Không tìm thấy bài thi.</p>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <QuizEditor quiz={quiz} />
    </div>
  );
}
