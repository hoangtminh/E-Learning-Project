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
import { Plus, X, Lock, PlayCircle, Trash2, Library, Users, ListVideo, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest text-on-surface">
        <div className="text-center space-y-4 bg-white rounded-2xl shadow-xs border border-outline-variant/30 p-8 max-w-md">
          <Lock className="size-12 text-on-surface-variant/40 mx-auto" />
          <h1 className="text-xl font-bold text-on-surface">Không có quyền truy cập</h1>
          <p className="text-on-surface-variant/70 text-sm">
            Khu vực này dành cho giảng viên. Liên hệ admin để được cấp quyền instructor.
          </p>
          <Link href="/dashboard" className="inline-block px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dim transition-colors shadow-xs active:scale-95">
            Về Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='pb-16 transition-all p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8 bg-surface-container-lowest min-h-screen text-on-surface relative'>
      <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />

      <div className='max-w-6xl mx-auto w-full space-y-6 sm:space-y-8 relative z-10'>
        {/* Title section */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6 relative z-10'>
          <div>
            <h1 className='text-xl sm:text-2xl font-black text-on-surface tracking-tight flex items-center gap-2'>
              <span className='material-symbols-outlined text-primary' style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              Instructor Studio
            </h1>
            <p className='text-xs sm:text-sm text-on-surface-variant/85 mt-1 max-w-2xl'>
              Quản lý khóa học của bạn
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white shadow-xs hover:bg-primary-dim transition-all active:scale-[0.98] self-start sm:self-center"
          >
            <Plus className="size-3.5" />
            Tạo khóa học mới
          </button>
        </div>

        {/* Create Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-outline-variant/30"
              >
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3.5 mb-4">
                  <h2 className="text-sm sm:text-base font-black text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">school</span>
                    Tạo khóa học mới
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-on-surface-variant/60 hover:text-on-surface cursor-pointer border-0 bg-transparent">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Tên khóa học <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 text-xs sm:text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface h-10 bg-slate-50 focus:bg-white transition-colors"
                      placeholder="Ví dụ: Lập trình Web với React"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Mô tả</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface resize-none bg-slate-50 focus:bg-white transition-colors text-xs sm:text-sm"
                      placeholder="Mô tả ngắn gọn về khóa học..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Chế độ hiển thị</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as 'public' | 'private' | 'sale')}
                      className="w-full px-4 py-2 border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface h-10 bg-slate-50 focus:bg-white transition-colors text-xs sm:text-sm"
                    >
                      <option value="public">Công khai miễn phí — ai cũng truy cập được</option>
                      <option value="sale">Công khai có phí — yêu cầu thanh toán</option>
                      <option value="private">Riêng tư — chỉ qua lời mời</option>
                    </select>
                  </div>

                  {/* Ô nhập giá — hiện khi chọn "Có phí" hoặc public (để tùy chọn) */}
                  {(visibility === 'sale' || visibility === 'public') && (
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Giá khóa học
                        {visibility === 'sale' && <span className="text-error"> *</span>}
                        <span className="text-on-surface-variant/60 font-normal normal-case ml-1">(VNĐ)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full px-4 py-2 pr-16 border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface h-10 bg-slate-50 focus:bg-white transition-colors text-xs sm:text-sm"
                          placeholder={visibility === 'sale' ? 'Ví dụ: 299000' : '0 = miễn phí'}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-xs font-bold pointer-events-none">VNĐ</span>
                      </div>
                      {visibility === 'public' && price && parseFloat(price) > 0 && (
                        <p className="text-[10px] sm:text-xs text-orange-600 mt-1.5 flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          Khóa học sẽ được đặt thành Có phí do có nhập giá
                        </p>
                      )}
                      {price && parseFloat(price) > 0 && (
                        <p className="text-[10px] sm:text-xs text-on-surface-variant/70 mt-1.5 font-semibold">
                          ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(price))}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-on-surface-variant/70 hover:text-on-surface text-xs font-bold cursor-pointer bg-transparent border-0"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!title.trim() || isSubmitting}
                    className="px-5 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dim transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo khóa học'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Course list */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 relative z-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 sm:h-64 bg-slate-100 animate-pulse rounded-2xl border border-outline-variant/25"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant/40 relative z-10">
            <Library className="size-8 text-on-surface-variant/35 mx-auto mb-3" />
            <h3 className="text-sm text-on-surface-variant font-bold mb-1">Chưa có khóa học nào</h3>
            <p className="text-xs text-on-surface-variant/70 mb-4">Bắt đầu tạo khóa học đầu tiên của bạn ngay!</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all border-0 cursor-pointer active:scale-95"
            >
              <Plus className="size-3.5" />
              Tạo khóa học
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 relative z-10"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {courses.map((course) => (
              <motion.div 
                key={course?.id} 
                className="group bg-white rounded-2xl border border-outline-variant/30 flex flex-col hover:shadow-xs hover:border-primary/45 transition-all duration-300 relative h-full overflow-hidden"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
                }}
              >
                <Link
                  href={`/instructor/studio/${course?.id}`}
                  className="relative h-24 sm:h-36 overflow-hidden bg-slate-100 block"
                >
                  {course?.thumbnailUrl ? (
                    <img src={course?.thumbnailUrl} alt={course?.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 group-hover:scale-[1.03] transition-transform duration-500">
                      <PlayCircle className="size-12 text-primary/40" />
                    </div>
                  )}
                  <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2.5 sm:py-1 backdrop-blur-md rounded-md sm:rounded-lg flex items-center gap-1 border border-white/10 ${
                      course.visibility === 'public'
                        ? 'bg-green-500/70'
                        : course.visibility === 'sale'
                          ? 'bg-primary/70'
                          : 'bg-orange-500/70'
                    }`}>
                    <span className="text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">
                      {course.visibility === 'public' ? 'Miễn phí'
                        : course.visibility === 'sale' ? 'Có phí'
                        : 'Riêng tư'}
                    </span>
                  </div>
                </Link>
                
                <div className="p-2.5 sm:p-4.5 flex flex-col flex-1">
                  <Link href={`/instructor/studio/${course?.id}`}>
                    <h3 className="font-bold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1 sm:mb-1.5 h-8 sm:h-10 text-xs sm:text-base">
                      {course?.title}
                    </h3>
                  </Link>
                  <p className="hidden sm:block text-on-surface-variant/80 text-xs line-clamp-2 mb-4 h-8 leading-relaxed">
                    {course?.description ? stripHtml(course.description) : 'Chưa có mô tả'}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-2.5 sm:pt-4.5 border-t border-outline-variant/20 gap-2 sm:gap-3">
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant/70 font-semibold">
                      <span className="flex items-center gap-1">
                        <ListVideo className="size-3.5" />
                        {course?._count.sections}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {course?._count.members}
                      </span>
                    </div>
                    {Number(course?.price) > 0 && (
                      <span className="text-[10px] sm:text-xs font-black text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(course.price))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteCourse(course?.id);
                    }}
                    className="bg-error hover:bg-error/90 text-white px-2 py-1.5 rounded-lg flex items-center justify-center transition-colors shadow-md text-[10px] sm:text-xs font-bold gap-1 cursor-pointer border-0 active:scale-95"
                    title="Xóa khóa học"
                  >
                    <Trash2 className="size-3 sm:size-3.5" />
                    <span className="hidden xs:inline">Xóa</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
