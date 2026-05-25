'use client';

import React, { useEffect, useState } from 'react';
import { adminGetStats, adminGetLogStats, adminGetLogs, AdminStats, LogStats, AdminLog } from '@/api/admin';
import {
  Users,
  History,
  ShieldCheck,
  GraduationCap,
  UserX,
  TrendingUp,
  CreditCard,
  Activity,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
        {href && <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />}
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((d, i) => {
        const height = Math.max((d.count / max) * 100, 2);
        return (
          <div
            key={i}
            className="flex-1 relative group"
            title={`${d.date}: ${d.count} logs`}
          >
            <div
              className="bg-sky-400/70 hover:bg-sky-500 rounded-sm transition-colors cursor-pointer"
              style={{ height: `${height}%`, minHeight: '2px' }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 bg-slate-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none">
              {d.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const color =
    action.includes('DELETE') || action.includes('SUSPEND') ? 'bg-red-100 text-red-700' :
    action.includes('CREATE') || action.includes('REGISTER') ? 'bg-emerald-100 text-emerald-700' :
    action.includes('UPDATE') || action.includes('PATCH') ? 'bg-amber-100 text-amber-700' :
    action.includes('LOGIN') ? 'bg-blue-100 text-blue-700' :
    action.includes('ADMIN') ? 'bg-purple-100 text-purple-700' :
    'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${color}`}>
      {action}
    </span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logStats, setLogStats] = useState<LogStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, logStatsRes, logsRes] = await Promise.all([
          adminGetStats(),
          adminGetLogStats(14),
          adminGetLogs(1, 8),
        ]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (logStatsRes.success && logStatsRes.data) setLogStats(logStatsRes.data);
        if (logsRes.success && logsRes.data) setRecentLogs(logsRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-sky-400 font-bold text-sm uppercase tracking-wider">Admin Control Center</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Tổng quan hệ thống</h1>
          <p className="text-slate-400 text-sm">
            {stats?.newUsersThisMonth ?? 0} người dùng mới trong 30 ngày qua •{' '}
            {stats?.totalLogs ?? 0} hoạt động được ghi nhận
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Tổng người dùng"
          value={stats?.totalUsers ?? 0}
          sub={`${stats?.newUsersThisMonth ?? 0} mới tháng này`}
          color="bg-sky-500"
          href="/administrator/users"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          label="Giảng viên"
          value={stats?.instructorCount ?? 0}
          color="bg-emerald-500"
        />
        <StatCard
          icon={<History className="w-6 h-6" />}
          label="Nhật ký hệ thống"
          value={stats?.totalLogs ?? 0}
          color="bg-violet-500"
          href="/administrator/logs"
        />
        <StatCard
          icon={<CreditCard className="w-6 h-6" />}
          label="Giao dịch thành công"
          value={stats?.successTransactions ?? 0}
          sub={`/ ${stats?.totalTransactions ?? 0} tổng`}
          color="bg-amber-500"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{stats?.adminCount ?? 0}</p>
            <p className="text-xs text-slate-500 font-medium">Quản trị viên</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{stats?.userCount ?? 0}</p>
            <p className="text-xs text-slate-500 font-medium">Học viên</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{stats?.suspendedUsers ?? 0}</p>
            <p className="text-xs text-slate-500 font-medium">Tài khoản bị khóa</p>
          </div>
        </div>
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Log activity chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Hoạt động 14 ngày qua</h3>
              <p className="text-xs text-slate-500 mt-0.5">Số lượng log theo ngày</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          {logStats ? (
            <MiniBarChart data={logStats.timeline} />
          ) : (
            <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          )}
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-400">{logStats?.timeline[0]?.date?.slice(5)}</span>
            <span className="text-xs text-slate-400">{logStats?.timeline[logStats.timeline.length - 1]?.date?.slice(5)}</span>
          </div>

          {/* Top actions */}
          {logStats && logStats.topActions.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top hành động</p>
              {logStats.topActions.slice(0, 5).map((a) => {
                const pct = Math.round((a.count / (logStats.topActions[0]?.count || 1)) * 100);
                return (
                  <div key={a.action}>
                    <div className="flex items-center justify-between mb-1">
                      <ActionBadge action={a.action} />
                      <span className="text-xs font-bold text-slate-600">{a.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Role distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6">Phân bổ vai trò</h3>
          {stats && (
            <div className="space-y-4">
              {[
                { label: 'Học viên', value: stats.userCount, color: 'bg-slate-400', total: stats.totalUsers },
                { label: 'Giảng viên', value: stats.instructorCount, color: 'bg-sky-500', total: stats.totalUsers },
                { label: 'Quản trị viên', value: stats.adminCount, color: 'bg-indigo-500', total: stats.totalUsers },
              ].map((r) => {
                const pct = stats.totalUsers > 0 ? Math.round((r.value / stats.totalUsers) * 100) : 0;
                return (
                  <div key={r.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{r.label}</span>
                      <span className="font-bold text-slate-900">{r.value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="font-bold text-slate-700 text-sm mb-3">Thao tác nhanh</h4>
            <div className="space-y-2">
              <Link href="/administrator/users" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-medium text-slate-700">Quản lý người dùng</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
              </Link>
              <Link href="/administrator/logs" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-slate-700">Xem nhật ký hệ thống</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent logs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Hoạt động gần đây</h3>
          <Link href="/administrator/logs" className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recentLogs.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">Chưa có hoạt động nào</div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50/50">
                <div className="flex-shrink-0">
                  {log.level === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : log.level === 'warn' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <ActionBadge action={log.action} />
                <span className="text-sm text-slate-600 flex-1 truncate">{log.details}</span>
                <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(log.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
