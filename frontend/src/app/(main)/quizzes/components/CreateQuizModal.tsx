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
      <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-lg'>
        <DialogHeader className='p-4 pb-0'>
          <DialogTitle className="text-base font-bold text-slate-800">{quiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}</DialogTitle>
          <DialogDescription className="text-xs">
            Điền thông tin chi tiết và thêm câu hỏi cho bài kiểm tra của bạn.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex-1 flex flex-col overflow-hidden px-4 pt-3'
        >
          <TabsList className='grid w-fit grid-cols-2 h-8 p-0.5 rounded-md bg-slate-100'>
            <TabsTrigger value='info' className='gap-1.5 px-3 py-1 text-xs rounded-sm'>
              <LayoutGrid className='size-3.5' /> Thông tin chung
            </TabsTrigger>
            <TabsTrigger value='questions' className='gap-1.5 px-3 py-1 text-xs rounded-sm'>
              <ListChecks className='size-3.5' /> Câu hỏi (
              {formData.questions.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className='flex-1 mt-3'>
            <TabsContent value='info' className='space-y-3 pb-3'>
              <div className='grid gap-1.5'>
                <Label htmlFor='title' className="text-xs font-semibold text-slate-600">Tiêu đề</Label>
                <Input
                  id='title'
                  placeholder='Ví dụ: Kiểm tra cuối kỳ môn Lập trình Web'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="h-8 text-xs rounded-md border-slate-200"
                />
              </div>
              <div className='grid gap-1.5'>
                <Label htmlFor='description' className="text-xs font-semibold text-slate-600">Mô tả</Label>
                <Textarea
                  id='description'
                  placeholder='Mô tả ngắn gọn về mục tiêu hoặc nội dung bài kiểm tra...'
                  className='resize-none text-xs rounded-md border-slate-200 min-h-[60px]'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='duration' className="text-xs font-semibold text-slate-600">Thời gian (phút)</Label>
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
                    className="h-8 text-xs rounded-md border-slate-200"
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label className="text-xs font-semibold text-slate-600">Chế độ hiển thị</Label>
                  <div className='flex items-center gap-4 h-8 px-3 border rounded-md border-slate-200'>
                    <label className='flex items-center gap-1.5 cursor-pointer text-xs'>
                      <input
                        type='radio'
                        checked={formData.isPublic}
                        onChange={() =>
                          setFormData({ ...formData, isPublic: true })
                        }
                      />
                      <span>Công khai</span>
                    </label>
                    <label className='flex items-center gap-1.5 cursor-pointer text-xs'>
                      <input
                        type='radio'
                        checked={!formData.isPublic}
                        onChange={() =>
                          setFormData({ ...formData, isPublic: false })
                        }
                      />
                      <span>Riêng tư</span>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='questions' className='pb-3'>
              <QuestionEditor
                questions={formData.questions}
                onChange={(questions) =>
                  setFormData({ ...formData, questions })
                }
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className='p-4 border-t bg-slate-100/70 gap-2'>
          <Button variant='outline' size='sm' onClick={() => onOpenChange(false)} disabled={isSaving} className="h-8 text-xs rounded-md border-slate-300">
            Hủy
          </Button>
          <Button size='sm' onClick={handleSave} disabled={isSaving} className="h-8 text-xs rounded-md bg-primary text-white hover:bg-primary-dim">
            {isSaving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Lưu Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
