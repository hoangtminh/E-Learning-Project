'use client';

export default function AdminFilesPage() {
  return (
    <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50'>
        <div>
          <h2 className='text-lg font-bold text-slate-800'>Quản lý Tài nguyên</h2>
          <p className='text-slate-500 text-sm mt-1'>Thêm, sửa, xóa tài liệu của lớp học</p>
        </div>
        <button className='bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm'>
          <span className='material-symbols-outlined text-[18px]'>upload_file</span>
          Tải lên tài liệu
        </button>
      </div>

      <div className='p-6'>
        <div className='text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
          <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>folder_open</span>
          <p className='text-slate-500 text-sm font-medium'>Tính năng đang được phát triển.</p>
        </div>
      </div>
    </div>
  );
}
