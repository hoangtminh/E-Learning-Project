'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';

const mockImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvz6dRTaGnLp3HCtAnUdFeqPCG--8LDSkS_kIcRWF7YWP0FCxFmMSW13aLrBFMLDoBai-M594I-qogj1gqDul0Maz6pPWi6cvRzgrY2AsTIJhiu7uPjIT96j6CUWdvzaDmXLA61S0kCKoSTOjyRmnFs9jY1eqPTxz1dKrTBwj-Bfn1V9-CQ2kmQnwJZzrxlfFTicoMH9lhguYzCK9NO2x5yG9KIFRlmT1Pkk6g9hkWohZ39mUTXwyDUN4Q7NpnU_TSQjo9xmK42kf6',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbf9FS7YzN_8LQiqdMEVWV623RnuIA0UlzAfGlOLvrkhLLol1XUwEjWGH_8VhmfH4D_jlzfPbF-obQQvvK3CjcDlmCRmJ6ZcaInVN1qx--7HPsq9waXXwjgJOXwjKS4od106pILRxqFZhq8G04cpdNOAjB0tZ26mrb0RUO7NitZm6lSE-bBy_wztdW7lQUIUudXGjiTr8pKkU51msgLH1gs0oNQJKP1TIlXdd7cbkHG8Gd4UFFnONcOSoEwvQfERbL5oH_hoDXDBJh',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBTd9exxx4xfCnO95mBJ78woWX1yyMClrkZnIxLnUU-pEhbS7mFKD6TIIAocNhPlh_vHFmTkedbOr6JcAUiAsAqfkagbyUwrl0-ole1eIa4VtH8QiwlcAU-8NbZmrJsCeIFAUFOi1V5Ipo8XGKgUzhtu-5wRe2ikAw8a9pP-TwgbWSdYtz0q-pHw_D-l0-AksG5fe1VoT-atdwDLDRtr95eT07JTXvzFjbTYg9dVMcHJyjAQI4wulQyrfgszEkmlmzKowEMovhMaNwg',
];

export default function ClassroomsPage() {
  const {
    classrooms: cohorts,
    loading,
    fetchClassrooms,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    joinByCode,
  } = useClassrooms();

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

  useEffect(() => {
    fetchClassrooms();
  }, []);

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
    } catch (e: any) {
      alert(e.message || 'Tạo thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit / Delete ───────────────────────────────────────────────────────────

  const handleEdit = async (id: string, oldTitle: string, oldDesc: string | null) => {
    const title = prompt('Nhập tên mới:', oldTitle);
    if (!title) return;
    try {
      await updateClassroom(id, title, oldDesc ?? undefined);
    } catch (e: any) {
      alert(e.message || 'Cập nhật thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
    try {
      await deleteClassroom(id);
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
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
    } catch (e: any) {
      setJoinError(e.message || 'Tham gia thất bại');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div>
      <div className='px-8 py-4 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-5 flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div>
            <h3 className='text-3xl font-extrabold text-on-surface tracking-tight'>
              Lớp học của tôi
            </h3>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='relative'>
              <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm'>
                search
              </span>
              <input
                type='text'
                placeholder='Tìm kiếm lớp học...'
                className='pl-9 pr-4 py-2.5 bg-white/60 border border-sky-300/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-sm w-48 transition-all focus:w-64 shadow-sm backdrop-blur-md text-slate-700'
              />
            </div>
            <button
              className='px-4 py-2.5 bg-sky-100 text-sky-700 font-semibold rounded-xl hover:bg-sky-200 transition-colors flex items-center gap-2 text-sm shadow-sm'
              onClick={openJoinModal}
            >
              <span className='material-symbols-outlined text-sm'>login</span>
              Tham gia bằng mã
            </button>
          </div>
        </div>

        {/* Classroom Grid */}
        <div className='flex flex-wrap gap-6'>
          {loading ? (
            <div className='text-slate-400 flex items-center gap-2 py-8'>
              <span className='material-symbols-outlined animate-spin'>
                progress_activity
              </span>
              Đang tải...
            </div>
          ) : (
            cohorts.map((cohort, index) => (
              <Link
                href={'/classrooms/' + cohort.id}
                key={cohort.id}
                className='relative rounded-2xl min-w-70 bg-white border border-slate-200 overflow-hidden group hover:shadow-[0_0_40px_rgba(125,211,252,0.15)] transition-all duration-300 flex flex-col'
              >
                {/* CRUD Actions overlay */}
                <div className='absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(cohort.id, cohort.title, cohort.description);
                    }}
                    className='bg-amber-400/90 text-amber-950 p-2 rounded-lg backdrop-blur-md hover:bg-amber-400 flex items-center justify-center transition-colors shadow-lg'
                    title='Sửa'
                  >
                    <span className='material-symbols-outlined text-sm'>edit</span>
                  </button>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(cohort.id);
                    }}
                    className='bg-red-500/90 text-white p-2 rounded-lg backdrop-blur-md hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg'
                    title='Xóa'
                  >
                    <span className='material-symbols-outlined text-sm'>delete</span>
                  </button>
                </div>

                <div className='relative h-48 overflow-hidden'>
                  <img
                    alt={cohort.title}
                    src={mockImages[index % 3]}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent' />
                  <div className='absolute bottom-4 left-4 right-4 flex justify-between items-end'>
                    <div>
                      <span className='px-2 py-1 rounded text-[10px] font-bold uppercase mb-2 inline-block bg-sky-300/90 text-slate-900'>
                        {cohort.isPublic ? 'Công khai' : 'Riêng tư'}
                      </span>
                      <h4 className='text-xl font-bold text-white leading-tight'>
                        {cohort.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className='p-5 flex-1 flex flex-col gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full border border-primary/20 bg-sky-200/10 flex items-center justify-center shrink-0'>
                      <span className='material-symbols-outlined text-sky-400 text-sm'>school</span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-bold text-on-surface-variant'>Mô tả</p>
                      <p className='text-sm font-semibold text-on-surface truncate'>
                        {cohort.description || 'Không có mô tả'}
                      </p>
                    </div>
                  </div>
                  {cohort._count && (
                    <div className='flex items-center gap-1.5 text-xs text-slate-500'>
                      <span className='material-symbols-outlined text-sm'>group</span>
                      {cohort._count.members} thành viên
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}

          {/* Add New Card */}
          <button
            type='button'
            onClick={handleCreateOpen}
            className='border-2 border-dashed border-sky-300/30 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-sky-300/5 transition-colors group cursor-pointer'
          >
            <div className='w-16 h-16 rounded-full bg-sky-300/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
              <Plus className='text-sky-400 text-3xl' />
            </div>
            <h5 className='text-lg font-bold text-on-surface'>Tạo Lớp Học Mới</h5>
          </button>
        </div>

        {/* Stats bar */}
        <div className='mt-10 glass-panel p-6 rounded-3xl flex items-center gap-8'>
          <div>
            <p className='text-3xl font-black text-on-surface'>{cohorts.length}</p>
            <p className='text-xs text-on-surface-variant'>Tổng số Classrooms</p>
          </div>
          <div className='h-10 w-px bg-sky-300/20' />
          <div>
            <p className='text-3xl font-black text-on-surface'>
              {cohorts.filter((c) => c.isPublic).length}
            </p>
            <p className='text-xs text-on-surface-variant'>Lớp công khai</p>
          </div>
        </div>
      </div>

      {/* ── Create Classroom Modal ─────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl'>
            <h2 className='text-xl font-bold text-slate-900 mb-5 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sky-600'>add_circle</span>
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
                  className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800'
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
                  className='w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 resize-none'
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newIsPublic ? 'bg-sky-500' : 'bg-slate-300'}`}
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
                className='px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors'
              >
                Hủy
              </button>
              <button
                onClick={submitCreate}
                disabled={isSubmitting || !newTitle.trim()}
                className='px-5 py-2 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center gap-2'
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
              <span className='material-symbols-outlined text-sky-600'>login</span>
              Tham gia lớp học
            </h2>
            <p className='text-sm text-slate-500 mb-5'>
              Nhập mã lớp học (6 ký tự) do giáo viên cung cấp.
            </p>
            <input
              type='text'
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className='w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 text-center text-xl font-bold tracking-[0.3em] uppercase'
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
                className='px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors'
              >
                Hủy
              </button>
              <button
                onClick={submitJoin}
                disabled={isJoining || joinCode.length < 3}
                className='px-5 py-2 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center gap-2'
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
