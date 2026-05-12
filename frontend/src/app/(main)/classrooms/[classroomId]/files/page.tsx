'use client';

import { useClassrooms } from '@/contexts/ClassroomContext';
import { useState, useEffect } from 'react';
import { ClassroomFile, getFiles, getPresignedDownloadUrl } from '@/api/classroom';

const getFileUI = (mimeType: string, name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  
  if (mimeType.includes('pdf') || ext === 'pdf') {
    return { icon: 'picture_as_pdf', bg: 'bg-red-50', color: 'text-red-500' };
  } else if (mimeType.includes('video') || ['mp4', 'mov', 'avi'].includes(ext || '')) {
    return { icon: 'movie', bg: 'bg-blue-50', color: 'text-blue-500' };
  } else if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(ext || '')) {
    return { icon: 'present_to_all', bg: 'bg-amber-50', color: 'text-amber-500' };
  } else if (mimeType.includes('zip') || ['zip', 'rar', 'tar'].includes(ext || '')) {
    return { icon: 'folder_zip', bg: 'bg-emerald-50', color: 'text-emerald-500' };
  } else if (mimeType.includes('document') || ['doc', 'docx'].includes(ext || '')) {
    return { icon: 'description', bg: 'bg-purple-50', color: 'text-purple-500' };
  }
  return { icon: 'insert_drive_file', bg: 'bg-slate-50', color: 'text-slate-500' };
};

export default function ClassroomFilesPage() {
  const { classroom } = useClassrooms();
  const [files, setFiles] = useState<ClassroomFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (classroom?.id) {
      fetchFiles();
    }
  }, [classroom?.id]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await getFiles(classroom!.id);
      if (res.success && res.data) {
        setFiles(res.data);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Failed to load files', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const res = await getPresignedDownloadUrl(classroom!.id, fileId);
      if (res.success && res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        throw new Error(res.error || 'Failed to get download URL');
      }
    } catch (error) {
      console.error('Failed to download file', error);
      alert('Không thể tải xuống file.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
        <div>
          <h2 className='text-xl font-bold text-slate-800'>
            Tài nguyên lớp học
          </h2>
          <p className='text-slate-500 text-xs mt-0.5'>
            {files.length} tài liệu trong lớp {classroom?.title}
          </p>
        </div>
      </div>

      <div className='bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 overflow-hidden shadow-sm'>
        {isLoading ? (
          <div className='text-center py-12 text-slate-500 text-sm'>Đang tải dữ liệu...</div>
        ) : files.length === 0 ? (
          <div className='text-center py-16'>
            <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>folder_open</span>
            <p className='text-slate-500 text-sm'>Lớp học chưa có tài liệu nào.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm border-collapse'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/50'>
                  <th className='px-6 py-4 font-semibold text-slate-600'>Tên tài liệu</th>
                  <th className='px-6 py-4 font-semibold text-slate-600 hidden md:table-cell'>Dung lượng</th>
                  <th className='px-6 py-4 font-semibold text-slate-600 hidden lg:table-cell'>Ngày tải</th>
                  <th className='px-6 py-4 font-semibold text-slate-600 hidden sm:table-cell'>Người đăng</th>
                  <th className='px-6 py-4 font-semibold text-slate-600 text-right'>Tải về</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const ui = getFileUI(file.mimeType, file.name);
                  return (
                    <tr 
                      key={file.id} 
                      className='border-b border-slate-50 hover:bg-slate-50/80 transition-colors group'
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ui.bg} ${ui.color}`}>
                            <span className='material-symbols-outlined text-[22px]'>
                              {ui.icon}
                            </span>
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <span className='font-medium text-slate-700 truncate max-w-[200px] md:max-w-md block' title={file.name}>
                              {file.name}
                            </span>
                            <span className='text-[10px] text-slate-400 md:hidden'>
                              {formatBytes(file.sizeBytes)} • {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-slate-500 hidden md:table-cell whitespace-nowrap'>
                        {formatBytes(file.sizeBytes)}
                      </td>
                      <td className='px-6 py-4 text-slate-500 hidden lg:table-cell whitespace-nowrap'>
                        {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className='px-6 py-4 hidden sm:table-cell'>
                        <div className='flex items-center gap-2'>
                          <div className='w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden'>
                            {file.uploader.avatarUrl ? (
                              <img src={file.uploader.avatarUrl} alt='' className='w-full h-full object-cover' />
                            ) : (
                              file.uploader.fullName?.charAt(0) || 'U'
                            )}
                          </div>
                          <span className='text-xs text-slate-600 truncate max-w-[100px]'>
                            {file.uploader.fullName || 'Người dùng'}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() => handleDownload(file.id)}
                          className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-sky-500 hover:text-white transition-all shadow-sm'
                          title='Tải xuống'
                        >
                          <span className='material-symbols-outlined text-[18px]'>
                            download
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
