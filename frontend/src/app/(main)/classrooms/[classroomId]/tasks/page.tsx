'use client';

import { useClassrooms } from '@/contexts/ClassroomContext';

type TaskSubmission = {
  id: string;
  taskId: string;
  studentId: string;
  content: string | null;
  fileUrl: string | null;
  submittedAt: string;
  grade: number | null;
};

type ClassroomTask = {
  id: string;
  classroomId: string;
  creatorId: string;
  title: string;
  description: string | null;
  deadline: string | null;
  createdAt: string;
  submissions: TaskSubmission[];
};

const mockClassroomTasks: ClassroomTask[] = [
  {
    id: '1',
    classroomId: 'cls-1',
    creatorId: 'usr-1',
    title: 'Module 1: Server Components vs Client Components',
    description:
      'Implement a hybrid rendering strategy for a product listing page.',
    deadline: '2023-10-24T23:59:59Z',
    createdAt: '2023-10-01T00:00:00Z',
    submissions: [
      {
        id: 'sub-1',
        taskId: '1',
        studentId: 'stu-1',
        content: 'My assignment link',
        fileUrl: null,
        submittedAt: '2023-10-20T10:00:00Z',
        grade: 95,
      },
    ],
  },
  {
    id: '2',
    classroomId: 'cls-1',
    creatorId: 'usr-1',
    title: 'Lab: Mastering Server Actions',
    description:
      'Build a secure form with useFormStatus and optimistic updates.',
    deadline: new Date(Date.now() + 2 * 86400000).toISOString(), // Mock "Due in 2 days"
    createdAt: '2023-10-15T00:00:00Z',
    submissions: [],
  },
  {
    id: '3',
    classroomId: 'cls-1',
    creatorId: 'usr-1',
    title: 'Week 2 Quiz: App Router Concepts',
    description:
      'Testing knowledge on layouts, templates, and segment configurations.',
    deadline: '2023-10-15T23:59:59Z',
    createdAt: '2023-10-05T00:00:00Z',
    submissions: [
      {
        id: 'sub-2',
        taskId: '3',
        studentId: 'stu-1',
        content: 'Quiz completed',
        fileUrl: null,
        submittedAt: '2023-10-12T14:30:00Z',
        grade: null,
      },
    ],
  },
];

const mockUpcoming = [
  {
    id: 1,
    label: 'TOMORROW',
    title: 'Server Actions Lab',
  },
  {
    id: 2,
    label: 'OCT 30',
    title: 'Final Project Proposal',
  },
];

const mockResources = [
  {
    id: 1,
    title: 'Class Syllabus',
    icon: 'menu_book',
    link: '#',
  },
  {
    id: 2,
    title: 'Discussion Forum',
    icon: 'forum',
    link: '#',
  },
];

export default function ClassroomTasksPage() {
  const { classroom } = useClassrooms();

  const activeCount = mockClassroomTasks.filter(
    (t) => t.submissions.length === 0,
  ).length;
  const doneCount = mockClassroomTasks.filter(
    (t) => t.submissions.length > 0,
  ).length;

  return (
    <div className='p-6 lg:p-10 max-w-7xl mx-auto w-full'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Main Assignments List */}
        <div className='col-span-1 lg:col-span-8 space-y-6'>
          {/* Teacher Actions (Visible contextually) */}
          <div className='flex justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-xl border border-sky-200/50 shadow-sm'>
            <div className='flex gap-2'>
              <span className='px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold'>
                Cần làm: {activeCount}
              </span>
              <span className='px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-xs font-semibold border border-slate-200'>
                Đã xong: {doneCount}
              </span>
            </div>
            <button className='flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95 text-sm'>
              <span className='material-symbols-outlined text-lg'>add</span>
              Tạo bài tập
            </button>
          </div>

          {/* Render Assignment Cards */}
          {mockClassroomTasks.map((task, index) => {
            const submission = task.submissions[0];
            const status = submission
              ? submission.grade !== null
                ? 'graded'
                : 'done'
              : 'todo';

            // Mock data for UI embellishments (icons, points, feedback)
            const icons = [
              {
                icon: 'assignment',
                iconColor: 'text-purple-600',
                iconBg: 'bg-purple-100',
                feedback: 'Excellent work',
                points: 100,
              },
              {
                icon: 'code',
                iconColor: 'text-sky-600',
                iconBg: 'bg-sky-100',
                feedback: null,
                points: 50,
              },
              {
                icon: 'description',
                iconColor: 'text-slate-500',
                iconBg: 'bg-slate-200/50',
                feedback: null,
                points: null,
              },
            ];
            const ui = icons[index % icons.length];

            let dueDateStr = '';
            let urgency = 'normal';

            if (status === 'todo' && task.deadline) {
              const diffDays = Math.ceil(
                (new Date(task.deadline).getTime() - Date.now()) / 86400000,
              );
              if (diffDays > 0 && diffDays <= 3) {
                dueDateStr = `Due in ${diffDays} days`;
                urgency = 'high';
              } else {
                dueDateStr = `Due ${new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
              }
            } else if (submission) {
              dueDateStr = `Submitted ${new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            } else {
              dueDateStr = 'No deadline';
            }

            return (
              <div
                key={task.id}
                className={`bg-white/60 backdrop-blur-md border border-slate-200 p-6 rounded-2xl group hover:border-sky-500/40 transition-all duration-300 shadow-sm ${
                  status === 'todo' ? 'border-l-4 border-l-sky-500' : ''
                } ${status === 'done' ? 'opacity-80' : ''}`}
              >
                <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
                  <div className='flex gap-5'>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ui.iconBg} ${ui.iconColor}`}
                    >
                      <span className='material-symbols-outlined'>
                        {ui.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors'>
                        {task.title}
                      </h3>
                      <p className='text-sm text-slate-500 mt-1'>
                        {task.description}
                      </p>
                      <div className='flex flex-wrap items-center gap-4 mt-4'>
                        <div
                          className={`flex items-center gap-1.5 text-xs ${urgency === 'high' ? 'text-red-500 font-bold' : 'text-slate-500'}`}
                        >
                          <span className='material-symbols-outlined text-sm'>
                            {urgency === 'high'
                              ? 'priority_high'
                              : status === 'done'
                                ? 'history'
                                : 'calendar_today'}
                          </span>
                          {dueDateStr}
                        </div>
                        {ui.points !== null && (
                          <div className='flex items-center gap-1.5 text-xs text-slate-500'>
                            <span className='material-symbols-outlined text-sm'>
                              grade
                            </span>
                            {ui.points} points
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col items-end gap-3 mt-4 md:mt-0 w-full md:w-auto'>
                    {status === 'graded' && (
                      <>
                        <span className='px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 w-max'>
                          <span className='material-symbols-outlined text-sm'>
                            check_circle
                          </span>
                          Đã chấm điểm
                        </span>
                        <div className='text-right'>
                          <div className='text-2xl font-black text-slate-800'>
                            {submission?.grade}
                            <span className='text-sm font-normal text-slate-500'>
                              /{ui.points}
                            </span>
                          </div>
                          {ui.feedback && (
                            <div className='text-[10px] font-bold text-sky-600 uppercase'>
                              {ui.feedback}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {status === 'todo' && (
                      <>
                        <span className='px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200 w-max'>
                          Chưa làm
                        </span>
                        <button className='mt-2 bg-sky-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-sky-600/20 hover:bg-sky-700 hover:shadow-lg transition-all active:scale-95 w-full md:w-auto'>
                          Nộp bài
                        </button>
                      </>
                    )}

                    {status === 'done' && (
                      <>
                        <span className='px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center gap-1 w-max'>
                          <span className='material-symbols-outlined text-sm'>
                            pending
                          </span>
                          Đã nộp
                        </span>
                        <button className='text-sky-600 text-sm font-bold hover:underline mt-2'>
                          Xem bài nộp
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Info Panel */}
        <div className='col-span-1 lg:col-span-4 space-y-6'>
          {/* Progress Card */}
          <div className='bg-white/60 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm'>
            <h4 className='font-bold text-slate-800 mb-6'>Tiến độ của bạn</h4>
            <div className='space-y-6'>
              <div>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='text-slate-500'>Đã hoàn thành</span>
                  <span className='font-bold text-slate-800'>
                    {doneCount}/{mockClassroomTasks.length}
                  </span>
                </div>
                <div className='w-full bg-slate-200 h-2 rounded-full overflow-hidden'>
                  <div
                    className='bg-sky-500 h-full rounded-full'
                    style={{
                      width: `${(doneCount / mockClassroomTasks.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                  <div className='text-xs text-slate-500 mb-1'>
                    Điểm trung bình
                  </div>
                  <div className='text-xl font-black text-sky-600'>A-</div>
                </div>
                <div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                  <div className='text-xs text-slate-500 mb-1'>Chuyên cần</div>
                  <div className='text-xl font-black text-slate-800'>98%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className='bg-white/60 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm'>
            <h4 className='font-bold text-slate-800 mb-4'>Sắp tới hạn</h4>
            <div className='space-y-4'>
              {mockUpcoming.map((item) => (
                <div key={item.id} className='flex gap-3 items-center'>
                  <div>
                    <div className={`text-xs font-bold uppercase`}>
                      {item.label}
                    </div>
                    <div className='text-sm font-semibold text-slate-800'>
                      {item.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className='bg-white/60 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm'>
            <h4 className='font-bold text-slate-800 mb-4'>Tài nguyên nhanh</h4>
            <div className='grid grid-cols-1 gap-2'>
              {mockResources.map((res) => (
                <a
                  key={res.id}
                  className='flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 transition-colors group'
                  href={res.link}
                >
                  <div className='flex items-center gap-3'>
                    <span className='material-symbols-outlined text-slate-500'>
                      {res.icon}
                    </span>
                    <span className='text-sm font-medium text-slate-800'>
                      {res.title}
                    </span>
                  </div>
                  <span className='material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity text-slate-500'>
                    open_in_new
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
