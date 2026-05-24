'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QuestionEditor } from './QuestionEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, ListChecks, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz } from '@/api/quizzes';
import { toast } from 'sonner';

interface QuizEditorProps {
  quiz?: Quiz | null;
}

export function QuizEditor({ quiz }: QuizEditorProps) {
  const router = useRouter();
  const { handleAddQuiz, handleUpdateQuiz } = useQuiz();
  const [activeTab, setActiveTab] = useState('info');
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
      // Map questions to match backend expectations
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

  return (
    <div className='max-w-5xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-20 py-4 border-b'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.back()}>
            <ArrowLeft className='size-5' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              {quiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {formData.title || 'Chưa đặt tiêu đề'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className='mr-2 size-4 animate-spin' />
            ) : (
              <Save className='mr-2 size-4' />
            )}
            {quiz ? 'Cập nhật' : 'Lưu bài thi'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi</CardTitle>
              <CardDescription>
                Thêm và tùy chỉnh các câu hỏi cho bài kiểm tra của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionEditor
                questions={formData.questions}
                onChange={(questions) =>
                  setFormData({ ...formData, questions })
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card className='sticky top-24'>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-2'>
                <Label htmlFor='title'>Tiêu đề</Label>
                <Input
                  id='title'
                  placeholder='Ví dụ: Kiểm tra cuối kỳ môn Lập trình Web'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='description'>Mô tả</Label>
                <Textarea
                  id='description'
                  placeholder='Mô tả ngắn gọn về mục tiêu hoặc nội dung...'
                  className='resize-none h-24'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='duration'>
                  Thời gian (phút, 0 = không giới hạn)
                </Label>
                <Input
                  id='duration'
                  type='number'
                  min='0'
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='startDate'>Ngày bắt đầu (Tùy chọn)</Label>
                <Input
                  id='startDate'
                  type='datetime-local'
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='endDate'>Ngày kết thúc (Tùy chọn)</Label>
                <Input
                  id='endDate'
                  type='datetime-local'
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label>Chế độ hiển thị</Label>
                <div className='flex items-center gap-4 h-10 px-3 border rounded-md'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      checked={formData.isPublic}
                      onChange={() =>
                        setFormData({ ...formData, isPublic: true })
                      }
                    />
                    <span className='text-sm'>Công khai</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      checked={!formData.isPublic}
                      onChange={() =>
                        setFormData({ ...formData, isPublic: false })
                      }
                    />
                    <span className='text-sm'>Riêng tư</span>
                  </label>
                </div>
              </div>

              <div className='pt-4 border-t'>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='text-muted-foreground'>Số câu hỏi:</span>
                  <span className='font-bold'>{formData.questions.length}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Tổng điểm:</span>
                  <span className='font-bold text-primary'>
                    {formData.questions.reduce(
                      (acc: number, q: any) => acc + (q.points || 0),
                      0,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
