'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { appConfirm } from '@/components/ui/app-dialog-provider';
import { callsApi } from '@/api/calls';
import { addMembers } from '@/api/classroom';

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

export default function AdminMembersPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const {
    classroom,
    members,
    loadingMembers,
    fetchMembers,
    removeMember,
    pendingMembers,
    fetchPendingMembers,
    approveMember,
    rejectMember,
    addMemberByEmail,
    updateMemberRole,
  } = useClassrooms();
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [addingError, setAddingError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Database autocomplete query matching
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEmailInput('');
    setSelectedUsers([]);
    setSearchResults([]);
    setAddingError('');
  };

  useEffect(() => {
    if (emailInput.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await callsApi.searchUsers(emailInput.trim());
        if (res && res.success && res.data) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [emailInput]);

  const currentUserId = user?.userId || user?.id;
  const currentMember = members?.find((m) => m?.userId === currentUserId);
  const currentUserRole = currentMember?.role;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;
    setIsAdding(true);
    setAddingError('');
    try {
      const userIds = selectedUsers.map((u) => u.id);
      const res = await addMembers(classroomId, userIds);
      if (res.success && res.data) {
        handleCloseAddModal();
        fetchMembers(classroomId); // Refresh the active member list
        toast.success(`Đã thêm thành công ${res.data.added} thành viên vào lớp học!`);
      } else {
        throw new Error(res.error || 'Thêm thành viên thất bại');
      }
    } catch (err: any) {
      setAddingError(err.message || 'Có lỗi xảy ra khi thêm thành viên');
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchMembers(classroomId);
      fetchPendingMembers(classroomId);
    }
  }, [classroomId, fetchMembers, fetchPendingMembers]);

  const handleCopyCode = () => {
    const code = classroom?.inviteCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Đã copy mã mời!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemove = async (userId: string, name: string | null) => {
    if (
      !(await appConfirm({ title: 'Xóa thành viên?', description: `Bạn có chắc muốn xóa ${name ?? 'thành viên này'} khỏi lớp học?`, confirmLabel: 'Xóa', variant: 'destructive' }))
    )
      return;
    try {
      await removeMember(classroomId, userId);
      toast.success(`Đã xóa thành viên ${name || ''} khỏi lớp học.`);
    } catch (e: any) {
      toast.error(e.message || 'Xóa thành viên thất bại');
    }
  };

  const handleApprove = async (userId: string, name: string | null) => {
    try {
      await approveMember(classroomId, userId);
      toast.success(`Đã duyệt thành viên ${name || ''} vào lớp học.`);
    } catch (e: any) {
      toast.error(e.message || 'Duyệt thành viên thất bại');
    }
  };

  const handleReject = async (userId: string, name: string | null) => {
    try {
      await rejectMember(classroomId, userId);
      toast.success(`Đã từ chối thành viên ${name || ''}.`);
    } catch (e: any) {
      toast.error(e.message || 'Từ chối thành viên thất bại');
    }
  };

  return (
    <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-100 bg-slate-50'>
        <h2 className='text-lg font-bold text-slate-800'>Quản lý Thành viên</h2>
        <p className='text-slate-500 text-sm mt-1'>
          Duyệt yêu cầu tham gia và quản lý học viên
        </p>
      </div>

      <div className='p-6 space-y-8'>
        {/* Invite Code */}
        <div>
          <h3 className='text-sm font-bold text-slate-700 mb-2 flex items-center gap-2'>
            <span className='material-symbols-outlined text-lg'>qr_code</span>{' '}
            Mã mời tham gia
          </h3>
          <div className='flex items-center gap-3 max-w-sm'>
            <div className='flex-1 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 font-mono text-center tracking-[0.25em] font-bold text-slate-800 select-all'>
              {classroom?.inviteCode ?? '------'}
            </div>
            <button
              onClick={handleCopyCode}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <span className='material-symbols-outlined text-[18px]'>
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Đã chép' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingMembers.length > 0 && (
          <div>
            <h3 className='text-sm font-bold text-amber-700 mb-3 flex items-center gap-2'>
              <span className='material-symbols-outlined text-lg'>
                hourglass_empty
              </span>
              Yêu cầu chờ duyệt ({pendingMembers.length})
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {pendingMembers.map((pm) => (
                <div
                  key={pm.id}
                  className='flex items-center justify-between border border-amber-200 bg-amber-50 rounded-xl p-3'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    {pm.user?.avatarUrl ? (
                      <img
                        alt={pm.user?.fullName ?? ''}
                        src={pm.user.avatarUrl}
                        className='w-10 h-10 rounded-full object-cover shrink-0'
                      />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0'>
                        {getInitials(pm.user?.fullName ?? pm.user?.email ?? 'User')}
                      </div>
                    )}
                    <div className='min-w-0'>
                      <h4 className='font-semibold text-slate-800 text-sm truncate'>
                        {pm.user?.fullName ?? pm.user?.email ?? 'Người đăng ký'}
                      </h4>
                      <p className='text-xs text-slate-500 truncate'>
                        {pm.user?.email ?? ''}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    <button
                      onClick={() => pm.user && handleApprove(pm.user.id, pm.user.fullName || pm.user.email)}
                      className='flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-all shadow-sm text-xs font-bold'
                    >
                      <span className='material-symbols-outlined text-[16px]'>
                        check_circle
                      </span>
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => pm.user && handleReject(pm.user.id, pm.user.fullName || pm.user.email)}
                      className='flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-bold'
                    >
                      <span className='material-symbols-outlined text-[16px]'>
                        cancel
                      </span>
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member List */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-bold text-slate-700 flex items-center gap-2'>
              <span className='material-symbols-outlined text-lg'>group</span>
              Danh sách thành viên ({members.length})
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors'
            >
              <span className='material-symbols-outlined text-[16px]'>
                person_add
              </span>
              Thêm thành viên
            </button>
          </div>
          {loadingMembers ? (
            <div className='text-center py-10 text-slate-400'>Đang tải...</div>
          ) : (
            <div className='space-y-2'>
              {members.map((m) => {
                const roleStyle = ROLE_LABELS[m.role] ?? ROLE_LABELS.member;
                return (
                  <div
                    key={m.id}
                    className='flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      {m.user?.avatarUrl ? (
                        <img
                          alt={m.user?.fullName ?? ''}
                          src={m.user.avatarUrl}
                          className='w-10 h-10 rounded-full object-cover shrink-0'
                        />
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0'>
                          {getInitials(m.user?.fullName ?? m.user?.email ?? 'User')}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <h4 className='font-semibold text-slate-800 text-sm truncate'>
                          {m.user?.fullName ?? m.user?.email ?? 'Thành viên'}
                        </h4>
                        <p className='text-xs text-slate-500 truncate mt-0.5'>
                          {m.user?.email ?? ''}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 shrink-0'>
                      {m.role !== 'owner' && currentUserRole === 'owner' ? (
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
                          className='text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm hover:bg-slate-100/80'
                        >
                          <option value='member'>Thành viên</option>
                          <option value='admin'>Quản trị viên</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleStyle.color}`}
                        >
                          {roleStyle.label}
                        </span>
                      )}
                      {m.role !== 'owner' && (
                        <button
                          onClick={() =>
                            handleRemove(m.userId, m.user?.fullName ?? '')
                          }
                          className='text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors'
                          title='Xóa thành viên'
                        >
                          <span className='material-symbols-outlined text-[20px] block'>
                            person_remove
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Dialog/Modal */}
      {showAddModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full mx-4 p-6 animate-scale-up'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3 mb-4'>
              <h3 className='text-base font-extrabold text-slate-800 flex items-center gap-2'>
                <span className='material-symbols-outlined text-sky-600'>
                  person_add
                </span>
                Thêm thành viên vào lớp học
              </h3>
              <button
                onClick={handleCloseAddModal}
                className='w-7 h-7 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors flex items-center justify-center'
              >
                <span className='material-symbols-outlined text-sm font-bold'>
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleAddMember} className='space-y-4'>
              {/* Selected Users Pills List */}
              {selectedUsers.length > 0 && (
                <div className='space-y-1.5'>
                  <label className='text-xs font-bold text-slate-500 uppercase tracking-wide'>
                    Thành viên đã chọn ({selectedUsers.length})
                  </label>
                  <div className='flex flex-wrap gap-2 p-3 border border-indigo-100 bg-indigo-50/30 rounded-xl max-h-36 overflow-y-auto animate-scale-up'>
                    {selectedUsers.map((su) => (
                      <div
                        key={su.id}
                        className='flex items-center gap-1.5 bg-white border border-slate-200 rounded-full pl-1.5 pr-2.5 py-1 text-xs shadow-sm hover:border-red-200 transition-colors group'
                      >
                        {su.avatarUrl ? (
                          <img
                            alt={su.fullName ?? ''}
                            src={su.avatarUrl}
                            className='w-5 h-5 rounded-full object-cover border border-slate-100'
                          />
                        ) : (
                          <div className='w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-extrabold text-[9px]'>
                            {getInitials(su.fullName ?? su.email)}
                          </div>
                        )}
                        <span className='font-semibold text-slate-700 max-w-[100px] truncate'>
                          {su.fullName || su.email}
                        </span>
                        <button
                          type='button'
                          onClick={() => setSelectedUsers((prev) => prev.filter((u) => u.id !== su.id))}
                          className='text-slate-400 hover:text-red-500 font-bold transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 w-4 h-4 ml-0.5'
                          title='Hủy chọn'
                        >
                          <span className='material-symbols-outlined text-[12px] font-extrabold'>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search input field */}
              <div className='space-y-1.5 relative'>
                <label className='text-xs font-bold text-slate-500 uppercase tracking-wide'>
                  Tìm kiếm thành viên
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Nhập tên hoặc Email để tìm kiếm...'
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className='flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2'
                  />
                  {isSearching && (
                    <span className='material-symbols-outlined text-[18px] animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
                      progress_activity
                    </span>
                  )}
                </div>

                {/* Autocomplete Dropdown List */}
                {searchResults.length > 0 && (
                  <div className='absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100'>
                    {searchResults.map((su) => (
                      <div
                        key={su.id}
                        onClick={() => {
                          if (!selectedUsers.some((u) => u.id === su.id)) {
                            setSelectedUsers((prev) => [...prev, su]);
                          }
                          setEmailInput('');
                          setSearchResults([]);
                        }}
                        className='flex items-center gap-3 p-2.5 hover:bg-sky-50/50 cursor-pointer transition-colors'
                      >
                        {su.avatarUrl ? (
                          <img
                            alt={su.fullName ?? ''}
                            src={su.avatarUrl}
                            className='w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200'
                          />
                        ) : (
                          <div className='w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs shrink-0'>
                            {getInitials(su.fullName ?? su.email)}
                          </div>
                        )}
                        <div className='min-w-0 flex-1'>
                          <h4 className='font-bold text-slate-800 text-xs truncate'>
                            {su.fullName || 'Chưa đặt tên'}
                          </h4>
                          <p className='text-[10px] text-slate-400 font-medium truncate mt-0.5'>
                            {su.email}
                          </p>
                        </div>
                        <span className='material-symbols-outlined text-sky-500 text-[18px] shrink-0 font-bold opacity-0 hover:opacity-100 transition-opacity mr-2'>
                          check
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {addingError && (
                <div className='p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-bold'>
                  {addingError}
                </div>
              )}

              <div className='flex justify-end gap-2.5 pt-3 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={handleCloseAddModal}
                  className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={selectedUsers.length === 0 || isAdding}
                  className='bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs px-4 py-2 shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
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
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
