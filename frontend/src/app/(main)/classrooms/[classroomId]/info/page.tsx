'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useClassrooms } from '@/contexts/ClassroomContext';

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
  const classroomId = params.classroomId as string;
  const {
    classroom,
    members,
    loadingMembers,
    fetchMembers,
    removeMember,
    pendingMembers,
    loadingPending,
    fetchPendingMembers,
    approveMember,
    rejectMember,
  } = useClassrooms();

  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemove = async (userId: string, name: string | null) => {
    if (
      !confirm(
        `Bạn có chắc muốn xóa ${name ?? 'thành viên này'} khỏi lớp học?`,
      )
    )
      return;
    try {
      await removeMember(classroomId, userId);
    } catch (e: any) {
      alert(e.message || 'Xóa thành viên thất bại');
    }
  };

  // The current user's role (we identify by comparing with owner from classroom)
  const currentUserIsAdminOrOwner =
    classroom?.members?.some(
      (m) => m.role === 'owner' || m.role === 'admin',
    ) ?? false;

  const filteredMembers = members.filter((m) => {
    const name = m.user.fullName ?? m.user.email;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto w-full'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* Left Column */}
        <div className='lg:col-span-8 space-y-8'>
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
            <div className='p-6 bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 space-y-5 shadow-sm'>
              <div>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                  Tên lớp học
                </h3>
                <p className='text-lg text-slate-800 font-semibold'>
                  {classroom?.title}
                </p>
              </div>
              <div>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                  Mô tả chi tiết
                </h3>
                <p className='text-slate-700 whitespace-pre-wrap leading-relaxed'>
                  {classroom?.description || 'Chưa có mô tả nào cho lớp học này.'}
                </p>
              </div>
              <div className='flex gap-8'>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    Ngày khởi tạo
                  </h3>
                  <p className='text-slate-700'>
                    {classroom?.createdAt
                      ? new Date(classroom.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    Trạng thái
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${classroom?.isPublic ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {classroom?.isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    Số thành viên
                  </h3>
                  <p className='text-slate-700 font-semibold'>
                    {classroom?._count?.members ?? members.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pending Members Section (Admin/Owner only) */}
          {currentUserIsAdminOrOwner && pendingMembers.length > 0 && (
            <section>
              <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2 mb-4 px-2'>
                <span
                  className='material-symbols-outlined text-amber-500'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  hourglass_empty
                </span>
                Yêu cầu tham gia
                <span className='ml-1 bg-amber-100 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-semibold'>
                  {pendingMembers.length}
                </span>
              </h2>

              <div className='bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 space-y-3'>
                {pendingMembers.map((pm) => (
                  <div
                    key={pm.id}
                    className='flex items-center justify-between border-b border-slate-100 last:border-0 pb-3 last:pb-0'
                  >
                    <div className='flex items-center gap-3'>
                      {pm.user.avatarUrl ? (
                        <img
                          alt={pm.user.fullName ?? ''}
                          src={pm.user.avatarUrl}
                          className='w-10 h-10 rounded-full object-cover shrink-0'
                        />
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-xs shrink-0'>
                          {getInitials(pm.user.fullName ?? pm.user.email)}
                        </div>
                      )}
                      <div>
                        <h4 className='font-semibold text-slate-800 text-sm'>
                          {pm.user.fullName ?? pm.user.email}
                        </h4>
                        <p className='text-xs text-slate-400'>{pm.user.email}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={async () => {
                          try {
                            await approveMember(classroomId, pm.user.id);
                          } catch (e: any) {
                            alert(e.message || 'Lỗi duyệt thành viên');
                          }
                        }}
                        className='bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1'
                      >
                        <span className='material-symbols-outlined text-[16px]'>check</span>
                        Duyệt
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await rejectMember(classroomId, pm.user.id);
                          } catch (e: any) {
                            alert(e.message || 'Lỗi từ chối thành viên');
                          }
                        }}
                        className='bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1'
                      >
                        <span className='material-symbols-outlined text-[16px]'>close</span>
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Members Section */}
          <section>
            <div className='flex items-center justify-between mb-4 px-2'>
              <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
                <span
                  className='material-symbols-outlined text-purple-600'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  group
                </span>
                Thành viên
                <span className='ml-1 bg-slate-200 text-slate-600 rounded-full px-2.5 py-0.5 text-xs font-semibold'>
                  {members.length}
                </span>
              </h2>
              {/* Search */}
              <div className='relative'>
                <span className='material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm'>
                  search
                </span>
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Tìm thành viên...'
                  className='pl-8 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/40'
                />
              </div>
            </div>

            {loadingMembers ? (
              <div className='flex items-center justify-center py-10 text-slate-400'>
                <span className='material-symbols-outlined animate-spin mr-2'>
                  progress_activity
                </span>
                Đang tải...
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {filteredMembers.map((m) => {
                  const roleStyle =
                    ROLE_LABELS[m.role] ?? ROLE_LABELS.member;
                  return (
                    <div
                      key={m.id}
                      className='bg-white/60 backdrop-blur-md border border-slate-200 p-4 rounded-xl flex items-center gap-4 hover:border-sky-300/60 transition-colors group shadow-sm'
                    >
                      {m.user.avatarUrl ? (
                        <img
                          alt={m.user.fullName ?? ''}
                          src={m.user.avatarUrl}
                          className='w-11 h-11 rounded-full object-cover shrink-0'
                        />
                      ) : (
                        <div className='w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0'>
                          {getInitials(m.user.fullName ?? m.user.email)}
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-slate-800 truncate text-sm'>
                          {m.user.fullName ?? m.user.email}
                        </h4>
                        <p className='text-xs text-slate-400 truncate'>
                          {m.user.email}
                        </p>
                        <span
                          className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${roleStyle.color}`}
                        >
                          {roleStyle.label}
                        </span>
                      </div>
                      {/* Remove button — only for admin/owner, and not for owner targets */}
                      {currentUserIsAdminOrOwner && m.role !== 'owner' && (
                        <button
                          onClick={() =>
                            handleRemove(m.userId, m.user.fullName)
                          }
                          className='material-symbols-outlined text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg'
                          title='Xóa thành viên'
                        >
                          person_remove
                        </button>
                      )}
                    </div>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <p className='col-span-2 text-center text-slate-400 py-8 text-sm'>
                    Không tìm thấy thành viên nào
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column — Sidebar */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Invite Code Widget */}
          <div className='bg-white/80 backdrop-blur-lg border border-sky-200 shadow-lg p-6 rounded-2xl'>
            <h3 className='text-lg font-bold text-slate-800 mb-1'>
              Mã tham gia lớp
            </h3>
            <p className='text-sm text-slate-500 mb-4'>
              Chia sẻ mã này để mời thành viên mới tham gia.
            </p>
            <div className='flex flex-col gap-3'>
              <div className='relative'>
                <div className='w-full bg-slate-100 border-0 rounded-lg px-4 py-3 text-lg font-bold text-center tracking-[0.25em] text-slate-800 select-all'>
                  {classroom?.inviteCode ?? '------'}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-green-500 text-white shadow-green-500/20'
                    : 'bg-sky-600 text-white shadow-sky-600/20 hover:brightness-110 active:scale-[0.98]'
                }`}
              >
                <span className='material-symbols-outlined text-lg'>
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Đã sao chép!' : 'Sao chép mã'}
              </button>
            </div>
          </div>

          {/* Support card */}
          <div className='bg-gradient-to-br from-purple-100 to-sky-100 p-6 rounded-2xl relative overflow-hidden shadow-sm group border border-sky-200/50'>
            <div className='absolute -right-4 -top-4 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700' />
            <h3 className='text-lg font-bold text-purple-900 mb-2 relative z-10'>
              Hỗ trợ học tập
            </h3>
            <p className='text-sm text-purple-800/80 mb-4 relative z-10'>
              Bạn gặp khó khăn trong quá trình học? Đừng ngần ngại liên hệ đội
              ngũ trợ giảng.
            </p>
            <button className='bg-white/90 text-purple-600 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white transition-colors relative z-10'>
              <span className='material-symbols-outlined text-sm'>
                support_agent
              </span>
              Chat với Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
