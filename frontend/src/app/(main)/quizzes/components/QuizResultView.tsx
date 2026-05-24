'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz, SubmitQuizResponse } from '@/api/quizzes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  X,
  Loader2,
  Home,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizResultViewProps {
  quizId: string;
  submissionId: string;
}

export function QuizResultView({ quizId, submissionId }: QuizResultViewProps) {
  const router = useRouter();
  const { fetchQuiz, getSubmissionDetails } = useQuiz();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<SubmitQuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizData, submissionData] = await Promise.all([
          fetchQuiz(quizId),
          getSubmissionDetails(quizId, submissionId),
        ]);
        setQuiz(quizData);
        setResult(submissionData);
      } catch (err) {
        console.error('Failed to load quiz results:', err);
        setError('Không thể tải kết quả bài thi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [quizId, submissionId, fetchQuiz, getSubmissionDetails]);
  console.log('quiz', quiz);
  console.log('result', result);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <Loader2 className='size-12 animate-spin text-primary' />
        <p className='text-muted-foreground animate-pulse'>
          Đang phân tích kết quả bài thi...
        </p>
      </div>
    );
  }

  if (error || !quiz || !result) {
    return (
      <div className='max-w-md mx-auto py-20 text-center space-y-6'>
        <div className='size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto'>
          <X className='size-10' />
        </div>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>Có lỗi xảy ra</h2>
          <p className='text-muted-foreground'>
            {error || 'Không tìm thấy dữ liệu bài thi.'}
          </p>
        </div>
        <Button onClick={() => router.push('/quizzes')} variant='outline'>
          Quay lại Thư viện
        </Button>
      </div>
    );
  }
  const correctCount = result.answers.filter((a) => a.isCorrect).length;
  const correctPercentage = Math.round(
    (correctCount / result.answers.length) * 100,
  );

  return (
    <div className='max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl border shadow-xl sm:shadow-2xl p-6 sm:p-12'>
        <div className='absolute top-0 right-0 -mt-10 -mr-10 size-48 sm:size-64 bg-primary/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-0 -mb-10 -ml-10 size-48 sm:size-64 bg-green-50 rounded-full blur-3xl' />

        <div className='relative flex flex-col items-center text-center space-y-4 sm:space-y-6'>
          <div
            className={cn(
              'size-16 sm:size-24 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg transform rotate-3',
              correctPercentage >= 50
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white',
            )}
          >
            <CheckCircle2 className='size-8 sm:size-12' />
          </div>

          <div className='space-y-2'>
            <Badge
              variant='outline'
              className='px-3 sm:px-4 py-0.5 sm:py-1 rounded-full border-primary/20 text-primary font-bold text-[10px] sm:text-xs'
            >
              HOÀN THÀNH BÀI THI
            </Badge>
            <h1 className='text-2xl sm:text-4xl font-black tracking-tight leading-tight'>
              {quiz.title}
            </h1>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl mt-4 sm:mt-8'>
            <div className='flex flex-col p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border transition-all hover:shadow-md'>
              <span className='text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2'>
                Tổng điểm
              </span>
              <span className='text-3xl sm:text-5xl font-black text-primary'>
                {result.score}
              </span>
            </div>

            <div className='flex flex-col p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border transition-all hover:shadow-md'>
              <span className='text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2'>
                Số câu đúng
              </span>
              <span className='text-3xl sm:text-5xl font-black text-blue-600'>
                {result.score}/{quiz.questions?.length}
              </span>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto'>
            <Button
              size='lg'
              className='w-full sm:w-auto rounded-xl px-8 py-6 font-bold shadow-xl shadow-primary/20'
              onClick={() => router.push('/quizzes')}
            >
              <Home className='mr-2 size-5' /> Quay về trang chủ
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='w-full sm:w-auto rounded-xl px-8 py-6 font-bold'
              onClick={() => router.push(`/quizzes/${quizId}/take`)}
            >
              <RotateCcw className='mr-2 size-5' /> Làm lại bài
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between px-2'>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            <ChevronRight className='size-6 text-primary' /> Chi tiết từng câu
            hỏi
          </h2>
          <Badge variant='secondary' className='rounded-lg px-3 py-1'>
            {quiz.questions?.length} câu hỏi
          </Badge>
        </div>

        <div className='grid gap-4'>
          {quiz.questions?.map((q, idx) => {
            const r = result?.answers?.find((res) => res.questionId === q.id);

            return (
              <Card
                key={q.id}
                className={cn(
                  'group border-2 transition-all hover:shadow-lg overflow-hidden',
                  r?.isCorrect
                    ? 'border-green-100 hover:border-green-200'
                    : 'border-red-100 hover:border-red-200',
                )}
              >
                <div
                  className={cn(
                    'h-1.5 w-full',
                    r?.isCorrect ? 'bg-green-500' : 'bg-red-500',
                  )}
                />
                <CardContent className='p-6'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                    <div className='flex gap-3 sm:gap-4'>
                      <div
                        className={cn(
                          'size-8 sm:size-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-110 text-sm sm:text-base',
                          r?.isCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700',
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className='space-y-1'>
                        <p className='font-bold text-base sm:text-lg leading-tight'>
                          {q.content}
                        </p>
                        <div className='flex items-center gap-3 mt-2'>
                          <Badge
                            variant='outline'
                            className='text-[9px] sm:text-[10px] uppercase font-bold tracking-tighter'
                          >
                            {q.type === 'text' ? 'Tự luận' : 'Trắc nghiệm'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center md:flex-col gap-3 sm:gap-4 md:gap-1 md:items-end shrink-0 ml-11 md:ml-0'>
                      <div
                        className={cn(
                          'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold text-[10px] sm:text-sm',
                          r?.isCorrect
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700',
                        )}
                      >
                        {r?.isCorrect ? (
                          <CheckCircle2 className='size-3 sm:size-4' />
                        ) : (
                          <X className='size-3 sm:size-4' />
                        )}
                        {r?.isCorrect ? 'Đúng' : 'Sai'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
