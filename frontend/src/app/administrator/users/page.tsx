'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  adminGetUsers, adminCreateUser, adminUpdateUserRole, adminSuspendUser,
  adminResetPassword, adminDeleteUser, adminGetUserDetail,
  AdminUser, AdminUserDetail,
} from '@/api/admin';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, UserPlus, Trash2, Lock, Unlock, KeyRound, ChevronDown,
  ShieldCheck, GraduationCap, User as UserIcon, X, Eye, Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'user', label: 'Học viên', Icon: UserIcon, color: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  { value: 'instructor', label: 'Giảng viên', Icon: GraduationCap, color: 'text-sky-700', bg: 'bg-sky-100', dot: 'bg-sky-500' },
  { value: 'admin', label: 'Quản trị viên', Icon: ShieldCheck, color: 'text-indigo-700', bg: 'bg-indigo-100', dot: 'bg-indigo-500' },
] as const;

function RoleDropdown({
  userId,
  currentRole,
  isSelf,
  onUpdate,
  index,
  total,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
  onUpdate: (id: string, role: string) => void;
  index: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const cfg = ROLES.find(r => r.value === currentRole) ?? ROLES[0];
  const { Icon } = cfg;

  if (isSelf) return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}<Lock className="w-3 h-3 opacity-50" />
    </span>
  );

  const openUpward = index >= total - 2;

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${cfg.bg} ${cfg.color}`}>
        <Icon className="w-3 h-3" />{cfg.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <>
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
        <div className={`absolute left-0 z-20 bg-white border border-slate-200 rounded-xl shadow-xl w-44 overflow-hidden ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {ROLES.map(r => {
            const RIcon = r.Icon;
            return (
              <button key={r.value} onClick={() => { onUpdate(userId, r.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-slate-50 ${r.value === currentRole ? 'bg-slate-50' : ''}`}>
                <span className={`w-2 h-2 rounded-full ${r.dot}`} />
                <RIcon className={`w-4 h-4 ${r.color}`} />
                <span className={r.value === currentRole ? `font-bold ${r.color}` : 'text-slate-700'}>{r.label}</span>
                {r.value === currentRole && <span className="ml-auto text-xs text-slate-400">✓</span>}
              </button>
            );
          })}
        </div>
      </>}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Vui lòng điền đầy đủ thông tin');
    setLoading(true);
    try {
      const res = await adminCreateUser(form);
      if (res.success) { toast.success('Đã tạo người dùng mới'); onCreated(); onClose(); }
      else toast.error(res.error || 'Tạo thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg">Tạo người dùng mới</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {[
            { key: 'fullName', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A' },
            { key: 'email', label: 'Email *', type: 'email', placeholder: 'user@example.com' },
            { key: 'password', label: 'Mật khẩu *', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Vai trò</label>
            <select className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 disabled:opacity-50">
              {loading ? 'Đang tạo...' : 'Tạo người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Mật khẩu ít nhất 6 ký tự');
    setLoading(true);
    try {
      const res = await adminResetPassword(user.id, password);
      if (res.success) { toast.success('Đã reset mật khẩu'); onClose(); }
      else toast.error(res.error || 'Thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Reset mật khẩu</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600">Đặt mật khẩu mới cho <strong>{user.fullName || user.email}</strong></p>
          <input type="password" placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            value={password} onChange={e => setPassword(e.target.value)} />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50">
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  useEffect(() => {
    adminGetUserDetail(userId).then(r => { if (r.success && r.data) setDetail(r.data); });
  }, [userId]);

  const logColor = (level: string) =>
    level === 'error' ? 'text-red-500' : level === 'warn' ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Chi tiết người dùng</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        {!detail ? (
          <div className="p-8 text-center text-slate-400">Đang tải...</div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
              <img src={detail.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(detail.fullName || 'U')}&background=random`}
                className="w-16 h-16 rounded-full border-2 border-slate-200" alt="" />
              <div>
                <p className="font-bold text-slate-900 text-lg">{detail.fullName || 'Không tên'}</p>
                <p className="text-sm text-slate-500">{detail.email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Tham gia: {new Date(detail.createdAt).toLocaleDateString('vi-VN')}
                  {detail.isSuspended && <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Bị khóa</span>}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Lớp học', value: detail._count.classroomMembers },
                { label: 'Khóa học', value: detail._count.courseMemberships },
                { label: 'Bài nộp', value: detail._count.taskSubmissions },
                { label: 'Giao dịch', value: detail._count.transactions },
                { label: 'Đang dạy', value: detail._count.coursesInstructing },
                { label: 'Sở hữu lớp', value: detail._count.ownedClassrooms },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Lịch sử hoạt động (20 gần nhất)</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {detail.logs.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Chưa có hoạt động</p>
                ) : detail.logs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 font-bold ${logColor(log.level)}`}>●</span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold shrink-0">{log.action}</span>
                    <span className="text-slate-500 flex-1 truncate">{log.details}</span>
                    <span className="text-slate-400 shrink-0">{new Date(log.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const currentUserId = currentUser?.id || currentUser?.userId;

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminGetUsers(page, 10, search, roleFilter, statusFilter);
      if (res.success && res.data) { setUsers(res.data.data); setMeta(res.data.meta); }
    } catch { toast.error('Không thể tải danh sách'); }
    finally { setLoading(false); }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { const t = setTimeout(() => fetchUsers(1), 400); return () => clearTimeout(t); }, [fetchUsers]);

  const handleRole = async (userId: string, role: string) => {
    const res = await adminUpdateUserRole(userId, role);
    if (res.success) { toast.success('Đã cập nhật vai trò'); fetchUsers(meta.page); }
    else toast.error(res.error || 'Thất bại');
  };

  const handleSuspend = async (user: AdminUser) => {
    const action = user.isSuspended ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${user.fullName || user.email}"?`)) return;
    const res = await adminSuspendUser(user.id, !user.isSuspended);
    if (res.success) { toast.success(`Đã ${action} tài khoản`); fetchUsers(meta.page); }
    else toast.error(res.error || 'Thất bại');
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Xóa vĩnh viễn tài khoản "${user.fullName || user.email}"?\nHành động này không thể hoàn tác.`)) return;
    const res = await adminDeleteUser(user.id);
    if (res.success) { toast.success('Đã xóa người dùng'); fetchUsers(meta.page); }
    else toast.error(res.error || 'Thất bại');
  };

  return (
    <div className="space-y-6">
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={() => fetchUsers(1)} />}
      {resetUser && <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
      {detailUserId && <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản lý người dùng</h1>
          <p className="text-slate-500 text-sm">Theo dõi và quản lý tất cả người dùng trong hệ thống.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" />Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Tìm kiếm tên, email..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              <option value="">Tất cả vai trò</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="suspended">Bị khóa</option>
            </select>
          </div>
          <span className="text-sm text-slate-500 ml-auto">{users.length}/{meta.total} người dùng</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Không tìm thấy người dùng nào.</td></tr>
              ) : users.map((user, index) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${isSelf ? 'bg-sky-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=random`}
                            className={`w-9 h-9 rounded-full border-2 object-cover ${user.isSuspended ? 'border-red-200 opacity-60' : 'border-slate-200'}`} alt="" />
                          {isSelf && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-sky-500 rounded-full border-2 border-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-sm">{user.fullName || 'Không tên'}</p>
                            {isSelf && <span className="text-xs bg-sky-100 text-sky-700 font-semibold px-1.5 py-0.5 rounded">Bạn</span>}
                          </div>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleDropdown userId={user.id} currentRole={user.role} isSelf={isSelf} onUpdate={handleRole} index={index} total={users.length} />
                    </td>
                    <td className="px-6 py-4">
                      {user.isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                          <Lock className="w-3 h-3" />Bị khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailUserId(user.id)} title="Xem chi tiết"
                          className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isSelf && <>
                          <button onClick={() => handleSuspend(user)} title={user.isSuspended ? 'Mở khóa' : 'Khóa tài khoản'}
                            className={`p-2 rounded-lg transition-colors ${user.isSuspended ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}>
                            {user.isSuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setResetUser(user)} title="Reset mật khẩu"
                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user)} title="Xóa người dùng"
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2">
            <button disabled={meta.page === 1} onClick={() => fetchUsers(meta.page - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40">Trước</button>
            <span className="text-sm text-slate-500">Trang {meta.page} / {meta.totalPages}</span>
            <button disabled={meta.page === meta.totalPages} onClick={() => fetchUsers(meta.page + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40">Sau</button>
          </div>
        )}
      </div>
    </div>
  );
}
