'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  ClassroomFile,
  getFiles,
  getPresignedUploadUrl,
  confirmFileUpload,
  getPresignedDownloadUrl,
  renameFile,
  deleteFile,
} from '@/api/classroom';

export default function AdminFilesPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const [files, setFiles] = useState<ClassroomFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [classroomId]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await getFiles(classroomId);
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // 1. Get presigned URL
      const res = await getPresignedUploadUrl(classroomId, file.name, file.type || 'application/octet-stream');
      
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to get upload URL');
      }

      const { url, s3Key } = res.data;
      
      // 2. Upload to S3
      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadRes.ok) throw new Error('S3 Upload failed');

      // 3. Confirm upload
      await confirmFileUpload(classroomId, s3Key, file.name, file.size, file.type || 'application/octet-stream');
      
      // Refresh list
      await fetchFiles();
    } catch (error) {
      console.error('Failed to upload file', error);
      alert('Tải file lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const res = await getPresignedDownloadUrl(classroomId, fileId);
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

  const handleRename = async (fileId: string, currentName: string) => {
    const newName = prompt('Nhập tên mới cho file:', currentName);
    if (!newName || newName === currentName) return;

    try {
      await renameFile(classroomId, fileId, newName);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f)),
      );
    } catch (error) {
      console.error('Failed to rename file', error);
      alert('Đổi tên file thất bại.');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa file này?')) return;

    try {
      await deleteFile(classroomId, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file', error);
      alert('Xóa file thất bại.');
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
    <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50'>
        <div>
          <h2 className='text-lg font-bold text-slate-800'>Quản lý Tài nguyên</h2>
          <p className='text-slate-500 text-sm mt-1'>Thêm, sửa, xóa tài liệu của lớp học</p>
        </div>
        <div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className='bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50'
          >
            <span className='material-symbols-outlined text-[18px]'>
              {isUploading ? 'hourglass_empty' : 'upload_file'}
            </span>
            {isUploading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
          </button>
        </div>
      </div>

      <div className='p-6'>
        {isLoading ? (
          <div className='text-center py-12 text-slate-500'>Đang tải danh sách file...</div>
        ) : files.length === 0 ? (
          <div className='text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
            <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>folder_open</span>
            <p className='text-slate-500 text-sm font-medium'>Chưa có tài liệu nào. Hãy tải lên!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-tl-xl">Tên file</th>
                  <th className="px-4 py-3 font-semibold">Dung lượng</th>
                  <th className="px-4 py-3 font-semibold">Người tải lên</th>
                  <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                      <span className='material-symbols-outlined text-indigo-500'>insert_drive_file</span>
                      <span className="truncate max-w-[200px] lg:max-w-xs block" title={file.name}>{file.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatBytes(file.sizeBytes)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {file.uploader.fullName || file.uploader.avatarUrl ? (
                        <div className="flex items-center gap-2">
                           {file.uploader.avatarUrl && <img src={file.uploader.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />}
                           <span>{file.uploader.fullName || 'Người dùng'}</span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap flex justify-end gap-1">
                      <button onClick={() => handleDownload(file.id)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Tải xuống">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                      <button onClick={() => handleRename(file.id, file.name)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Đổi tên">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(file.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Xóa">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
