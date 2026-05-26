'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QuestionEditor } from './QuestionEditor';
import {
  ArrowLeft,
  Save,
  Loader2,
  Settings,
  LayoutGrid,
  Clock,
  ListChecks,
  SquareCheck,
  Type,
  Calendar,
  Lock,
  Globe,
  Award,
} from 'lucide-react';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz } from '@/api/quizzes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuizEditorProps {
  quiz?: Quiz | null;
}

export function QuizEditor({ quiz }: QuizEditorProps) {
  const router = useRouter();
  const { handleAddQuiz, handleUpdateQuiz } = useQuiz();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    isPublic: true,
    duration: 30, // 0 for unlimited
    startDate: '',
    endDate: '',
    questions: [],
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        isPublic: quiz.isPublic ?? true,
        duration: quiz.duration ?? 0,
        startDate: quiz.startDate
          ? new Date(quiz.startDate).toISOString().slice(0, 16)
          : '',
        endDate: quiz.endDate
          ? new Date(quiz.endDate).toISOString().slice(0, 16)
          : '',
        questions: (quiz.questions || []).map((q: any) => {
          if (q.type === 'text') {
            const correctOption = q.options?.find((o: any) => o.isCorrect);
            return { ...q, correctText: correctOption?.content || '' };
          }
          return q;
        }),
      });
    }
  }, [quiz]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.warning('Vui lòng nhập tiêu đề bài thi');
      return;
    }

    setIsSaving(true);
    try {
      const formattedQuestions = formData.questions.map((q: any) => {
        const { id, ...rest } = q;
        const cleanedOptions = (q.options || []).map(({ id: optId, ...optRest }: any) => optRest);
        
        return {
          ...rest,
          options: q.type === 'text' ? [] : cleanedOptions,
          correctText: q.type === 'text' ? q.correctText : undefined
        };
      });

      const dataToSave = { 
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic,
        duration: formData.duration,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        questions: formattedQuestions 
      };

      if (quiz?.id) {
        await handleUpdateQuiz(quiz.id, dataToSave);
        toast.success('Cập nhật bài thi thành công!');
      } else {
        await handleAddQuiz(dataToSave);
        toast.success('Tạo bài thi mới thành công!');
      }
      router.push('/quizzes');
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      toast.error(error.message || 'Lưu bài thi thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats calculation
  const questionsList = formData.questions || [];
  const singleChoiceCount = questionsList.filter((q: any) => q.type === 'single_choice').length;
  const multipleChoiceCount = questionsList.filter((q: any) => q.type === 'multiple_choice').length;
  const textCount = questionsList.filter((q: any) => q.type === 'text').length;
  const totalPoints = questionsList.reduce((acc: number, q: any) => acc + (q.points || 1), 0);

  return (
    <div className='max-w-6xl mx-auto space-y-4 pb-16'>
      {/* Top Header Navigation */}
      <div className='flex items-center justify-between border-b pb-3 sticky top-0 bg-[#edf0ff] z-30 pt-2 px-2 rounded-lg border-slate-300'>
        <div className='flex items-center gap-2.5'>
          <Button 
            variant='outline' 
            size='icon' 
            onClick={() => router.back()}
            className='bg-white rounded-md hover:bg-slate-100 transition-colors border-slate-300 size-8'
          >
            <ArrowLeft className='size-4 text-slate-600' />
          </Button>
          <div>
            <span className='text-[9px] font-black text-primary uppercase tracking-wider block'>Quiz Builder</span>
            <h1 className='text-base font-bold tracking-tight text-slate-800'>
              {quiz ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}
            </h1>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.back()}
            disabled={isSaving}
            className='bg-white rounded-md text-slate-600 border-slate-300 h-8 text-xs font-semibold'
          >
            Hủy
          </Button>
          <Button 
            size='sm'
            onClick={handleSave} 
            disabled={isSaving}
            className='bg-primary hover:bg-primary-dim text-white font-bold rounded-md shadow transition-colors h-8 text-xs'
          >
            {isSaving ? (
              <Loader2 className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Save className='mr-1.5 size-3.5' />
            )}
            {quiz ? 'Cập nhật' : 'Xuất bản'}
          </Button>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        
        {/* Left Column: Editor Fields & Question list */}
        <div className='lg:col-span-8 space-y-3'>
          
          {/* Title & Description Container */}
          <div className='bg-white border border-slate-200 rounded-md p-3 shadow-sm space-y-1.5'>
            <input
              type='text'
              placeholder='Nhập tiêu đề bài trắc nghiệm...'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className='w-full bg-transparent border-none text-lg font-extrabold text-slate-800 placeholder:text-slate-350 focus:ring-0 p-0 focus:outline-none'
            />
            <Textarea
              placeholder='Nhập mô tả ngắn hoặc hướng dẫn làm bài...'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className='w-full bg-transparent rounded-sm border-none text-slate-500 placeholder:text-slate-400 focus:ring-0 p-0 focus:outline-none resize-none h-12 text-xs leading-relaxed'
            />
          </div>

          {/* Question List Card */}
          <div className='bg-white border border-slate-200 rounded-md p-3 shadow-sm space-y-2'>
            <div>
              <h2 className='text-xs font-bold text-slate-850'>Nội dung câu hỏi</h2>
              <p className='text-[9px] text-slate-400 mt-0.5'>
                Danh sách các câu hỏi trong bài thi
              </p>
            </div>
            <div className='pt-1'>
              <QuestionEditor
                questions={formData.questions}
                onChange={(questions) => setFormData({ ...formData, questions })}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Settings & Stats Sidebar */}
        <div className='lg:col-span-4 space-y-3'>
          <div className='sticky top-20 space-y-3'>
            
            {/* General Settings Box */}
            <div className='bg-white border border-slate-200 rounded-md p-3 shadow-sm space-y-3'>
              <div className='flex items-center gap-1.5 pb-1.5 border-b border-slate-100'>
                <Settings className='size-3.5 text-primary' />
                <h3 className='font-bold text-[10px] uppercase text-slate-700 tracking-wider'>Cấu hình</h3>
              </div>

              {/* Time limit */}
              <div className='space-y-1'>
                <Label htmlFor='duration' className='text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1'>
                  <Clock className='size-3 text-slate-455' />
                  Thời gian làm bài
                </Label>
                <div className='relative'>
                  <Input
                    id='duration'
                    type='number'
                    min='0'
                    placeholder='30'
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className='border-slate-200 rounded-md pr-10 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 font-semibold h-8 text-xs bg-slate-50/50'
                  />
                  <span className='absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 pointer-events-none'>Phút</span>
                </div>
              </div>

              {/* Dates */}
              <div className='space-y-1'>
                <Label htmlFor='startDate' className='text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1'>
                  <Calendar className='size-3 text-slate-455' />
                  Ngày bắt đầu (Tùy chọn)
                </Label>
                <Input
                  id='startDate'
                  type='datetime-local'
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className='border-slate-200 rounded-md focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs font-medium h-8 bg-slate-50/50'
                />
              </div>

              <div className='space-y-1'>
                <Label htmlFor='endDate' className='text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1'>
                  <Calendar className='size-3 text-slate-455' />
                  Ngày kết thúc (Tùy chọn)
                </Label>
                <Input
                  id='endDate'
                  type='datetime-local'
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className='border-slate-200 rounded-md focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs font-medium h-8 bg-slate-50/50'
                />
              </div>

              {/* Visibility */}
              <div className='space-y-1'>
                <Label className='text-[9px] font-bold text-slate-500 uppercase tracking-wider block'>Chế độ hiển thị</Label>
                <div className='grid grid-cols-2 gap-1.5'>
                  <button
                    type='button'
                    onClick={() => setFormData({ ...formData, isPublic: true })}
                    className={cn(
                      'flex items-center justify-center gap-1 py-1 rounded-md border font-bold text-[9px] transition-colors',
                      formData.isPublic
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-650 bg-white'
                    )}
                  >
                    <Globe className='size-3' /> Public
                  </button>
                  <button
                    type='button'
                    onClick={() => setFormData({ ...formData, isPublic: false })}
                    className={cn(
                      'flex items-center justify-center gap-1 py-1 rounded-md border font-bold text-[9px] transition-colors',
                      !formData.isPublic
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-655 bg-white'
                    )}
                  >
                    <Lock className='size-3' /> Private
                  </button>
                </div>
              </div>
            </div>

            {/* Quiz Summary Box */}
            <div className='bg-white border border-slate-200 rounded-md p-3 shadow-sm space-y-2.5'>
              <div className='flex items-center gap-1.5 pb-1.5 border-b border-slate-100'>
                <LayoutGrid className='size-3.5 text-primary' />
                <h3 className='font-bold text-[10px] uppercase text-slate-700 tracking-wider'>Tóm tắt</h3>
              </div>

              <div className='space-y-1'>
                <div className='flex justify-between items-center text-[10px] font-bold text-slate-700 bg-slate-200/85 p-1.5 rounded border border-slate-300'>
                  <span className='flex items-center gap-1.5'><ListChecks className='size-3.5 text-primary' /> Chọn một</span>
                  <span className='bg-slate-300/80 text-slate-800 px-1.5 py-0.5 rounded text-[9px]'>{singleChoiceCount}</span>
                </div>
                <div className='flex justify-between items-center text-[10px] font-bold text-slate-700 bg-slate-200/85 p-1.5 rounded border border-slate-300'>
                  <span className='flex items-center gap-1.5'><SquareCheck className='size-3.5 text-tertiary' /> Chọn nhiều</span>
                  <span className='bg-slate-300/80 text-slate-800 px-1.5 py-0.5 rounded text-[9px]'>{multipleChoiceCount}</span>
                </div>
                <div className='flex justify-between items-center text-[10px] font-bold text-slate-700 bg-slate-200/85 p-1.5 rounded border border-slate-300'>
                  <span className='flex items-center gap-1.5'><Type className='size-3.5 text-slate-500' /> Tự luận</span>
                  <span className='bg-slate-300/80 text-slate-800 px-1.5 py-0.5 rounded text-[9px]'>{textCount}</span>
                </div>
              </div>

              <div className='pt-2 border-t border-slate-150 space-y-1'>
                <div className='flex justify-between items-center text-xs font-bold text-slate-700'>
                  <span className='uppercase tracking-widest text-slate-450 text-[9px]'>Số câu hỏi</span>
                  <span className='text-slate-850'>{questionsList.length} câu</span>
                </div>
                <div className='flex justify-between items-center text-xs font-bold text-slate-700'>
                  <span className='uppercase tracking-widest text-slate-455 text-[9px]'>Tổng điểm</span>
                  <span className='text-primary font-black flex items-center gap-0.5'><Award className='size-3.5' /> {totalPoints}đ</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
