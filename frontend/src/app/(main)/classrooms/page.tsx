'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SearchX,
} from 'lucide-react';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { appConfirm } from '@/components/ui/app-dialog-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvz6dRTaGnLp3HCtAnUdFeqPCG--8LDSkS_kIcRWF7YWP0FCxFmMSW13aLrBFMLDoBai-M594I-qogj1gqDul0Maz6pPWi6cvRzgrY2AsTIJhiu7uPjIT96j6CUWdvzaDmXLA61S0kCKoSTOjyRmnFs9jY1eqPTxz1dKrTBwj-Bfn1V9-CQ2kmQnwJZzrxlfFTicoMH9lhguYzCK9NO2x5yG9KIFRlmT1Pkk6g9hkWohZ39mUTXwyDUN4Q7NpnU_TSQjo9xmK42kf6',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbf9FS7YzN_8LQiqdMEVWV623RnuIA0UlzAfGlOLvrkhLLol1XUwEjWGH_8VhmfH4D_jlzfPbF-obQQvvK3CjcDlmCRmJ6ZcaInVN1qx--7HPsq9waXXwjgJOXwjKS4od106pILRxqFZhq8G04cpdNOAjB0tZ26mrb0RUO7NitZm6lSE-bBy_wztdW7lQUIUudXGjiTr8pKkU51msgLH1gs0oNQJKP1TIlXdd7cbkHG8Gd4UFFnONcOSoEwvQfERbL5oH_hoDXDBJh',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBTd9exxx4xfCnO95mBJ78woWX1yyMClrkZnIxLnUU-pEhbS7mFKD6TIIAocNhPlh_vHFmTkedbOr6JcAUiAsAqfkagbyUwrl0-ole1eIa4VtH8QiwlcAU-8NbZmrJsCeIFAUFOi1V5Ipo8XGKgUzhtu-5wRe2ikAw8a9pP-TwgbWSdYtz0q-pHw_D-l0-AksG5fe1VoT-atdwDLDRtr95eT07JTXvzFjbTYg9dVMcHJyjAQI4wulQyrfgszEkmlmzKowEMovhMaNwg',
];

type CatalogClassroom = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  inviteCode: string | null;
  createdAt: string;
  ownerId: string;
  members?: any[];
  _count?: { members: number };
  owner?: { id: string; fullName: string | null; avatarUrl: string | null; email: string };
};

function CatalogClassroomCard({
  classroom,
  index,
  userId,
  handleLeave,
}: {
  classroom: CatalogClassroom;
  index: number;
  userId?: string;
  handleLeave: (id: string) => void;
}) {
  const coverImage = mockImages[index % mockImages.length];

  return (
    <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden group flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative h-full'>
      {/* Leave Classroom button */}
      {userId !== classroom.ownerId && (
        <div className='absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLeave(classroom.id);
            }}
            className='bg-red-500/90 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-lg flex items-center justify-center transition-colors shadow-md text-xs font-bold gap-1 cursor-pointer border-0'
            title='Rời lớp học'
          >
            <span className='material-symbols-outlined text-xs font-bold'>
              logout
            </span>
            Rời lớp
          </button>
        </div>
      )}

      <Link
        href={`/classrooms/${classroom.id}`}
        className='relative h-40 overflow-hidden bg-slate-100 block'
      >
        <img
          src={coverImage}
          alt={classroom.title}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
        />
        <div className='absolute top-3 left-3 px-2 py-1 bg-slate-900/70 backdrop-blur-md rounded flex items-center gap-1'>
          <span className='text-white text-[10px] font-bold uppercase tracking-wider'>
            {classroom.isPublic ? 'Công khai' : 'Riêng tư'}
          </span>
        </div>
      </Link>

      <div className='p-4 flex flex-col flex-1'>
        <Link href={`/classrooms/${classroom.id}`}>
          <h3 className='font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2 mb-2 h-10'>
            {classroom.title}
          </h3>
        </Link>
        <p className='text-slate-500 text-xs line-clamp-2 mb-4 h-8'>
          {classroom.description || 'Chưa có mô tả cho lớp học này.'}
        </p>

        <div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-100 gap-3'>
          <div className='min-w-0'>
            <p className='text-xs text-slate-500 truncate'>
              {classroom.owner?.fullName || 'Giảng viên'}
            </p>
            <p className='text-sm font-black text-slate-800 flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-sm align-middle text-slate-400'>
                group
              </span>
              <span className='text-xs font-bold text-slate-700'>
                {classroom._count?.members ?? classroom.members?.length ?? 0} thành viên
              </span>
            </p>
          </div>
          <Link
            href={`/classrooms/${classroom.id}`}
            className='px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all active:scale-95 shrink-0'
          >
            Vào lớp
          </Link>
        </div>
      </div>
    </div>
  );
}

function AddNewClassroomCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='border border-dashed border-sky-300/60 rounded-2xl flex flex-col items-center justify-center p-6 hover:bg-sky-300/5 transition-all duration-300 group cursor-pointer h-full min-h-[300px] w-full bg-white/50'
    >
      <div className='w-16 h-16 rounded-full bg-sky-300/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
        <Plus className='text-sky-500 size-8' />
      </div>
      <h5 className='text-base font-bold text-slate-700'>
        Tạo Lớp Học Mới
      </h5>
      <p className='text-[11px] text-slate-400 mt-1 text-center max-w-[180px] leading-relaxed'>
        Bắt đầu thảo luận, chia sẻ bài tập và quản lý các tài liệu học tập.
      </p>
    </button>
  );
}

export default function ClassroomsPage() {
  const {
    classrooms: cohorts,
    loading,
    fetchClassrooms,
    createClassroom,
    joinByCode,
    removeMember,
    pendingClassrooms,
    loadingPendingClassrooms,
    fetchPendingClassrooms,
    cancelJoinRequest,
  } = useClassrooms();

  const { user } = useAuth();

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Join by code modal state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchClassrooms();
    fetchPendingClassrooms();
  }, [fetchClassrooms, fetchPendingClassrooms]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  // ── Create ──────────────────────────────────────────────────────────────────

  const handleCreateOpen = () => {
    setNewTitle('');
    setNewDesc('');
    setNewIsPublic(false);
    setIsCreateModalOpen(true);
  };

  const submitCreate = async () => {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await createClassroom(newTitle, newDesc, newIsPublic);
      setIsCreateModalOpen(false);
      toast.success('Đã tạo lớp học thành công!');
    } catch (e: any) {
      toast.error(e.message || 'Tạo thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Leave ───────────────────────────────────────────────────────────

  const handleLeave = async (id: string) => {
    if (!(await appConfirm({ title: 'Rời lớp học?', description: 'Bạn có chắc chắn muốn rời khỏi lớp học này?', confirmLabel: 'Rời lớp', variant: 'destructive' }))) return;
    try {
      const currentUserId = user?.id || user?.userId;
      if (currentUserId) {
        await removeMember(id, currentUserId);
        await fetchClassrooms(); // Refresh list after leaving
        toast.success('Đã rời khỏi lớp học!');
      }
    } catch (e: any) {
      toast.error(e.message || 'Rời lớp thất bại');
    }
  };

  // ── Join by code ────────────────────────────────────────────────────────────

  const openJoinModal = () => {
    setJoinCode('');
    setJoinError('');
    setIsJoinModalOpen(true);
  };

  const submitJoin = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    setJoinError('');
    try {
      await joinByCode(joinCode.trim());
      setIsJoinModalOpen(false);
      setJoinCode('');
      toast.success('Đã tham gia / gửi yêu cầu tham gia lớp học thành công!');
    } catch (e: any) {
      setJoinError(e.message || 'Tham gia thất bại');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelRequest = async (classroomId: string, name: string) => {
    if (!(await appConfirm({ title: 'Hủy yêu cầu?', description: `Hủy yêu cầu tham gia lớp "${name}"?`, confirmLabel: 'Hủy yêu cầu', variant: 'destructive' }))) return;
    const currentUserId = user?.userId || user?.id;
    if (!currentUserId) return;
    try {
      await cancelJoinRequest(classroomId, currentUserId);
      toast.success('Đã hủy yêu cầu tham gia.');
    } catch (e: any) {
      toast.error(e.message || 'Hủy yêu cầu thất bại');
    }
  };

  // Filter
  const filteredClassrooms = cohorts.filter((cohort) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = cohort.title.toLowerCase().includes(query);
      const matchDesc = cohort.description?.toLowerCase().includes(query) || false;
      if (!matchTitle && !matchDesc) return false;
    }

    if (filterType === 'public' && !cohort.isPublic) return false;
    if (filterType === 'private' && cohort.isPublic) return false;

    return true;
  });

  // Pagination
  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.ceil((filteredClassrooms.length + 1) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClassrooms = filteredClassrooms.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const showAddCardOnThisPage = currentPage === totalPages || filteredClassrooms.length === 0;

  return (
    <div className='space-y-10 pb-12 transition-all p-6 md:p-12'>
      {/* Title section */}
      <div className='flex min-h-[92px] flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-black text-slate-900'>Lớp học của tôi</h1>
          <p className='text-slate-500 mt-1'>
            Quản lý các lớp học của bạn và tham gia các lớp học mới để học tập cùng thảo luận.
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-3'>
          <button
            className='inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-sky-50 px-4 text-sm font-semibold text-sky-600 shadow-xs transition-colors hover:bg-sky-100'
            onClick={openJoinModal}
          >
            <span className='material-symbols-outlined text-sm'>login</span>
            Tham gia bằng mã
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200'>
        <div className='relative flex-1 max-w-md'>
          <Input
            className='w-full bg-slate-50 pl-10 pr-4 py-2 rounded-lg text-sm border-slate-200 focus:bg-white transition-colors'
            placeholder='Tìm kiếm lớp học...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className='absolute left-3 top-2.5 size-4 text-slate-400' />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5'>
            <Filter className='size-3.5' /> Lọc
          </span>
          <div className='flex gap-1 bg-slate-100 p-1 rounded-lg text-xs'>
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'public', label: 'Công khai' },
              { value: 'private', label: 'Riêng tư' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilterType(item.value as 'all' | 'public' | 'private')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer border-0 ${filterType === item.value
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

      {/* ── Pending Join Requests ────────────────────────────────────── */}
      {pendingClassrooms.length > 0 && (
        <div className='mb-8'>
          <h4 className='text-sm font-bold text-amber-700 mb-4 flex items-center gap-2'>
            <span className='material-symbols-outlined text-lg'>
              hourglass_empty
            </span>
            Đang chờ duyệt ({pendingClassrooms.length})
          </h4>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {pendingClassrooms.map((pr) => (
              <div
                key={pr.requestId}
                className='relative rounded-2xl bg-amber-50/50 border border-amber-200 overflow-hidden flex flex-col group transition-all duration-300 opacity-90'
              >
                <div className='relative h-40 overflow-hidden bg-slate-100'>
                  <img
                    alt={pr.classroom.title}
                    src={mockImages[0]}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95'
                  />
                  <div className='absolute inset-0 bg-amber-950/20' />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='bg-amber-100 text-amber-800 px-4 py-2 rounded-full flex items-center gap-2 font-bold text-xs shadow-md'>
                      <span className='material-symbols-outlined text-[16px] animate-pulse'>
                        hourglass_empty
                      </span>
                      Đang chờ duyệt
                    </div>
                  </div>
                </div>
                <div className='p-4 flex flex-col flex-1'>
                  <h3 className='font-bold text-slate-800 leading-snug line-clamp-2 mb-4 h-10'>
                    {pr.classroom.title}
                  </h3>
                  <div className='mt-auto flex items-center justify-between pt-4 border-t border-amber-100 gap-3'>
                    <div className='text-xs text-amber-700 flex items-center gap-1'>
                      <span className='material-symbols-outlined text-sm align-middle'>
                        group
                      </span>
                      {pr.classroom._count.members} thành viên
                    </div>
                    <button
                      onClick={() =>
                        handleCancelRequest(pr.classroom.id, pr.classroom.title)
                      }
                      className='text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border-0 cursor-pointer'
                    >
                      <span className='material-symbols-outlined text-[14px] font-bold'>
                        close
                      </span>
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classroom Grid */}
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-72 bg-slate-100 animate-pulse rounded-2xl border border-slate-200'
            />
          ))}
        </div>
      ) : filteredClassrooms.length === 0 && !showAddCardOnThisPage ? (
        <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
          <SearchX className='size-10 text-slate-300 mx-auto mb-3' />
          <p className='text-slate-500 font-medium'>
            Không tìm thấy lớp học nào phù hợp.
          </p>
          <Button
            variant='outline'
            className='mt-4'
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className='space-y-8'>
          <section>
            <h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sky-500'>
                school
              </span>
              Danh sách lớp học
            </h2>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {paginatedClassrooms.map((cohort, index) => (
                <CatalogClassroomCard
                  key={cohort.id}
                  classroom={cohort}
                  index={startIndex + index}
                  userId={user?.id || user?.userId}
                  handleLeave={handleLeave}
                />
              ))}
              {showAddCardOnThisPage && (
                <AddNewClassroomCard onClick={handleCreateOpen} />
              )}
            </div>
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-2 pt-2'>
              <Button
                variant='outline'
                size='icon'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className='border border-slate-200 text-slate-600 rounded-lg hover:bg-sky-600 hover:text-white hover:border-sky-600 disabled:opacity-50 disabled:pointer-events-none'
              >
                <ChevronLeft className='size-4' />
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`font-bold w-10 h-10 rounded-lg transition-all ${currentPage === pageNum
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant='outline'
                size='icon'
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className='border border-slate-200 text-slate-600 rounded-lg hover:bg-sky-600 hover:text-white hover:border-sky-600 disabled:opacity-50 disabled:pointer-events-none'
              >
                <ChevronRight className='size-4' />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className='glass-panel p-6 rounded-3xl flex items-center gap-8 border border-sky-200/20 max-w-sm'>
        <div>
          <p className='text-3xl font-black text-slate-900'>
            {cohorts.length}
          </p>
          <p className='text-xs text-slate-500'>
            Tổng số Lớp học
          </p>
        </div>
        <div className='h-10 w-px bg-slate-200' />
        <div>
          <p className='text-3xl font-black text-slate-900'>
            {cohorts.filter((c) => c.isPublic).length}
          </p>
          <p className='text-xs text-slate-500'>Lớp công khai</p>
        </div>
      </div>

      {/* ── Create Classroom Modal ─────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl'>
            <h2 className='text-xl font-bold text-slate-900 mb-5 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sky-600'>
                add_circle
              </span>
              Tạo lớp học mới
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-1'>
                  Tên lớp học <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-850'
                  placeholder='Nhập tên lớp...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-1'>
                  Mô tả (Tùy chọn)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-855 resize-none'
                  placeholder='Nhập mô tả...'
                  rows={3}
                />
              </div>
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  role='switch'
                  aria-checked={newIsPublic}
                  onClick={() => setNewIsPublic((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0 ${newIsPublic ? 'bg-sky-500' : 'bg-slate-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${newIsPublic ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
                <label className='text-sm text-slate-700 font-medium'>
                  Lớp học công khai
                </label>
              </div>
            </div>
            <div className='mt-6 flex justify-end gap-3'>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className='px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors border-0 bg-transparent cursor-pointer'
              >
                Hủy
              </button>
              <button
                onClick={submitCreate}
                disabled={isSubmitting || !newTitle.trim()}
                className='px-5 py-2 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center gap-2 border-0 cursor-pointer'
              >
                {isSubmitting ? (
                  <>
                    <span className='material-symbols-outlined animate-spin text-sm'>
                      progress_activity
                    </span>
                    Đang tạo...
                  </>
                ) : (
                  'Tạo mới'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Join by Code Modal ─────────────────────────────────────────────── */}
      {isJoinModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl'>
            <h2 className='text-xl font-bold text-slate-900 mb-1 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sky-600'>
                login
              </span>
              Tham gia lớp học
            </h2>
            <p className='text-sm text-slate-500 mb-5'>
              Nhập mã lớp học (6 ký tự) do giáo viên cung cấp.
            </p>
            <input
              type='text'
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className='w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-855 text-center text-xl font-bold tracking-[0.3em] uppercase'
              placeholder='XXXXXX'
              maxLength={6}
            />
            {joinError && (
              <p className='mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg'>
                {joinError}
              </p>
            )}
            <div className='mt-6 flex justify-end gap-3'>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className='px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors border-0 bg-transparent cursor-pointer'
              >
                Hủy
              </button>
              <button
                onClick={submitJoin}
                disabled={isJoining || joinCode.length < 3}
                className='px-5 py-2 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center gap-2 border-0 cursor-pointer'
              >
                {isJoining ? (
                  <>
                    <span className='material-symbols-outlined animate-spin text-sm'>
                      progress_activity
                    </span>
                    Đang tham gia...
                  </>
                ) : (
                  'Tham gia'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
