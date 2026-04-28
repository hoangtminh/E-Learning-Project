'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  daysLeft: number;
  submitted: boolean;
  grade?: number;
}

interface AssignmentsDueProps {
  assignments?: Assignment[];
  isLoading?: boolean;
}

const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Quiz: Async/Await Patterns',
    course: 'JavaScript Deep Dive',
    dueDate: '2026-04-25',
    daysLeft: 6,
    submitted: false,
  },
  {
    id: '2',
    title: 'Project: Build a Chat App',
    course: 'React Advanced Patterns',
    dueDate: '2026-04-20',
    daysLeft: 1,
    submitted: false,
  },
  {
    id: '3',
    title: 'Design Exercise: Landing Page',
    course: 'Web Design Fundamentals',
    dueDate: '2026-05-02',
    daysLeft: 13,
    submitted: false,
  },
  {
    id: '4',
    title: 'Reading: Design Patterns',
    course: 'JavaScript Deep Dive',
    dueDate: '2026-04-18',
    daysLeft: -1,
    submitted: true,
    grade: 95,
  },
];

function getDueSoonColor(daysLeft: number) {
  if (daysLeft < 0) return 'text-muted-foreground';
  if (daysLeft <= 1) return 'text-red-400';
  if (daysLeft <= 3) return 'text-orange-400';
  return 'text-emerald-400';
}

function getIcon(daysLeft: number, submitted: boolean) {
  if (submitted) return <CheckCircle2 className='h-5 w-5 text-emerald-400' />;
  if (daysLeft <= 1) return <AlertCircle className='h-5 w-5 text-red-400' />;
  return <Clock className='h-5 w-5 text-primary/50' />;
}

export function AssignmentsDue({
  assignments = mockAssignments,
  isLoading,
}: AssignmentsDueProps) {
  const pending = assignments.filter((a) => !a.submitted);
  const dueSoon = pending.filter((a) => a.daysLeft <= 3);

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-lg font-semibold tracking-tight'>
          Bài tập sắp hết hạn
        </h2>
        <p className='text-muted-foreground text-sm'>
          {dueSoon.length > 0
            ? `${dueSoon.length} bài tập cần hoàn thành`
            : 'Không có bài tập cần gấp'}
        </p>
      </div>

      {isLoading ? (
        <div className='space-y-2'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='glass-elevated animate-pulse rounded-lg p-3 h-16'
            />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className='glass rounded-xl p-6 text-center'>
          <p className='text-muted-foreground text-sm'>
            ✨ Bạn không có bài tập nào cần làm
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {assignments
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 5)
            .map((assignment) => (
              <Link
                key={assignment.id}
                href={`/dashboard/assignments/${assignment.id}`}
                className={cn(
                  'glass-elevated group block rounded-lg p-3 transition-all hover:border-primary/30',
                  assignment.submitted && 'opacity-70',
                )}
              >
                <div className='flex items-start gap-3'>
                  <div className='pt-1'>
                    {getIcon(assignment.daysLeft, assignment.submitted)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3
                      className={cn(
                        'font-medium truncate group-hover:text-primary transition-colors',
                        assignment.submitted &&
                          'line-through text-muted-foreground',
                      )}
                    >
                      {assignment.title}
                    </h3>
                    <p className='text-muted-foreground text-xs mt-0.5'>
                      {assignment.course}
                    </p>
                  </div>
                  <div className='text-right'>
                    {assignment.submitted ? (
                      <p className='text-emerald-400 text-xs font-medium'>
                        Đã nộp • {assignment.grade}%
                      </p>
                    ) : (
                      <p
                        className={cn(
                          'text-xs font-semibold',
                          getDueSoonColor(assignment.daysLeft),
                        )}
                      >
                        {assignment.daysLeft > 0
                          ? `${assignment.daysLeft.toString().padStart(1)} ngày`
                          : `Hết hạn`}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}

      {pending.length > 5 && (
        <Link
          href='/dashboard/assignments'
          className='text-xs text-primary hover:underline'
        >
          Xem tất cả bài tập ({pending.length}) →
        </Link>
      )}
    </div>
  );
}
