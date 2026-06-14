'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssignmentDetail, Assignment } from '@/api/assignments';
import { getMembers, ClassroomMember, TaskSubmission } from '@/api/classroom';
import { useAuth } from '@/contexts/AuthContext';
import { TaskProvider, useTasks } from '@/contexts/TaskContext';
import { Loader2, ArrowLeft, Search, CheckCircle2, Clock, Download, Save, Star, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

// Helper to check if submission was late
function isSubmissionLate(submittedAtStr: string, deadlineStr: string | null): boolean {
  if (!deadlineStr) return false;
  const submitted = new Date(submittedAtStr);
  const deadline = new Date(deadlineStr);
  return submitted > deadline;
}

// Helper to calculate late difference
function getLateDifference(submittedAtStr: string, deadlineStr: string): string {
  const diffMs = new Date(submittedAtStr).getTime() - new Date(deadlineStr).getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `${diffDays} ngày`;
}

// User Avatar helper
function UserAvatar({ name, url }: { name: string | null; url: string | null }) {
  if (url) {
    return <img src={url} alt={name || ''} className='w-10 h-10 rounded-full object-cover border border-outline-variant/30' />;
  }
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold border border-outline-variant/30 shadow-xs'>
      {initial}
    </div>
  );
}

// --- Split-Pane Grading Inner Component ---
function GradingContent({
  assignment,
  classroomId,
}: {
  assignment: Assignment;
  classroomId: string;
}) {
  const router = useRouter();
  const { getSubmissions, getSubmissionDownloadUrl, gradeSubmission } = useTasks();

  const [students, setStudents] = useState<ClassroomMember[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<ClassroomMember | null>(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'needs_grading'>('all');

  // Grading states
  const [grade, setGrade] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [gradeSaving, setGradeSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load classroom members
      const membersRes = await getMembers(classroomId);
      if (membersRes.success && membersRes.data) {
        // Filter out instructors/admins, only keep students
        const studentMembers = membersRes.data.filter(m => m.role === 'member');
        setStudents(studentMembers);
      }

      // Load submissions
      const subs = await getSubmissions(classroomId, assignment.id);
      setSubmissions(subs);
    } catch (e) {
      console.error(e);
      toast.error('Lỗi khi tải dữ liệu học sinh');
    } finally {
      setLoading(false);
    }
  }, [classroomId, assignment.id, getSubmissions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle active student submission matching
  const activeSubmission = selectedStudent
    ? submissions.find((s) => s.userId === selectedStudent.userId)
    : null;

  // Sync grading input when selected student changes
  useEffect(() => {
    if (activeSubmission) {
      setGrade(activeSubmission.grade !== null ? String(activeSubmission.grade) : '');
      setFeedback(activeSubmission.content || '');
    } else {
      setGrade('');
      setFeedback('');
    }
  }, [selectedStudent, activeSubmission]);

  const handleGradeSubmit = async () => {
    if (!selectedStudent || !activeSubmission) return;
    const gradeVal = parseFloat(grade);
    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 100) {
      toast.error('Điểm phải nằm trong khoảng từ 0 đến 100');
      return;
    }
    setGradeSaving(true);
    try {
      await gradeSubmission(classroomId, assignment.id, activeSubmission.id, gradeVal);
      // Wait, can we also save feedback? Currently, backend submitTask holds the content.
      // So we update the grade. Let's send a success toast.
      toast.success('Chấm điểm thành công!');
      await loadData();
    } catch (e: any) {
      toast.error(e.message || 'Chấm điểm thất bại');
    } finally {
      setGradeSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!activeSubmission || !activeSubmission.fileUrl) return;
    setDownloading(true);
    try {
      const url = await getSubmissionDownloadUrl(classroomId, assignment.id, activeSubmission.id);
      window.open(url, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải file');
    } finally {
      setDownloading(false);
    }
  };

  // Filter students based on search and tab
  const filteredStudents = students.filter((student) => {
    const studentName = student.user?.fullName || student.user?.email || '';
    const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase());

    const studentSub = submissions.find((s) => s.userId === student.userId);
    const matchesFilter =
      filterType === 'all' || (filterType === 'needs_grading' && studentSub && studentSub.grade === null);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className='flex flex-col h-screen overflow-hidden bg-surface-container-lowest text-on-surface relative z-10'>
      <div className='absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
      {/* Top App Bar */}
      <header className='h-16 bg-white border-b border-outline-variant/30 flex items-center justify-between px-8 shrink-0 shadow-xs'>
        <div className='flex items-center gap-3 text-sm text-on-surface-variant/70'>
          <button
            onClick={() => router.back()}
            className='hover:text-primary transition-colors flex items-center gap-1 font-bold'
          >
            <ArrowLeft size={16} /> Chi tiết bài tập
          </button>
          <span className='text-slate-300'>/</span>
          <span className='text-on-surface font-bold truncate max-w-xs'>{assignment.title}</span>
          <span className='text-slate-300'>/</span>
          <span className='text-primary font-bold'>Chấm điểm</span>
        </div>
      </header>

      {/* Split Pane Layout */}
      <div className='flex-1 flex overflow-hidden p-6 gap-6 min-h-0'>
        {/* Left Pane: Student List */}
        <section className='w-1/3 min-w-[320px] max-w-[400px] rounded-2xl flex flex-col overflow-hidden bg-white border border-outline-variant/30 shadow-xs'>
          <div className='p-4 border-b border-outline-variant/20 space-y-4 shrink-0'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50' size={16} />
              <input
                type='text'
                placeholder='Tìm kiếm học sinh...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2 pl-9 pr-4 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-slate-400'
              />
            </div>
            {/* Tabs */}
            <div className='flex gap-2 text-xs'>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all border ${filterType === 'all' ? 'bg-primary/5 text-primary border-primary/30' : 'text-on-surface-variant/50 hover:bg-surface-container-lowest border-transparent'}`}
              >
                Tất cả ({students.length})
              </button>
              <button
                onClick={() => setFilterType('needs_grading')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all border ${filterType === 'needs_grading' ? 'bg-primary/5 text-primary border-primary/30' : 'text-on-surface-variant/50 hover:bg-surface-container-lowest border-transparent'}`}
              >
                Chưa chấm ({submissions.filter((s) => s.grade === null).length})
              </button>
            </div>
          </div>

          {/* Student Items list */}
          <div className='flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar'>
            {loading ? (
              <div className='flex items-center justify-center py-10 text-on-surface-variant/50 text-xs gap-2'>
                <Loader2 className='animate-spin text-primary' size={16} /> Đang tải danh sách...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className='text-center py-10 text-on-surface-variant/50 text-xs'>Không tìm thấy học sinh nào</div>
            ) : (
              filteredStudents.map((student) => {
                const sub = submissions.find((s) => s.userId === student.userId);
                const isSelected = selectedStudent?.userId === student.userId;

                let statusBadge = (
                  <span className='text-[10px] font-bold text-on-surface-variant/50 bg-surface-container-low px-2 py-0.5 rounded-full'>
                    Chưa nộp
                  </span>
                );

                if (sub) {
                  const isLate = sub.submittedAt && isSubmissionLate(sub.submittedAt, assignment.deadline);
                  const isGraded = sub.grade !== null && sub.grade !== undefined;

                  if (isGraded) {
                    statusBadge = (
                      <span className='text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full flex items-center gap-0.5'>
                        Điểm: {sub.grade}
                      </span>
                    );
                  } else if (isLate) {
                    statusBadge = (
                      <span className='text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full'>
                        Muộn ({getLateDifference(sub.submittedAt, assignment.deadline!)})
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className='text-[10px] font-bold text-primary bg-primary/5 border border-sky-100 px-2 py-0.5 rounded-full'>
                        Đã nộp
                      </span>
                    );
                  }
                }

                return (
                  <div
                    key={student.userId}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3.5 transition-all ${isSelected ? 'bg-primary/5/50 border-sky-300 shadow-xs' : 'bg-white border-slate-150 hover:bg-surface-container-lowest'}`}
                  >
                    <UserAvatar name={student.user?.fullName} url={student.user?.avatarUrl} />
                    <div className='flex-1 min-w-0'>
                      <h4 className={`text-sm truncate ${isSelected ? 'font-bold text-sky-800' : 'font-medium text-on-surface-variant'}`}>
                        {student.user?.fullName || student.user?.email}
                      </h4>
                      <p className='text-[10px] text-on-surface-variant/50 font-medium truncate mt-0.5'>{student.user?.email}</p>
                    </div>
                    <div className='shrink-0'>{statusBadge}</div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Pane: Submissions Preview & Grading */}
        <section className='flex-1 flex flex-col gap-6 overflow-hidden min-h-0'>
          {selectedStudent ? (
            <>
              {/* Grading Input Header Form */}
              <div className='glass-panel rounded-2xl p-5 flex gap-6 shrink-0 border border-outline-variant/30/80 shadow-xs'>
                <div className='w-40 flex flex-col gap-2.5 border-r border-outline-variant/20 pr-6 shrink-0'>
                  <label className='text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider'>Điểm số</label>
                  <div className='flex items-end gap-1.5'>
                    <input
                      type='number'
                      min={0}
                      max={100}
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      disabled={!activeSubmission}
                      placeholder='-'
                      className='w-16 bg-surface-container-lowest text-2xl font-black text-center rounded-xl py-2 border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-sky-400 text-on-surface disabled:opacity-50'
                    />
                    <span className='text-on-surface-variant/50 font-semibold mb-2.5'>/ 100</span>
                  </div>
                </div>

                <div className='flex-1 flex flex-col gap-2'>
                  <label className='text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider flex justify-between'>
                    <span>Ghi chú từ học sinh</span>
                  </label>
                  <textarea
                    readOnly
                    value={activeSubmission?.content || ''}
                    placeholder='Học sinh không để lại ghi chú...'
                    className='w-full flex-1 bg-surface-container-lowest/50 rounded-xl p-3 text-xs border border-outline-variant/30/80 resize-none text-on-surface-variant/80 focus:outline-none no-scrollbar'
                  />
                </div>

                <div className='w-36 flex flex-col justify-end gap-2.5 pl-2 shrink-0'>
                  <button
                    onClick={handleGradeSubmit}
                    disabled={gradeSaving || !activeSubmission}
                    className='w-full py-2.5 bg-primary/50 hover:bg-primary-dim text-white font-bold rounded-xl text-xs shadow-md shadow-sky-100 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5'
                  >
                    {gradeSaving ? <Loader2 size={12} className='animate-spin' /> : <Save size={12} />}
                    Lưu điểm
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              <div className='flex-1 bg-white border border-outline-variant/30 rounded-2xl flex flex-col overflow-hidden relative shadow-xs min-h-0'>
                {/* Header */}
                <div className='p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest shrink-0'>
                  <div className='flex items-center gap-3'>
                    <UserAvatar name={selectedStudent.user?.fullName} url={selectedStudent.user?.avatarUrl} />
                    <div>
                      <h2 className='text-sm font-bold text-on-surface'>{selectedStudent.user?.fullName}</h2>
                      <p className='text-[10px] text-on-surface-variant/50 font-semibold'>
                        {activeSubmission ? `ID bài nộp: #${activeSubmission.id.slice(-6)}` : 'Chưa nộp bài'}
                      </p>
                    </div>
                  </div>

                  <div className='shrink-0'>
                    {activeSubmission ? (
                      <span className='px-2.5 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold border border-sky-150 flex items-center gap-1'>
                        <Clock size={11} /> Đã nộp bài
                      </span>
                    ) : (
                      <span className='px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant/70 text-[10px] font-bold border border-outline-variant/30 flex items-center gap-1'>
                        <Clock size={11} /> Đang đợi nộp bài
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Viewer */}
                <div className='flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center bg-surface-container-lowest/50 min-h-0'>
                  {activeSubmission ? (
                    <div className='w-full max-w-xl bg-white rounded-xl border border-outline-variant/30 p-6 shadow-xs space-y-4'>
                      {activeSubmission.fileUrl ? (
                        <div className='flex items-start justify-between border-b border-outline-variant/20 pb-4'>
                          <div className='flex items-center gap-3 min-w-0'>
                            <div className='w-10 h-10 rounded-lg bg-primary/5 border border-sky-100 flex items-center justify-center text-primary shrink-0'>
                              <FileText size={20} />
                            </div>
                            <div className='min-w-0'>
                              <h3 className='font-bold text-on-surface-variant text-sm truncate max-w-sm'>
                                {activeSubmission.fileUrl.split('/').pop() || 'Tệp đính kèm bài làm'}
                              </h3>
                              <p className='text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-wider'>Tệp đính kèm S3</p>
                            </div>
                          </div>
                          <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className='p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant/70 hover:text-on-surface transition-colors disabled:opacity-50'
                          >
                            {downloading ? <Loader2 size={16} className='animate-spin' /> : <Download size={16} />}
                          </button>
                        </div>
                      ) : (
                        <div className='text-on-surface-variant/70 text-xs italic py-2'>
                          Học sinh không tải lên tệp đính kèm.
                        </div>
                      )}

                      {/* text-based submit content */}
                      {activeSubmission.content ? (
                        <div className='space-y-2'>
                          <h4 className='text-xs font-bold text-on-surface uppercase tracking-wider'>Nội dung trả lời:</h4>
                          <div className='text-on-surface-variant/80 text-sm leading-relaxed whitespace-pre-wrap bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 max-h-60 overflow-y-auto no-scrollbar'>
                            {activeSubmission.content}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className='text-center py-10 select-none'>
                      <FileText size={48} className='text-slate-200 mx-auto mb-2' />
                      <p className='text-sm font-semibold text-on-surface-variant/50'>Học sinh chưa nộp bài làm</p>
                      <p className='text-xs text-on-surface-variant/50/80 mt-1'>Học sinh này chưa gửi bất kỳ tập tin hoặc câu trả lời nào.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className='flex-1 bg-white border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center text-on-surface-variant/50 shadow-xs'>
              <Users className='text-slate-200 mb-3' size={54} />
              <h3 className='font-bold text-on-surface-variant text-sm'>Chọn học sinh để chấm điểm</h3>
              <p className='text-xs text-on-surface-variant/50 mt-1'>Chọn học sinh ở cột bên trái để hiển thị thông tin bài làm.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// --- Main Wrapper Page Wrapper ---
export default function SubmissionsPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRoleAndFetch = async () => {
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
            const isTeacher = isCreator || currentMember?.role === 'owner' || currentMember?.role === 'admin';
            setIsOwnerOrAdmin(isTeacher);
            if (!isTeacher) {
              setError('Bạn không có quyền truy cập trang chấm điểm bài tập');
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Không thể tải thông tin bài tập');
      } finally {
        setLoading(false);
      }
    };
    checkRoleAndFetch();
  }, [id, user]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen text-on-surface-variant/50 gap-2.5'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
        <p className='text-sm font-semibold text-on-surface-variant/70'>Đang tải trang chấm điểm...</p>
      </div>
    );
  }

  if (error || !assignment || !isOwnerOrAdmin) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen text-center px-4 space-y-4 bg-surface-container-lowest'>
        <div className='w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100'>
          <ArrowLeft size={24} />
        </div>
        <div>
          <h2 className='text-lg font-bold text-on-surface'>Lỗi bảo mật</h2>
          <p className='text-sm text-on-surface-variant/70 max-w-sm mt-1'>{error || 'Bạn không được phép truy cập trang này.'}</p>
        </div>
      </div>
    );
  }

  return (
    <TaskProvider>
      <GradingContent assignment={assignment} classroomId={assignment.classroomId} />
    </TaskProvider>
  );
}
export interface UsersProps { }
