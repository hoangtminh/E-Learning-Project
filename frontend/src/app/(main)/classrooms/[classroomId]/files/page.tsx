'use client';

import { useClassrooms } from '@/contexts/ClassroomContext';

type FileType = 'pdf' | 'video' | 'slides' | 'zip' | 'doc';

interface ClassroomFile {
  id: string;
  name: string;
  description: string;
  type: FileType;
  size: string;
  uploader: string;
  uploadedAt: string;
  isFeatured?: boolean;
}

const mockFiles: ClassroomFile[] = [
  {
    id: '1',
    name: 'Course Syllabus v1.2',
    description:
      'Complete roadmap of the course including weekly topics and project requirements.',
    type: 'pdf',
    size: '2.4 MB',
    uploader: 'Alex Nguyen',
    uploadedAt: 'Oct 24, 2023',
  },
  {
    id: '2',
    name: 'Module 1: Deep Dive into SSR',
    description:
      'Offline video for Module 1 focusing on Server-Side Rendering performance.',
    type: 'video',
    size: '1.2 GB',
    uploader: 'Alex Nguyen',
    uploadedAt: 'Oct 20, 2023',
  },
  {
    id: '3',
    name: 'Project Architecture Slides',
    description:
      'Visual guides and diagrams explaining the final project structure.',
    type: 'slides',
    size: '15.8 MB',
    uploader: 'Jane Doe',
    uploadedAt: 'Nov 02, 2023',
  },
  {
    id: '4',
    name: 'Starter Template Source',
    description:
      'Clean repository starter with Prettier, ESLint, and Tailwind pre-configured.',
    type: 'zip',
    size: '450 KB',
    uploader: 'Alex Nguyen',
    uploadedAt: 'Nov 15, 2023',
  },
  {
    id: '5',
    name: 'Cheat Sheet: Next.js Hooks & Patterns',
    description:
      'A handy one-page reference guide for useFormState, useFormStatus, and Server Actions.',
    type: 'doc',
    size: '840 KB',
    uploader: 'Minh Tran',
    uploadedAt: 'Nov 20, 2023',
    isFeatured: true,
  },
];

const getFileUI = (type: FileType) => {
  switch (type) {
    case 'pdf':
      return {
        icon: 'picture_as_pdf',
        bg: 'bg-red-100',
        color: 'text-red-600',
      };
    case 'video':
      return { icon: 'movie', bg: 'bg-blue-100', color: 'text-blue-600' };
    case 'slides':
      return {
        icon: 'present_to_all',
        bg: 'bg-amber-100',
        color: 'text-amber-600',
      };
    case 'zip':
      return {
        icon: 'folder_zip',
        bg: 'bg-emerald-100',
        color: 'text-emerald-600',
      };
    case 'doc':
      return {
        icon: 'description',
        bg: 'bg-purple-100',
        color: 'text-purple-600',
      };
    default:
      return {
        icon: 'insert_drive_file',
        bg: 'bg-slate-100',
        color: 'text-slate-600',
      };
  }
};

export default function ClassroomFilesPage() {
  const { classroom } = useClassrooms();

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800'>
            Tài nguyên lớp học
          </h2>
          <p className='text-slate-500 text-sm mt-1'>
            Tất cả tài liệu có thể tải xuống của {classroom?.title}
          </p>
        </div>
        <div className='flex gap-3'>
          <button className='flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-200 transition-all'>
            <span className='material-symbols-outlined text-lg'>
              filter_list
            </span>
            Lọc
          </button>
          <button className='flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/20 hover:opacity-90 hover:bg-sky-700 transition-all'>
            <span className='material-symbols-outlined text-lg'>download</span>
            Tải tất cả
          </button>
        </div>
      </div>

      {/* Bento Grid of Resources */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {mockFiles.map((file) => {
          const ui = getFileUI(file.type);
          return (
            <div
              key={file.id}
              className={`bg-white/60 backdrop-blur-md border border-slate-200 p-6 rounded-2xl group hover:bg-white/80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col ${
                file.isFeatured
                  ? 'lg:col-span-2 md:flex-row md:items-center gap-6'
                  : ''
              }`}
            >
              <div
                className={`flex justify-between items-start mb-6 ${file.isFeatured ? 'mb-0 shrink-0' : ''}`}
              >
                <div
                  className={`w-16 h-16 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${ui.bg} ${ui.color}`}
                >
                  <span className='material-symbols-outlined text-4xl md:text-3xl'>
                    {ui.icon}
                  </span>
                </div>
                {!file.isFeatured && (
                  <span className='text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md'>
                    {file.size}
                  </span>
                )}
              </div>

              <div className='flex-1 flex flex-col h-full'>
                <div
                  className={`${file.isFeatured ? 'flex justify-between items-start mb-4' : ''}`}
                >
                  <h3 className='text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors'>
                    {file.name}
                  </h3>
                  {file.isFeatured && (
                    <span className='text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md hidden md:block'>
                      {file.size}
                    </span>
                  )}
                </div>

                <div
                  className={`mt-auto pt-6 flex items-center justify-between border-t border-slate-200/60 ${file.isFeatured ? 'border-none pt-4' : ''}`}
                >
                  <div className='flex flex-col md:flex-row md:items-center gap-1 md:gap-4'>
                    <span className='text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1'>
                      <span className='material-symbols-outlined text-xs'>
                        person
                      </span>{' '}
                      {file.uploader}
                    </span>
                    <span className='text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1'>
                      <span className='material-symbols-outlined text-xs'>
                        history
                      </span>{' '}
                      {file.uploadedAt}
                    </span>
                  </div>

                  <button
                    className={`rounded-lg bg-slate-100 text-slate-600 hover:bg-sky-600 hover:text-white transition-all flex items-center justify-center ${file.isFeatured ? 'px-4 py-2 gap-2' : 'p-2'}`}
                  >
                    <span className='material-symbols-outlined text-lg md:text-sm'>
                      download
                    </span>
                    {file.isFeatured && (
                      <span className='text-xs font-bold hidden md:block'>
                        TẢI XUỐNG
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Storage info */}
      <div className='mt-12 p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0'>
            <span className='material-symbols-outlined'>storage</span>
          </div>
          <div>
            <p className='text-sm font-semibold text-slate-800'>
              Dung lượng lưu trữ của lớp học
            </p>
            <p className='text-xs text-slate-500'>
              1.8 GB / 5.0 GB đã được sử dụng
            </p>
          </div>
        </div>
        <div className='w-full md:w-64 h-2 bg-slate-200 rounded-full overflow-hidden'>
          <div className='h-full bg-sky-500 w-[36%]'></div>
        </div>
        <button className='text-sky-600 text-sm font-bold hover:underline shrink-0'>
          Quản lý tài nguyên
        </button>
      </div>
    </div>
  );
}
