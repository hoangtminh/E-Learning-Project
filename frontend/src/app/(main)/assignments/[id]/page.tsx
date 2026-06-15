'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssignmentDetail, Assignment } from '@/api/assignments';
import { getMembers } from '@/api/classroom';
import { useAuth } from '@/contexts/AuthContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { Loader2, ArrowLeft, Clock, Award, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Imported Separated Components
import { AssignmentDetailCard } from './components/AssignmentDetailCard';
import { AssignmentDescriptionCard } from './components/AssignmentDescriptionCard';
import { AssignmentAttachmentCard } from './components/AssignmentAttachmentCard';
import { StudentSubmissionForm } from './components/StudentSubmissionForm';

// --- Main Content Component ---
function AssignmentDetailContent({
  assignment,
  classroomId,
  isOwnerOrAdmin,
  onRefresh,
}: {
  assignment: Assignment;
  classroomId: string;
  isOwnerOrAdmin: boolean;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const existingSub = assignment.submissions?.[0];
  const isSubmitted = !!existingSub;
  const isGraded = existingSub?.grade !== null && existingSub?.grade !== undefined;

  return (
    <div className='max-w-5xl mx-auto px-4 py-8 space-y-6 relative z-10'>
      {/* Top Action Bar */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => router.back()}
          className='inline-flex items-center text-sm font-bold text-on-surface-variant/80 hover:text-primary transition-colors group'
        >
          <ArrowLeft size={16} className='mr-2 group-hover:-translate-x-0.5 transition-transform' />
          Quay lại
        </button>

        {!isOwnerOrAdmin && (
          <div className='flex items-center gap-3'>
            <span className='text-xs font-bold text-on-surface-variant/70 flex items-center gap-1.5'>
              <Clock size={14} />
              {isGraded ? 'Đã chấm điểm' : isSubmitted ? 'Đã nộp bài' : 'Chưa nộp bài'}
            </span>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Side: Assignment details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Detail Card */}
          <AssignmentDetailCard
            title={assignment.title}
            deadline={assignment.deadline}
            classroomTitle={assignment.classroom?.title}
          />

          {/* Detailed Instructions */}
          <AssignmentDescriptionCard description={assignment.description} />

          {/* Task Attachment Materials */}
          <AssignmentAttachmentCard
            classroomId={classroomId}
            taskId={assignment.id}
            attachmentKey={assignment.attachmentKey}
            attachmentName={assignment.attachmentName}
          />

          {/* Graded Display for student */}
          {!isOwnerOrAdmin && isGraded && (
            <div className='glass-panel rounded-3xl p-8 shadow-xs border border-emerald-200/50 bg-emerald-50/20 space-y-4'>
              <h3 className='text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5 text-emerald-800'>
                <Award size={15} /> Điểm của bạn
              </h3>
              <div className='flex items-end gap-2'>
                <span className='text-4xl font-black text-emerald-700 leading-none'>{Number(existingSub?.grade).toFixed(0)}</span>
                <span className='text-sm font-bold text-on-surface-variant/50 mb-1'>/ 100 điểm</span>
              </div>
              <p className='text-xs text-on-surface-variant/70 font-medium'>Bài tập của bạn đã được giáo viên chấm điểm thành công.</p>
            </div>
          )}
        </div>

        {/* Right Side: Submission Form for Student, or Redirect Card for Teacher */}
        <div className='lg:col-span-1'>
          {isOwnerOrAdmin ? (
            <div className='glass-panel rounded-2xl p-6 shadow-xs border border-white/50 space-y-6'>
              <div className='border-b border-outline-variant/20 pb-3'>
                <h2 className='text-sm font-bold text-on-surface tracking-wide uppercase flex items-center gap-1.5'>
                  <Users size={16} className='text-primary' /> Quản lý bài tập
                </h2>
              </div>
              <div className='space-y-4 text-on-surface-variant/80 text-sm leading-relaxed'>
                <p>
                  Bạn đang xem bài tập này với tư cách là <strong>Giảng viên / Quản trị viên</strong> của lớp học.
                </p>
                <p>
                  Hãy truy cập trang quản lý bài nộp để xem danh sách bài làm của học sinh, tải tệp đính kèm và thực hiện chấm điểm trực tiếp.
                </p>
              </div>
              <div className='pt-2'>
                <Link
                  href={`/assignments/${assignment.id}/submissions`}
                  className='w-full py-3 bg-primary hover:bg-primary-dim text-white font-bold rounded-xl text-sm shadow-md shadow-sky-100 hover:shadow-lg transition-all flex items-center justify-center gap-1.5'
                >
                  Xem danh sách & Chấm điểm
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <StudentSubmissionForm
              assignment={assignment}
              classroomId={classroomId}
              onRefresh={onRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Wrapper Page Wrapper ---
export default function AssignmentDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getAssignmentDetail(id);
      setAssignment(data);

      // Fetch classroom members to check role
      if (data?.classroomId) {
        const membersRes = await getMembers(data.classroomId);
        if (membersRes.success && membersRes.data) {
          const currentUserId = user?.userId || user?.id;
          const currentMember = membersRes.data.find((m) => m.userId === currentUserId);
          const isCreator = data.creatorId === currentUserId;
          setIsOwnerOrAdmin(isCreator || currentMember?.role === 'owner' || currentMember?.role === 'admin');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể tải thông tin bài tập');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails, refreshKey]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[70vh] text-on-surface-variant/50 gap-2.5'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
        <p className='text-sm font-semibold text-on-surface-variant/70'>Đang tải thông tin bài tập...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-4'>
        <div className='w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100'>
          <ArrowLeft size={24} />
        </div>
        <div>
          <h2 className='text-lg font-bold text-on-surface'>Lỗi tải dữ liệu</h2>
          <p className='text-sm text-on-surface-variant/70 max-w-sm mt-1'>{error || 'Không tìm thấy bài tập được yêu cầu.'}</p>
        </div>
      </div>
    );
  }

  return (
    <TaskProvider>
      <div className='pb-16 transition-all p-4 sm:p-6 md:p-12 space-y-6 sm:space-y-8 bg-surface-container-lowest min-h-screen text-on-surface relative'>
        <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
        <div className='max-w-5xl mx-auto w-full relative z-10'>
          <AssignmentDetailContent
            assignment={assignment}
            classroomId={assignment.classroomId!}
            isOwnerOrAdmin={isOwnerOrAdmin}
            onRefresh={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </div>
    </TaskProvider>
  );
}
