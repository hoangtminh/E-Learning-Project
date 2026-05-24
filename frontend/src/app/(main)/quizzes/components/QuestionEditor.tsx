'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Check,
  Type,
  ListChecks,
  SquareCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Question, QuestionType } from '@/api/quizzes';
import { Label } from '@/components/ui/label';

interface QuestionEditorProps {
  questions: Question[]; // The backend might have a different structure, so I'll keep any[] but use internal types for logic
  onChange: (questions: any[]) => void;
}

export function QuestionEditor({ questions, onChange }: QuestionEditorProps) {
  const addQuestion = (type: QuestionType) => {
    const newQuestion = {
      content: '',
      type: type, // single_choice, multiple_choice, text
      options:
        type === 'text'
          ? []
          : [
              { id: '1', content: 'Đáp án 1', isCorrect: true },
              { id: '2', content: 'Đáp án 2', isCorrect: false },
            ],
      correctText: '',
    };
    onChange([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: any) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const newOption = {
      content: `Đáp án ${question.options.length + 1}`,
      isCorrect: false,
    };
    updateQuestion(questionId, { options: [...question.options, newOption] });
  };

  const removeOption = (questionId: string, optionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    updateQuestion(questionId, {
      options: question.options.filter((o) => o.id !== optionId),
    });
  };

  const toggleOptionCorrect = (questionId: string, optionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = question.options.map((o) => {
      if (o.id === optionId) return { ...o, isCorrect: !o.isCorrect };
      if (question.type === 'single_choice') return { ...o, isCorrect: false };
      return o;
    });

    updateQuestion(questionId, { options: newOptions });
  };

  return (
    <div className='space-y-6'>
      {questions.map((q, index) => (
        <div
          key={q.id}
          className='border rounded-lg p-4 bg-white shadow-sm space-y-4'
        >
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Badge variant='outline'>Câu {index + 1}</Badge>
              <span className='text-xs text-muted-foreground uppercase font-bold tracking-wider'>
                {q.type === 'single_choice'
                  ? 'Chọn một'
                  : q.type === 'multiple_choice'
                    ? 'Chọn nhiều'
                    : 'Tự luận/Text'}
              </span>
            </div>
            <Button
              variant='ghost'
              size='icon-xs'
              onClick={() => removeQuestion(q.id)}
              className='text-destructive'
            >
              <Trash2 className='size-4' />
            </Button>
          </div>

          <div className='space-y-2'>
            <Textarea
              placeholder='Nhập nội dung câu hỏi...'
              value={q.content}
              onChange={(e) =>
                updateQuestion(q.id, { content: e.target.value })
              }
              className='min-h-[60px]'
            />
          </div>

          {q.type !== 'text' ? (
            <div className='space-y-3'>
              <p className='text-xs font-semibold text-muted-foreground uppercase'>
                Các phương án trả lời
              </p>
              {q.options.map((opt) => (
                <div key={opt.id} className='flex items-center gap-2'>
                  <Button
                    variant={opt.isCorrect ? 'default' : 'outline'}
                    size='icon-xs'
                    className='shrink-0'
                    onClick={() => toggleOptionCorrect(q.id, opt.id)}
                  >
                    {opt.isCorrect && <Check className='size-3' />}
                  </Button>
                  <Input
                    value={opt.content}
                    onChange={(e) => {
                      const newOptions = q.options.map((o) =>
                        o.id === opt.id ? { ...o, content: e.target.value } : o,
                      );
                      updateQuestion(q.id, { options: newOptions });
                    }}
                    className='flex-1 h-8 text-sm'
                  />
                  <Button
                    variant='ghost'
                    size='icon-xs'
                    onClick={() => removeOption(q.id, opt.id)}
                  >
                    <Trash2 className='size-3' />
                  </Button>
                </div>
              ))}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => addOption(q.id)}
                className='w-full border-dashed border-2'
              >
                <Plus className='mr-2 size-3' /> Thêm phương án
              </Button>
            </div>
          ) : (
            <div className='space-y-2'>
              <Label className='text-xs text-muted-foreground uppercase'>
                Đáp án mong muốn (để chấm điểm tự động)
              </Label>
              <Input
                placeholder='Ví dụ: 12.5 hoặc Hanoi'
                value={q.correctText}
                onChange={(e) =>
                  updateQuestion(q.id, { correctText: e.target.value })
                }
              />
            </div>
          )}
        </div>
      ))}

      <div className='flex flex-col gap-3 py-4'>
        <p className='text-sm font-medium text-center text-muted-foreground'>
          Thêm câu hỏi mới
        </p>
        <div className='grid grid-cols-3 gap-2'>
          <Button
            variant='outline'
            className='flex flex-col h-16 gap-1'
            onClick={() => addQuestion('single_choice')}
          >
            <ListChecks className='size-4' />
            <span className='text-[10px]'>Chọn một</span>
          </Button>
          <Button
            variant='outline'
            className='flex flex-col h-16 gap-1'
            onClick={() => addQuestion('multiple_choice')}
          >
            <SquareCheck className='size-4' />
            <span className='text-[10px]'>Chọn nhiều</span>
          </Button>
          <Button
            variant='outline'
            className='flex flex-col h-16 gap-1'
            onClick={() => addQuestion('text')}
          >
            <Type className='size-4' />
            <span className='text-[10px]'>Text</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
