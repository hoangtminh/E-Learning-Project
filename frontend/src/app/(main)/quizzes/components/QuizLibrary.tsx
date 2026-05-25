'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { QuizCard } from './QuizCard';
import { QuizSettingsModal } from './QuizSettingsModal';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz } from '@/api/quizzes';
import { useRouter } from 'next/navigation';

export function QuizLibrary() {
  const router = useRouter();
  const {
    createdQuizzes,
    joinedQuizzes,
    publicQuizzes,
    fetchCreatedQuizzes,
    fetchJoinedQuizzes,
    fetchPublicQuizzes,
    loading,
  } = useQuiz();

  const [activeTab, setActiveTab] = useState('my-quizzes');
  const [search, setSearch] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
        return createdQuizzes;
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
    <div className='space-y-10 pb-12 transition-all p-6 md:p-12'>
      {/* Header section - 100% identical to Courses Catalog */}
      <div className='flex min-h-[92px] flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-black text-slate-900'>Thư viện Quiz</h1>
          <p className='text-slate-500 mt-1'>
            Quản lý, chỉnh sửa và tham gia các bài kiểm tra của bạn.
          </p>
        </div>
        <button
          onClick={() => router.push('/quizzes/new')}
          className='inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border-0 bg-sky-50 px-4 text-sm font-semibold text-sky-600 shadow-xs transition-colors hover:bg-sky-100'
        >
          Tạo Quiz mới
          <Plus className='size-4' />
        </button>
      </div>

      {/* Search and Filters row - 100% identical to Courses Catalog */}
      <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200'>
        <div className='relative flex-1 max-w-md'>
          <Input
            className='w-full bg-slate-50 pl-10 pr-4 py-2 rounded-lg text-sm border-slate-200 focus:bg-white transition-colors'
            placeholder='Tìm kiếm bài trắc nghiệm...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className='absolute left-3 top-2.5 size-4 text-slate-400' />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5'>
            <Filter className='size-3.5' /> Lọc
          </span>
          <div className='flex gap-1 bg-slate-100 p-1 rounded-lg text-xs'>
            {[
              { value: 'my-quizzes', label: 'Của tôi' },
              { value: 'joined', label: 'Đã tham gia' },
              { value: 'public', label: 'Công khai' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${activeTab === item.value
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
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='h-72 bg-slate-100 animate-pulse rounded-2xl border border-slate-200'
            />
          ))}
        </div>
      ) : filteredQuizzes?.length === 0 ? (
        <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
          <Search className='size-10 text-slate-300 mx-auto mb-3' />
          <p className='text-slate-500 font-medium'>
            {activeTab === 'my-quizzes'
              ? 'Bạn chưa tạo bài trắc nghiệm nào.'
              : activeTab === 'joined'
                ? 'Bạn chưa tham gia bài trắc nghiệm nào.'
                : 'Không tìm thấy bài trắc nghiệm nào phù hợp.'}
          </p>
          {activeTab === 'my-quizzes' && (
            <button
              className='mt-4 px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all active:scale-95 inline-flex items-center gap-1 mx-auto'
              onClick={() => router.push('/quizzes/new')}
            >
              <Plus className='size-3.5' /> Tạo ngay
            </button>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredQuizzes?.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              isOwner={activeTab === 'my-quizzes'}
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
