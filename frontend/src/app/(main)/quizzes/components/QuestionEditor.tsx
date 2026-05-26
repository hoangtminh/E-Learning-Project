'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Check,
  ListChecks,
  SquareCheck,
  Type,
  X,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Question, QuestionType } from '@/api/quizzes';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  questions: any[];
  onChange: (questions: any[]) => void;
}

export function QuestionEditor({ questions, onChange }: QuestionEditorProps) {
  const addQuestion = (type: QuestionType) => {
    const newQuestion = {
      id: 'temp-' + Math.random().toString(36).substring(2, 9),
      content: '',
      type: type, // single_choice, multiple_choice, text
      points: 1,
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
      id: 'opt-' + Math.random().toString(36).substring(2, 9),
      content: `Đáp án ${question.options.length + 1}`,
      isCorrect: false,
    };
    updateQuestion(questionId, { options: [...question.options, newOption] });
  };

  const removeOption = (questionId: string, optionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    updateQuestion(questionId, {
      options: question.options.filter((o: any) => o.id !== optionId),
    });
  };

  const toggleOptionCorrect = (questionId: string, optionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = question.options.map((o: any) => {
      if (o.id === optionId) return { ...o, isCorrect: !o.isCorrect };
      if (question.type === 'single_choice') return { ...o, isCorrect: false };
      return o;
    });

    updateQuestion(questionId, { options: newOptions });
  };

  return (
    <div className='space-y-3'>
      {questions.map((q, index) => {
        const isSingle = q.type === 'single_choice';
        const isMultiple = q.type === 'multiple_choice';
        const isText = q.type === 'text';

        return (
          <div
            key={q.id || index}
            className={cn(
              'border bg-white rounded-md p-3 shadow-sm space-y-3 transition-all duration-300 hover:shadow border-l-4 border-slate-300',
              isSingle && 'border-l-primary',
              isMultiple && 'border-l-tertiary',
              isText && 'border-l-slate-400'
            )}
          >
            {/* Header Area */}
            <div className='flex justify-between items-center pb-1.5 border-b border-slate-200'>
              <div className='flex items-center gap-1.5'>
                <div
                  className={cn(
                    'w-7 h-7 rounded bg-slate-100 flex items-center justify-center shrink-0',
                    isSingle && 'bg-primary/20 text-primary',
                    isMultiple && 'bg-tertiary/20 text-tertiary',
                    isText && 'bg-slate-200 text-slate-650'
                  )}
                >
                  {isSingle && <ListChecks className='size-3.5' />}
                  {isMultiple && <SquareCheck className='size-3.5' />}
                  {isText && <Type className='size-3.5' />}
                </div>
                <div>
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase tracking-widest block',
                      isSingle && 'text-primary',
                      isMultiple && 'text-tertiary',
                      isText && 'text-slate-600'
                    )}
                  >
                    Câu hỏi {index + 1} — {isSingle ? 'Chọn một' : isMultiple ? 'Chọn nhiều' : 'Tự luận'}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1 shrink-0'>
                  <label className='text-[9px] font-bold text-slate-400 uppercase'>Điểm:</label>
                  <input
                    type='number'
                    min='1'
                    value={q.points || 1}
                    onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                    className='w-10 h-6 px-1 border border-slate-350 rounded text-center text-xs font-bold focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-slate-50'
                  />
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => removeQuestion(q.id)}
                  className='text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors size-6'
                >
                  <Trash2 className='size-3.5' />
                </Button>
              </div>
            </div>

            {/* Question Text */}
            <div className='space-y-1'>
              <Label className='text-[9px] font-bold text-slate-400 uppercase tracking-wider'>
                Nội dung câu hỏi
              </Label>
              <Textarea
                placeholder='Nhập câu hỏi tại đây...'
                value={q.content}
                onChange={(e) =>
                  updateQuestion(q.id, { content: e.target.value })
                }
                className='min-h-[52px] bg-slate-100/90 border-slate-200 rounded focus:bg-white transition-all text-slate-800 text-xs font-medium p-2'
              />
            </div>

            {!isText ? (
              <div className='space-y-1.5 pl-0 sm:pl-8'>
                <div className='flex items-center justify-between'>
                  <Label className='text-[9px] font-bold text-slate-400 uppercase tracking-wider'>
                    Phương án trả lời (Click chọn đáp án đúng)
                  </Label>
                </div>

                <div className='space-y-1.5'>
                  {q.options.map((opt: any, optIdx: number) => {
                    const isCorrect = opt.isCorrect;
                    return (
                      <div
                        key={opt.id || optIdx}
                        className={cn(
                          'flex items-center gap-2 p-1 px-2 border rounded bg-slate-100/60 transition-all duration-200 hover:bg-slate-100/90 border-slate-300',
                          isCorrect && 'border-emerald-500 bg-emerald-100/40'
                        )}
                      >
                        {/* Correct Selector Badge Button */}
                        <button
                          type='button'
                          onClick={() => toggleOptionCorrect(q.id, opt.id)}
                          className={cn(
                            'size-4.5 rounded border flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95',
                            isSingle && 'rounded-full',
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          )}
                        >
                          {isCorrect && <Check className='size-2.5 stroke-[3]' />}
                        </button>

                        {/* Content input */}
                        <Input
                          value={opt.content}
                          onChange={(e) => {
                            const newOptions = q.options.map((o: any) =>
                              o.id === opt.id ? { ...o, content: e.target.value } : o
                            );
                            updateQuestion(q.id, { options: newOptions });
                          }}
                          className={cn(
                            'flex-1 h-6.5 text-xs font-medium bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-400',
                            isCorrect ? 'text-emerald-900 font-bold' : 'text-slate-700'
                          )}
                          placeholder={`Nhập phương án ${optIdx + 1}...`}
                        />

                        {/* Remove Option Button */}
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => removeOption(q.id, opt.id)}
                          className='text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded size-5.5 shrink-0'
                          disabled={q.options.length <= 2}
                        >
                          <X className='size-3' />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <button
                  type='button'
                  onClick={() => addOption(q.id)}
                  className='w-full py-1.5 rounded border border-dashed border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-650 font-semibold text-[9px] flex items-center justify-center gap-1 transition-all duration-200'
                >
                  <Plus className='size-3' /> Thêm phương án trả lời
                </button>
              </div>
            ) : (
              <div className='space-y-1 pl-0 sm:pl-8'>
                <Label className='text-[9px] font-bold text-slate-400 uppercase tracking-wider block'>
                  Đáp án chính xác
                </Label>
                <Input
                  placeholder='Ví dụ: Hà Nội hoặc 12.5...'
                  value={q.correctText || ''}
                  onChange={(e) =>
                    updateQuestion(q.id, { correctText: e.target.value })
                  }
                  className='border-slate-300 rounded focus:border-slate-450 focus:ring-1 focus:ring-slate-450 text-xs font-medium h-7.5 bg-slate-50'
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Add new question type section */}
      <div className='pt-3 border-t border-slate-200 space-y-2'>
        <p className='text-[9px] font-black uppercase tracking-wider text-slate-450 text-center'>
          Thêm câu hỏi mới vào bài thi
        </p>
        <div className='grid grid-cols-3 gap-2 max-w-sm mx-auto'>
          <button
            type='button'
            className='flex flex-col items-center justify-center p-1.5 rounded-md border border-slate-300 hover:border-primary hover:bg-primary/20 transition-all duration-200 group active:scale-95'
            onClick={() => addQuestion('single_choice')}
          >
            <div className='w-5.5 h-5.5 rounded bg-primary/25 text-primary flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform'>
              <ListChecks className='size-3' />
            </div>
            <span className='font-bold text-slate-700 text-[9px]'>Chọn một</span>
          </button>
          <button
            type='button'
            className='flex flex-col items-center justify-center p-1.5 rounded-md border border-slate-300 hover:border-tertiary hover:bg-tertiary/20 transition-all duration-200 group active:scale-95'
            onClick={() => addQuestion('multiple_choice')}
          >
            <div className='w-5.5 h-5.5 rounded bg-tertiary/25 text-tertiary flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform'>
              <SquareCheck className='size-3' />
            </div>
            <span className='font-bold text-slate-700 text-[9px]'>Chọn nhiều</span>
          </button>
          <button
            type='button'
            className='flex flex-col items-center justify-center p-1.5 rounded-md border border-slate-300 hover:border-slate-500 hover:bg-slate-200 transition-all duration-200 group active:scale-95'
            onClick={() => addQuestion('text')}
          >
            <div className='w-5.5 h-5.5 rounded bg-slate-200 text-slate-700 flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform'>
              <Type className='size-3' />
            </div>
            <span className='font-bold text-slate-700 text-[9px]'>Tự luận</span>
          </button>
        </div>
      </div>
    </div>
  );
}
