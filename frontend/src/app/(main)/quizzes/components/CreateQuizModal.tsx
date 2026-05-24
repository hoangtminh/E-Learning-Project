'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QuestionEditor } from './QuestionEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, ListChecks, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useQuiz } from "@/contexts/QuizContext";
import { Quiz } from "@/api/quizzes";

interface CreateQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: Quiz | null;
  onSuccess?: () => void;
}

export function CreateQuizModal({
  open,
  onOpenChange,
  quiz,
  onSuccess,
}: CreateQuizModalProps) {
  const { handleAddQuiz, handleUpdateQuiz } = useQuiz();
  const [activeTab, setActiveTab] = useState('info');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    isPublic: true,
    duration: 30,
    questions: [],
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        isPublic: quiz.isPublic ?? true,
        duration: quiz.duration ?? 30,
        questions: (quiz.questions || []).map((q: any) => {
          if (q.type === 'text') {
            const correctOption = q.options?.find((o: any) => o.isCorrect);
            return { ...q, correctText: correctOption?.content || '' };
          }
          return q;
        }),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        isPublic: true,
        duration: 30,
        questions: [],
      });
    }
  }, [quiz, open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map questions to match backend expectations (especially for text questions)
      const formattedQuestions = formData.questions.map((q: any) => {
        if (q.type === 'text') {
          return {
            ...q,
            options: q.correctText ? [{ content: q.correctText, isCorrect: true }] : []
          };
        }
        return q;
      });

      const dataToSave = { ...formData, questions: formattedQuestions };

      if (quiz?.id) {
        await handleUpdateQuiz(quiz.id, dataToSave);
      } else {
        await handleAddQuiz(dataToSave);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden'>
        <DialogHeader className='p-6 pb-0'>
          <DialogTitle>{quiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết và thêm câu hỏi cho bài kiểm tra của bạn.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex-1 flex flex-col overflow-hidden px-6 pt-4'
        >
          <TabsList className='grid w-fit grid-cols-2'>
            <TabsTrigger value='info' className='gap-2'>
              <LayoutGrid className='size-4' /> Thông tin chung
            </TabsTrigger>
            <TabsTrigger value='questions' className='gap-2'>
              <ListChecks className='size-4' /> Câu hỏi (
              {formData.questions.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className='flex-1 mt-4'>
            <TabsContent value='info' className='space-y-4 pb-4'>
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
                  placeholder='Mô tả ngắn gọn về mục tiêu hoặc nội dung bài kiểm tra...'
                  className='resize-none'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='duration'>Thời gian (phút)</Label>
                  <Input
                    id='duration'
                    type='number'
                    min='1'
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
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
              </div>
            </TabsContent>

            <TabsContent value='questions' className='pb-4'>
              <QuestionEditor
                questions={formData.questions}
                onChange={(questions) =>
                  setFormData({ ...formData, questions })
                }
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className='p-6 border-t bg-slate-50/50'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Lưu Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
