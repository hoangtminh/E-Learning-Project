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
  } = useClassrooms();

  const [copied, setCopied] = useState(false);

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
    if (!confirm(`Bạn có chắc muốn xóa ${name ?? 'thành viên này'} khỏi lớp học?`)) return;
    try {
      await removeMember(classroomId, userId);
    } catch (e: any) {
      alert(e.message || 'Xóa thành viên thất bại');
    }
  };

  return (
    <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-100 bg-slate-50'>
        <h2 className='text-lg font-bold text-slate-800'>Quản lý Thành viên</h2>
        <p className='text-slate-500 text-sm mt-1'>Duyệt yêu cầu tham gia và quản lý học viên</p>
      </div>

      <div className='p-6 space-y-8'>
        {/* Invite Code */}
        <div>
          <h3 className='text-sm font-bold text-slate-700 mb-2 flex items-center gap-2'>
            <span className='material-symbols-outlined text-lg'>qr_code</span> Mã mời tham gia
          </h3>
          <div className='flex items-center gap-3 max-w-sm'>
            <div className='flex-1 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 font-mono text-center tracking-[0.25em] font-bold text-slate-800 select-all'>
              {classroom?.inviteCode ?? '------'}
            </div>
            <button
              onClick={handleCopyCode}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                copied ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <span className='material-symbols-outlined text-[18px]'>{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Đã chép' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingMembers.length > 0 && (
          <div>
            <h3 className='text-sm font-bold text-amber-700 mb-3 flex items-center gap-2'>
              <span className='material-symbols-outlined text-lg'>hourglass_empty</span>
              Yêu cầu chờ duyệt ({pendingMembers.length})
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {pendingMembers.map((pm) => (
                <div key={pm.id} className='flex items-center justify-between border border-amber-200 bg-amber-50 rounded-xl p-3'>
                  <div className='flex items-center gap-3 min-w-0'>
                    {pm.user.avatarUrl ? (
                      <img alt={pm.user.fullName ?? ''} src={pm.user.avatarUrl} className='w-10 h-10 rounded-full object-cover shrink-0' />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0'>
                        {getInitials(pm.user.fullName ?? pm.user.email)}
                      </div>
                    )}
                    <div className='min-w-0'>
                      <h4 className='font-semibold text-slate-800 text-sm truncate'>{pm.user.fullName ?? pm.user.email}</h4>
                      <p className='text-xs text-slate-500 truncate'>{pm.user.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    <button
                      onClick={() => approveMember(classroomId, pm.user.id)}
                      className='flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-all shadow-sm text-xs font-bold'
                    >
                      <span className='material-symbols-outlined text-[16px]'>check_circle</span>
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => rejectMember(classroomId, pm.user.id)}
                      className='flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-bold'
                    >
                      <span className='material-symbols-outlined text-[16px]'>cancel</span>
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
          <h3 className='text-sm font-bold text-slate-700 mb-3 flex items-center gap-2'>
            <span className='material-symbols-outlined text-lg'>group</span>
            Danh sách thành viên ({members.length})
          </h3>
          {loadingMembers ? (
            <div className='text-center py-10 text-slate-400'>Đang tải...</div>
          ) : (
            <div className='space-y-2'>
              {members.map((m) => {
                const roleStyle = ROLE_LABELS[m.role] ?? ROLE_LABELS.member;
                return (
                  <div key={m.id} className='flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white'>
                    <div className='flex items-center gap-3 min-w-0'>
                      {m.user.avatarUrl ? (
                        <img alt={m.user.fullName ?? ''} src={m.user.avatarUrl} className='w-10 h-10 rounded-full object-cover shrink-0' />
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0'>
                          {getInitials(m.user.fullName ?? m.user.email)}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <h4 className='font-semibold text-slate-800 text-sm truncate'>{m.user.fullName ?? m.user.email}</h4>
                        <p className='text-xs text-slate-400 truncate'>{m.user.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 shrink-0'>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${roleStyle.color}`}>
                        {roleStyle.label}
                      </span>
                      {m.role !== 'owner' && (
                        <button
                          onClick={() => handleRemove(m.userId, m.user.fullName)}
                          className='text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors'
                          title='Xóa thành viên'
                        >
                          <span className='material-symbols-outlined text-[20px] block'>person_remove</span>
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
    </div>
  );
}
