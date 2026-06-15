'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { adminGetLogs, adminGetDistinctActions, adminBulkDeleteLogs, AdminLog } from '@/api/admin';
import { toast } from 'sonner';
import {
  Search, Download, Trash2, RefreshCw, Filter, AlertCircle,
  CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Monitor,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const LEVEL_CONFIG = {
  info: { label: 'Info', color: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2, dot: 'bg-emerald-500' },
  warn: { label: 'Warn', color: 'bg-amber-100 text-amber-700', Icon: AlertTriangle, dot: 'bg-amber-500' },
  error: { label: 'Error', color: 'bg-red-100 text-red-700', Icon: AlertCircle, dot: 'bg-red-500' },
};

function actionColor(action: string) {
  if (action.includes('DELETE') || action.includes('SUSPEND')) return 'bg-red-100 text-red-800';
  if (action.includes('CREATE') || action.includes('REGISTER')) return 'bg-emerald-100 text-emerald-800';
  if (action.includes('UPDATE') || action.includes('RESET') || action.includes('PATCH')) return 'bg-amber-100 text-amber-800';
  if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-800';
  if (action.includes('ADMIN')) return 'bg-purple-100 text-purple-800';
  if (action.includes('PAYMENT')) return 'bg-pink-100 text-pink-800';
  return 'bg-slate-100 text-slate-700';
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDays, setBulkDays] = useState(30);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    action: '', level: '', dateFrom: '', dateTo: '',
  });

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminGetLogs(page, 20, filters);
      if (res.success && res.data) { setLogs(res.data.data); setMeta(res.data.meta); }
    } catch { toast.error('Không thể tải nhật ký'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  useEffect(() => {
    adminGetDistinctActions().then(r => { if (r.success && r.data) setActions(r.data); });
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(meta.page);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, meta.page, fetchLogs]);

  const handleExport = () => {
    const token = document.cookie.split('; ').find(r => r.startsWith('access_token='))?.split('=')[1];
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    const url = `${BACKEND_URL}/admin/logs/export?${params}`;
    const a = document.createElement('a');
    a.href = url;
    // Add auth via fetch
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const objUrl = URL.createObjectURL(blob);
        a.href = objUrl;
        a.download = `logs-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(objUrl);
      });
  };

  const handleBulkDelete = async () => {
    const res = await adminBulkDeleteLogs(bulkDays);
    if (res.success) {
      toast.success(`Đã xóa logs cũ hơn ${bulkDays} ngày`);
      setShowBulkDelete(false);
      fetchLogs(1);
    } else {
      toast.error(res.error || 'Thất bại');
    }
  };

  const setFilter = (key: string, value: string) => setFilters(p => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Nhật ký hệ thống</h1>
          <p className="text-slate-500 text-sm">Ghi lại toàn bộ hoạt động quan trọng trong hệ thống.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setAutoRefresh(v => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${autoRefresh ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </button>
          <button onClick={handleExport}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />Export CSV
          </button>
          <button onClick={() => setShowBulkDelete(true)}
            className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />Xóa cũ
          </button>
        </div>
      </div>

      {/* Bulk delete modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Xóa logs cũ</h3>
            <p className="text-sm text-slate-600">Xóa tất cả logs cũ hơn <strong>{bulkDays} ngày</strong>. Không thể hoàn tác.</p>
            <div>
              <label className="text-xs font-bold text-slate-500">Số ngày</label>
              <input type="number" min={1} max={365} value={bulkDays} onChange={e => setBulkDays(Number(e.target.value))}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowBulkDelete(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">Hủy</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <select value={filters.action} onChange={e => setFilter('action', e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 max-w-xs">
          <option value="">Tất cả hành động</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filters.level} onChange={e => setFilter('level', e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20">
          <option value="">Tất cả level</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
          <span className="text-slate-400 text-sm">–</span>
          <input type="date" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
        </div>
        {(filters.action || filters.level || filters.dateFrom || filters.dateTo) && (
          <button onClick={() => setFilters({ action: '', level: '', dateFrom: '', dateTo: '' })}
            className="text-xs text-red-500 hover:text-red-700 font-bold border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
            Xóa bộ lọc
          </button>
        )}
        <span className="text-sm text-slate-500 font-medium w-full sm:w-auto sm:ml-auto text-right">{meta.total} logs</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table view for tablet/desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-3 lg:px-4 py-4 w-8"></th>
                <th className="px-3 lg:px-4 py-4">Thời gian</th>
                <th className="px-3 lg:px-4 py-4">Người dùng</th>
                <th className="px-3 lg:px-4 py-4">Hành động</th>
                <th className="px-3 lg:px-4 py-4">Chi tiết</th>
                <th className="px-3 lg:px-4 py-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Đang tải nhật ký...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Không có nhật ký nào.</td></tr>
              ) : logs.map(log => {
                const levelCfg = LEVEL_CONFIG[log.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG.info;
                const LevelIcon = levelCfg.Icon;
                const isExpanded = expandedLog === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setExpandedLog(isExpanded ? null : log.id)}>
                      <td className="px-3 lg:px-4 py-3">
                        <LevelIcon className={`w-4 h-4 ${levelCfg.color.replace('bg-', 'text-').split(' ')[1]}`} />
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="px-3 lg:px-4 py-3">
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <img src={log.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user.fullName || 'U')}&size=24&background=random`}
                              className="w-6 h-6 rounded-full" alt="" />
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-none">{log.user.fullName || 'Không tên'}</p>
                              <p className="text-xs text-slate-400">{log.user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Hệ thống</span>
                        )}
                      </td>
                      <td className="px-3 lg:px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${actionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{log.details}</td>
                      <td className="px-3 lg:px-4 py-3 text-xs text-slate-400 font-mono">{log.ipAddress || '—'}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">Chi tiết đầy đủ</p>
                              <p className="text-slate-700">{log.details || '—'}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 w-24 shrink-0">Level:</span>
                                <span className={`px-2 py-0.5 rounded-full font-bold ${levelCfg.color}`}>{log.level}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 w-24 shrink-0">IP:</span>
                                <span className="font-mono text-slate-700">{log.ipAddress || '—'}</span>
                              </div>
                              {log.userAgent && (
                                <div className="flex items-start gap-2">
                                  <Monitor className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                  <span className="text-slate-500 break-all">{log.userAgent}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Card list view for mobile */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading && logs.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400">Đang tải nhật ký...</div>
          ) : logs.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400">Không có nhật ký nào.</div>
          ) : (
            logs.map((log) => {
              const levelCfg = LEVEL_CONFIG[log.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG.info;
              const LevelIcon = levelCfg.Icon;
              const isExpanded = expandedLog === log.id;
              return (
                <div key={log.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LevelIcon className={`w-4 h-4 ${levelCfg.color.replace('bg-', 'text-').split(' ')[1]}`} />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <img src={log.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user.fullName || 'U')}&size=24&background=random`}
                            className="w-5 h-5 rounded-full" alt="" />
                          <span className="font-bold text-slate-700">{log.user.fullName || 'Không tên'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Hệ thống</span>
                      )}
                    </div>
                    <span className="font-mono text-slate-400">{log.ipAddress || '—'}</span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 break-all">{log.details}</p>

                  <button 
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold focus:outline-none flex items-center gap-1"
                  >
                    {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                  </button>

                  {isExpanded && (
                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 mt-2 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-500 uppercase tracking-wider mb-0.5">Chi tiết đầy đủ</p>
                        <p className="text-slate-700 break-all">{log.details || '—'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/60">
                        <div>
                          <span className="text-slate-400 block">Level:</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold inline-block mt-0.5 ${levelCfg.color}`}>{log.level}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">IP:</span>
                          <span className="font-mono text-slate-700 block mt-0.5">{log.ipAddress || '—'}</span>
                        </div>
                      </div>
                      {log.userAgent && (
                        <div className="pt-1 border-t border-slate-100/60 flex items-start gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-slate-500 break-all">{log.userAgent}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2">
            <button disabled={meta.page === 1} onClick={() => fetchLogs(meta.page - 1)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
              const page = meta.totalPages <= 7 ? i + 1 : i + Math.max(1, meta.page - 3);
              if (page > meta.totalPages) return null;
              return (
                <button key={page} onClick={() => fetchLogs(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${page === meta.page ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {page}
                </button>
              );
            })}
            <button disabled={meta.page === meta.totalPages} onClick={() => fetchLogs(meta.page + 1)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
