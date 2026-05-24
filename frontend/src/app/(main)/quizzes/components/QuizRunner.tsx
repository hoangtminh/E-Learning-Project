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
  X,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress'; // Assuming progress exists, if not I'll create it
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz, SubmitQuizResponse } from '@/api/quizzes';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { handleSubmitQuiz } = useQuiz();
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(
    quiz.duration ? quiz.duration * 60 : 3600,
  );
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isFinished) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isFinished]);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  if (!isStarted) {
    return (
      <div className='max-w-2xl mx-auto py-12 px-4'>
        <Card className='border-2 shadow-xl overflow-hidden'>
          <div className='h-3 bg-primary' />
          <CardHeader className='text-center space-y-4 pb-8'>
            <div className='mx-auto size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-2'>
              <CheckCircle2 className='size-8' />
            </div>
            <div className='space-y-2'>
              <CardTitle className='text-3xl font-bold'>{quiz.title}</CardTitle>
              <p className='text-muted-foreground text-lg'>
                {quiz.description || 'Sẵn sàng để kiểm tra kiến thức của bạn?'}
              </p>
            </div>
          </CardHeader>
          <CardContent className='grid gap-6 border-y bg-slate-50/50 p-5 sm:p-8'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm'>
                <div className='size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0'>
                  <Clock className='size-5' />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground font-medium uppercase'>
                    Thời gian
                  </p>
                  <p className='font-bold text-sm sm:text-base'>
                    {quiz.duration ? `${quiz.duration} phút` : 'Không giới hạn'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm'>
                <div className='size-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0'>
                  <AlertCircle className='size-5' />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground font-medium uppercase'>
                    Số câu hỏi
                  </p>
                  <p className='font-bold text-sm sm:text-base'>
                    {questions.length} câu
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <h4 className='font-semibold text-sm uppercase tracking-wider text-muted-foreground'>
                Lưu ý trước khi làm bài:
              </h4>
              <ul className='space-y-2'>
                {[
                  'Đảm bảo kết nối internet ổn định.',
                  'Thời gian sẽ bắt đầu tính ngay khi bạn nhấn nút.',
                  'Bạn không thể tạm dừng bài thi sau khi đã bắt đầu.',
                  'Bài thi sẽ tự động nộp khi hết thời gian.',
                ].map((text, i) => (
                  <li key={i} className='flex gap-3 text-sm'>
                    <div className='size-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5'>
                      <Check className='size-3' />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className='p-6 sm:p-8 justify-center'>
            <Button
              size='lg'
              className='w-full sm:w-auto px-12 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all'
              onClick={() => setIsStarted(true)}
            >
              Bắt đầu làm bài
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] gap-4'>
        <p className='text-muted-foreground'>
          Bài thi này chưa có câu hỏi nào.
        </p>
        <Button onClick={() => router.push('/quizzes')}>
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
            return { questionId, textAnswer: value as string };
          } else if (question?.type === 'multiple_choice') {
            return { questionId, selectedOptionIds: value as string[] };
          } else {
            return { questionId, selectedOptionIds: [value as string] };
          }
        },
      );

      const data = await handleSubmitQuiz(quiz.id, {
        timeSpent: (quiz.duration ? quiz.duration * 60 : 3600) - timeLeft,
        answers: formattedAnswers,
      });

      console.log(data);
      router.push(`/quizzes/${quiz.id}/result/${data.id}`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto py-8 px-4 space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 sm:p-4 rounded-xl shadow-sm border sticky top-0 z-10 gap-3'>
        <div className='space-y-0.5 sm:space-y-1 w-full sm:w-auto'>
          <h1 className='font-bold text-base sm:text-lg line-clamp-1'>
            {quiz.title}
          </h1>
          <div className='flex items-center gap-4 text-xs sm:text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Clock className='size-3 sm:size-4' /> {formatTime(timeLeft)}
            </div>
            <div className='flex items-center gap-1'>
              <AlertCircle className='size-3 sm:size-4' /> Câu{' '}
              {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
        </div>
        <Button
          variant='destructive'
          onClick={handleSubmit}
          size='sm'
          className='w-full sm:w-auto'
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

      <div className='grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-3 sm:p-4 bg-white rounded-xl border shadow-sm'>
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestionIndex(idx)}
            className={cn(
              'size-8 sm:size-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center',
              currentQuestionIndex === idx
                ? 'bg-primary text-white shadow-md ring-2 ring-primary/20'
                : answers[q.id]
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-slate-100 text-slate-400',
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
