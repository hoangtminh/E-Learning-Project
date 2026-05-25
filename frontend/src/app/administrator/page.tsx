'use client';

import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminGetLogs } from '@/api/admin';
import { Users, History, Activity, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, logsRes] = await Promise.all([
          adminGetUsers(1, 1),
          adminGetLogs(1, 1),
        ]);

        if (usersRes.success && logsRes.success) {
          setStats({
            totalUsers: usersRes.data?.meta.total || 0,
            totalLogs: logsRes.data?.meta.total || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-32 bg-slate-200 rounded-3xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl">
        <h1 className="text-3xl font-black mb-2">Tổng quan quản trị</h1>
        <p className="text-slate-400">Chào mừng bạn đến với trung tâm quản lý hệ thống Glacier.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="w-6 h-6" />}
          label="Tổng người dùng"
          value={stats.totalUsers}
          color="bg-sky-500"
        />
        <StatCard 
          icon={<History className="w-6 h-6" />}
          label="Nhật ký hệ thống"
          value={stats.totalLogs}
          color="bg-emerald-500"
        />
        <StatCard 
          icon={<Activity className="w-6 h-6" />}
          label="Phiên hoạt động"
          value="--"
          color="bg-amber-500"
        />
        <StatCard 
          icon={<ShieldAlert className="w-6 h-6" />}
          label="Sự kiện bảo mật"
          value="0"
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors text-left group">
              <p className="font-bold text-sm text-slate-900 group-hover:text-sky-600">Xem người dùng</p>
              <p className="text-xs text-slate-500">Quản lý vai trò và quyền truy cập</p>
            </button>
            <button className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors text-left group">
              <p className="font-bold text-sm text-slate-900 group-hover:text-sky-600">Sao lưu hệ thống</p>
              <p className="text-xs text-slate-500">Tạo bản sao lưu cơ sở dữ liệu</p>
            </button>
            <button className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors text-left group">
              <p className="font-bold text-sm text-slate-900 group-hover:text-sky-600">Thông báo hệ thống</p>
              <p className="text-xs text-slate-500">Gửi thông báo tới người dùng</p>
            </button>
            <button className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors text-left group">
              <p className="font-bold text-sm text-slate-900 group-hover:text-sky-600">Chế độ bảo trì</p>
              <p className="text-xs text-slate-500">Bật/tắt truy cập hệ thống</p>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Sức khỏe hệ thống</h3>
          <p className="text-sm text-slate-500 mb-4">Tất cả hệ thống hoạt động bình thường</p>
          <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[98%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
