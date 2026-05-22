'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useClassrooms } from '@/contexts/ClassroomContext';
import { usePosts } from '@/contexts/PostContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Security } from '@hugeicons/core-free-icons';
import { Video } from 'lucide-react';
import { toast } from 'sonner';
import { StartCallModal } from './StartCallModal';
import { callsApi, CallType } from '@/api/calls';

export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { classroomId } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { classroom, loadingClassroom, fetchClassroom } = useClassrooms();
  const { createPost } = usePosts();
  const { user } = useAuth();
  const [isConfirmCallOpen, setIsConfirmCallOpen] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);

  useEffect(() => {
    if (classroomId) fetchClassroom(classroomId as string);
  }, [classroomId, fetchClassroom]);

  if (loadingClassroom)
    return (
      <div className='p-8 text-center text-slate-500 font-semibold text-sm'>
        Đang tải thông tin lớp học...
      </div>
    );
  if (!classroom)
    return (
      <div className='p-8 text-center text-red-500 font-semibold text-sm'>
        Không tìm thấy lớp học
      </div>
    );

  const currentUserId = user?.userId || user?.id;
  const isOwner = !!currentUserId && currentUserId === classroom.ownerId;
  const currentMember = classroom.members?.find(
    (m) => m.userId === currentUserId,
  );
  const isOwnerOrAdmin =
    isOwner ||
    currentMember?.role === 'admin' ||
    currentMember?.role === 'owner';

  const tabs = [
    { name: 'Bảng tin', path: `/classrooms/${classroomId}`, exact: true },
    { name: 'Bài tập', path: `/classrooms/${classroomId}/tasks`, exact: false },
    {
      name: 'Tài liệu',
      path: `/classrooms/${classroomId}/files`,
      exact: false,
    },
    {
      name: 'Thành viên',
      path: `/classrooms/${classroomId}/info`,
      exact: false,
    },
    {
      name: 'Khóa học',
      path: `/classrooms/${classroomId}/courses`,
      exact: false,
    },
  ];

  // Do not show tabs if in admin area
  const isAdminArea = pathname.includes('/admin');

  const handleStartCall = async () => {
    if (!classroom?.id) return;
    setIsStartingCall(true);
    try {
      // Create call in backend database as a group / channel call
      const res = await callsApi.createCall({
        title: `Cuộc họp nhóm - ${classroom.title}`,
        type: CallType.CHANNEL,
        classroomId: classroom.id,
      });

      if (res.success && res.data) {
        const callRoomId = res.data.id;
        // 1. Post systemic call announcement in group feed
        await createPost(classroom.id, `[SYSTEM_CALL]:${callRoomId}`);
        setIsConfirmCallOpen(false);
        // 2. Route directly to group WebRTC channel video room
        toast.success('Khởi động cuộc họp nhóm thành công!');
        router.push(`/call/${callRoomId}`);
      } else {
        toast.error(res.error || 'Tạo phòng họp nhóm thất bại!');
      }
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khởi động cuộc họp nhóm');
    } finally {
      setIsStartingCall(false);
    }
  };

  return (
    <TaskProvider>
      <div className='flex flex-col min-h-screen bg-slate-50 text-slate-800'>
        {/* Sub-navigation Tabs */}
        {!isAdminArea && (
          <nav className='sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 md:px-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4'>
            <div className='flex gap-5 md:gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mb-px'>
              {tabs.map((tab) => {
                const isActive = tab.exact
                  ? pathname === tab.path
                  : pathname.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`py-3 md:py-4 text-sm md:text-base shrink-0 transition-all ${isActive ? 'font-bold border-b-2 border-sky-600 text-sky-600' : 'font-semibold text-slate-500 hover:text-sky-600'}`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>
            <div className='flex items-center justify-end gap-2 py-1.5 sm:py-2 border-t border-slate-100 sm:border-t-0'>
              {isOwnerOrAdmin && (
                <Button
                  variant='outline'
                  className='flex gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 rounded-md text-xs md:text-sm font-bold shadow-sm h-8 md:h-9 px-2.5 md:px-3.5'
                  onClick={() => setIsConfirmCallOpen(true)}
                >
                  <Video size={14} className='text-rose-500 md:w-4 md:h-4' />
                  <span className='hidden xs:inline'>Cuộc gọi nhóm</span>
                  <span className='xs:hidden'>Gọi nhóm</span>
                </Button>
              )}

              {isOwnerOrAdmin && (
                <Link
                  href={`/classrooms/${classroomId}/admin`}
                  className='text-indigo-800 transition-colors flex items-center'
                >
                  <Button
                    variant='outline'
                    className='flex gap-1.5 rounded-md text-xs md:text-sm font-bold shadow-sm border-indigo-150 h-8 md:h-9 px-2.5 md:px-3.5'
                  >
                    <HugeiconsIcon
                      icon={Security}
                      className='w-3.5 h-3.5 text-indigo-600 md:w-4 md:h-4'
                    />
                    <span className='hidden xs:inline'>Dashboard Admin</span>
                    <span className='xs:hidden'>Admin</span>
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
        <div className='w-full'>{children}</div>

        {/* Group Call Start Modal */}
        <StartCallModal
          isOpen={isConfirmCallOpen}
          onClose={() => setIsConfirmCallOpen(false)}
          onConfirm={handleStartCall}
          isSubmitting={isStartingCall}
        />
      </div>
    </TaskProvider>
  );
}
