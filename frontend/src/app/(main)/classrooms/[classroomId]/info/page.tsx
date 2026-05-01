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
  const { classroom, members, loadingMembers, fetchMembers } = useClassrooms();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (classroomId) {
      fetchMembers(classroomId);
    }
  }, [classroomId, fetchMembers]);

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
              <span className='material-symbols-outlined text-sky-600' style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              Thông tin chung
            </h2>
            <div className='p-6 bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 space-y-5 shadow-sm'>
              <div>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>Tên lớp học</h3>
                <p className='text-lg text-slate-800 font-semibold'>{classroom?.title}</p>
              </div>
              <div>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>Mô tả chi tiết</h3>
                <p className='text-slate-700 whitespace-pre-wrap leading-relaxed'>{classroom?.description || 'Chưa có mô tả nào cho lớp học này.'}</p>
              </div>
              <div className='flex gap-8'>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>Ngày khởi tạo</h3>
                  <p className='text-slate-700'>{classroom?.createdAt ? new Date(classroom.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>Trạng thái</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${classroom?.isPublic ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {classroom?.isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>
                <div>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>Số thành viên</h3>
                  <p className='text-slate-700 font-semibold'>{classroom?._count?.members ?? members.length}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Members Section */}
          <section>
            <div className='flex items-center justify-between mb-4 px-2'>
              <h2 className='text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
                <span className='material-symbols-outlined text-purple-600' style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                Thành viên
                <span className='ml-1 bg-slate-200 text-slate-600 rounded-full px-2.5 py-0.5 text-xs font-semibold'>{members.length}</span>
              </h2>
              {/* Search */}
              <div className='relative'>
                <span className='material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm'>search</span>
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
                <span className='material-symbols-outlined animate-spin mr-2'>progress_activity</span>
                Đang tải...
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {filteredMembers.map((m) => {
                  const roleStyle = ROLE_LABELS[m.role] ?? ROLE_LABELS.member;
                  return (
                    <div key={m.id} className='bg-white/60 backdrop-blur-md border border-slate-200 p-4 rounded-xl flex items-center gap-4 transition-colors shadow-sm'>
                      {m.user.avatarUrl ? (
                        <img alt={m.user.fullName ?? ''} src={m.user.avatarUrl} className='w-11 h-11 rounded-full object-cover shrink-0' />
                      ) : (
                        <div className='w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0'>
                          {getInitials(m.user.fullName ?? m.user.email)}
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-slate-800 truncate text-sm'>{m.user.fullName ?? m.user.email}</h4>
                        <p className='text-xs text-slate-400 truncate'>{m.user.email}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${roleStyle.color}`}>
                          {roleStyle.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <p className='col-span-2 text-center text-slate-400 py-8 text-sm'>Không tìm thấy thành viên nào</p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column — Sidebar */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Support card */}
          <div className='bg-gradient-to-br from-purple-100 to-sky-100 p-6 rounded-2xl relative overflow-hidden shadow-sm border border-sky-200/50'>
            <div className='absolute -right-4 -top-4 w-24 h-24 bg-white/40 rounded-full blur-2xl' />
            <h3 className='text-lg font-bold text-purple-900 mb-2 relative z-10'>Hỗ trợ học tập</h3>
            <p className='text-sm text-purple-800/80 mb-4 relative z-10'>
              Bạn gặp khó khăn trong quá trình học? Đừng ngần ngại liên hệ đội ngũ trợ giảng.
            </p>
            <button className='bg-white/90 text-purple-600 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white transition-colors relative z-10'>
              <span className='material-symbols-outlined text-sm'>support_agent</span>
              Chat với Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
