'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { getCourses } from '@/api/courses';
import type { CourseListItem } from '@/api/courses';

export default function AdminCoursesPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { classroom, loadingClassroom, linkCourse, unlinkCourse } = useClassrooms();
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [allCourses, setAllCourses] = useState<CourseListItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [linking, setLinking] = useState(false);

  const fetchAvailableCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await getCourses({ limit: 100 });
      if (res.success && res.data) {
        setAllCourses(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (showLinkModal && allCourses.length === 0) {
      fetchAvailableCourses();
    }
  }, [showLinkModal]);

  const handleLink = async (courseId: string) => {
    setLinking(true);
    try {
      await linkCourse(classroomId, courseId);
      setShowLinkModal(false);
    } catch (e: any) {
      alert(e.message || 'Lỗi liên kết khóa học');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy liên kết khóa học "${courseTitle}"?`)) return;
    try {
      await unlinkCourse(classroomId, courseId);
    } catch (e: any) {
      alert(e.message || 'Lỗi hủy liên kết');
    }
  };

  if (loadingClassroom) {
    return (
      <div className='flex items-center justify-center py-20 text-slate-400'>
        <span className='material-symbols-outlined animate-spin mr-2'>progress_activity</span>
        Đang tải...
      </div>
    );
  }

  const linkedCourses = classroom?.linkedCourses || [];

  return (
    <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50'>
        <div>
          <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
            Quản lý Khóa học
          </h2>
          <p className='text-slate-500 text-sm mt-1'>Thêm hoặc gỡ bỏ khóa học khỏi lớp</p>
        </div>
        <button
          onClick={() => setShowLinkModal(true)}
          className='bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 text-sm'
        >
          <span className='material-symbols-outlined text-[18px]'>add_link</span>
          Thêm khóa học
        </button>
      </div>

      <div className='p-6'>
        {linkedCourses.length === 0 ? (
          <div className='text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
            <span className='material-symbols-outlined text-4xl text-slate-300 mb-2 block'>school</span>
            <p className='text-slate-500 text-sm font-medium'>Chưa có khóa học nào được gắn.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {linkedCourses.map(({ course }) => (
              <div key={course.id} className='flex gap-4 p-4 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white'>
                <div className='w-24 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0'>
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-slate-300'>
                      <span className='material-symbols-outlined'>image</span>
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-bold text-slate-800 text-sm truncate'>{course.title}</h4>
                  <p className='text-slate-500 text-xs mt-1 truncate'>{course.description || 'Không có mô tả'}</p>
                </div>
                <div className='shrink-0 flex items-center'>
                  <button
                    onClick={() => handleUnlink(course.id, course.title)}
                    className='text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors'
                    title='Hủy liên kết'
                  >
                    <span className='material-symbols-outlined text-xl block'>link_off</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Course Modal */}
      {showLinkModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]'>
            <div className='flex justify-between items-center mb-5'>
              <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
                <span className='material-symbols-outlined text-indigo-600'>add_link</span>
                Gắn khóa học vào lớp
              </h2>
              <button onClick={() => setShowLinkModal(false)} className='text-slate-400 hover:text-slate-600'>
                <span className='material-symbols-outlined'>close</span>
              </button>
            </div>
            
            <div className='overflow-y-auto flex-1 pr-2 space-y-3'>
              {loadingCourses ? (
                <div className='flex justify-center py-10 text-slate-400'>
                  <span className='material-symbols-outlined animate-spin text-3xl'>progress_activity</span>
                </div>
              ) : allCourses.length === 0 ? (
                <div className='text-center py-10 text-slate-500'>Không có khóa học nào trên hệ thống.</div>
              ) : (
                allCourses.map((course) => {
                  const isLinked = linkedCourses.some(lc => lc.course.id === course.id);
                  return (
                    <div key={course.id} className='flex items-center gap-4 p-3 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-slate-50'>
                      <div className='w-16 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0'>
                        {course.thumbnailUrl && <img src={course.thumbnailUrl} alt='' className='w-full h-full object-cover' />}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-bold text-slate-800 truncate text-sm'>{course.title}</h4>
                        <p className='text-xs text-slate-500 truncate'>Bởi {course.owner?.fullName || 'N/A'}</p>
                      </div>
                      <div className='shrink-0'>
                        {isLinked ? (
                          <span className='px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1'>
                            <span className='material-symbols-outlined text-[16px]'>check</span> Đã liên kết
                          </span>
                        ) : (
                          <button
                            onClick={() => handleLink(course.id)}
                            disabled={linking}
                            className='px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors'
                          >
                            Liên kết
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
