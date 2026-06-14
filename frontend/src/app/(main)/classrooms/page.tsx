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
  School,
  LogOut,
  Users,
  Settings,
  X,
  Lock,
  Globe,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { appConfirm } from '@/components/ui/app-dialog-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className='bg-white border border-outline-variant/30 rounded-2xl overflow-hidden group flex flex-col hover:shadow-xs hover:border-primary/45 transition-all duration-300 relative h-full'>
      {/* Leave Classroom button */}
      {userId !== classroom.ownerId && (
        <div className='absolute top-2 right-2 sm:top-3 sm:right-3 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'>
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLeave(classroom.id);
            }}
            className='bg-error hover:bg-error/90 text-white px-2 py-1.5 rounded-lg flex items-center justify-center transition-colors shadow-md text-[10px] sm:text-xs font-bold gap-1 cursor-pointer border-0 active:scale-95'
            title='Rời lớp học'
          >
            <LogOut className='size-3 sm:size-3.5' />
            <span className='hidden xs:inline'>Rời lớp</span>
          </button>
        </div>
      )}

      <Link
        href={`/classrooms/${classroom.id}`}
        className='relative h-24 sm:h-36 overflow-hidden bg-slate-100 block'
      >
        <img
          src={coverImage}
          alt={classroom.title}
          className='w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500'
        />
        <div className='absolute top-2 left-2 px-1.5 py-0.5 sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 bg-slate-950/70 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10'>
          {classroom.isPublic ? (
            <>
              <Globe className='size-2.5 sm:size-3 text-white' />
              <span className='text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider'>Công khai</span>
            </>
          ) : (
            <>
              <Lock className='size-2.5 sm:size-3 text-white' />
              <span className='text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider'>Riêng tư</span>
            </>
          )}
        </div>
      </Link>

      <div className='p-2.5 sm:p-4.5 flex flex-col flex-1'>
        <Link href={`/classrooms/${classroom.id}`}>
          <h3 className='font-bold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1.5 h-8 sm:h-10 text-xs sm:text-base'>
            {classroom.title}
          </h3>
        </Link>
        <p className='hidden sm:block text-on-surface-variant/80 text-xs line-clamp-2 mb-4 h-8 leading-relaxed'>
          {classroom.description || 'Chưa có mô tả chi tiết cho lớp học này.'}
        </p>

        <div className='mt-auto flex items-center justify-between pt-2.5 sm:pt-4.5 border-t border-outline-variant/20 gap-2 sm:gap-3'>
          <div className='min-w-0'>
            <p className='text-[8px] sm:text-[10px] text-on-surface-variant/70 truncate flex items-center gap-1 sm:gap-1.5'>
              Giảng viên: <span className='font-bold text-on-surface'>{classroom.owner?.fullName || 'Chưa cập nhật'}</span>
            </p>
            <p className='text-xs sm:text-sm font-black text-on-surface mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5'>
              <Users className='size-3 sm:size-4 text-on-surface-variant/50 hidden sm:block' />
              {classroom._count?.members ?? classroom.members?.length ?? 0} học viên
            </p>
          </div>
          <Link
            href={`/classrooms/${classroom.id}`}
            className='px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl bg-primary text-white text-[10px] sm:text-xs font-bold hover:bg-primary-dim shadow-xs transition-all active:scale-[0.97] shrink-0'
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
      className='border border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center p-4 sm:p-6 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group cursor-pointer h-full min-h-[170px] sm:min-h-[290px] w-full bg-white/50'
    >
      <div className='w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-[1.05] transition-transform'>
        <Plus className='text-primary size-4 sm:size-6' />
      </div>
      <h5 className='text-xs sm:text-base font-bold text-on-surface'>
        Tạo Lớp Học Mới
      </h5>
      <p className='hidden sm:block text-[10px] sm:text-xs text-on-surface-variant/70 mt-1.5 text-center max-w-[200px] leading-relaxed'>
        Khởi tạo không gian học tập, chia sẻ tài liệu và quản lý các bài tập nhóm.
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

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  // ── Create ──────────────────────────────────────────────────────────────────

  const handleCreateOpen = () => {
    if (!isInstructor) {
      toast.error('Chỉ giảng viên mới được phép tạo lớp học');
      return;
    }
    setNewTitle('');
    setNewDesc('');
    setNewIsPublic(false);
    setIsCreateModalOpen(true);
  };

  const submitCreate = async () => {
    if (!newTitle.trim()) return;
    if (!isInstructor) {
      toast.error('Chỉ giảng viên mới được phép tạo lớp học');
      return;
    }
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
  const showAddCardOnThisPage = (currentPage === totalPages || filteredClassrooms.length === 0) && isInstructor;

  return (
    <div className='pb-16 transition-all p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8 bg-surface-container-lowest min-h-screen text-on-surface relative'>
      <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />

      {/* Title section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-outline-variant/30 pb-4 sm:pb-6 relative z-10'>
        <div>
          <h1 className='text-xl sm:text-2xl font-black text-on-surface tracking-tight'>Lớp học của tôi</h1>
          <p className='text-xs sm:text-sm text-on-surface-variant/85 mt-1 max-w-2xl'>
            Quản lý các lớp học của bạn và tham gia phòng học mới để trao đổi thảo luận.
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-3 self-start sm:self-center'>
          <button
            className='inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary/10 hover:bg-primary/15 px-4 text-xs font-bold text-primary active:scale-[0.98] shadow-xs transition-all'
            onClick={openJoinModal}
          >
            <Plus className='size-3.5' />
            Tham gia bằng mã
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center bg-white p-3 rounded-2xl border border-outline-variant/30 relative z-10 shadow-xs'>
        <div className='relative flex-1 max-w-md'>
          <Input
            className='w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border-outline-variant/40 focus-visible:ring-primary/20 focus:bg-white transition-colors h-10'
            placeholder='Tìm kiếm lớp học...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className='absolute left-3 top-3 size-4 text-on-surface-variant/45' />
        </div>

        <div className='flex items-center gap-2 self-end sm:self-center'>
          <span className='text-xs font-bold text-on-surface-variant/75 uppercase tracking-wider flex items-center gap-1.5 shrink-0'>
            <Filter className='size-3.5' /> Lọc
          </span>
          <div className='flex gap-1 bg-surface-container p-1 rounded-xl text-xs border border-outline-variant/20'>
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'public', label: 'Công khai' },
              { value: 'private', label: 'Riêng tư' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilterType(item.value as 'all' | 'public' | 'private')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer border-0 transition-all text-[11px] ${filterType === item.value
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

      {/* ── Pending Join Requests ────────────────────────────────────── */}
      {pendingClassrooms.length > 0 && (
        <div className='mb-6 relative z-10'>
          <h4 className='text-xs font-bold text-orange-600 mb-4 flex items-center gap-2 uppercase tracking-wider'>
            <School className='size-4 animate-pulse' />
            Đang chờ duyệt ({pendingClassrooms.length})
          </h4>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'>
            {pendingClassrooms.map((pr) => (
              <div
                key={pr.requestId}
                className='relative rounded-2xl bg-white border border-outline-variant/30 overflow-hidden flex flex-col group transition-all duration-350 shadow-xs'
              >
                <div className='relative h-24 sm:h-32 overflow-hidden bg-slate-100'>
                  <img
                    alt={pr.classroom.title}
                    src={mockImages[0]}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95'
                  />
                  <div className='absolute inset-0 bg-slate-950/20' />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='bg-orange-500/15 text-orange-600 border border-orange-500/25 px-2 py-1 sm:px-4 sm:py-1.5 rounded-lg flex items-center gap-1 font-bold text-[8px] sm:text-[10px] uppercase tracking-wider shadow-sm backdrop-blur-xs'>
                      <span className='w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-orange-500 animate-pulse' />
                      <span className='hidden xs:inline'>Chờ duyệt</span>
                      <span className='xs:hidden'>Chờ</span>
                    </div>
                  </div>
                </div>
                <div className='p-3 sm:p-4.5 flex flex-col flex-1'>
                  <h3 className='font-bold text-on-surface leading-snug line-clamp-2 mb-2 sm:mb-4 h-8 sm:h-10 text-xs sm:text-base'>
                    {pr.classroom.title}
                  </h3>
                  <div className='mt-auto flex items-center justify-between pt-3 sm:pt-4.5 border-t border-outline-variant/20 gap-2 sm:gap-3'>
                    <div className='text-[10px] sm:text-xs font-bold text-on-surface-variant flex items-center gap-1 min-w-0'>
                      <Users className='size-3 sm:size-3.5 shrink-0' />
                      <span className='truncate'>{pr.classroom._count.members} hv</span>
                    </div>
                    <button
                      onClick={() =>
                        handleCancelRequest(pr.classroom.id, pr.classroom.title)
                      }
                      className='text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-error hover:text-white flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-error/10 hover:bg-error rounded-lg sm:rounded-xl transition-all border-0 cursor-pointer active:scale-95 shrink-0'
                    >
                      <X size={10} className='sm:size-3' />
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
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 relative z-10'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-40 sm:h-64 bg-slate-100 animate-pulse rounded-2xl border border-outline-variant/25'
            />
          ))}
        </div>
      ) : filteredClassrooms.length === 0 && !showAddCardOnThisPage ? (
        <div className='text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant/40 relative z-10'>
          <SearchX className='size-8 text-on-surface-variant/35 mx-auto mb-3' />
          <p className='text-sm text-on-surface-variant font-bold mb-1'>
            Không tìm thấy lớp học nào phù hợp.
          </p>
          <p className='text-xs text-on-surface-variant/70 mb-4'>
            Thử thay đổi từ khóa tìm kiếm hoặc các tùy chọn lọc.
          </p>
          <Button
            variant='outline'
            className='rounded-xl text-xs h-9 cursor-pointer'
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className='space-y-8 relative z-10'>
          <section>
            <div className='flex items-center gap-2 mb-5'>
              <School className='size-5 text-primary' />
              <h2 className='text-sm sm:text-base font-black text-on-surface uppercase tracking-wider'>
                Danh sách lớp học
              </h2>
            </div>

            <motion.div 
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {paginatedClassrooms.map((cohort, index) => (
                <motion.div
                  key={cohort.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
                  }}
                >
                  <CatalogClassroomCard
                    classroom={cohort}
                    index={startIndex + index}
                    userId={user?.id || user?.userId}
                    handleLeave={handleLeave}
                  />
                </motion.div>
              ))}
              {showAddCardOnThisPage && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
                  }}
                >
                  <AddNewClassroomCard onClick={handleCreateOpen} />
                </motion.div>
              )}
            </motion.div>
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-2 pt-4'>
              <Button
                variant='outline'
                size='icon'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className='border-outline-variant/35 text-on-surface-variant/80 rounded-xl hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:pointer-events-none w-9 h-9 cursor-pointer'
              >
                <ChevronLeft className='size-4' />
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`font-bold w-9 h-9 rounded-xl transition-all text-xs cursor-pointer ${currentPage === pageNum
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white border border-outline-variant/30 text-on-surface-variant/80 hover:bg-slate-50'
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
                className='border-outline-variant/35 text-on-surface-variant/80 rounded-xl hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:pointer-events-none w-9 h-9 cursor-pointer'
              >
                <ChevronRight className='size-4' />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className='bg-white border border-outline-variant/30 p-5 rounded-2xl flex items-center gap-6 max-w-sm relative z-10 shadow-xs'>
        <div>
          <p className='text-2xl font-black text-on-surface'>
            {cohorts.length}
          </p>
          <p className='text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider mt-0.5'>
            Tổng số Lớp học
          </p>
        </div>
        <div className='h-8 w-px bg-outline-variant/30' />
        <div>
          <p className='text-2xl font-black text-on-surface'>
            {cohorts.filter((c) => c.isPublic).length}
          </p>
          <p className='text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider mt-0.5'>Lớp công khai</p>
        </div>
      </div>

      {/* ── Create Classroom Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4'>
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-outline-variant/30'
            >
              <div className='flex items-center justify-between border-b border-outline-variant/20 pb-3.5 mb-4'>
                <h2 className='text-sm sm:text-base font-black text-on-surface uppercase tracking-wider flex items-center gap-2'>
                  <School className='size-4 text-primary' />
                  Tạo lớp học mới
                </h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className='text-on-surface-variant/60 hover:text-on-surface cursor-pointer border-0 bg-transparent'
                >
                  <X size={18} />
                </button>
              </div>

              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <label className='block text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Tên lớp học <span className='text-error'>*</span>
                  </label>
                  <input
                    type='text'
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className='w-full px-4 py-2 text-xs sm:text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface h-10'
                    placeholder='Nhập tên lớp...'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='block text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Mô tả (Tùy chọn)
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className='w-full px-4 py-3 text-xs sm:text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface resize-none leading-relaxed'
                    placeholder='Nhập mô tả chi tiết lớp học...'
                    rows={3}
                  />
                </div>
                <div className='flex items-center gap-3 pt-1'>
                  <button
                    type='button'
                    role='switch'
                    aria-checked={newIsPublic}
                    onClick={() => setNewIsPublic((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-0 ${newIsPublic ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${newIsPublic ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                  <label className='text-xs sm:text-sm text-on-surface-variant font-bold uppercase tracking-wider cursor-pointer'>
                    Lớp học công khai
                  </label>
                </div>
              </div>
              
              <div className='mt-6 flex justify-end gap-3 border-t border-outline-variant/20 pt-4.5'>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className='px-4 py-2 text-xs font-bold text-on-surface-variant/80 hover:bg-slate-50 rounded-xl transition-colors border-0 bg-transparent cursor-pointer'
                >
                  Hủy
                </button>
                <button
                  onClick={submitCreate}
                  disabled={isSubmitting || !newTitle.trim()}
                  className='px-5 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dim transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 border-0 cursor-pointer text-xs h-9'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='animate-spin size-3.5' />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo mới'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Join by Code Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4'>
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className='bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-outline-variant/30'
            >
              <div className='flex items-center justify-between border-b border-outline-variant/20 pb-3.5 mb-3.5'>
                <h2 className='text-sm sm:text-base font-black text-on-surface uppercase tracking-wider flex items-center gap-2'>
                  <School className='size-4 text-primary' />
                  Tham gia lớp học
                </h2>
                <button 
                  onClick={() => setIsJoinModalOpen(false)}
                  className='text-on-surface-variant/60 hover:text-on-surface cursor-pointer border-0 bg-transparent'
                >
                  <X size={18} />
                </button>
              </div>

              <p className='text-xs text-on-surface-variant/75 leading-relaxed mb-4'>
                Nhập mã lớp học (gồm 6 ký tự) do giáo viên của bạn cung cấp.
              </p>
              <input
                type='text'
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className='w-full px-4 py-3 border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface text-center text-xl font-bold tracking-[0.2em] uppercase h-12'
                placeholder='MÃ LỚP'
                maxLength={6}
              />
              {joinError && (
                <p className='mt-3 text-xs text-error bg-error/5 px-3 py-2 rounded-lg border border-error/15 font-semibold leading-relaxed'>
                  {joinError}
                </p>
              )}
              
              <div className='mt-6 flex justify-end gap-3 border-t border-outline-variant/20 pt-4.5'>
                <button
                  onClick={() => setIsJoinModalOpen(false)}
                  className='px-4 py-2 text-xs font-bold text-on-surface-variant/80 hover:bg-slate-50 rounded-xl transition-colors border-0 bg-transparent cursor-pointer'
                >
                  Hủy
                </button>
                <button
                  onClick={submitJoin}
                  disabled={isJoining || joinCode.length < 3}
                  className='px-5 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dim transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 border-0 cursor-pointer text-xs h-9'
                >
                  {isJoining ? (
                    <>
                      <Loader2 className='animate-spin size-3.5' />
                      Đang gửi...
                    </>
                  ) : (
                    'Tham gia'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
