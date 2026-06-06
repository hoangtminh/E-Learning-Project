'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { changePassword } from '@/api/user';

type Tab = 'account' | 'security' | 'notifications';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('account');

  // Account tab state
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [accountMsg, setAccountMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);

  // Security tab state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [secMsg, setSecMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Notification tab state
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  const handleChangePwd = async () => {
    setSecMsg(null);
    if (!currentPwd || !newPwd || !confirmPwd) {
      setSecMsg({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setSecMsg({ type: 'error', text: 'Mật khẩu mới không khớp.' });
      return;
    }
    if (newPwd.length < 6) {
      setSecMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    setSavingPwd(true);
    const res = await changePassword({ currentPassword: currentPwd, newPassword: newPwd });
    if (res.success) {
      setSecMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } else {
      setSecMsg({ type: 'error', text: res.error || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.' });
    }
    setSavingPwd(false);
  };

  const tabs = [
    { id: 'account' as Tab, label: 'Tài khoản', icon: 'manage_accounts' },
    { id: 'security' as Tab, label: 'Bảo mật', icon: 'lock' },
    { id: 'notifications' as Tab, label: 'Thông báo', icon: 'notifications' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#252f43]">Cài đặt</h1>
        <p className="text-xs sm:text-sm text-[#525b72] mt-1">Quản lý tài khoản và tuỳ chỉnh trải nghiệm học tập của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
        {/* Sidebar tabs */}
        <div className="md:col-span-1">
          <nav className="bg-white rounded-2xl border border-[#a3adc7]/20 shadow-sm p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-[#006382] text-white shadow-md shadow-[#006382]/20'
                    : 'text-[#525b72] hover:bg-[#006382]/5 hover:text-[#006382]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">

          {/* ── Account Tab ── */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#a3adc7]/20 shadow-sm p-4 sm:p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-black text-[#252f43]">Thông tin tài khoản</h2>

              {accountMsg && (
                <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${accountMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {accountMsg.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  {accountMsg.text}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Tên hiển thị</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#a3adc7]/40 text-[#252f43] text-sm focus:outline-none focus:ring-2 focus:ring-[#006382]/30 focus:border-[#006382] transition"
                    placeholder="Tên đầy đủ..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Email</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#a3adc7]/20 bg-[#f5f6ff] text-[#525b72] text-sm">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    {user?.email}
                  </div>
                  <p className="text-xs text-[#525b72] mt-1.5 ml-1">Email không thể thay đổi sau khi đăng ký</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Vai trò</label>
                  <div className="px-4 py-3 rounded-xl border border-[#a3adc7]/20 bg-[#f5f6ff] text-[#252f43] text-sm capitalize">
                    {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#a3adc7]/20 flex justify-end">
                <button
                  onClick={async () => {
                    setSavingAccount(true);
                    setAccountMsg(null);
                    const { updateMyProfile } = await import('@/api/user');
                    const res = await updateMyProfile({ fullName: displayName });
                    if (res.success) {
                      setAccountMsg({ type: 'success', text: 'Cập nhật thành công!' });
                    } else {
                      setAccountMsg({ type: 'error', text: res.error || 'Cập nhật thất bại.' });
                    }
                    setSavingAccount(false);
                  }}
                  disabled={savingAccount}
                  className="flex items-center gap-2 bg-[#006382] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#005672] transition-colors disabled:opacity-60"
                >
                  {savingAccount && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#a3adc7]/20 shadow-sm p-4 sm:p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-black text-[#252f43]">Đổi mật khẩu</h2>
              <p className="text-sm text-[#525b72]">Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh và không chia sẻ với ai.</p>

              {secMsg && (
                <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${secMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {secMsg.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  {secMsg.text}
                </div>
              )}

              <div className="space-y-5">
                {/* Current password */}
                <div>
                  <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? 'text' : 'password'}
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[#a3adc7]/40 text-[#252f43] text-sm focus:outline-none focus:ring-2 focus:ring-[#006382]/30 focus:border-[#006382] transition"
                      placeholder="Nhập mật khẩu hiện tại..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525b72] hover:text-[#252f43]"
                    >
                      <span className="material-symbols-outlined text-xl">{showCurrentPwd ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[#a3adc7]/40 text-[#252f43] text-sm focus:outline-none focus:ring-2 focus:ring-[#006382]/30 focus:border-[#006382] transition"
                      placeholder="Tối thiểu 6 ký tự..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525b72] hover:text-[#252f43]"
                    >
                      <span className="material-symbols-outlined text-xl">{showNewPwd ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {newPwd && (
                    <div className="mt-2 flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            newPwd.length > i * 3
                              ? newPwd.length < 6 ? 'bg-red-400' : newPwd.length < 10 ? 'bg-yellow-400' : 'bg-emerald-400'
                              : 'bg-[#a3adc7]/30'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-[#525b72] ml-2">
                        {newPwd.length < 6 ? 'Yếu' : newPwd.length < 10 ? 'Trung bình' : 'Mạnh'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-[#252f43] text-sm focus:outline-none focus:ring-2 focus:ring-[#006382]/30 focus:border-[#006382] transition ${
                      confirmPwd && confirmPwd !== newPwd ? 'border-red-400' : 'border-[#a3adc7]/40'
                    }`}
                    placeholder="Nhập lại mật khẩu mới..."
                  />
                  {confirmPwd && confirmPwd !== newPwd && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">Mật khẩu không khớp</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#a3adc7]/20 flex justify-end">
                <button
                  onClick={handleChangePwd}
                  disabled={savingPwd}
                  className="flex items-center gap-2 bg-[#006382] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#005672] transition-colors disabled:opacity-60"
                >
                  {savingPwd && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#a3adc7]/20 shadow-sm p-4 sm:p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-black text-[#252f43]">Cài đặt thông báo</h2>
              <p className="text-sm text-[#525b72]">Chọn cách bạn muốn nhận thông báo từ nền tảng.</p>

              <div className="space-y-4">
                {[
                  {
                    label: 'Thông báo qua Email',
                    desc: 'Nhận email khi có hoạt động mới trong khóa học và lớp học',
                    checked: notifEmail,
                    onChange: setNotifEmail,
                    icon: 'email',
                  },
                  {
                    label: 'Thông báo trong ứng dụng',
                    desc: 'Hiển thị chuông thông báo khi có tin nhắn, bài tập mới',
                    checked: notifInApp,
                    onChange: setNotifInApp,
                    icon: 'notifications',
                  },
                  {
                    label: 'Email marketing',
                    desc: 'Nhận thông tin về khóa học mới, ưu đãi và sự kiện',
                    checked: notifMarketing,
                    onChange: setNotifMarketing,
                    icon: 'campaign',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 p-5 rounded-2xl border border-[#a3adc7]/20 hover:border-[#006382]/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#006382]/10 flex items-center justify-center text-[#006382] shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#252f43] text-sm">{item.label}</p>
                      <p className="text-xs text-[#525b72] mt-0.5">{item.desc}</p>
                    </div>
                    {/* Toggle switch */}
                    <button
                      onClick={() => item.onChange(!item.checked)}
                      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${item.checked ? 'bg-[#006382]' : 'bg-[#a3adc7]/40'}`}
                      role="switch"
                      aria-checked={item.checked}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${item.checked ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#a3adc7]/20 flex justify-end">
                <button className="flex items-center gap-2 bg-[#006382] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#005672] transition-colors">
                  Lưu cài đặt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
