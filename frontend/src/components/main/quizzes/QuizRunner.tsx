'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress'; // Assuming progress exists, if not I'll create it
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz } from '@/api/quizzes';
import { Textarea } from '@/components/ui/textarea';

// Simple Progress component if missing
const SimpleProgress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div
    className={cn(
      'h-2 w-full bg-slate-100 rounded-full overflow-hidden',
      className,
    )}
  >
    <div
      className='h-full bg-primary transition-all duration-300'
      style={{ width: `${value}%` }}
    />
  </div>
);

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const { handleSubmitQuiz } = useQuiz();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(
    quiz.duration ? quiz.duration * 60 : 3600,
  );
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (timeLeft <= 0 || isFinished) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  if (questions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] gap-4'>
        <p className='text-muted-foreground'>
          Bài thi này chưa có câu hỏi nào.
        </p>
        <Button onClick={() => (window.location.href = '/quizzes')}>
          Quay lại thư viện
        </Button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const toggleOption = (questionId: string, optionId: string) => {
    const current = answers[questionId] || [];
    const updated = current.includes(optionId)
      ? current.filter((id: string) => id !== optionId)
      : [...current, optionId];
    handleAnswerChange(questionId, updated);
  };

  const handleSubmit = async () => {
    if (!quiz.id) return;
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, value]) => {
          const question = questions.find((q) => q.id === questionId);
          if (question?.type === 'text') {
            return { questionId, textAnswer: value };
          } else if (question?.type === 'multiple_choice') {
            return { questionId, optionIds: value as string[] };
          } else {
            return { questionId, optionIds: [value as string] };
          }
        },
      );

      const submission = await handleSubmitQuiz(quiz.id, {
        timeSpent: (quiz.duration ? quiz.duration * 60 : 3600) - timeLeft,
        answers: formattedAnswers,
      });

      setScore(submission.score);
      setIsFinished(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinished) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center'>
        <div className='size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center'>
          <CheckCircle2 className='size-10' />
        </div>
        <h2 className='text-2xl font-bold'>Nộp bài thành công!</h2>
        <p className='text-muted-foreground'>
          Cảm ơn bạn đã hoàn thành bài kiểm tra. Kết quả của bạn là:
        </p>
        <div className='text-4xl font-black text-primary'>
          {score !== null ? `${score} điểm` : 'Đang chấm...'}
        </div>
        <Button onClick={() => (window.location.href = '/quizzes')}>
          Quay lại thư viện
        </Button>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto py-8 px-4 space-y-6'>
      <div className='flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border sticky top-0 z-10'>
        <div className='space-y-1'>
          <h1 className='font-bold text-lg line-clamp-1'>{quiz.title}</h1>
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Clock className='size-4' /> {formatTime(timeLeft)}
            </div>
            <div className='flex items-center gap-1'>
              <AlertCircle className='size-4' /> Câu {currentQuestionIndex + 1}/
              {questions.length}
            </div>
          </div>
        </div>
        <Button
          variant='destructive'
          onClick={handleSubmit}
          size='sm'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className='mr-2 size-4 animate-spin' />
          ) : (
            <Send className='mr-2 size-4' />
          )}{' '}
          Nộp bài
        </Button>
      </div>

      <SimpleProgress value={progress} />

      <Card className='border-2 shadow-lg'>
        <CardHeader>
          <div className='flex justify-between items-start gap-4'>
            <Badge variant='secondary'>
              Câu hỏi {currentQuestionIndex + 1}
            </Badge>
            <Badge variant='outline'>
              {currentQuestion.type === 'single_choice'
                ? 'Chọn 1 đáp án'
                : currentQuestion.type === 'multiple_choice'
                  ? 'Chọn nhiều đáp án'
                  : 'Trả lời ngắn'}
            </Badge>
          </div>
          <CardTitle className='text-xl mt-4 leading-relaxed'>
            {currentQuestion.content}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {currentQuestion.type === 'text' ? (
            <Textarea
              placeholder='Nhập câu trả lời của bạn...'
              value={answers[currentQuestion.id] || ''}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              className='min-h-[120px]'
            />
          ) : (
            <div className='grid gap-3'>
              {currentQuestion.options.map((opt: any) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    currentQuestion.type === 'single_choice'
                      ? handleAnswerChange(currentQuestion.id, opt.id)
                      : toggleOption(currentQuestion.id, opt.id)
                  }
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:bg-slate-50',
                    currentQuestion.type === 'single_choice'
                      ? answers[currentQuestion.id] === opt.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-100'
                      : (answers[currentQuestion.id] || []).includes(opt.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-100',
                  )}
                >
                  <div
                    className={cn(
                      'size-5 rounded-full border-2 flex items-center justify-center shrink-0',
                      currentQuestion.type === 'single_choice'
                        ? answers[currentQuestion.id] === opt.id
                          ? 'border-primary bg-primary'
                          : 'border-slate-300'
                        : (answers[currentQuestion.id] || []).includes(opt.id)
                          ? 'border-primary bg-primary rounded-md'
                          : 'border-slate-300 rounded-md',
                    )}
                  >
                    {(answers[currentQuestion.id] === opt.id ||
                      (answers[currentQuestion.id] || []).includes(opt.id)) && (
                      <Check className='size-3 text-white' />
                    )}
                  </div>
                  <span className='font-medium'>{opt.content}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className='flex justify-between border-t p-6 bg-slate-50/50 rounded-b-xl'>
          <Button
            variant='ghost'
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          >
            <ChevronLeft className='mr-2 size-4' /> Câu trước
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>
              Câu tiếp theo <ChevronRight className='ml-2 size-4' />
            </Button>
          ) : (
            <Button
              variant='default'
              onClick={handleSubmit}
              className='bg-green-600 hover:bg-green-700'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className='mr-2 size-4 animate-spin' />
              ) : (
                <Send className='mr-2 size-4' />
              )}{' '}
              Kết thúc bài thi
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className='grid grid-cols-10 gap-2 p-4 bg-white rounded-xl border shadow-sm'>
        {/* {quiz.questions.map((_, idx) => (
           <button
             key={idx}
             onClick={() => setCurrentQuestionIndex(idx)}
             className={cn(
               "size-8 rounded-lg text-xs font-bold transition-all",
               currentQuestionIndex === idx ? "bg-primary text-white shadow-md ring-2 ring-primary/20" : 
               answers[quiz.questions[idx].id] ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-400"
             )}
           >
             {idx + 1}
           </button>
         ))} */}
      </div>
    </div>
  );
}
