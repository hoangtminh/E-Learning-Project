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
  Bookmark,
  Award,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz, SubmitQuizResponse } from '@/api/quizzes';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const { handleSubmitQuiz } = useQuiz();
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(
    quiz.duration ? quiz.duration * 60 : 3600
  );
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isFinished]);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleAutoSubmit = async () => {
    toast.info('Hết giờ làm bài! Hệ thống đang tự động nộp bài...');
    await performSubmit();
  };

  const performSubmit = async () => {
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
        }
      );

      const data = await handleSubmitQuiz(quiz.id, {
        timeSpent: (quiz.duration ? quiz.duration * 60 : 3600) - timeLeft,
        answers: formattedAnswers,
      });

      toast.success('Nộp bài thi thành công!');
      router.push(`/quizzes/${quiz.id}/result/${data.id}`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Gặp lỗi khi nộp bài. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = () => {
    const unansweredCount = questions.filter(q => {
      const ans = answers[q.id];
      if (q.type === 'multiple_choice') return !ans || ans.length === 0;
      return !ans;
    }).length;

    const message = unansweredCount > 0 
      ? `Bạn còn ${unansweredCount} câu hỏi chưa trả lời. Bạn có chắc chắn muốn nộp bài thi?`
      : 'Bạn đã trả lời hết các câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?';

    if (window.confirm(message)) {
      void performSubmit();
    }
  };

  if (!isStarted) {
    return (
      <div className='max-w-xl mx-auto py-4 px-3'>
        <Card className='border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden'>
          <div className='h-2 bg-primary' />
          <CardHeader className='text-center space-y-2 pb-3 pt-4'>
            <div className='mx-auto size-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center mb-1'>
              <BookOpen className='size-5' />
            </div>
            <div className='space-y-1'>
              <CardTitle className='text-lg font-black text-slate-800'>{quiz.title}</CardTitle>
              <div className='text-slate-500 text-xs max-w-sm mx-auto leading-relaxed'>
                {quiz.description || 'Bài thi trắc nghiệm & tự luận.'}
              </div>
            </div>
          </CardHeader>
          <CardContent className='grid gap-3 border-y border-slate-200 bg-slate-100/70 p-3 sm:p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex items-center gap-2 p-2 bg-white rounded-md border border-slate-200 shadow-sm'>
                <div className='size-8 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center shrink-0'>
                  <Clock className='size-4' />
                </div>
                <div>
                  <p className='text-[9px] text-slate-400 font-bold uppercase tracking-wider'>Time</p>
                  <p className='font-extrabold text-slate-700 text-xs'>{quiz.duration ? `${quiz.duration}m` : 'Unlimited'}</p>
                </div>
              </div>
              <div className='flex items-center gap-2 p-2 bg-white rounded-md border border-slate-200 shadow-sm'>
                <div className='size-8 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0'>
                  <AlertCircle className='size-4' />
                </div>
                <div>
                  <p className='text-[9px] text-slate-400 font-bold uppercase tracking-wider'>Questions</p>
                  <p className='font-extrabold text-slate-700 text-xs'>{questions.length} câu</p>
                </div>
              </div>
            </div>

            <div className='space-y-2 bg-white p-3 rounded-md border border-slate-200 shadow-sm'>
              <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400'>Lưu ý:</h4>
              <ul className='space-y-1.5'>
                {['Mạng ổn định', 'Thời gian chạy liên tục', 'Tự động nộp khi hết giờ'].map((text, i) => (
                  <li key={i} className='flex gap-2 text-xs text-slate-600 font-semibold'>
                    <Check className='size-3 text-emerald-600 mt-0.5 shrink-0' />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className='p-3 justify-center'>
            <Button
              size='sm'
              className='w-full py-1.5 bg-primary hover:bg-primary-dim text-white font-extrabold rounded-md shadow-sm'
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
        <p className='text-slate-400 text-sm'>
          Bài thi này chưa có câu hỏi nào.
        </p>
        <Button onClick={() => router.push('/quizzes')} className='rounded-md' size='sm'>
          Quay lại thư viện
        </Button>
      </div>
    );
  }

  // Answer counting for stats
  const answeredCount = questions.filter(q => {
    const ans = answers[q.id];
    if (q.type === 'multiple_choice') return ans && ans.length > 0;
    return ans && ans.toString().trim() !== '';
  }).length;
  const remainingCount = questions.length - answeredCount;
  const flaggedCount = flaggedQuestions.size;

  return (
    <div className='w-full max-w-5xl mx-auto px-1.5 py-2.5 space-y-2.5'>
      
      {/* Top Banner Navigation bar */}
      <nav className='bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 z-30 gap-2 shadow-sm'>
        <div className='flex items-center gap-2 min-w-0'>
          <div className='size-7 bg-primary/20 rounded-md flex items-center justify-center shrink-0 text-primary'>
            <Award className='size-4' />
          </div>
          <div className='min-w-0'>
            <h1 className='font-black text-slate-800 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[400px]'>
              {quiz.title}
            </h1>
          </div>
        </div>

        <div className='flex items-center gap-1.5 shrink-0'>
          {/* Time Counter Pill */}
          <div className={cn(
            'flex items-center bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 text-slate-600 transition-all font-mono font-bold text-xs shrink-0',
            timeLeft < 60 && 'bg-rose-100 border-rose-200 text-rose-600 animate-pulse'
          )}>
            <Clock className='size-3.5 mr-1 shrink-0' />
            <span id="timer-display" className='font-mono tracking-wider'>{formatTime(timeLeft)}</span>
          </div>

          <Button
            onClick={handleConfirmSubmit}
            disabled={isSubmitting}
            className='bg-slate-800 hover:bg-primary hover:shadow-primary/10 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md shadow-sm transition-all h-7.5 shrink-0'
          >
            {isSubmitting ? (
              <Loader2 className='mr-1 size-3 animate-spin' />
            ) : (
              <Send className='mr-1 size-3' />
            )}
            Nộp bài
          </Button>
        </div>
      </nav>

      {/* Main Grid Section */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-3.5'>
        
        {/* Left Side: Question content area */}
        <div className='lg:col-span-8 space-y-2.5'>
          
          {/* Core Question Card */}
          <Card className='border border-slate-200 bg-white rounded-lg p-3 shadow-sm space-y-3 overflow-hidden'>
            <div className='flex justify-between items-center pb-1.5 border-b border-slate-100'>
              <Badge variant='secondary' className='rounded px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600'>
                {currentQuestion.points || 1} Điểm
              </Badge>
              <Badge variant='outline' className='rounded px-1.5 py-0.5 text-[10px] font-semibold border-slate-200 text-slate-500'>
                {currentQuestion.type === 'single_choice'
                  ? 'Chọn 1 đáp án'
                  : currentQuestion.type === 'multiple_choice'
                    ? 'Chọn nhiều'
                    : 'Tự luận'}
              </Badge>
            </div>

            {/* Question Text */}
            <div className='text-slate-800 font-extrabold text-sm leading-relaxed bg-slate-100/60 p-2.5 rounded-md border border-slate-200/60'>
              {currentQuestion.content}
            </div>

            {/* Question Answer Inputs */}
            <div className='space-y-1.5'>
              {currentQuestion.type === 'text' ? (
                <Textarea
                  placeholder='Nhập câu trả lời...'
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                  className='min-h-[80px] border-slate-200 rounded-md focus:border-slate-400 focus:ring-1 focus:ring-slate-400 font-medium text-slate-700 p-2.5 text-xs'
                />
              ) : (
                <div className='grid gap-1.5'>
                  {currentQuestion.options.map((opt: any, optIdx: number) => {
                    const isSingle = currentQuestion.type === 'single_choice';
                    const isSelected = isSingle 
                      ? answers[currentQuestion.id] === opt.id
                      : (answers[currentQuestion.id] || []).includes(opt.id);

                    return (
                      <button
                        key={opt.id || optIdx}
                        onClick={() =>
                          isSingle
                            ? handleAnswerChange(currentQuestion.id, opt.id)
                            : toggleOption(currentQuestion.id, opt.id)
                        }
                        className={cn(
                          'flex items-center gap-2.5 p-2 px-3 rounded-md border text-left transition-all duration-200 active:scale-[0.99] font-bold text-xs sm:text-sm',
                          isSelected
                            ? 'border-primary bg-primary/15 text-primary shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        )}
                      >
                        <div
                          className={cn(
                            'size-3.5 border flex items-center justify-center shrink-0 transition-all',
                            isSingle ? 'rounded-full' : 'rounded',
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {isSelected && <Check className='size-2.5 stroke-[3]' />}
                        </div>
                        <span className='flex-1 leading-normal'>{opt.content}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Option Buttons Bottom */}
            <div className='flex flex-col sm:flex-row justify-between items-center gap-2 pt-2.5 border-t border-slate-100'>
              <Button
                variant='ghost'
                size='sm'
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className='text-slate-500 hover:bg-slate-50 rounded-md w-full sm:w-auto justify-center h-8 text-xs font-semibold'
              >
                <ChevronLeft className='mr-1 size-3.5' /> Câu trước
              </Button>

              <div className='flex flex-col sm:flex-row items-center gap-1.5 w-full sm:w-auto justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={cn(
                    'rounded-md border-slate-300 text-slate-500 hover:bg-slate-50 w-full sm:w-auto font-bold h-8 text-xs',
                    flaggedQuestions.has(currentQuestion.id) && 'border-tertiary text-tertiary bg-tertiary/15 hover:bg-tertiary/20'
                  )}
                >
                  <Bookmark className='mr-1 size-3.5' /> 
                  {flaggedQuestions.has(currentQuestion.id) ? 'Bỏ đánh dấu' : 'Xem lại'}
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <Button 
                    size='sm'
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className='bg-primary hover:bg-primary-dim text-white font-bold rounded-md shadow-sm w-full sm:w-auto h-8 text-xs'
                  >
                    Lưu & Tiếp <ChevronRight className='ml-1 size-3.5' />
                  </Button>
                ) : (
                  <Button
                    variant='default'
                    size='sm'
                    onClick={handleConfirmSubmit}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-sm w-full sm:w-auto h-8 text-xs'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className='mr-1 size-3 animate-spin' />
                    ) : (
                      <CheckCircle2 className='mr-1 size-3' />
                    )}
                    Nộp bài
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Sticky Question grid Map */}
        <div className='lg:col-span-4'>
          <div className='sticky top-20 space-y-3'>
            
            {/* Bento map card */}
            <div className='bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-3'>
              <div className='flex items-center justify-between pb-1.5 border-b border-slate-100'>
                <h3 className='font-bold text-slate-800 text-xs uppercase tracking-wider'>Bản đồ</h3>
                <span className='text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-bold'>{questions.length} Câu</span>
              </div>

              {/* Bento Grid */}
              <div className='grid grid-cols-5 gap-1'>
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = answers[q.id] && (
                    q.type === 'multiple_choice' ? answers[q.id].length > 0 : answers[q.id].toString().trim() !== ''
                  );
                  const isFlagged = flaggedQuestions.has(q.id);

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={cn(
                        'aspect-square flex items-center justify-center rounded-md text-xs font-extrabold transition-all duration-200 active:scale-90',
                        isCurrent
                          ? 'border-2 border-primary bg-primary/20 text-primary font-black shadow-[0_0_8px_rgba(0,99,130,0.15)]'
                          : isFlagged
                            ? 'bg-tertiary text-white border-none'
                            : isAnswered
                              ? 'bg-primary/20 text-primary border-none'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/40'
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend Stats info */}
              <div className='pt-2 border-t border-slate-100 space-y-1 text-[11px] font-bold text-slate-500'>
                <div className='flex items-center justify-between p-1 rounded bg-slate-100'>
                  <span className='flex items-center'><span className='w-2.5 h-2.5 rounded bg-primary/20 mr-2 shrink-0' />Đã trả lời</span>
                  <span className='text-slate-800 font-extrabold'>{answeredCount}</span>
                </div>
                <div className='flex items-center justify-between p-1 rounded bg-slate-100'>
                  <span className='flex items-center'><span className='w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300 mr-2 shrink-0' />Còn lại</span>
                  <span className='text-slate-800 font-extrabold'>{remainingCount}</span>
                </div>
                <div className='flex items-center justify-between p-1 rounded bg-slate-100'>
                  <span className='flex items-center'><span className='w-2.5 h-2.5 rounded bg-tertiary mr-2 shrink-0' />Xem lại</span>
                  <span className='text-slate-800 font-extrabold'>{flaggedCount}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className='w-full py-2 rounded-md bg-slate-800 hover:bg-primary text-white font-extrabold text-[10px] uppercase tracking-widest transition-colors duration-200 active:scale-95'
              >
                Nộp bài ngay
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
