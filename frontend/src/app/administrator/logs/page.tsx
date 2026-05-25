'use client';

import React, { useEffect, useState } from 'react';
import { adminGetLogs, AdminLog } from '@/api/admin';
import { toast } from 'sonner';

export default function SystemLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminGetLogs(page, 20);
      if (res.success && res.data) {
        setLogs(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (error) {
      toast.error('Không thể tải nhật ký hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Nhật ký hệ thống</h1>
        <p className="text-slate-500 text-sm">Lịch sử ghi lại tất cả các hành động quản trị và hệ thống.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Đang tải nhật ký...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Không có nhật ký nào.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{log.user.fullName}</span>
                          <span className="text-xs text-slate-500">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Hệ thống / Người dùng đã xóa</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2">
            <button 
              disabled={meta.page === 1}
              onClick={() => fetchLogs(meta.page - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-colors"
            >
              Trước
            </button>
            <span className="text-sm font-medium text-slate-500">Trang {meta.page} / {meta.totalPages}</span>
            <button 
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchLogs(meta.page + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
