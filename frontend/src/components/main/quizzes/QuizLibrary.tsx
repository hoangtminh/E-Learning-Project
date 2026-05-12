'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Library, Globe, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuizCard } from './QuizCard';
import { CreateQuizModal } from './CreateQuizModal';
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
  console.log('filteredQuizzes', filteredQuizzes);

  return (
    <div className='flex flex-col p-6 max-w-7xl mx-auto space-y-8 relative z-10'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
            Thư viện Quiz
          </h1>
          <p className='text-slate-500 text-lg'>
            Quản lý, chỉnh sửa và tham gia các bài kiểm tra của bạn.
          </p>
        </div>
        <Button
          className='w-full md:w-auto h-12 px-6 rounded-xl bg-primary hover:bg-primary-dim shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95'
          onClick={() => router.push('/quizzes/new')}
        >
          <Plus className='mr-2 size-5' /> Tạo Quiz mới
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full block gap-2'
      >
        <div className='flex items-center justify-between'>
          <TabsList className='grid w-full grid-cols-3 max-w-md bg-transparent h-11 p-1'>
            <TabsTrigger
              value='my-quizzes'
              className='gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all'
            >
              <Library className='size-4' /> Của tôi
            </TabsTrigger>
            <TabsTrigger
              value='joined'
              className='gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all'
            >
              <BookOpen className='size-4' /> Đã tham gia
            </TabsTrigger>
            <TabsTrigger
              value='public'
              className='gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all'
            >
              <Globe className='size-4' /> Công khai
            </TabsTrigger>
          </TabsList>

          <div className='w-full md:max-w-xs relative ml-auto'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400' />
            <Input
              placeholder='Tìm kiếm quiz...'
              className='pl-10 h-11 border-none bg-slate-100/50 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl transition-all'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {['my-quizzes', 'joined', 'public'].map((tab) => (
          <TabsContent
            key={tab}
            value={tab}
            className='mt-0 outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500'
          >
            {loading ? (
              <div className='flex flex-col items-center justify-center py-24 space-y-4'>
                <Loader2 className='size-10 animate-spin text-primary' />
                <p className='text-slate-400 animate-pulse'>
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : (
              <div className='flex flex-col gap-6'>
                {filteredQuizzes?.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    isOwner={tab === 'my-quizzes'}
                    onEdit={handleEdit}
                    onSettings={handleSettings}
                    onShare={handleSettings}
                    onTake={(q) =>
                      (window.location.href = `/quizzes/${q.id}/take`)
                    }
                  />
                ))}
                {filteredQuizzes?.length === 0 && (
                  <div className='py-32 text-center glass-panel border-dashed rounded-[2rem] flex flex-col items-center justify-center'>
                    <div className='size-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-6 shadow-inner'>
                      <Search className='size-10 text-slate-300' />
                    </div>
                    <h3 className='text-xl font-semibold text-slate-900 mb-2'>
                      Không tìm thấy kết quả
                    </h3>
                    <p className='text-slate-500 max-w-xs'>
                      {tab === 'my-quizzes'
                        ? 'Bạn chưa tạo bài quiz nào. Hãy bắt đầu bằng cách tạo một quiz mới!'
                        : tab === 'joined'
                          ? 'Bạn chưa tham gia bài quiz nào.'
                          : 'Hiện không có bài quiz công khai nào phù hợp.'}
                    </p>
                    {tab === 'my-quizzes' && (
                      <Button
                        variant='outline'
                        className='mt-6 rounded-xl'
                        onClick={() => router.push('/quizzes/new')}
                      >
                        <Plus className='mr-2 size-4' /> Tạo ngay
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <QuizSettingsModal
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        quiz={selectedQuiz}
      />
    </div>
  );
}
