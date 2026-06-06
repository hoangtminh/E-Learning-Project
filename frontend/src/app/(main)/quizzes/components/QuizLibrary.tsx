'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { QuizCard } from './QuizCard';
import { QuizSettingsModal } from './QuizSettingsModal';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz } from '@/api/quizzes';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function QuizLibrary() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    createdQuizzes,
    joinedQuizzes,
    publicQuizzes,
    fetchCreatedQuizzes,
    fetchJoinedQuizzes,
    fetchPublicQuizzes,
    loading,
  } = useQuiz();

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('joined');
  const [search, setSearch] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (user && isInstructor) {
      setActiveTab('my-quizzes');
    }
  }, [user, isInstructor]);

  useEffect(() => {
    fetchCreatedQuizzes();
    fetchJoinedQuizzes();
    fetchPublicQuizzes();
  }, [fetchCreatedQuizzes, fetchJoinedQuizzes, fetchPublicQuizzes]);

  const handleEdit = (quiz: Quiz) => {
    router.push(`/quizzes/${quiz.id}/edit`);
  };

  const handleSettings = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsSettingsModalOpen(true);
  };

  const getCurrentQuizzes = () => {
    switch (activeTab) {
      case 'my-quizzes':
        return isInstructor ? createdQuizzes : [];
      case 'joined':
        return joinedQuizzes;
      case 'public':
        return publicQuizzes;
      default:
        return [];
    }
  };

  const filteredQuizzes = getCurrentQuizzes()?.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='space-y-6 pb-8 transition-all p-4 sm:p-6 md:p-8'>
      {/* Header section - 100% identical to Courses Catalog */}
      <div className='flex min-h-[80px] flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center'>
        <div className='min-w-0'>
          <h1 className='text-xl sm:text-2xl font-black text-slate-900'>Thư viện Quiz</h1>
          <p className='text-slate-500 mt-0.5 text-[10px] sm:text-xs'>
            Quản lý, chỉnh sửa và tham gia các bài kiểm tra của bạn.
          </p>
        </div>
        {isInstructor && (
          <button
            onClick={() => router.push('/quizzes/new')}
            className='inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border-0 bg-sky-100 px-3.5 text-[10px] sm:text-xs font-bold text-sky-700 shadow-xs transition-colors hover:bg-sky-200 self-start sm:self-center'
          >
            Tạo Quiz mới
            <Plus className='size-3.5 sm:size-4' />
          </button>
        )}
      </div>

      {/* Search and Filters row - 100% identical to Courses Catalog */}
      <div className='flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-3 rounded-lg border border-slate-300'>
        <div className='relative flex-1 max-w-sm'>
          <Input
            className='w-full bg-slate-50 pl-9 pr-4 py-1.5 rounded-md text-xs border-slate-200 focus:bg-white transition-colors h-8'
            placeholder='Tìm kiếm bài trắc nghiệm...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className='absolute left-3 top-2.5 size-3.5 text-slate-400' />
        </div>

        <div className='flex items-center gap-2 self-end sm:self-center'>
          <span className='text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1'>
            <Filter className='size-3' /> Lọc
          </span>
          <div className='flex gap-0.5 bg-slate-100 p-0.5 rounded-md text-[10px] sm:text-[11px]'>
            {[
              ...(isInstructor ? [{ value: 'my-quizzes', label: 'Của tôi' }] : []),
              { value: 'joined', label: 'Đã tham gia' },
              { value: 'public', label: 'Công khai' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${activeTab === item.value
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content display based on loading and results */}
      {loading ? (
        <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='h-40 sm:h-64 bg-slate-100 animate-pulse rounded-lg border border-slate-200'
            />
          ))}
        </div>
      ) : filteredQuizzes?.length === 0 ? (
        <div className='text-center py-10 bg-slate-100/50 rounded-lg border border-dashed border-slate-300'>
          <Search className='size-8 text-slate-300 mx-auto mb-2.5' />
          <p className='text-slate-500 text-xs font-semibold'>
            {activeTab === 'my-quizzes'
              ? 'Bạn chưa tạo bài trắc nghiệm nào.'
              : activeTab === 'joined'
                ? 'Bạn chưa tham gia bài trắc nghiệm nào.'
                : 'Không tìm thấy bài trắc nghiệm nào phù hợp.'}
          </p>
          {activeTab === 'my-quizzes' && isInstructor && (
            <button
              className='mt-3 px-3 py-1.5 rounded-md bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all active:scale-95 inline-flex items-center gap-1 mx-auto'
              onClick={() => router.push('/quizzes/new')}
            >
              <Plus className='size-3.5' /> Tạo ngay
            </button>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
          {filteredQuizzes?.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              isOwner={quiz.creatorId === user?.userId || quiz.creatorId === user?.id}
              onEdit={handleEdit}
              onSettings={handleSettings}
              onShare={handleSettings}
              onTake={(q) =>
                (window.location.href = `/quizzes/${q.id}/take`)
              }
            />
          ))}
        </div>
      )}

      <QuizSettingsModal
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        quiz={selectedQuiz}
      />
    </div>
  );
}
