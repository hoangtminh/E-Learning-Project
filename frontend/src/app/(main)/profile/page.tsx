'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateMyProfile } from '@/api/user';
import { getMyEnrolledCourses } from '@/api/enrollment';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  useEffect(() => {
    getMyEnrolledCourses()
      .then((res) => {
        if (res.success && res.data) setEnrolledCourses(res.data);
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg(null);
    const res = await updateMyProfile({ fullName, avatarUrl });
    if (res.success) {
      updateUser({ fullName, avatarUrl });
      setSaveMsg({ type: 'success', text: 'Cập nhật thành công!' });
      setIsEditing(false);
    } else {
      setSaveMsg({ type: 'error', text: res.error || 'Cập nhật thất bại.' });
    }
    setIsSaving(false);
  };

  const initials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#252f43]">Hồ sơ cá nhân</h1>
        <p className="text-xs sm:text-sm text-[#525b72] mt-1">Quản lý thông tin tài khoản và khóa học của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar + Basic info */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#a3adc7]/20 shadow-sm p-4 sm:p-6 md:p-8 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              {(isEditing ? avatarUrl : user?.avatarUrl) ? (
                <img
                  src={isEditing ? avatarUrl : user?.avatarUrl!}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#006382]/20"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#006382] to-[#0091aa] flex items-center justify-center text-white text-3xl font-black ring-4 ring-[#006382]/20">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#252f43]">{user?.fullName || 'Người dùng'}</h2>
              <p className="text-sm text-[#525b72]">{user?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#006382]/10 text-[#006382]">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {user?.role === 'admin' ? 'admin_panel_settings' : user?.role === 'instructor' ? 'school' : 'person'}
                </span>
                {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-[#a3adc7]/20 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xl font-black text-[#252f43]">{enrolledCourses.length}</p>
                <p className="text-xs text-[#525b72]">Khóa học</p>
              </div>
              <div>
                <p className="text-xl font-black text-[#252f43]">0</p>
                <p className="text-xs text-[#525b72]">Chứng chỉ</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-[#a3adc7]/20 shadow-sm p-4 space-y-1">
            {[
              { icon: 'settings', label: 'Cài đặt tài khoản', href: '/settings' },
              { icon: 'school', label: 'Khóa học của tôi', href: '/my-courses' },
              { icon: 'groups', label: 'Lớp học', href: '/classrooms' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#006382]/5 text-[#525b72] hover:text-[#006382] transition-colors group"
              >
                <span className="material-symbols-outlined text-xl group-hover:text-[#006382]">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                <span className="material-symbols-outlined text-sm ml-auto opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Edit form + Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit form */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#a3adc7]/20 shadow-sm p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-[#252f43]">Thông tin cá nhân</h3>
              {!isEditing ? (
                <button
                  onClick={() => { setIsEditing(true); setSaveMsg(null); }}
                  className="flex items-center gap-2 text-sm font-semibold text-[#006382] hover:bg-[#006382]/10 px-4 py-2 rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setFullName(user?.fullName || ''); setAvatarUrl(user?.avatarUrl || ''); setSaveMsg(null); }}
                    className="text-sm font-medium text-[#525b72] hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 text-sm font-bold text-white bg-[#006382] hover:bg-[#005672] px-5 py-2 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {isSaving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>

            {saveMsg && (
              <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {saveMsg.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {saveMsg.text}
              </div>
            )}

            <div className="space-y-5">
              {/* Full name */}
              <div>
                <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Tên đầy đủ</label>
                {isEditing ? (
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#a3adc7]/40 text-[#252f43] text-sm focus:outline-none focus:ring-2 focus:ring-[#006382]/30 focus:border-[#006382] transition bg-white"
                    placeholder="Nhập tên đầy đủ..."
                  />
                ) : (
                  <p className="px-4 py-3 bg-[#f5f6ff] rounded-xl text-[#252f43] text-sm">{user?.fullName || '—'}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Email</label>
                <p className="px-4 py-3 bg-[#f5f6ff] rounded-xl text-[#525b72] text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  {user?.email}
                </p>
                <p className="text-xs text-[#525b72] mt-1.5 ml-1">Email không thể thay đổi</p>
              </div>

              {/* Avatar URL */}
              {isEditing && (
                <div>
                  <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">URL ảnh đại diện</label>
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#a3adc7]/40 text-[#252f43] text-sm focus:outline-none focus:ring-2 focus:ring-[#006382]/30 focus:border-[#006382] transition bg-white"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              )}

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-[#525b72] uppercase tracking-wider mb-2">Vai trò</label>
                <p className="px-4 py-3 bg-[#f5f6ff] rounded-xl text-[#252f43] text-sm capitalize">
                  {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                </p>
              </div>
            </div>
          </div>

          {/* Enrolled courses */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#a3adc7]/20 shadow-sm p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-[#252f43]">Khóa học đang học</h3>
              <Link href="/courses" className="text-sm font-semibold text-[#006382] hover:underline">Khám phá thêm</Link>
            </div>

            {loadingCourses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.slice(0, 5).map((enrollment: any) => {
                  const course = enrollment.course || enrollment;
                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-[#a3adc7]/20 hover:border-[#006382]/30 hover:bg-[#006382]/5 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sky-400">play_circle</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#252f43] text-sm line-clamp-1 group-hover:text-[#006382] transition-colors">{course.title}</p>
                        <p className="text-xs text-[#525b72] mt-0.5">{course.instructor?.fullName || 'Giảng viên'}</p>
                      </div>
                      <span className="material-symbols-outlined text-[#a3adc7] group-hover:text-[#006382] transition-colors shrink-0">chevron_right</span>
                    </Link>
                  );
                })}
                {enrolledCourses.length > 5 && (
                  <Link href="/my-courses" className="block text-center text-sm font-semibold text-[#006382] hover:underline pt-2">
                    Xem tất cả {enrolledCourses.length} khóa học →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-3xl text-[#006382]">auto_stories</span>
                </div>
                <p className="text-sm text-[#525b72]">Bạn chưa đăng ký khóa học nào.</p>
                <Link href="/courses" className="mt-3 inline-block text-sm font-bold text-[#006382] hover:underline">Khám phá ngay →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
