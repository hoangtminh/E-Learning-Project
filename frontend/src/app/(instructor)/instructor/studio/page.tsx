'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  InstructorCourse,
  getMyTeachingCourses,
} from '@/api/instructor';
import { createCourse, deleteCourse } from '@/api/courses';
import { stripHtml } from '@/lib/utils';
import { appAlert, appConfirm } from '@/components/ui/app-dialog-provider';

export default function InstructorStudioPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'sale'>('public');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await getMyTeachingCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;

    const parsedPrice = parseFloat(price.replace(/,/g, ''));
    const finalPrice = !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 0;

    // Nếu nhập giá > 0 mà chọn public → tự đổi sang sale
    const finalVisibility =
      finalPrice > 0 && visibility === 'public' ? 'sale' : visibility;

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
        visibility: finalVisibility,
        price: finalPrice > 0 ? finalPrice : undefined,
      });

      if (res.success) {
        setShowForm(false);
        setTitle('');
        setDescription('');
        setPrice('');
        setVisibility('public');
        await fetchCourses();
      } else {
        void appAlert(res.error || 'Tạo khóa học thất bại');
      }
    } catch (err: any) {
      void appAlert(err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!(await appConfirm({ title: 'Xóa khóa học?', description: 'Bạn có chắc chắn muốn xóa khóa học này? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn.', confirmLabel: 'Xóa khóa học', variant: 'destructive' }))) return;
    try {
      const res = await deleteCourse(courseId);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      } else {
        void appAlert(res.error || 'Xóa khóa học thất bại');
      }
    } catch (err: any) {
      void appAlert(err.message || 'Đã xảy ra lỗi khi xóa khóa học');
    }
  };

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md">
          <span className="material-symbols-outlined text-5xl text-slate-300">lock</span>
          <h1 className="text-xl font-bold text-slate-800">Không có quyền truy cập</h1>
          <p className="text-slate-500 text-sm">
            Khu vực này dành cho giảng viên. Liên hệ admin để được cấp quyền instructor.
          </p>
          <Link href="/dashboard" className="inline-block px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors">
            Về Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="material-symbols-outlined text-sky-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              Instructor Studio
            </h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý khóa học của bạn</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Tạo khóa học mới
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Create Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Tạo khóa học mới</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">close</span>
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
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                    placeholder="Ví dụ: Lập trình Web với React"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 resize-none"
                    placeholder="Mô tả ngắn gọn về khóa học..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chế độ hiển thị</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as 'public' | 'private' | 'sale')}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                  >
                    <option value="public">Công khai miễn phí — ai cũng truy cập được</option>
                    <option value="sale">Công khai có phí — yêu cầu thanh toán</option>
                    <option value="private">Riêng tư — chỉ qua lời mời</option>
                  </select>
                </div>

                {/* Ô nhập giá — hiện khi chọn "Có phí" hoặc public (để tùy chọn) */}
                {(visibility === 'sale' || visibility === 'public') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Giá khóa học
                      {visibility === 'sale' && <span className="text-red-500"> *</span>}
                      <span className="text-slate-400 font-normal ml-1">(VNĐ)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2.5 pr-16 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                        placeholder={visibility === 'sale' ? 'Ví dụ: 299000' : '0 = miễn phí'}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">VNĐ</span>
                    </div>
                    {visibility === 'public' && price && parseFloat(price) > 0 && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Khóa học sẽ được đặt thành <strong>Có phí</strong> do có nhập giá
                      </p>
                    )}
                    {price && parseFloat(price) > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(price))}
                      </p>
                    )}
                  </div>
                )}
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
                  className="px-5 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo khóa học'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
            <span className="material-symbols-outlined text-5xl text-slate-300">library_books</span>
            <h3 className="text-lg font-semibold text-slate-700">Chưa có khóa học nào</h3>
            <p className="text-slate-500 text-sm">Bắt đầu tạo khóa học đầu tiên của bạn ngay!</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo khóa học
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course?.id} className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-sky-200 transition-all">
                <Link
                  href={`/instructor/studio/${course?.id}`}
                  className="block h-full"
                >
                  <div className="h-36 bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center relative">
                    {course?.thumbnailUrl ? (
                      <img src={course?.thumbnailUrl} alt={course?.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-white/40 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_circle
                      </span>
                    )}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      course.visibility === 'public'
                        ? 'bg-green-100 text-green-700'
                        : course.visibility === 'sale'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {course.visibility === 'public' ? 'Miễn phí'
                        : course.visibility === 'sale' ? 'Có phí'
                        : 'Riêng tư'}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2">
                      {course?.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                      {stripHtml(course?.description) || 'Chưa có mô tả'}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">list</span>
                          {course?._count.sections} phần
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">group</span>
                          {course?._count.members} học viên
                        </span>
                      </div>
                      {Number(course?.price) > 0 && (
                        <span className="text-xs font-bold text-blue-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(course.price))}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteCourse(course?.id);
                  }}
                  className="absolute top-3 left-3 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 shadow-sm"
                  title="Xóa khóa học"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
