'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyEnrolledCourses } from '@/api/enrollment';
import Link from 'next/link';
import { stripHtml } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getMyEnrolledCourses();
        if (res.success && res.data) {
          setCourses(res.data);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#006382] to-[#0091aa] p-8 text-white shadow-xl shadow-[#006382]/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">
            Chào mừng trở lại, {user?.fullName || 'Học viên'}! 👋
          </h1>
          <p className="text-white/80 max-w-xl text-sm leading-relaxed">
            Tiếp tục hành trình chinh phục tri thức của bạn. Hôm nay là một ngày tuyệt vời để học thêm những điều mới mẻ.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#a3adc7]/20 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#006382]/10 flex items-center justify-center text-[#006382]">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#525b72]">Khóa học đã đăng ký</p>
            <p className="text-2xl font-black text-[#252f43]">{courses.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#a3adc7]/20 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
            <span className="material-symbols-outlined text-2xl">local_fire_department</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#525b72]">Chuỗi học tập</p>
            <p className="text-2xl font-black text-[#252f43]">3 ngày</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#a3adc7]/20 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#525b72]">Chứng chỉ hoàn thành</p>
            <p className="text-2xl font-black text-[#252f43]">0</p>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#252f43]">Tiến độ học tập</h2>
          <Link href="/courses" className="text-sm font-medium text-[#006382] hover:underline">
            Khám phá thêm
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((enrollment: any) => {
              const course = enrollment.course;
              return (
                <div key={enrollment.id} className="group bg-white rounded-2xl border border-[#a3adc7]/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-sky-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-sky-300">play_circle</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-[#252f43] line-clamp-2 mb-2 group-hover:text-[#006382] transition-colors">{course.title}</h3>
                    <p className="text-sm text-[#525b72] mb-4 flex-1 line-clamp-2">{stripHtml(course.description) || 'Chưa có mô tả cho khóa học này.'}</p>
                    
                    <div className="space-y-3 mt-auto">
                      <div className="w-full bg-[#f1f4f9] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#006382] h-1.5 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#525b72]">0% hoàn thành</span>
                        <Link href={`/courses/${course.id}`} className="text-sm font-bold text-[#006382] bg-[#006382]/10 px-4 py-1.5 rounded-full hover:bg-[#006382] hover:text-white transition-colors">
                          Tiếp tục
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#a3adc7]/20 border-dashed p-12 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-[#006382]">auto_stories</span>
            </div>
            <h3 className="text-lg font-bold text-[#252f43] mb-2">Chưa có khóa học nào</h3>
            <p className="text-[#525b72] mb-6 max-w-md">Bạn chưa đăng ký khóa học nào. Hãy khám phá hàng trăm khóa học chất lượng trên nền tảng của chúng tôi.</p>
            <Link href="/courses" className="bg-[#006382] text-white font-bold py-2.5 px-6 rounded-full hover:bg-[#004e66] transition-colors shadow-lg shadow-[#006382]/20">
              Khám phá ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
