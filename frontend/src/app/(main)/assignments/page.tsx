'use client';

import { useEffect, useState } from 'react';
import { getMyAssignments, Assignment } from '@/api/assignments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNowStrict, isPast, isFuture } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, BookX, ChevronRight, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-3'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' strokeWidth={2} />
        <p className='text-xs text-on-surface-variant/70 font-medium'>Đang tải danh sách bài tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6'>
        <div className='w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-3'>
          <AlertCircle className='size-6' />
        </div>
        <h3 className='text-lg font-bold text-on-surface mb-1'>Lỗi tải dữ liệu</h3>
        <p className='text-sm text-destructive max-w-md'>{error}</p>
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
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center py-20 text-center bg-white border border-outline-variant/30 rounded-2xl p-8 shadow-xs'
    >
      <div className='relative mb-5 flex items-center justify-center w-16 h-16 bg-surface rounded-2xl border border-outline-variant/20'>
        <BookX size={32} className='text-on-surface-variant/40' strokeWidth={1.5} />
      </div>
      <h3 className='text-base font-bold text-on-surface mb-1'>{message}</h3>
      {subMessage && <p className='text-xs text-on-surface-variant/70 max-w-xs'>{subMessage}</p>}
    </motion.div>
  );

  const formatTimeLeft = (deadlineStr: string) => {
    const date = new Date(deadlineStr);
    const distance = formatDistanceToNowStrict(date, { locale: vi });
    if (isPast(date)) return `Quá hạn ${distance}`;
    return `Còn ${distance}`;
  };

  const AssignmentList = ({ items }: { items: Assignment[] }) => {
    const completedCount = items.filter(i => i.submissions && i.submissions.length > 0).length;
    const progressPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0;

    return (
      <div className='space-y-4'>
        {/* Header List */}
        <div className='bg-white border border-outline-variant/30 rounded-2xl p-4 md:p-5 shadow-xs'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
            <div>
              <h3 className='text-sm font-bold text-on-surface uppercase tracking-wider'>
                Danh sách bài tập ({items.length})
              </h3>
              <p className='text-xs text-on-surface-variant/80 mt-0.5'>
                Theo dõi và nộp bài trước thời hạn quy định
              </p>
            </div>
            <div className='flex items-center gap-2 text-xs font-bold text-primary shrink-0'>
              <CheckCircle2 size={16} className='text-primary' />
              <span>Đã hoàn thành {completedCount}/{items.length} bài</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className='h-1.5 w-full bg-surface-container rounded-full overflow-hidden'>
            <div 
              className='h-full bg-primary rounded-full transition-all duration-500 ease-out' 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <motion.div 
          className='space-y-3'
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {items.map((item) => {
            const isSubmitted = item.submissions && item.submissions.length > 0;
            const isOverdue = item.deadline && isPast(new Date(item.deadline)) && !isSubmitted;

            return (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
                }}
              >
                <Link href={`/assignments/${item.id}`}>
                  <div className='group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-outline-variant/30 rounded-2xl hover:border-primary/50 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer gap-4'>
                    {/* Left Side: Indicator, Title & Classroom */}
                    <div className='flex items-start gap-3.5 min-w-0'>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isSubmitted ? 'bg-green-500' : isOverdue ? 'bg-error' : 'bg-primary'
                      }`} />
                      <div className='min-w-0'>
                        <h4 className='font-bold text-on-surface group-hover:text-primary transition-colors text-sm sm:text-base leading-snug truncate'>
                          {item.title}
                        </h4>
                        <div className='flex items-center gap-2 mt-1 flex-wrap'>
                          <span className='text-xs text-on-surface-variant/80'>
                            Lớp học: <span className='font-semibold text-on-surface'>{item.classroom?.title}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Badges & Time */}
                    <div className='flex items-center justify-between sm:justify-end gap-5 shrink-0'>
                      <div className='flex items-center gap-3'>
                        {isSubmitted ? (
                          <span className='px-3 py-1 rounded-lg bg-green-500/10 text-green-600 font-bold text-[10px] uppercase tracking-wider border border-green-500/20'>
                            Đã nộp
                          </span>
                        ) : (
                          <span className='px-3 py-1 rounded-lg bg-surface text-on-surface-variant/85 font-bold text-[10px] uppercase tracking-wider border border-outline-variant/20'>
                            Chưa nộp
                          </span>
                        )}

                        {item.deadline ? (
                          <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                            isOverdue ? 'text-error' : 'text-orange-500'
                          }`}>
                            <Calendar size={13} />
                            <span>{formatTimeLeft(item.deadline)}</span>
                          </div>
                        ) : (
                          <span className='text-xs text-on-surface-variant/60 font-medium'>Không thời hạn</span>
                        )}
                      </div>

                      <ChevronRight 
                        className='text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block' 
                        size={18} 
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  };

  return (
    <div className='flex flex-col min-h-screen bg-surface-container-lowest text-on-surface w-full pb-12'>
      {/* Header Banner */}
      <div className='px-6 md:px-12 py-6 border-b border-outline-variant/30 bg-white relative overflow-hidden'>
        <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
        <div className='max-w-5xl mx-auto w-full relative z-10'>
          <h1 className='text-2xl font-black text-on-surface tracking-tight'>Bài tập của tôi</h1>
          <p className='text-xs sm:text-sm text-on-surface-variant/85 mt-1 max-w-2xl'>
            Quản lý, theo dõi thời hạn và hoàn thành các bài kiểm tra, bài tập về nhà từ tất cả các lớp học của bạn.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue='upcoming' className='w-full flex-1 flex flex-col'>
        {/* Tabs Bar */}
        <div className='sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 md:px-12 border-b border-outline-variant/30 flex justify-start'>
          <div className='max-w-5xl mx-auto w-full'>
            <TabsList className='bg-transparent justify-start h-auto p-0 rounded-none flex gap-8'>
              <TabsTrigger
                value='upcoming'
                className='relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-4 px-0 font-bold text-xs sm:text-sm text-on-surface-variant/70 data-[state=active]:text-primary hover:text-primary transition-all after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-250 cursor-pointer'
              >
                Bài tập sắp tới
              </TabsTrigger>
              <TabsTrigger
                value='pastdue'
                className='relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-4 px-0 font-bold text-xs sm:text-sm text-on-surface-variant/70 data-[state=active]:text-primary hover:text-primary transition-all after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-250 cursor-pointer'
              >
                Quá hạn
              </TabsTrigger>
              <TabsTrigger
                value='completed'
                className='relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-4 px-0 font-bold text-xs sm:text-sm text-on-surface-variant/70 data-[state=active]:text-primary hover:text-primary transition-all after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-250 cursor-pointer'
              >
                Đã nộp
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content Section */}
        <div className='p-6 md:p-8 lg:p-10 max-w-5xl mx-auto w-full flex-1'>
          <AnimatePresence mode='wait'>
            <TabsContent value='upcoming' className='mt-0 outline-hidden'>
              {upcoming.length > 0 ? (
                <AssignmentList items={upcoming} />
              ) : (
                <EmptyState
                  message='Không có bài tập nào sắp tới.'
                  subMessage='Hãy truy cập vào từng lớp học của bạn để kiểm tra thêm thông tin chi tiết.'
                />
              )}
            </TabsContent>

            <TabsContent value='pastdue' className='mt-0 outline-hidden'>
              {pastDue.length > 0 ? (
                <AssignmentList items={pastDue} />
              ) : (
                <EmptyState
                  message='Không có bài tập nào quá hạn.'
                  subMessage='Tuyệt vời! Bạn đã hoàn thành đúng hạn tất cả các bài tập được giao.'
                />
              )}
            </TabsContent>

            <TabsContent value='completed' className='mt-0 outline-hidden'>
              {completed.length > 0 ? (
                <AssignmentList items={completed} />
              ) : (
                <EmptyState
                  message='Chưa có bài tập nào được nộp.'
                  subMessage='Khi bạn hoàn thành và nộp bài tập, thông tin bài nộp sẽ hiển thị tại đây.'
                />
              )}
            </TabsContent>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
