'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, SearchX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { QuizCard } from './QuizCard';
import { QuizSettingsModal } from './QuizSettingsModal';
import { useQuiz } from '@/contexts/QuizContext';
import { Quiz } from '@/api/quizzes';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

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
    <div className='pb-16 transition-all p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8 bg-surface-container-lowest min-h-screen text-on-surface relative'>
      <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />

      {/* Header section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6 relative z-10'>
        <div>
          <h1 className='text-xl sm:text-2xl font-black text-on-surface tracking-tight'>Thư viện Bài kiểm tra</h1>
          <p className='text-xs sm:text-sm text-on-surface-variant/85 mt-1 max-w-2xl'>
            Quản lý, chỉnh sửa và tham gia các bài kiểm tra của bạn.
          </p>
        </div>
        {isInstructor && (
          <button
            onClick={() => router.push('/quizzes/new')}
            className='inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border-0 bg-primary/10 hover:bg-primary/15 px-4 text-xs font-bold text-primary shadow-xs transition-all active:scale-[0.98] self-start sm:self-center cursor-pointer'
          >
            Tạo Quiz mới
            <Plus className='size-3.5' />
          </button>
        )}
      </div>

      {/* Search and Filters row */}
      <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-3 rounded-2xl border border-outline-variant/30 relative z-10 shadow-xs'>
        <div className='relative flex-1 max-w-md w-full'>
          <Input
            className='w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border-outline-variant/40 focus-visible:ring-primary/20 focus:bg-white transition-colors h-10'
            placeholder='Tìm kiếm bài trắc nghiệm...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className='absolute left-3 top-3 size-4 text-on-surface-variant/45' />
        </div>

        <div className='flex items-center gap-2 self-start md:self-center'>
          <span className='text-xs font-bold text-on-surface-variant/75 uppercase tracking-wider flex items-center gap-1.5 shrink-0'>
            <Filter className='size-3.5' /> Lọc
          </span>
          <div className='flex gap-1 bg-surface-container p-1 rounded-xl text-xs border border-outline-variant/20'>
            {[
              ...(isInstructor ? [{ value: 'my-quizzes', label: 'Của tôi' }] : []),
              { value: 'joined', label: 'Đã tham gia' },
              { value: 'public', label: 'Công khai' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
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

      {/* Content display based on loading and results */}
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 relative z-10'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='h-48 sm:h-64 bg-slate-100 animate-pulse rounded-2xl border border-outline-variant/25'
            />
          ))}
        </div>
      ) : filteredQuizzes?.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant/40 relative z-10'>
          <SearchX className='size-8 text-on-surface-variant/35 mx-auto mb-3' />
          <p className='text-sm text-on-surface-variant font-bold mb-1'>
            {activeTab === 'my-quizzes'
              ? 'Bạn chưa tạo bài trắc nghiệm nào.'
              : activeTab === 'joined'
                ? 'Bạn chưa tham gia bài trắc nghiệm nào.'
                : 'Không tìm thấy bài trắc nghiệm nào phù hợp.'}
          </p>
          {activeTab === 'my-quizzes' && isInstructor && (
            <button
              className='mt-4 rounded-xl text-xs h-9 cursor-pointer bg-primary text-white font-bold hover:bg-primary-dim transition-all active:scale-[0.97] inline-flex items-center gap-2 px-4 border-0'
              onClick={() => router.push('/quizzes/new')}
            >
              <Plus className='size-3.5' /> Tạo ngay
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 relative z-10'
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {filteredQuizzes?.map((quiz) => (
            <motion.div
              key={quiz.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
              }}
              className="h-full"
            >
              <QuizCard
                quiz={quiz}
                isOwner={quiz.creatorId === user?.userId || quiz.creatorId === user?.id}
                onEdit={handleEdit}
                onSettings={handleSettings}
                onShare={handleSettings}
                onTake={(q) =>
                  (window.location.href = `/quizzes/${q.id}/take`)
                }
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <QuizSettingsModal
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        quiz={selectedQuiz}
      />
    </div>
  );
}
