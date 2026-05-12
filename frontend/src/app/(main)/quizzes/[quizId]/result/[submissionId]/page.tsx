'use client';

import { use } from 'react';
import { QuizResultView } from '@/components/main/quizzes/QuizResultView';

export default function QuizResultPage({
  params,
}: {
  params: Promise<{ quizId: string; submissionId: string }>;
}) {
  const { quizId, submissionId } = use(params);

  return (
    <div className='min-h-screen bg-slate-50/30'>
      <QuizResultView quizId={quizId} submissionId={submissionId} />
    </div>
  );
}
