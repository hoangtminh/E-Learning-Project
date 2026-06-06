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
import { Video, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { StartCallModal } from './StartCallModal';
import { callsApi, CallType } from '@/api/calls';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { classroomId } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { classroom, loadingClassroom, fetchClassroom, toggleClassroomNotifications } = useClassrooms();
  const { createPost } = usePosts();
  const { user } = useAuth();
  const [isConfirmCallOpen, setIsConfirmCallOpen] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);

  const currentUserId = user?.userId || user?.id;
  const currentMember = classroom?.members?.find(
    (m) => m.userId === currentUserId,
  );
  const notificationsEnabled = currentMember?.notificationsEnabled ?? true;

  const handleToggleNotifications = async () => {
    if (!classroom?.id) return;
    setIsTogglingNotifications(true);
    try {
      await toggleClassroomNotifications(classroom.id, !notificationsEnabled);
      toast.success(
        !notificationsEnabled
          ? 'Đã bật thông báo cho lớp học này!'
          : 'Đã tắt thông báo cho lớp học này!',
      );
    } catch (e: any) {
      toast.error(e.message || 'Lỗi cập nhật thông báo');
    } finally {
      setIsTogglingNotifications(false);
    }
  };

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

  const isOwner = !!currentUserId && currentUserId === classroom.ownerId;
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

  const mobileVisibleTabs = tabs.slice(0, 3);
  const mobileDropdownTabs = tabs.slice(3);

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
          <nav className='sticky top-0 z-45 bg-white/80 backdrop-blur-md px-3 md:px-6 border-b border-slate-200 flex flex-row justify-between items-center h-12 md:h-14 gap-2 md:gap-4 shrink-0'>
            {/* Desktop Tabs */}
            <div className='hidden md:flex gap-8 -mb-px'>
              {tabs.map((tab) => {
                const isActive = tab.exact
                  ? pathname === tab.path
                  : pathname.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`py-4 text-sm md:text-base shrink-0 transition-all ${isActive ? 'font-bold border-b-2 border-sky-600 text-sky-600' : 'font-semibold text-slate-500 hover:text-sky-600'}`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Tabs */}
            <div className='flex md:hidden items-center gap-3 -mb-px min-w-0 flex-1 overflow-x-auto no-scrollbar'>
              {mobileVisibleTabs.map((tab) => {
                const isActive = tab.exact
                  ? pathname === tab.path
                  : pathname.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`py-3 text-[13px] shrink-0 transition-all ${isActive ? 'font-bold border-b-2 border-sky-600 text-sky-600' : 'font-semibold text-slate-500 hover:text-sky-600'}`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
              
              {/* Dropdown for remaining tabs */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='p-1.5 text-slate-500 hover:text-sky-600 shrink-0 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center' aria-label="More tabs">
                    <span className='material-symbols-outlined text-[20px]'>menu</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-40 bg-white border border-slate-200 shadow-lg rounded-xl p-1.5 z-50'>
                  {mobileDropdownTabs.map((tab) => {
                    const isActive = pathname.startsWith(tab.path);
                    return (
                      <DropdownMenuItem key={tab.path} asChild>
                        <Link
                          href={tab.path}
                          className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-sky-50 text-sky-600 font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-sky-600'
                          }`}
                        >
                          {tab.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Actions */}
            <div className='flex items-center justify-end gap-1.5 md:gap-2 shrink-0'>
              {currentMember && (
                <Button
                  variant='outline'
                  disabled={isTogglingNotifications}
                  onClick={handleToggleNotifications}
                  className={`flex items-center justify-center rounded-md text-xs md:text-sm font-bold shadow-sm h-8 md:h-9 w-8 md:w-auto px-0 md:px-3.5 transition-all ${
                    notificationsEnabled
                      ? 'text-sky-600 border-sky-200 hover:bg-sky-50'
                      : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={notificationsEnabled ? 'Tắt thông báo lớp học' : 'Bật thông báo lớp học'}
                >
                  {notificationsEnabled ? (
                    <Bell size={14} className='md:mr-2 text-sky-500' />
                  ) : (
                    <BellOff size={14} className='md:mr-2 text-slate-400' />
                  )}
                  <span className='hidden md:inline'>
                    {notificationsEnabled ? 'Thông báo: Bật' : 'Thông báo: Tắt'}
                  </span>
                </Button>
              )}
              {isOwnerOrAdmin && (
                <Button
                  variant='outline'
                  className='flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 rounded-md text-xs md:text-sm font-bold shadow-sm h-8 md:h-9 w-8 md:w-auto px-0 md:px-3.5 transition-all'
                  onClick={() => setIsConfirmCallOpen(true)}
                  title="Cuộc gọi nhóm"
                >
                  <Video size={14} className='text-rose-500 md:w-4 md:h-4' />
                  <span className='hidden md:inline'>Cuộc gọi nhóm</span>
                </Button>
              )}

              {isOwnerOrAdmin && (
                <Link
                  href={`/classrooms/${classroomId}/admin`}
                  className='text-indigo-800 transition-colors flex items-center'
                >
                  <Button
                    variant='outline'
                    className='flex items-center justify-center rounded-md text-xs md:text-sm font-bold shadow-sm border-indigo-150 h-8 md:h-9 w-8 md:w-auto px-0 md:px-3.5 transition-all'
                    title="Dashboard Admin"
                  >
                    <HugeiconsIcon
                      icon={Security}
                      className='w-3.5 h-3.5 text-indigo-600 md:w-4 md:h-4'
                    />
                    <span className='hidden md:inline'>Dashboard Admin</span>
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
