'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizEditor } from "@/app/(main)/quizzes/components/QuizEditor";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function NewQuizPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  useEffect(() => {
    if (!isLoading && !isInstructor) {
      router.push('/quizzes');
    }
  }, [user, isLoading, isInstructor, router]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Loader2 className='size-10 animate-spin text-primary' />
      </div>
    );
  }

  if (!isInstructor) {
    return null;
  }

  return (
    <div className="p-6">
      <QuizEditor />
    </div>
  );
}
