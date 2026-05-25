'use client';

import { useEffect, useState } from 'react';
import { getMyAssignments, Assignment } from '@/api/assignments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNowStrict, isPast, isFuture } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, BookX, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await getMyAssignments();
        setAssignments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='w-8 h-8 animate-spin text-sky-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full text-red-500'>
        Error: {error}
      </div>
    );
  }

  const upcoming = assignments.filter((a) => {
    const isSubmitted = a.submissions && a.submissions.length > 0;
    if (isSubmitted) return false;
    return !a.deadline || isFuture(new Date(a.deadline));
  });

  const pastDue = assignments.filter((a) => {
    const isSubmitted = a.submissions && a.submissions.length > 0;
    if (isSubmitted) return false;
    return a.deadline && isPast(new Date(a.deadline));
  });

  const completed = assignments.filter((a) => {
    return a.submissions && a.submissions.length > 0;
  });

  const EmptyState = ({ message, subMessage }: { message: string, subMessage?: string }) => (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='relative mb-8'>
        <div className='absolute inset-0 bg-sky-100 rounded-full blur-2xl opacity-50' />
        <BookX size={80} className='text-slate-300 relative z-10' strokeWidth={1.5} />
      </div>
      <h3 className='text-xl font-semibold text-slate-800 mb-2'>{message}</h3>
      {subMessage && <p className='text-slate-500 max-w-sm'>{subMessage}</p>}
    </div>
  );

  const formatTimeLeft = (deadlineStr: string) => {
    const date = new Date(deadlineStr);
    const distance = formatDistanceToNowStrict(date, { locale: vi });
    if (isPast(date)) return `Quá hạn ${distance}`;
    return `Còn ${distance}`;
  };

  const AssignmentList = ({ items }: { items: Assignment[] }) => {
    return (
      <div className='space-y-3 mt-6'>
        {/* Header List */}
        <div className='flex items-center justify-between px-2 mb-2'>
          <h3 className='font-bold text-slate-800'>Bài tập ({items.length})</h3>
          <div className='flex items-center gap-2 text-sm text-sky-500'>
            <div className='w-1.5 h-1.5 rounded-full bg-sky-500'></div>
            {items.filter(i => i.submissions?.length > 0).length}/{items.length} đã nộp
          </div>
        </div>
        <div className='h-1 w-full bg-sky-400 rounded-full mb-4'></div>

        {items.map((item) => {
          const isSubmitted = item.submissions?.length > 0;
          const isOverdue = item.deadline && isPast(new Date(item.deadline)) && !isSubmitted;

          return (
            <Link key={item.id} href={`/assignments/${item.id}`}>
              <div className='group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-full hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer mb-3'>
                {/* Left Side: Dot and Title */}
                <div className='flex items-center gap-4'>
                  <div className='w-2 h-2 rounded-full bg-sky-500 shrink-0'></div>
                  <h4 className='font-medium text-slate-800'>{item.title}</h4>
                  <span className='text-sm text-slate-400 ml-2'> Lớp học: {item.classroom?.title}</span>
                </div>

                {/* Right Side: Badges & Time */}
                <div className='flex items-center gap-4 text-sm'>
                  {isSubmitted ? (
                    <span className='px-4 py-1 rounded-full bg-sky-50 text-sky-600 font-medium text-xs border border-sky-100'>
                      Đã nộp
                    </span>
                  ) : (
                    <span className='px-4 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200'>
                      Chưa nộp
                    </span>
                  )}

                  {item.deadline ? (
                    <span className={`font-medium w-24 text-right ${isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                      {formatTimeLeft(item.deadline)}
                    </span>
                  ) : (
                    <span className='text-slate-400 w-24 text-right'>Không thời hạn</span>
                  )}

                  <ChevronRight className='text-slate-300 group-hover:text-sky-500 transition-colors shrink-0' size={18} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className='flex flex-col min-h-screen bg-slate-50 text-slate-800 w-full'>
      {/* Header Banner */}
      <div className='bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-white flex justify-between items-center'>
        <div>
          <h1 className='text-xl font-bold'>Bài tập của tôi</h1>
          <p className='text-sky-100 text-sm mt-0.5 opacity-80'>
            Quản lý tất cả bài tập từ các lớp học của bạn
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='upcoming' className='w-full flex-1 flex flex-col'>
        {/* Tabs Bar */}
        <div className='sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 border-b border-slate-200 flex justify-start'>
          <TabsList className='bg-transparent justify-start h-auto p-0 rounded-none flex gap-8'>
            <TabsTrigger
              value='upcoming'
              className='relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-4 px-0 font-medium text-slate-500 data-[state=active]:text-sky-600 hover:text-sky-600 data-[state=active]:font-semibold transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-sky-600 after:opacity-0 data-[state=active]:after:opacity-100'
            >
              Bài tập sắp tới
            </TabsTrigger>
            <TabsTrigger
              value='pastdue'
              className='relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-4 px-0 font-medium text-slate-500 data-[state=active]:text-sky-600 hover:text-sky-600 data-[state=active]:font-semibold transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-sky-600 after:opacity-0 data-[state=active]:after:opacity-100'
            >
              Quá hạn
            </TabsTrigger>
            <TabsTrigger
              value='completed'
              className='relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-4 px-0 font-medium text-slate-500 data-[state=active]:text-sky-600 hover:text-sky-600 data-[state=active]:font-semibold transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-sky-600 after:opacity-0 data-[state=active]:after:opacity-100'
            >
              Đã nộp
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className='p-6 lg:p-10 max-w-5xl mx-auto w-full'>
          <TabsContent value='upcoming' className='mt-0'>
            {upcoming.length > 0 ? (
              <AssignmentList items={upcoming} />
            ) : (
              <EmptyState
                message='Không có bài tập nào sắp tới.'
                subMessage='Hãy truy cập vào từng lớp học để kiểm tra thêm.'
              />
            )}
          </TabsContent>

          <TabsContent value='pastdue' className='mt-0'>
            {pastDue.length > 0 ? (
              <AssignmentList items={pastDue} />
            ) : (
              <EmptyState
                message='Không có bài tập nào quá hạn.'
                subMessage='Tuyệt vời! Bạn đã hoàn thành đúng hạn tất cả các bài tập.'
              />
            )}
          </TabsContent>

          <TabsContent value='completed' className='mt-0'>
            {completed.length > 0 ? (
              <AssignmentList items={completed} />
            ) : (
              <EmptyState
                message='Chưa có bài tập nào được nộp.'
                subMessage='Khi bạn nộp bài tập, chúng sẽ xuất hiện ở đây.'
              />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
