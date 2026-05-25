'use client';

import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminUpdateUserRole, adminDeleteUser, AdminUser } from '@/api/admin';
import { Search, MoreVertical, Shield, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminGetUsers(page, 10, search);
      if (res.success && res.data) {
        setUsers(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await adminUpdateUserRole(userId, role);
      if (res.success) {
        toast.success('Đã cập nhật vai trò người dùng');
        fetchUsers(meta.page);
      } else {
        toast.error(res.error || 'Cập nhật vai trò thất bại');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await adminDeleteUser(userId);
      if (res.success) {
        toast.success('Đã xóa người dùng');
        fetchUsers(meta.page);
      } else {
        toast.error(res.error || 'Xóa người dùng thất bại');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản lý người dùng</h1>
          <p className="text-slate-500 text-sm">Theo dõi và quản lý tất cả người dùng trong hệ thống.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors">
          <UserPlus className="w-4 h-4" />
          Thêm người dùng mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Hiển thị {users.length} trong tổng số {meta.total} người dùng
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Đang tải danh sách người dùng...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Không tìm thấy người dùng nào.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} 
                          alt="" 
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{user.fullName || 'Không tên'}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className={`text-xs font-bold px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-sky-500/20 cursor-pointer ${
                          user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                          user.role === 'instructor' ? 'bg-sky-100 text-sky-700' :
                          'bg-slate-100 text-slate-700'
                        }`}
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      >
                        <option value="user">Học viên</option>
                        <option value="instructor">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              onClick={() => fetchUsers(meta.page - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-colors"
            >
              Trước
            </button>
            <span className="text-sm font-medium text-slate-500">Trang {meta.page} / {meta.totalPages}</span>
            <button 
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchUsers(meta.page + 1)}
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
