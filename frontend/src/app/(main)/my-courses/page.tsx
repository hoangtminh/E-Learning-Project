'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getMyEnrolledCourses } from '@/api/enrollment';
import { getMyTeachingCourses, InstructorCourse } from '@/api/instructor';
import { createCourse, deleteCourse } from '@/api/courses';
import { stripHtml } from '@/lib/utils';

interface EnrolledCourse {
  id: string;
  title: string;
  slug?: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  visibility: string;
  createdAt: string;
  enrolledAt?: string;
  instructor: { id: string; fullName: string | null; avatarUrl: string | null };
  _count?: { sections: number; members: number };
}

export default function MyCoursesPage() {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [teachingCourses, setTeachingCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'teaching'>('enrolled');

  // Create course form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const promises: Promise<any>[] = [getMyEnrolledCourses()];
      if (isInstructor) {
        promises.push(getMyTeachingCourses());
      }
      const results = await Promise.all(promises);
      if (results[0].success && results[0].data) {
        setEnrolledCourses(results[0].data);
      }
      if (results[1]?.success && results[1]?.data) {
        setTeachingCourses(results[1].data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36);

      const res = await createCourse({
        title: title.trim(),
        slug,
        description: description.trim() || undefined,
        visibility,
      });

      if (res.success) {
        setShowForm(false);
        setTitle('');
        setDescription('');
        setActiveTab('teaching');
        await fetchAll();
      } else {
        alert(res.error || 'Tạo khóa học thất bại');
      }
    } catch (err: any) {
      alert(err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn.')) return;
    try {
      const res = await deleteCourse(courseId);
      if (res.success) {
        setTeachingCourses((prev) => prev.filter((c) => c.id !== courseId));
      } else {
        alert(res.error || 'Xóa khóa học thất bại');
      }
    } catch (err: any) {
      alert(err.message || 'Đã xảy ra lỗi khi xóa khóa học');
    }
  };

  const tabs = [
    { id: 'enrolled' as const, label: 'Đang học', count: enrolledCourses.length },
    ...(isInstructor
      ? [{ id: 'teaching' as const, label: 'Đang giảng dạy', count: teachingCourses.length }]
      : []),
  ];

  return (
    <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">
            Khóa học của tôi
          </h1>
          <p className="text-slate-500 mt-1 text-[13px]">
            Quản lý các khóa học bạn đang tham gia{isInstructor ? ' và giảng dạy' : ''}.
          </p>
        </div>
        {isInstructor && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#006382] text-white rounded-lg text-[13px] font-semibold hover:bg-[#005270] transition-colors shrink-0"
          >
            + Tạo khóa học
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-[13px] font-semibold transition-colors ${
              activeTab === tab.id
                ? 'text-[#006382]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                activeTab === tab.id
                  ? 'bg-[#006382]/10 text-[#006382]'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#006382] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Create Course Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Tạo khóa học mới</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006382] text-slate-800"
                  placeholder="Ví dụ: Lập trình Web với React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006382] text-slate-800 resize-none"
                  placeholder="Mô tả ngắn gọn về khóa học..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chế độ hiển thị</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006382] text-slate-800"
                >
                  <option value="public">Công khai — ai cũng có thể tìm thấy</option>
                  <option value="private">Riêng tư — chỉ qua lời mời</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || isSubmitting}
                className="px-5 py-2.5 bg-[#006382] text-white rounded-xl font-semibold text-sm hover:bg-[#005270] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo khóa học'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-16 justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#006382] border-t-transparent" />
          <span>Đang tải...</span>
        </div>
      ) : activeTab === 'enrolled' ? (
        enrolledCourses.length === 0 ? (
          <EmptyState
            title="Chưa đăng ký khóa học nào"
            description="Hãy khám phá danh mục khóa học và bắt đầu hành trình học tập!"
            actionLabel="Khám phá khóa học"
            actionHref="/courses"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} type="enrolled" />
            ))}
          </div>
        )
      ) : (
        teachingCourses.length === 0 ? (
          <EmptyState
            title="Chưa có khóa học giảng dạy"
            description="Tạo khóa học đầu tiên của bạn ngay!"
            actionLabel="Tạo khóa học"
            actionOnClick={() => setShowForm(true)}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachingCourses.map((course) => (
              <CourseCard key={course.id} course={course} type="teaching" onDelete={() => handleDeleteCourse(course.id)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function CourseCard({ course, type, onDelete }: { course: any; type: 'enrolled' | 'teaching'; onDelete?: () => void }) {
  const href = type === 'teaching'
    ? `/instructor/studio/${course.id}`
    : `/courses/${course.id}`;

  return (
    <div className="relative group">
    <Link
      href={href}
      className="flex flex-col h-full rounded-xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5"
    >
      {course.thumbnailUrl ? (
        <div className="aspect-video w-full overflow-hidden bg-slate-100">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-[#006382]/10 via-[#006382]/5 to-slate-50 flex items-center justify-center">
          <span className="text-[#006382]/20 text-3xl font-black tracking-tighter">
            {course.title?.charAt(0)?.toUpperCase() || 'C'}
          </span>
        </div>
      )}

      <div className="flex-1 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-md px-2 py-[2px] text-[10px] font-semibold tracking-wide uppercase ${
            type === 'teaching'
              ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
          }`}>
            {type === 'teaching' ? 'Giảng viên' : 'Đang học'}
          </span>
        </div>

        <h3 className="text-[14px] font-semibold leading-snug text-slate-800 group-hover:text-[#006382] transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-slate-400 mt-1 line-clamp-2 text-[12px] leading-relaxed">
          {stripHtml(course.description) || 'Chưa có mô tả.'}
        </p>
      </div>

      <div className="px-4 pb-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        {type === 'teaching' ? (
          <>
            <span>{course._count?.sections ?? 0} phần học</span>
            <span>{course._count?.members ?? 0} học viên</span>
          </>
        ) : (
          <>
            <span>{course.instructor?.fullName || 'Giảng viên'}</span>
            {course.enrolledAt && (
              <span>{new Date(course.enrolledAt).toLocaleDateString('vi-VN')}</span>
            )}
          </>
        )}
      </div>
    </Link>
    {type === 'teaching' && onDelete && (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 shadow-sm"
        title="Xóa khóa học"
      >
        <span className="material-symbols-outlined text-[14px] leading-none">delete</span>
      </button>
    )}
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  actionOnClick?: () => void;
}) {
  const buttonClass = "inline-block mt-5 px-5 py-2 bg-[#006382] hover:bg-[#005270] text-white rounded-lg text-[13px] font-semibold transition-colors";

  return (
    <div className="text-center py-20 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      <h3 className="font-semibold text-[15px] text-slate-700">{title}</h3>
      <p className="text-slate-400 text-[13px] mt-1.5 max-w-xs mx-auto">{description}</p>
      {actionHref ? (
        <Link href={actionHref} className={buttonClass}>
          {actionLabel}
        </Link>
      ) : (
        <button onClick={actionOnClick} className={buttonClass}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
