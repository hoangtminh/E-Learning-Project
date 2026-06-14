'use client';

import { useEffect, useState } from 'react';
import { getMyAssignments, Assignment } from '@/api/assignments';
import { formatDistanceToNowStrict, isPast, isFuture } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, BookX, ChevronRight, Calendar, CheckCircle2, AlertCircle, Search, Filter, SearchX } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type TabValue = 'upcoming' | 'pastdue' | 'completed';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredAssignments = assignments.filter((a) => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const titleMatch = a.title?.toLowerCase().includes(lowerQuery);
    const classroomMatch = a.classroom?.title?.toLowerCase().includes(lowerQuery);
    return titleMatch || classroomMatch;
  });

  const upcoming = filteredAssignments.filter((a) => {
    const isSubmitted = a.submissions && a.submissions.length > 0;
    if (isSubmitted) return false;
    return !a.deadline || isFuture(new Date(a.deadline));
  });

  const pastDue = filteredAssignments.filter((a) => {
    const isSubmitted = a.submissions && a.submissions.length > 0;
    if (isSubmitted) return false;
    return a.deadline && isPast(new Date(a.deadline));
  });

  const completed = filteredAssignments.filter((a) => {
    return a.submissions && a.submissions.length > 0;
  });

  const getCurrentItems = () => {
    if (activeTab === 'upcoming') return upcoming;
    if (activeTab === 'pastdue') return pastDue;
    return completed;
  };

  const formatTimeLeft = (deadlineStr: string) => {
    const date = new Date(deadlineStr);
    const distance = formatDistanceToNowStrict(date, { locale: vi });
    if (isPast(date)) return `Quá hạn ${distance}`;
    return `Còn ${distance}`;
  };

  return (
    <div className='pb-16 transition-all p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8 bg-surface-container-lowest min-h-screen text-on-surface relative'>
      <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
      {/* Main Container */}
      <div className='max-w-5xl mx-auto w-full space-y-6 sm:space-y-8 relative z-10'>
        {/* Title section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6 relative z-10'>
        <div>
          <h1 className='text-xl sm:text-2xl font-black text-on-surface tracking-tight'>Bài tập của tôi</h1>
          <p className='text-xs sm:text-sm text-on-surface-variant/85 mt-1 max-w-2xl'>
            Quản lý, theo dõi thời hạn và hoàn thành các bài kiểm tra, bài tập về nhà từ tất cả các lớp học của bạn.
          </p>
        </div>
        </div>

        {/* Filter Bar */}
        <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-3 rounded-2xl border border-outline-variant/30 shadow-xs'>
        <div className='relative flex-1 max-w-md w-full'>
          <div className='relative w-full'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Tìm kiếm bài tập...'
              className='w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors h-10 text-on-surface'
            />
            <Search className='absolute left-3 top-3 size-4 text-on-surface-variant/45' />
          </div>
        </div>

        <div className='flex items-center gap-2 self-start md:self-center'>
          <span className='text-xs font-bold text-on-surface-variant/75 uppercase tracking-wider flex items-center gap-1.5 shrink-0'>
            <Filter className='size-3.5' /> Trạng thái
          </span>
          <div className='flex gap-1 bg-surface-container p-1 rounded-xl text-xs border border-outline-variant/20'>
            {[
              { value: 'upcoming', label: 'Sắp tới' },
              { value: 'pastdue', label: 'Quá hạn' },
              { value: 'completed', label: 'Đã nộp' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value as TabValue)}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer border-0 transition-all text-[11px] ${activeTab === item.value
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-on-surface-variant/75 hover:text-on-surface'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

        {/* Content Section */}
        <div className='relative'>
        {loading ? (
          <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-3'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' strokeWidth={2} />
            <p className='text-xs text-on-surface-variant/70 font-bold uppercase tracking-wider'>Đang tải danh sách bài tập...</p>
          </div>
        ) : error ? (
          <div className='rounded-2xl bg-error/5 p-8 text-center border border-error/15 max-w-md mx-auto'>
            <div className='w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error mx-auto mb-3'>
              <AlertCircle className='size-6' />
            </div>
            <p className='font-bold text-sm text-on-surface uppercase tracking-wider mb-1'>Lỗi tải dữ liệu</p>
            <p className='text-xs text-error/85 leading-relaxed'>{error}</p>
          </div>
        ) : getCurrentItems().length === 0 ? (
          <div className='text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant/40'>
            {searchQuery ? (
              <>
                <SearchX className='size-8 text-on-surface-variant/35 mx-auto mb-3' strokeWidth={1.5} />
                <h3 className='text-sm text-on-surface-variant font-bold mb-1'>
                  Không tìm thấy kết quả nào
                </h3>
                <p className='text-xs text-on-surface-variant/70 max-w-xs mx-auto'>
                  Không có bài tập nào phù hợp với từ khóa "{searchQuery}" trong mục này.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className='mt-4 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors border-0 cursor-pointer shadow-xs active:scale-95'
                >
                  Xóa tìm kiếm
                </button>
              </>
            ) : (
              <>
                <BookX className='size-8 text-on-surface-variant/35 mx-auto mb-3' strokeWidth={1.5} />
                <h3 className='text-sm text-on-surface-variant font-bold mb-1'>
                  {activeTab === 'upcoming' && 'Không có bài tập nào sắp tới.'}
                  {activeTab === 'pastdue' && 'Không có bài tập nào quá hạn.'}
                  {activeTab === 'completed' && 'Chưa có bài tập nào được nộp.'}
                </h3>
                <p className='text-xs text-on-surface-variant/70 max-w-xs mx-auto'>
                  {activeTab === 'upcoming' && 'Hãy truy cập vào từng lớp học của bạn để kiểm tra thêm thông tin chi tiết.'}
                  {activeTab === 'pastdue' && 'Tuyệt vời! Bạn đã hoàn thành đúng hạn tất cả các bài tập được giao.'}
                  {activeTab === 'completed' && 'Khi bạn hoàn thành và nộp bài tập, thông tin bài nộp sẽ hiển thị tại đây.'}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Header List */}
            <div className='bg-white border border-outline-variant/30 rounded-2xl p-4 md:p-5 shadow-xs'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
                <div>
                  <h3 className='text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2'>
                    Danh sách bài tập <span className="bg-surface-container px-2 py-0.5 rounded-md text-primary">{getCurrentItems().length}</span>
                  </h3>
                  <p className='text-xs text-on-surface-variant/80 mt-1'>
                    Theo dõi và nộp bài trước thời hạn quy định
                  </p>
                </div>
                <div className='flex items-center gap-2 text-xs font-bold text-primary shrink-0 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10'>
                  <CheckCircle2 size={16} className='text-primary' />
                  <span>Đã hoàn thành {filteredAssignments.filter(i => i.submissions && i.submissions.length > 0).length}/{filteredAssignments.length} bài</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className='h-1.5 w-full bg-surface-container rounded-full overflow-hidden'>
                <div 
                  className='h-full bg-primary rounded-full transition-all duration-500 ease-out' 
                  style={{ width: `${filteredAssignments.length > 0 ? (filteredAssignments.filter(i => i.submissions && i.submissions.length > 0).length / filteredAssignments.length) * 100 : 0}%` }}
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
              {getCurrentItems().map((item) => {
                const isSubmitted = item.submissions && item.submissions.length > 0;
                const isOverdue = item.deadline && isPast(new Date(item.deadline)) && !isSubmitted;
                const grade = isSubmitted ? item.submissions[0]?.grade : undefined;

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
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-sm ${
                            isSubmitted ? 'bg-green-500' : isOverdue ? 'bg-error' : 'bg-primary'
                          }`} />
                          <div className='min-w-0'>
                            <h4 className='font-bold text-on-surface group-hover:text-primary transition-colors text-sm sm:text-base leading-snug truncate'>
                              {item.title}
                            </h4>
                            <div className='flex items-center gap-2 mt-1 flex-wrap'>
                              <span className='text-[10px] sm:text-xs text-on-surface-variant/80'>
                                Lớp học: <span className='font-black text-on-surface'>{item.classroom?.title}</span>
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

                            {isSubmitted ? (
                              grade != null ? (
                                <span className='text-xs font-bold text-green-600'>
                                  {grade} điểm
                                </span>
                              ) : (
                                <span className='text-xs text-on-surface-variant/60 font-medium'>
                                  Chưa có điểm
                                </span>
                              )
                            ) : item.deadline ? (
                              <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold ${
                                isOverdue ? 'text-error' : 'text-orange-500'
                              }`}>
                                <Calendar size={13} />
                                <span>{formatTimeLeft(item.deadline)}</span>
                              </div>
                            ) : (
                              <span className='text-[10px] sm:text-xs text-on-surface-variant/60 font-bold'>Không thời hạn</span>
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
        )}
      </div>
      </div>
    </div>
  );
}
