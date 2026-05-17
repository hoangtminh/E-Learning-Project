'use client';

import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { stripHtml } from '@/lib/utils';

export default function CoursesCatalogPage() {
  const { courses, isLoading, error } = useCourses();

  return (
    <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">
          Danh mục khóa học
        </h1>
        <p className="text-slate-500 mt-1 text-[13px]">
          Khám phá các khóa học mới nhất từ Glacier Learning.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-16 justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#006382] border-t-transparent" />
          <span>Đang tải danh sách khóa học…</span>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200/60 p-5 text-sm">
          <p className="font-semibold text-red-700">Không thể tải khóa học</p>
          <p className="text-red-500 mt-1 text-[13px]">{error}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
          <h3 className="font-semibold text-[15px] text-slate-700">
            Chưa có khóa học nào
          </h3>
          <p className="text-slate-400 text-[13px] mt-1.5">
            Hiện chưa có khóa học nào được đăng tải.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="group flex flex-col rounded-xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5"
            >
              {/* Thumbnail */}
              {c.thumbnailUrl ? (
                <div className="aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={c.thumbnailUrl}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-[#006382]/10 via-[#006382]/5 to-slate-50 flex items-center justify-center">
                  <span className="text-[#006382]/20 text-3xl font-black tracking-tighter">
                    {c.title?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                </div>
              )}

              <div className="flex-1 p-4">
                {/* Tags row */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-md bg-[#006382]/8 border border-[#006382]/15 px-2 py-[2px] text-[10px] font-semibold tracking-wide text-[#006382] uppercase">
                    {c.visibility === 'public' ? 'Công khai' : c.visibility}
                  </span>
                  <span className="text-[12px] font-semibold text-[#006382]">
                    {!c.price || c.price === 0
                      ? 'Miễn phí'
                      : `${Number(c.price).toLocaleString()}₫`}
                  </span>
                </div>

                {/* Title & description */}
                <h2 className="text-[14px] font-semibold leading-snug text-slate-800 group-hover:text-[#006382] transition-colors line-clamp-2">
                  {c.title}
                </h2>
                <p className="text-slate-400 mt-1 line-clamp-2 text-[12px] leading-relaxed">
                  {stripHtml(c.description) || 'Chưa có mô tả cho khóa học này.'}
                </p>
              </div>

              {/* Footer */}
              <div className="px-4 pb-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {c.instructor?.avatarUrl ? (
                    <img src={c.instructor.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-[#006382]/10 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-[#006382]">
                        {(c.instructor?.fullName || 'G')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-slate-400 truncate max-w-[100px]">
                    {c.instructor?.fullName || 'Giảng viên'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>{c._count?.sections ?? 0} phần</span>
                  <span>·</span>
                  <span>{c._count?.members ?? 0} học viên</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
