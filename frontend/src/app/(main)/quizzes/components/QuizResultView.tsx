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
    <div className='max-w-3xl mx-auto py-4 sm:py-6 px-3 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-white rounded-lg border shadow-sm p-4 sm:p-8'>
        <div className='absolute top-0 right-0 -mt-10 -mr-10 size-48 sm:size-64 bg-primary/15 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-0 -mb-10 -ml-10 size-48 sm:size-64 bg-green-100 rounded-full blur-3xl' />

        <div className='relative flex flex-col items-center text-center space-y-3 sm:space-y-4'>
          <div
            className={cn(
              'size-12 sm:size-16 rounded-lg flex items-center justify-center shadow-md transform rotate-3',
              correctPercentage >= 50
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white',
            )}
          >
            <CheckCircle2 className='size-6 sm:size-8' />
          </div>

          <div className='space-y-1.5'>
            <Badge
              variant='outline'
              className='px-2.5 py-0.5 rounded-full border-primary/30 text-primary font-bold text-[9px] sm:text-xs bg-primary/5'
            >
              HOÀN THÀNH BÀI THI
            </Badge>
            <h1 className='text-xl sm:text-2xl font-black tracking-tight leading-tight text-slate-800'>
              {quiz.title}
            </h1>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg mt-3 sm:mt-6'>
            <div className='flex flex-col p-3 bg-slate-100 rounded-lg border border-slate-200 transition-all hover:shadow-sm'>
              <span className='text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1'>
                Tổng điểm
              </span>
              <span className='text-2xl sm:text-3xl font-black text-primary'>
                {result.score}
              </span>
            </div>

            <div className='flex flex-col p-3 bg-slate-100 rounded-lg border border-slate-200 transition-all hover:shadow-sm'>
              <span className='text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1'>
                Số câu đúng
              </span>
              <span className='text-2xl sm:text-3xl font-black text-blue-600'>
                {result.score}/{quiz.questions?.length}
              </span>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 w-full sm:w-auto'>
            <Button
              size='default'
              className='w-full sm:w-auto rounded-md h-9 px-6 font-bold shadow-md shadow-primary/10'
              onClick={() => router.push('/quizzes')}
            >
              <Home className='mr-1.5 size-4' /> Quay về trang chủ
            </Button>
            <Button
              size='default'
              variant='outline'
              className='w-full sm:w-auto rounded-md h-9 px-6 font-bold border-slate-300'
              onClick={() => router.push(`/quizzes/${quizId}/take`)}
            >
              <RotateCcw className='mr-1.5 size-4' /> Làm lại bài
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between px-1'>
          <h2 className='text-lg font-bold flex items-center gap-1.5 text-slate-800'>
            <ChevronRight className='size-5 text-primary' /> Chi tiết từng câu hỏi
          </h2>
          <Badge variant='secondary' className='rounded-md px-2 py-0.5 text-xs'>
            {quiz.questions?.length} câu hỏi
          </Badge>
        </div>

        <div className='grid gap-3'>
          {quiz.questions?.map((q, idx) => {
            const r = result?.answers?.find((res) => res.questionId === q.id);

            return (
              <Card
                key={q.id}
                className={cn(
                  'group border transition-all hover:shadow-sm overflow-hidden rounded-lg bg-white',
                  r?.isCorrect
                    ? 'border-green-200 hover:border-green-300'
                    : 'border-red-200 hover:border-red-300',
                )}
              >
                <div
                  className={cn(
                    'h-1 w-full',
                    r?.isCorrect ? 'bg-green-500' : 'bg-red-500',
                  )}
                />
                <CardContent className='p-3.5'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div className='flex gap-2.5 sm:gap-3'>
                      <div
                        className={cn(
                          'size-7 sm:size-8 rounded-md flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 text-xs sm:text-sm',
                          r?.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800',
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className='space-y-1'>
                        <p className='font-bold text-sm sm:text-base leading-tight text-slate-850'>
                          {q.content}
                        </p>
                        <div className='flex items-center gap-2 mt-1.5'>
                          <Badge
                            variant='outline'
                            className='text-[9px] uppercase font-bold tracking-tighter border-slate-200 text-slate-500'
                          >
                            {q.type === 'text' ? 'Tự luận' : 'Trắc nghiệm'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center md:flex-col gap-2 md:gap-0.5 md:items-end shrink-0 ml-9 md:ml-0'>
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs',
                          r?.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800',
                        )}
                      >
                        {r?.isCorrect ? (
                          <CheckCircle2 className='size-3' />
                        ) : (
                          <X className='size-3' />
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
