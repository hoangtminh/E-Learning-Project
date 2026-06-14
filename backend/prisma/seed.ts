import {
  PrismaClient,
  GlobalRole,
  ClassroomRole,
  CourseVisibility,
  ContentType,
  ConversationType,
  CallStatus,
  CallType,
  QuestionType,
  TransactionStatus,
  Prisma,
} from '@prisma/client';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';
import 'dotenv/config';

const adapter = new PrismaTiDBCloud({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Đang bắt đầu quá trình Seed dữ liệu ---');

  // SEED USER
  const users = [
    {
      id: "944ad8af-c80a-4239-a34c-4ec8f9a5c852",
      email: "test@gmail.com",
      passwordHash: "$2b$10$MZcAM12XzcRgG7SKo01NkeYuoyUM  acFXSJgvu/ETgCRPxOdRLqNXC",
      fullName: "Test User",
      avatarUrl: null,
      createdAt: new Date('2026-04-26T01:19:19.271Z'),
      role: GlobalRole.instructor,
    },
    {
      id: "a1faf183-9e79-4669-8b70-a4032f214e3c",
      email: "nampham.name@gmail.com",
      passwordHash: "$2b$10$U43lXCrbpGzBonSut/ebH.CGC.vsBUOkSMSlqv/cPqrQWywV6YPZ6",
      fullName: "Phạm Sơn Nam",
      avatarUrl: null,
      createdAt: new Date('2026-04-20T07:56:49.503Z'),
      role: GlobalRole.instructor,
    },
    {
      id: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      email: "hoangtuanminh25@gmail.com",
      passwordHash: "$2b$10$qefijrjBflnh14TzU7UcruWhm.VEwNR62XVpDyy6a4I6WoAA0vYg6",
      fullName: "Minh HT",
      avatarUrl: null,
      createdAt: new Date('2026-04-23T08:25:03.739Z'),
      role: GlobalRole.instructor,
    },
    {
      id: "cmp76z9j90000wsvt1p9girqj",
      email: "test2@gmail.com",
      passwordHash: "$2b$10$M6OMtvZ6MKe4trICQ6Q9ReWZbicAbqQOBM/hGihuk4cIDM9qBUYJW",
      fullName: "Test 2",
      avatarUrl: null,
      createdAt: new Date('2026-05-15T17:29:14.757Z'),
      role: GlobalRole.instructor,
    },
    {
      id: "cmpb98j1s000084upe2fkby8h",
      email: "test123@gmail.com",
      passwordHash: "$2b$10$NmYtMt9xA2GBJKhIjc/C7Oath7Sp8xOXekI6qKoWvljev3FPJ5OOy",
      fullName: "Test",
      avatarUrl: null,
      createdAt: new Date('2026-05-18T13:43:30.928Z'),
      role: GlobalRole.user,
    },
    {
      id: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      email: "friendcraftdemo@gmail.com",
      passwordHash: "$2b$10$wbSvQMtlMXje/6KGc5S/LeUtDDo0hqrDRlDmBu9TOmvLbkPwx45QS",
      fullName: "The Demo",
      avatarUrl: null,
      createdAt: new Date('2026-04-25T02:56:47.975Z'),
      role: GlobalRole.instructor,
    },
  ];

  for (const record of users) {
    const { id, ...updateData } = record;
    await prisma.user.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: User');

  // SEED CLASSROOM
  const classrooms = [
    {
      id: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      title: "Testing",
      description: "JGH73N",
      inviteCode: null,
      isPublic: false,
      createdAt: new Date('2026-04-24T21:48:25.896Z'),
      ownerId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
    },
    {
      id: "cmp9j9y8q0000a4up4vemgh2q",
      title: "Test for new class",
      description: "",
      inviteCode: "N4UF5A",
      isPublic: true,
      createdAt: new Date('2026-05-17T08:49:01.082Z'),
      ownerId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
    },
  ];

  for (const record of classrooms) {
    const { id, ...updateData } = record;
    await prisma.classroom.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Classroom');

  // SEED CLASSROOMMEMBER
  const classroomMembers = [
    {
      id: "8936f489-0076-43a4-9e09-c30c79c29fac",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      userId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      role: ClassroomRole.owner,
      joinedAt: new Date('2026-04-24T21:48:25.896Z'),
    },
    {
      id: "cmp9j9ya60001a4up7d32x55e",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      userId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      role: ClassroomRole.owner,
      joinedAt: new Date('2026-05-17T08:49:01.082Z'),
    },
    {
      id: "cmp9jb0d90002a4upxpev7bdq",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      role: ClassroomRole.member,
      joinedAt: new Date('2026-05-17T08:49:50.493Z'),
    },
  ];

  for (const record of classroomMembers) {
    const { id, ...updateData } = record;
    await prisma.classroomMember.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ClassroomMember');

  // SEED CLASSROOMJOINREQUEST
  const classroomJoinRequests = [
    {
      id: "join_req_001",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of classroomJoinRequests) {
    const { id, ...updateData } = record;
    await prisma.classroomJoinRequest.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ClassroomJoinRequest');

  // SEED COURSE
  const courses = [
    {
      id: "course_reactjs_001",
      instructorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Lập trình ReactJS nâng cao & Next.js App Router",
      slug: "lap-trinh-reactjs-nang-cao",
      description: "<p>Khóa học này sẽ hướng dẫn bạn làm chủ các kỹ thuật ReactJS nâng cao như Performance Optimization, State Management phức tạp, Server Components và Next.js App Router từ cơ bản đến nâng cao để xây dựng các ứng dụng web tối ưu nhất.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
      price: new Prisma.Decimal(500000),
      visibility: CourseVisibility.public,
      createdAt: new Date('2026-05-20T08:00:00.000Z'),
    },
    {
      id: "course_security_002",
      instructorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "An toàn thông tin ứng dụng Web",
      slug: "an-toan-thong-tin-web",
      description: "<p>Tìm hiểu sâu về các lỗ hổng bảo mật phổ biến của ứng dụng Web (OWASP Top 10) như SQL Injection, XSS, CSRF. Thực hành kiểm thử và triển khai các biện pháp phòng chống hiệu quả.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200",
      price: new Prisma.Decimal(250000),
      visibility: CourseVisibility.public,
      createdAt: new Date('2026-05-21T08:00:00.000Z'),
    },
    {
      id: "course_git_003",
      instructorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Làm chủ Git & GitHub hoàn toàn miễn phí",
      slug: "git-github-mien-phi",
      description: "<p>Khóa học miễn phí giúp bạn nhanh chóng làm quen và thành thạo các thao tác quản lý phiên bản với Git, làm việc nhóm trên GitHub hiệu quả.</p>",
      thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=200",
      price: new Prisma.Decimal(0),
      visibility: CourseVisibility.public,
      createdAt: new Date('2026-05-22T08:00:00.000Z'),
    }
  ];

  for (const record of courses) {
    const { id, ...updateData } = record;
    await prisma.course.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Course');

  // SEED COURSEMEMBER
  const courseMembers = [
    {
      id: "course_mem_001",
      courseId: "course_reactjs_001",
      userId: "cmpb98j1s000084upe2fkby8h",
      enrolledAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of courseMembers) {
    const { id, ...updateData } = record;
    await prisma.courseMember.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: CourseMember');

  // SEED COURSEINVITATION
  const courseInvitations = [
    {
      id: "course_inv_001",
      courseId: "course_reactjs_001",
      inviterId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      inviteeId: "cmpb98j1s000084upe2fkby8h",
      invitedAt: new Date('2026-05-24T00:00:00.000Z'),
      acceptedAt: null,
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of courseInvitations) {
    const { id, ...updateData } = record;
    await prisma.courseInvitation.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: CourseInvitation');

  // SEED SECTION
  const sections = [
    {
      id: "section_reactjs_1",
      courseId: "course_reactjs_001",
      title: "Chương 1: Thiết lập cấu trúc dự án & React nâng cao",
      orderIndex: 1,
    },
    {
      id: "section_reactjs_2",
      courseId: "course_reactjs_001",
      title: "Chương 2: Tối ưu hóa hiệu năng & Next.js App Router",
      orderIndex: 2,
    },
    {
      id: "section_security_1",
      courseId: "course_security_002",
      title: "Chương 1: Giới thiệu về Bảo mật Web & OWASP Top 10",
      orderIndex: 1,
    },
    {
      id: "section_security_2",
      courseId: "course_security_002",
      title: "Chương 2: SQL Injection & XSS cơ bản đến nâng cao",
      orderIndex: 2,
    },
    {
      id: "section_git_1",
      courseId: "course_git_003",
      title: "Chương 1: Làm quen với hệ thống Git",
      orderIndex: 1,
    }
  ];

  for (const record of sections) {
    const { id, ...updateData } = record;
    await prisma.section.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Section');

  // SEED LESSON
  const lessons = [
    {
      id: "lesson_reactjs_1_1",
      sectionId: "section_reactjs_1",
      title: "Bài 1: Giới thiệu khóa học và cài đặt môi trường",
      order: 1,
      type: ContentType.text,
      body: "<p>Bài viết này hướng dẫn cài đặt Node.js và Yarn cho dự án ReactJS.</p>",
      durationSec: 300,
    },
    {
      id: "lesson_reactjs_1_2",
      sectionId: "section_reactjs_1",
      title: "Bài 2: Sử dụng useMemo và useCallback đúng cách",
      order: 2,
      type: ContentType.text,
      body: "<p>Tìm hiểu các trường hợp nên và không nên tối ưu hóa memoization trong React.</p>",
      durationSec: 600,
    },
    {
      id: "lesson_reactjs_2_1",
      sectionId: "section_reactjs_2",
      title: "Bài 3: Next.js App Router - Server vs Client Components",
      order: 1,
      type: ContentType.text,
      body: "<p>So sánh cơ chế hoạt động và cách chia sẻ dữ liệu giữa Server Components và Client Components.</p>",
      durationSec: 900,
    },
    {
      id: "lesson_security_1_1",
      sectionId: "section_security_1",
      title: "Bài 1: Tổng quan về lỗ hổng bảo mật OWASP Top 10",
      order: 1,
      type: ContentType.text,
      body: "<p>Tổng quan các mối đe dọa lớn nhất đối với ứng dụng Web hiện nay.</p>",
      durationSec: 450,
    },
    {
      id: "lesson_security_2_1",
      sectionId: "section_security_2",
      title: "Bài 2: Thực hành SQL Injection trên môi trường Lab",
      order: 1,
      type: ContentType.text,
      body: "<p>Khai thác lỗ hổng SQL Injection và cách vá lỗi bằng Prepared Statements.</p>",
      durationSec: 720,
    },
    {
      id: "lesson_git_1_1",
      sectionId: "section_git_1",
      title: "Bài 1: Git là gì? Tại sao nên dùng Git?",
      order: 1,
      type: ContentType.text,
      body: "<p>Hiểu cơ chế quản lý phiên bản phân tán.</p>",
      durationSec: 250,
    }
  ];

  for (const record of lessons) {
    const { id, ...updateData } = record;
    await prisma.lesson.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Lesson');

  // SEED USERPROGRESS
  const userProgresses = [
    {
      id: "user_prog_001",
      userId: "cmpb98j1s000084upe2fkby8h",
      courseId: "course_reactjs_001",
      lessonId: "lesson_reactjs_1_1",
      lastWatchedSecond: 120,
      isCompleted: false,
      updatedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of userProgresses) {
    const { id, ...updateData } = record;
    await prisma.userProgress.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: UserProgress');

  // SEED CONVERSATION
  const conversations = [
    {
      id: "conv_classroom_001",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      type: ConversationType.classroom,
      title: "Chat Testing Classroom",
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of conversations) {
    const { id, ...updateData } = record;
    await prisma.conversation.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Conversation');

  // SEED CONVERSATIONMEMBER
  const conversationMembers = [
    {
      id: "conv_mem_001",
      conversationId: "conv_classroom_001",
      userId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      joinedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of conversationMembers) {
    const { id, ...updateData } = record;
    await prisma.conversationMember.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ConversationMember');

  // SEED MESSAGE
  const messages = [
    {
      id: "msg_001",
      conversationId: "conv_classroom_001",
      senderId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "Hello everyone, welcome to the Testing classroom chat!",
      fileUrl: null,
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of messages) {
    const { id, ...updateData } = record;
    await prisma.message.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Message');

  // SEED CLASSROOMTASK
  const classroomTasks = [
    {
      id: "class_task_001",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Bài tập 1: Khởi động",
      description: "Hãy nộp lời giải bài tập khởi động tại đây.",
      deadline: new Date('2026-06-01T00:00:00.000Z'),
      attachmentKey: null,
      attachmentName: null,
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of classroomTasks) {
    const { id, ...updateData } = record;
    await prisma.classroomTask.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ClassroomTask');

  // SEED TASKSUBMISSION
  const taskSubmissions = [
    {
      id: "task_sub_001",
      taskId: "class_task_001",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "Em xin nộp bài ạ.",
      fileUrl: "https://example.com/sub.pdf",
      submittedAt: new Date('2026-05-24T00:00:00.000Z'),
      grade: new Prisma.Decimal(9.5),
    }
  ];

  for (const record of taskSubmissions) {
    const { id, ...updateData } = record;
    await prisma.taskSubmission.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: TaskSubmission');

  // SEED CLASSROOMFILE
  const classroomFiles = [
    {
      id: "class_file_001",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      uploaderId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      name: "lecture_notes.pdf",
      s3Key: "uploads/lecture_notes.pdf",
      sizeBytes: 1024567,
      mimeType: "application/pdf",
      uploadedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of classroomFiles) {
    const { id, ...updateData } = record;
    await prisma.classroomFile.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ClassroomFile');



  // SEED NOTE
  const notes = [
    {
      id: "note_001",
      userId: "cmpb98j1s000084upe2fkby8h",
      courseId: "course_reactjs_001",
      lessonId: "lesson_reactjs_1_1",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      content: "Đây là ghi chú của bài học useMemo",
      videoTimestamp: 45,
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
      updatedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of notes) {
    const { id, ...updateData } = record;
    await prisma.note.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Note');

  // SEED CALL
  const calls = [
    {
      id: "call_001",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Họp lớp tuần 1",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      conversationId: "conv_classroom_001",
      status: CallStatus.ongoing,
      type: CallType.channel,
      participantCount: 1,
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
      startedAt: new Date('2026-05-24T00:00:00.000Z'),
      endedAt: null,
    }
  ];

  for (const record of calls) {
    const { id, ...updateData } = record;
    await prisma.call.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Call');

  // SEED QUIZ
  const quizzes = [
    {
      id: "quiz_001",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Quiz ôn tập ReactJS",
      description: "Kiểm tra kiến thức cơ bản về ReactJS",
      isPublic: true,
      duration: 15,
      startDate: null,
      endDate: null,
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
      updatedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of quizzes) {
    const { id, ...updateData } = record;
    await prisma.quiz.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Quiz');

  // SEED QUIZMEMBERSHIP
  const quizMemberships = [
    {
      id: "quiz_mem_001",
      quizId: "quiz_001",
      userId: "cmpb98j1s000084upe2fkby8h",
      joinedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of quizMemberships) {
    const { id, ...updateData } = record;
    await prisma.quizMembership.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: QuizMembership');

  // SEED QUESTION
  const questions = [
    {
      id: "ques_001",
      quizId: "quiz_001",
      type: QuestionType.single_choice,
      content: "useMemo dùng để làm gì?",
      orderIndex: 1,
      points: 1,
    }
  ];

  for (const record of questions) {
    const { id, ...updateData } = record;
    await prisma.question.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Question');

  // SEED QUESTIONOPTION
  const questionOptions = [
    {
      id: "ques_opt_001",
      questionId: "ques_001",
      content: "Tối ưu hóa ghi nhớ giá trị tính toán",
      isCorrect: true,
      orderIndex: 1,
    }
  ];

  for (const record of questionOptions) {
    const { id, ...updateData } = record;
    await prisma.questionOption.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: QuestionOption');

  // SEED QUIZSUBMISSION
  const quizSubmissions = [
    {
      id: "quiz_sub_001",
      quizId: "quiz_001",
      userId: "cmpb98j1s000084upe2fkby8h",
      score: new Prisma.Decimal(10.0),
      timeSpent: 120,
      submittedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of quizSubmissions) {
    const { id, ...updateData } = record;
    await prisma.quizSubmission.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: QuizSubmission');

  // SEED USERANSWER
  const userAnswers = [
    {
      id: "user_ans_001",
      submissionId: "quiz_sub_001",
      questionId: "ques_001",
      textAnswer: null,
      isCorrect: true,
    }
  ];

  for (const record of userAnswers) {
    const { id, ...updateData } = record;
    await prisma.userAnswer.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: UserAnswer');

  // SEED USERANSWEROPTION
  const userAnswerOptions = [
    {
      id: "user_ans_opt_001",
      userAnswerId: "user_ans_001",
      optionId: "ques_opt_001",
    }
  ];

  for (const record of userAnswerOptions) {
    const { id, ...updateData } = record;
    await prisma.userAnswerOption.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: UserAnswerOption');

  // SEED CLASSROOMPOST
  const classroomPosts = [
    {
      id: "class_post_001",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "Chào cả lớp, chúc các bạn một tuần mới học tập tốt!",
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
      updatedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of classroomPosts) {
    const { id, ...updateData } = record;
    await prisma.classroomPost.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ClassroomPost');

  // SEED CLASSROOMPOSTCOMMENT
  const classroomPostComments = [
    {
      id: "class_comment_001",
      postId: "class_post_001",
      authorId: "cmpb98j1s000084upe2fkby8h",
      content: "Cảm ơn thầy ạ!",
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
      updatedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of classroomPostComments) {
    const { id, ...updateData } = record;
    await prisma.classroomPostComment.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ClassroomPostComment');

  // SEED NOTIFICATION
  const notifications = [
    {
      id: "noti_001",
      userId: "cmpb98j1s000084upe2fkby8h",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "NEW_POST",
      content: "Minh HT đã đăng bài viết mới trong Testing.",
      link: "/classrooms/85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      isRead: false,
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of notifications) {
    const { id, ...updateData } = record;
    await prisma.notification.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Notification');

  // SEED TRANSACTION
  const transactions = [
    {
      id: "trans_001",
      userId: "cmpb98j1s000084upe2fkby8h",
      courseId: "course_reactjs_001",
      amount: new Prisma.Decimal(500000),
      status: TransactionStatus.success,
      vnpTxnRef: "vnp_txn_ref_001",
      vnpBankCode: "NCB",
      vnpBankTranNo: "vnp_bank_tran_no_001",
      vnpCardType: "ATM",
      vnpPayDate: "20260524160000",
      vnpOrderInfo: "Thanh toan khoa hoc ReactJS",
      vnpTransactionNo: "vnp_transaction_no_001",
      vnpResponseCode: "00",
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
      updatedAt: new Date('2026-05-24T00:00:00.000Z'),
    }
  ];

  for (const record of transactions) {
    const { id, ...updateData } = record;
    await prisma.transaction.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: Transaction');

  console.log('--- Hoàn tất quá trình Seed dữ liệu thành công! ---');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
