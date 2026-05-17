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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      const callRoomId = `classroom-${classroom.id}`;
      // 1. Post systemic call announcement in group feed
      await createPost(classroom.id, `[SYSTEM_CALL]:${callRoomId}`);
      setIsConfirmCallOpen(false);
      // 2. Route directly to group WebRTC private video room
      toast.success('Khởi động cuộc họp private thành công!');
      router.push(`/call/${callRoomId}`);
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
          <nav className='sticky top-0 flex justify-between items-center z-40 bg-white/80 backdrop-blur-md px-6 border-b border-slate-200'>
            <div className='flex gap-8'>
              {tabs.map((tab) => {
                const isActive = tab.exact
                  ? pathname === tab.path
                  : pathname.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`py-4 text-base transition-all ${isActive ? 'font-bold border-b-2 border-sky-600 text-sky-600' : 'font-semibold text-slate-500 hover:text-sky-600'}`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>
            <div className='flex items-center gap-3 py-2'>
              {isOwnerOrAdmin && (
                <Button
                  variant='outline'
                  className='flex gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 rounded-md text-sm font-bold shadow-sm'
                  onClick={() => setIsConfirmCallOpen(true)}
                >
                  <Video size={16} className='text-rose-500' />
                  <span>Cuộc gọi nhóm</span>
                </Button>
              )}

              {isOwnerOrAdmin && (
                <Link
                  href={`/classrooms/${classroomId}/admin`}
                  className='text-indigo-800 transition-colors flex items-center gap-2'
                >
                  <Button
                    variant='outline'
                    className='flex gap-2 rounded-md text-sm font-bold shadow-sm border-indigo-150'
                  >
                    <HugeiconsIcon
                      icon={Security}
                      className='w-4 h-4 text-indigo-600'
                    />
                    Dashboard Admin
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
