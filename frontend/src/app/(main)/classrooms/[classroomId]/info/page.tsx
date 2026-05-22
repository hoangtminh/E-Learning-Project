'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: 'Chủ phòng', color: 'bg-indigo-100 text-indigo-700' },
  admin: { label: 'Quản trị', color: 'bg-sky-100 text-sky-700' },
  member: { label: 'Thành viên', color: 'bg-slate-100 text-slate-600' },
};

export default function ClassroomInfoPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.classroomId as string;

  const {
    classroom,
    members,
    loadingMembers,
    fetchMembers,
    removeMember,
    addMemberByEmail,
    updateMemberRole,
  } = useClassrooms();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [addingError, setAddingError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [kickTarget, setKickTarget] = useState<any>(null);
  const [isKicking, setIsKicking] = useState(false);
  const [kickError, setKickError] = useState('');

  useEffect(() => {
    if (classroomId) {
      fetchMembers(classroomId);
    }
  }, [classroomId, fetchMembers]);

  const currentUserId = user?.userId || user?.id;
  const currentMember = members?.find((m) => m?.userId === currentUserId);
  const currentUserRole = currentMember?.role;
  const isOwnerOrAdmin =
    currentUserRole === 'owner' || currentUserRole === 'admin';

  const filteredMembers = (members ?? []).filter((m) => {
    const name = m?.user?.fullName ?? m?.user?.email ?? '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsAdding(true);
    setAddingError('');
    try {
      await addMemberByEmail(classroomId, emailInput.trim());
      setShowAddModal(false);
      setEmailInput('');
      toast.success('Đã thêm thành viên thành công!');
    } catch (err: any) {
      setAddingError(err.message || 'Có lỗi xảy ra khi thêm thành viên');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className='p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
        {/* Left Column */}
        <div className='lg:col-span-8 space-y-6 sm:space-y-8'>
          {/* General Info */}
          <section>
            <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2 mb-4 px-2'>
              <span
                className='material-symbols-outlined text-sky-600'
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              Thông tin chung
            </h2>
            <div className='p-4 sm:p-6 bg-white border border-slate-200 space-y-4 sm:space-y-5 rounded-md shadow-sm'>
              <div>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                  Tên lớp học
                </h3>
                <p className='text-lg text-slate-800 font-extrabold'>
                  {classroom?.title}
                </p>
              </div>
              <div>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                  Mô tả chi tiết
                </h3>
                <p className='text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-semibold'>
                  {classroom?.description ||
                    'Chưa có mô tả nào cho lớp học này.'}
                </p>
              </div>
              <div className='flex gap-8 border-t border-slate-100 pt-4'>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    Ngày khởi tạo
                  </h3>
                  <p className='text-sm text-slate-700 font-semibold'>
                    {classroom?.createdAt
                      ? new Date(classroom.createdAt).toLocaleDateString(
                          'vi-VN',
                        )
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    Trạng thái
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-bold inline-block ${classroom?.isPublic ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {classroom?.isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    Số thành viên
                  </h3>
                  <p className='text-sm text-slate-700 font-extrabold'>
                    {classroom?._count?.members ?? members?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Members Section */}
          <section>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 px-2 gap-4'>
              <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
                <span
                  className='material-symbols-outlined text-purple-600'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  group
                </span>
                Thành viên
                <span className='ml-1 bg-slate-200 text-slate-600 rounded-full px-2.5 py-0.5 text-xs font-bold'>
                  {members?.length ?? 0}
                </span>
              </h2>
              <div className='flex items-center gap-3 w-full sm:w-auto shrink-0'>
                {/* Search Input component */}
                <div className='relative flex-1 sm:flex-initial'>
                  <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm'>
                    search
                  </span>
                  <Input
                    type='text'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder='Tìm thành viên...'
                    className='pl-9 rounded-md text-sm max-w-xs'
                  />
                </div>
                {/* Add Member Button component */}
                {isOwnerOrAdmin && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className='flex items-center gap-1.5 rounded-md text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                  >
                    <span className='material-symbols-outlined text-[18px]'>
                      person_add
                    </span>
                    Thêm thành viên
                  </Button>
                )}
              </div>
            </div>

            {loadingMembers ? (
              <div className='flex items-center justify-center py-12 text-slate-400 font-bold text-sm'>
                <span className='material-symbols-outlined animate-spin mr-2'>
                  progress_activity
                </span>
                Đang tải danh sách thành viên...
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                {filteredMembers.map((m) => {
                  const roleStyle =
                    ROLE_LABELS[m?.role || 'member'] ?? ROLE_LABELS.member;
                  const isCurrentUser = m?.userId === currentUserId;
                  const canManage =
                    isOwnerOrAdmin &&
                    !isCurrentUser &&
                    (currentUserRole === 'owner' || m?.role !== 'admin');

                  return (
                    <div
                      key={m?.id}
                      className='bg-white border border-slate-200 p-3 sm:p-4 rounded-md flex items-center justify-between gap-3 sm:gap-4 transition-all hover:border-slate-300 shadow-sm'
                    >
                      <div className='flex items-center gap-3 min-w-0 flex-1'>
                        {m?.user?.avatarUrl ? (
                          <img
                            alt={m?.user?.fullName ?? ''}
                            src={m.user.avatarUrl}
                            className='w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm'
                          />
                        ) : (
                          <div className='w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shrink-0 border border-slate-100 shadow-sm'>
                            {getInitials(m?.user?.fullName ?? m?.user?.email)}
                          </div>
                        )}
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-bold text-slate-800 truncate text-sm flex items-center gap-1.5'>
                            {m?.user?.fullName ?? m?.user?.email}
                            {isCurrentUser && (
                              <span className='text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-extrabold'>
                                (Bạn)
                              </span>
                            )}
                          </h4>
                          <p className='text-xs text-slate-400 truncate mt-0.5'>
                            {m?.user?.email}
                          </p>
                          <span
                            className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${roleStyle.color}`}
                          >
                            {roleStyle.label}
                          </span>
                        </div>
                      </div>

                      {canManage && (
                        <div className='flex items-center gap-2 shrink-0'>
                          {currentUserRole === 'owner' && m.role !== 'owner' && (
                            <select
                              value={m.role}
                              onChange={async (e) => {
                                const nextRole = e.target.value as 'admin' | 'member';
                                try {
                                  await updateMemberRole(
                                    classroomId,
                                    m.userId,
                                    nextRole,
                                  );
                                  toast.success('Cập nhật vai trò thành công!');
                                } catch (e: any) {
                                  toast.error(e.message || 'Lỗi cập nhật vai trò');
                                }
                              }}
                              className='text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer'
                            >
                              <option value='member'>Thành viên</option>
                              <option value='admin'>Quản trị viên</option>
                            </select>
                          )}
                          <Button
                            variant='ghost'
                            size='icon'
                            className='w-8 h-8 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50'
                            title='Xóa khỏi lớp'
                            onClick={() => setKickTarget(m)}
                          >
                            <span className='material-symbols-outlined text-[18px]'>
                              person_remove
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column / Sidebar */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Support card */}
          <div className='bg-gradient-to-br from-purple-100 to-sky-100 p-6 rounded-md relative overflow-hidden shadow-sm border border-sky-200/50'>
            <div className='absolute -right-4 -top-4 w-24 h-24 bg-white/40 rounded-full blur-2xl' />
            <h3 className='text-lg font-extrabold text-purple-900 mb-2 relative z-10'>
              Hỗ trợ học tập
            </h3>
            <p className='text-sm text-purple-800/80 mb-4 relative z-10 font-semibold leading-relaxed'>
              Bạn gặp khó khăn trong quá trình học tập? Hãy liên hệ với chúng
              tôi để nhận sự trợ giúp sớm nhất.
            </p>
            <Button
              variant='default'
              className='bg-white/90 text-purple-600 font-extrabold px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-white transition-colors relative z-10 border border-purple-200/20 shadow-sm'
            >
              <span className='material-symbols-outlined text-sm font-bold'>
                support_agent
              </span>
              Chat với Trợ giảng
            </Button>
          </div>
        </div>
      </div>

      {/* Add Member Dialog/Modal */}
      {showAddModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white rounded-md shadow-xl border border-slate-200 max-w-md w-full mx-4 p-6 animate-scale-up'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3 mb-4'>
              <h3 className='text-base font-extrabold text-slate-800 flex items-center gap-2'>
                <span className='material-symbols-outlined text-sky-600'>
                  person_add
                </span>
                Thêm thành viên bằng Email
              </h3>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowAddModal(false)}
                className='w-7 h-7 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors'
              >
                <span className='material-symbols-outlined text-sm font-bold'>
                  close
                </span>
              </Button>
            </div>

            <form onSubmit={handleAddMember} className='space-y-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-500 uppercase tracking-wide'>
                  Địa chỉ Email
                </label>
                <Input
                  type='email'
                  required
                  placeholder='e.g., user@example.com'
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className='rounded-md text-sm'
                />
              </div>

              {addingError && (
                <div className='p-3 bg-red-50 border border-red-100 rounded-md text-xs text-red-600 font-bold'>
                  {addingError}
                </div>
              )}

              <div className='flex justify-end gap-2.5 pt-3 border-t border-slate-100'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowAddModal(false)}
                  className='rounded-md text-xs font-bold'
                >
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={isAdding}
                  className='bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-md text-xs shadow-sm flex items-center gap-1.5'
                >
                  {isAdding ? (
                    <span className='material-symbols-outlined animate-spin text-[16px]'>
                      progress_activity
                    </span>
                  ) : (
                    <span className='material-symbols-outlined text-[16px] font-bold'>
                      add
                    </span>
                  )}
                  Thêm thành viên
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kick Member Confirmation Dialog */}
      {kickTarget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white rounded-md shadow-xl border border-slate-200 max-w-md w-full mx-4 p-6 animate-scale-up'>
            <div className='flex items-center gap-3 text-red-600 border-b border-slate-100 pb-3 mb-4'>
              <span className='material-symbols-outlined text-2xl'>
                warning
              </span>
              <h3 className='text-base font-extrabold text-slate-800'>
                Xóa{' '}
                {kickTarget.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
              </h3>
            </div>

            <div className='space-y-3 mb-6'>
              <p className='text-sm text-slate-600 leading-relaxed font-semibold'>
                Bạn có chắc chắn muốn xóa{' '}
                <strong>
                  {kickTarget.user?.fullName || kickTarget.user?.email}
                </strong>{' '}
                ra khỏi lớp học không?
              </p>
              <p className='text-xs text-red-500 bg-red-50 border border-red-100 rounded-md p-2.5 font-bold leading-normal'>
                Hành động này không thể hoàn tác. Người dùng sẽ mất toàn bộ
                quyền truy cập và các dữ liệu liên quan.
              </p>
            </div>

            {kickError && (
              <div className='p-3 mb-4 bg-red-50 border border-red-100 rounded-md text-xs text-red-600 font-bold animate-pulse'>
                {kickError}
              </div>
            )}

            <div className='flex justify-end gap-2.5 pt-3 border-t border-slate-100'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setKickTarget(null);
                  setKickError('');
                }}
                className='rounded-md text-xs font-bold'
              >
                Hủy
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={async () => {
                  if (kickTarget.userId === currentUserId) {
                    setKickError(
                      'Bạn không thể tự xóa chính mình khỏi lớp học.',
                    );
                    return;
                  }
                  const roleWeights: Record<string, number> = {
                    owner: 3,
                    admin: 2,
                    member: 1,
                  };
                  const myWeight = roleWeights[currentUserRole ?? ''] ?? 0;
                  const targetWeight = roleWeights[kickTarget.role] ?? 0;

                  if (targetWeight >= myWeight) {
                    setKickError(
                      'Bạn không thể xóa người có quyền cao hơn hoặc bằng bạn.',
                    );
                    return;
                  }

                  setIsKicking(true);
                  setKickError('');
                  try {
                    await removeMember(classroomId, kickTarget.userId);
                    setKickTarget(null);
                    toast.success('Đã xóa thành viên khỏi lớp!');
                  } catch (err: any) {
                    setKickError(err.message || 'Xóa thành viên thất bại');
                  } finally {
                    setIsKicking(false);
                  }
                }}
                disabled={isKicking}
                className='bg-red-600 hover:bg-red-700 text-white font-bold rounded-md text-xs shadow-sm flex items-center gap-1.5'
              >
                {isKicking ? (
                  <span className='material-symbols-outlined animate-spin text-[16px]'>
                    progress_activity
                  </span>
                ) : (
                  <span className='material-symbols-outlined text-[16px] font-bold'>
                    delete
                  </span>
                )}
                Xóa ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
