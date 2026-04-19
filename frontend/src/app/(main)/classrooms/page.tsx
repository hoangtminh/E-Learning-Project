'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';

// Mock data for aesthetic UI parts that DB does not provide yet
const mockRecentActivity = [
  {
    name: 'Jane Doe',
    action: 'Posted in Web Advanced',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJnR7ndOjP0F7ipAR6tQr-tLqmw_QrNpd7AeYincADPOBwmZSu0gjh-xmVLALrA4X5ecxvm3pLdg-OUOU4UxCcB6ux0ZwZtVyqFQHmfsyKmSRmNutSH8r168ZBgrzJly01CAsiS5Y8w0u9P3MLYOg0uCy5CC-sqg3-6aLZhaysuZrz4kLoJOE1s-QwZAWgeOypEq5Ic1J5k59ii_27cOz7e5CTk2mxK1wvIzTWtVegQ8NRUNz2-JlSQB_poNr1h2Tk92zY8xsgyiqV',
  },
  {
    name: 'Mike Smith',
    action: 'Submitted Design Assignment',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAk5Fp9gtu5Ijk15JvOFLGfEiiK-v_Kc1Lq423rjtEvjPGx3xMrCTcmmxrZKekAOAgo3eJTRu4msj_-GlK86kYSG7BYUcXgCNyrtedni4C4KycLkkV0LJLIKpK8CZrKB8aBABr2aLSQRrSLR1SlfaHJUDdX2XZuW1Ln0QV4FbV9erEv0NJkv8eY_VnRrQuGY78aAg-MLHl8Urdk9tcFYt8bg_x02RsfBX0MTE396P44WCXkoFV24jT61Z2hr5cGJcgjZ7MZ-e8M2V-z',
  },
  {
    name: 'Kelly Vo',
    action: 'Started a live study group',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA3nc09LW7oEj9VrHUkCUU4Qb-kIlQeguzrTWXz4uKLV-BDrlQ0Nw-LDRnN67Icwz8NxA0O1SXh2gzgIt3yRZrmpL_nQab7aCA2yIEertLRDfnU-4rKH88srpmZURpQb9NtYlxH5poEOG2vKjHP-S_TIuwv5-9kDj6p9tlgJiS_jkT7L8kDpspP3t09wxtHLFgtM6-1EBZpk9MH7Fmed326VlXqFiplTNs19et64cyqMo5X_CcP4s8MHGeRMapFNCsR3iduDKMEM5uN',
  },
];

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
  } = useClassrooms();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleCreateOpen = () => {
    setNewTitle('');
    setNewDesc('');
    setIsCreateModalOpen(true);
  };

  const submitCreate = async () => {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await createClassroom(newTitle, newDesc);
      setIsCreateModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Tạo thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: string, oldTitle: string) => {
    const title = prompt('Nhập tên mới:', oldTitle);
    if (!title) return;
    try {
      await updateClassroom(id, title);
    } catch (e) {
      console.error(e);
      alert('Cập nhật thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
    try {
      await deleteClassroom(id);
    } catch (e) {
      console.error(e);
      alert('Xóa thất bại');
    }
  };

  return (
    <div>
      {/* Main Content Area */}
      <div className='px-8 py-4 max-w-7xl mx-auto'>
        {/* Header Section */}
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
              onClick={() => setIsCreateModalOpen(true)}
            >
              <span className='material-symbols-outlined text-sm'>login</span>
              Tham gia bằng mã
            </button>
          </div>
        </div>

        {/* Classroom Bento Grid */}
        <div className='flex flex-wrap gap-6'>
          {cohorts.map((cohort, index) => (
            <Link
              href={'/classrooms/' + cohort.id}
              key={cohort.id}
              className='relative rounded-2xl min-w-70 bg-white border border-slate-400 overflow-hidden group hover:shadow-[0_0_40px_rgba(125,211,252,0.15)] transition-all duration-300 flex flex-col'
            >
              {/* CRUD Actions overlay */}
              <div className='absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    handleEdit(cohort.id, cohort.title);
                  }}
                  className='bg-amber-400/90 text-amber-950 p-2 rounded-lg backdrop-blur-md hover:bg-amber-400 flex items-center justify-center transition-colors shadow-lg'
                  title='Sửa'
                >
                  <span className='material-symbols-outlined text-sm'>
                    edit
                  </span>
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
                  <span className='material-symbols-outlined text-sm'>
                    delete
                  </span>
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
                      Dữ liệu DB thật
                    </span>
                    <h4 className='text-xl font-bold text-white leading-tight'>
                      {cohort.title}
                    </h4>
                  </div>
                </div>
              </div>
              <div className='p-6 flex-1 flex flex-col'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full border border-primary/20 bg-sky-200/10 flex items-center justify-center'>
                    <span className='material-symbols-outlined text-sky-400'>
                      school
                    </span>
                  </div>
                  <div className='w-[80%]'>
                    <p className='text-xs font-bold text-on-surface-variant'>
                      Mô tả
                    </p>
                    <p className='text-sm font-semibold text-on-surface truncate'>
                      {cohort.description || 'Không có mô tả'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Empty State / Add New Card */}
          <button
            type='button'
            onClick={() => setIsCreateModalOpen(true)}
            className='border-2 border-dashed border-sky-300/30 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-sky-300/5 transition-colors group cursor-pointer h-full'
          >
            <div className='w-16 h-16 rounded-full bg-sky-300/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
              <Plus className=' text-sky-400 text-3xl' />
            </div>
            <h5 className='text-lg font-bold text-on-surface'>
              Tạo Lớp Học Mới
            </h5>
          </button>
        </div>

        {/* Activity Recap Bento Piece */}
        <div className='mt-12 glass-panel p-8 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='md:col-span-1 border-r border-sky-300/10'>
            <h5 className='text-sm font-bold text-sky-400 uppercase tracking-widest mb-4'>
              Thống kê tổng
            </h5>
            <div className='space-y-6'>
              <div>
                <p className='text-3xl font-black text-on-surface'>
                  {cohorts.length}
                </p>
                <p className='text-xs text-on-surface-variant'>
                  Tổng số Classrooms
                </p>
              </div>
            </div>
          </div>
          <div className='md:col-span-3'>
            <h5 className='text-sm font-bold text-sky-400 uppercase tracking-widest mb-6'>
              Hoạt động gần đây
            </h5>
            <div className='flex flex-wrap gap-4'>
              {mockRecentActivity.map((activity, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 bg-white/40 p-3 rounded-2xl border border-sky-300/10'
                >
                  <img
                    alt={activity.name}
                    src={activity.avatar}
                    className='w-8 h-8 rounded-full object-cover'
                  />
                  <div>
                    <p className='text-xs font-bold text-on-surface'>
                      {activity.name}
                    </p>
                    <p className='text-[10px] text-on-surface-variant'>
                      {activity.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Classroom Modal */}
      {isCreateModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl'>
            <h2 className='text-2xl font-bold text-slate-900 mb-4'>
              Tạo lớp học mới
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-1'>
                  Tên lớp học
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
            </div>
            <div className='mt-8 flex justify-end gap-3'>
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
    </div>
  );
}
