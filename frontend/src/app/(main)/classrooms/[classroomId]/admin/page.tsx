'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AdminPage() {
  const { classroomId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (classroomId) {
      router.replace(`/classrooms/${classroomId}/admin/courses`);
    }
  }, [classroomId, router]);

  return (
    <div className='flex items-center justify-center h-64 text-slate-400'>
      <span className='material-symbols-outlined animate-spin mr-2'>progress_activity</span>
      Đang tải...
    </div>
  );
}
