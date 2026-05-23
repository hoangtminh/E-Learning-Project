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
  const classroomJoinRequests: any[] = [];

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
  const courses: any[] = [];

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
  const courseMembers: any[] = [];

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
  const courseInvitations: any[] = [];

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
  const sections: any[] = [];

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
  const lessons: any[] = [];

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
  const userProgresses: any[] = [];

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
      id: "2c015873-afdc-476e-8c59-253fed84979e",
      classroomId: null,
      type: ConversationType.group,
      title: "3 chat",
      createdAt: new Date('2026-04-26T03:10:07.603Z'),
    },
    {
      id: "668d058a-552f-4671-9f75-99c4257ce050",
      classroomId: null,
      type: ConversationType.group,
      title: "New Chat",
      createdAt: new Date('2026-04-25T07:38:43.997Z'),
    },
    {
      id: "90d4e7be-d00c-463c-891e-ccddee0e6b49",
      classroomId: null,
      type: ConversationType.group,
      title: "Group chat",
      createdAt: new Date('2026-04-26T01:20:41.593Z'),
    },
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
      id: "45205b92-20c7-4acb-8eec-4ff3b3ec877b",
      conversationId: "2c015873-afdc-476e-8c59-253fed84979e",
      userId: "944ad8af-c80a-4239-a34c-4ec8f9a5c852",
      joinedAt: new Date('2026-04-26T03:10:07.603Z'),
    },
    {
      id: "58d4c2e7-4c37-4d44-9fc0-7bbb1273c89f",
      conversationId: "90d4e7be-d00c-463c-891e-ccddee0e6b49",
      userId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      joinedAt: new Date('2026-04-26T01:20:41.593Z'),
    },
    {
      id: "58d9e616-4ac7-4eb9-ba82-f25c21bb3f5a",
      conversationId: "2c015873-afdc-476e-8c59-253fed84979e",
      userId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      joinedAt: new Date('2026-04-26T03:10:07.603Z'),
    },
    {
      id: "8dbcae5a-e471-4775-ab96-c714add84f44",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      userId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      joinedAt: new Date('2026-04-25T07:38:43.997Z'),
    },
    {
      id: "bf3410a9-76b2-451e-965e-3757601196a6",
      conversationId: "90d4e7be-d00c-463c-891e-ccddee0e6b49",
      userId: "944ad8af-c80a-4239-a34c-4ec8f9a5c852",
      joinedAt: new Date('2026-04-26T01:20:41.593Z'),
    },
    {
      id: "ca37198a-63d0-4a7d-ab2e-44716f6a540a",
      conversationId: "2c015873-afdc-476e-8c59-253fed84979e",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      joinedAt: new Date('2026-04-26T03:10:07.603Z'),
    },
    {
      id: "d776528e-9084-48cb-9109-76fb90ad5243",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      joinedAt: new Date('2026-04-25T07:38:43.997Z'),
    },
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
      id: "02b2fc85-3422-4f1e-a26f-eaa3abb119f9",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      senderId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "see you tomorrow",
      fileUrl: null,
      createdAt: new Date('2026-04-25T11:55:19.888Z'),
    },
    {
      id: "0c97f955-211b-4b17-8daf-ebc502d3f315",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      senderId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "tks",
      fileUrl: null,
      createdAt: new Date('2026-04-25T11:55:29.523Z'),
    },
    {
      id: "1ec5f5c7-6361-4ae2-b2e9-99b92bf3088e",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      senderId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "Hello hello",
      fileUrl: null,
      createdAt: new Date('2026-04-25T11:30:02.622Z'),
    },
    {
      id: "3d8c69e5-410a-461a-b17e-f0547fd41666",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      senderId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "Hi",
      fileUrl: null,
      createdAt: new Date('2026-04-25T10:42:29.719Z'),
    },
    {
      id: "725e48db-8d4b-45f2-8d36-fa430ce6e1a1",
      conversationId: "90d4e7be-d00c-463c-891e-ccddee0e6b49",
      senderId: "944ad8af-c80a-4239-a34c-4ec8f9a5c852",
      content: "hello everyone",
      fileUrl: null,
      createdAt: new Date('2026-04-26T01:24:08.186Z'),
    },
    {
      id: "cmpbf0s9o00052supaz3dxw06",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      senderId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "Hello",
      fileUrl: null,
      createdAt: new Date('2026-05-18T16:25:27.324Z'),
    },
    {
      id: "cmpbf0vwi00062sup5evkuuya",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      senderId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "wanna have a call?",
      fileUrl: null,
      createdAt: new Date('2026-05-18T16:25:32.034Z'),
    },
    {
      id: "cmpbf15fn00072supbwlcjv37",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      senderId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "sure",
      fileUrl: null,
      createdAt: new Date('2026-05-18T16:25:44.387Z'),
    },
    {
      id: "cmpbffky2000a2supsnohittp",
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      senderId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "[CALL_INVITATION]:cmpbffkpr00092supt0x0t9ek:New Chat",
      fileUrl: null,
      createdAt: new Date('2026-05-18T16:36:57.674Z'),
    },
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
      id: "cmp9kic8v000aa4updz3nm26q",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "New task",
      description: null,
      deadline: null,
      attachmentKey: null,
      attachmentName: null,
      createdAt: new Date('2026-05-17T09:23:32.095Z'),
    },
    {
      id: "cmp9m5bcf000ca4up9unrm3x3",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "New task post",
      description: null,
      deadline: null,
      attachmentKey: null,
      attachmentName: null,
      createdAt: new Date('2026-05-17T10:09:23.631Z'),
    },
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
      id: "cmp9kit49000ba4upwbs82l6t",
      taskId: "cmp9kic8v000aa4updz3nm26q",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "Submit for task",
      fileUrl: null,
      submittedAt: new Date('2026-05-17T09:23:53.961Z'),
      grade: null,
    },
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
  const classroomFiles: any[] = [];

  for (const record of classroomFiles) {
    const { id, ...updateData } = record;
    await prisma.classroomFile.upsert({
      where: { id: record.id },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ClassroomFile');

  // SEED CLASSROOMLINKEDCOURSE
  const classroomLinkedCourses: any[] = [];

  for (const record of classroomLinkedCourses) {
    const { classroomId, courseId, ...updateData } = record;
    await prisma.classroomLinkedCourse.upsert({
      where: {
        classroomId_courseId: {
          classroomId: record.classroomId,
          courseId: record.courseId,
        },
      },
      update: updateData,
      create: record,
    });
  }
  console.log('✅ Đã xong: ClassroomLinkedCourse');

  // SEED NOTE
  const notes: any[] = [];

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
      id: "cmpbef7k500002suphp5aj7ud",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp nhóm - Testing",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-18T16:08:40.710Z'),
      startedAt: new Date('2026-05-18T16:08:40.593Z'),
      endedAt: new Date('2026-05-18T16:16:27.512Z'),
    },
    {
      id: "cmpbepj9i00022sup792izb71",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-18T16:16:42.438Z'),
      startedAt: new Date('2026-05-18T16:16:42.396Z'),
      endedAt: new Date('2026-05-18T16:24:46.696Z'),
    },
    {
      id: "cmpbf17k600082supv3egweb3",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      title: "Cuộc họp nhóm - New Chat",
      classroomId: null,
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-18T16:25:47.142Z'),
      startedAt: new Date('2026-05-18T16:25:47.091Z'),
      endedAt: new Date('2026-05-18T16:36:33.286Z'),
    },
    {
      id: "cmpbffkpr00092supt0x0t9ek",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      title: "Cuộc họp nhóm - New Chat",
      classroomId: null,
      conversationId: "668d058a-552f-4671-9f75-99c4257ce050",
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-18T16:36:57.375Z'),
      startedAt: new Date('2026-05-18T16:36:57.325Z'),
      endedAt: new Date('2026-05-18T16:38:45.186Z'),
    },
    {
      id: "cmpbg7mag000b2sup4nb0tv3o",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp Riêng tư",
      classroomId: null,
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.private,
      participantCount: -2,
      createdAt: new Date('2026-05-18T16:58:45.784Z'),
      startedAt: new Date('2026-05-18T16:58:45.082Z'),
      endedAt: new Date('2026-05-18T17:06:52.283Z'),
    },
    {
      id: "cmpbgv18v000c2supwvzqyn9m",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp Công khai",
      classroomId: null,
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.public,
      participantCount: 0,
      createdAt: new Date('2026-05-18T17:16:58.255Z'),
      startedAt: new Date('2026-05-18T17:16:58.101Z'),
      endedAt: new Date('2026-05-18T17:25:06.406Z'),
    },
    {
      id: "cmpbh5rvy000d2sup7y3j68eh",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp Riêng tư",
      classroomId: null,
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.private,
      participantCount: -1,
      createdAt: new Date('2026-05-18T17:25:19.342Z'),
      startedAt: new Date('2026-05-18T17:25:19.298Z'),
      endedAt: new Date('2026-05-18T17:28:39.802Z'),
    },
    {
      id: "cmpbz3pg500005wupbd9l4s2p",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-19T01:47:35.957Z'),
      startedAt: new Date('2026-05-19T01:47:35.868Z'),
      endedAt: new Date('2026-05-19T01:59:47.661Z'),
    },
    {
      id: "cmpc0jmdf00035wupvnfiahh0",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-19T02:27:58.083Z'),
      startedAt: new Date('2026-05-19T02:27:58.026Z'),
      endedAt: new Date('2026-05-19T02:30:34.154Z'),
    },
    {
      id: "cmpc14okb00065wup5b0om3uv",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-19T02:44:20.699Z'),
      startedAt: new Date('2026-05-19T02:44:20.605Z'),
      endedAt: new Date('2026-05-19T02:52:55.669Z'),
    },
    {
      id: "cmpc1rb9700095wupuov2wcog",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-19T03:01:56.540Z'),
      startedAt: new Date('2026-05-19T03:01:56.489Z'),
      endedAt: new Date('2026-05-19T03:23:24.845Z'),
    },
    {
      id: "cmpc2tvkp000c5wup833pxznd",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-19T03:31:55.801Z'),
      startedAt: new Date('2026-05-19T03:31:55.470Z'),
      endedAt: new Date('2026-05-19T04:05:21.325Z'),
    },
    {
      id: "cmpc4j6t0000f5wup8wxc9vu2",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-19T04:19:36.372Z'),
      startedAt: new Date('2026-05-19T04:19:36.327Z'),
      endedAt: new Date('2026-05-19T04:31:53.038Z'),
    },
    {
      id: "cmpfpsy520000m8up4s09gto5",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-21T16:38:22.166Z'),
      startedAt: new Date('2026-05-21T16:38:22.100Z'),
      endedAt: new Date('2026-05-21T16:51:57.525Z'),
    },
    {
      id: "cmpfqvy140003m8upy60ui23e",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-21T17:08:41.608Z'),
      startedAt: new Date('2026-05-21T17:08:41.562Z'),
      endedAt: new Date('2026-05-21T17:10:35.072Z'),
    },
    {
      id: "cmpfrio590006m8upmwtomvdz",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-21T17:26:21.885Z'),
      startedAt: new Date('2026-05-21T17:26:21.841Z'),
      endedAt: new Date('2026-05-21T17:38:16.222Z'),
    },
    {
      id: "cmpfs8s9l0009m8updcob8vgz",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      title: "Cuộc họp nhóm - Test for new class",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      conversationId: null,
      status: CallStatus.ended,
      type: CallType.channel,
      participantCount: 0,
      createdAt: new Date('2026-05-21T17:46:40.281Z'),
      startedAt: new Date('2026-05-21T17:46:40.230Z'),
      endedAt: new Date('2026-05-21T17:48:44.316Z'),
    },
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
  const quizzes: any[] = [];

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
  const quizMemberships: any[] = [];

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
  const questions: any[] = [];

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
  const questionOptions: any[] = [];

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
  const quizSubmissions: any[] = [];

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
  const userAnswers: any[] = [];

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
  const userAnswerOptions: any[] = [];

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
      id: "cmp9k2v510003a4upyuk844cn",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "New Posting in Classroom",
      createdAt: new Date('2026-05-17T09:11:30.085Z'),
      updatedAt: new Date('2026-05-17T09:11:30.085Z'),
    },
    {
      id: "cmp9m5bn1000da4upon8j3qr0",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_TASK]:cmp9m5bcf000ca4up9unrm3x3:New task post",
      createdAt: new Date('2026-05-17T10:09:24.013Z'),
      updatedAt: new Date('2026-05-17T10:09:24.013Z'),
    },
    {
      id: "cmp9my3aj000ea4upfcqb5wh2",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "New post",
      createdAt: new Date('2026-05-17T10:31:46.219Z'),
      updatedAt: new Date('2026-05-17T10:31:46.219Z'),
    },
    {
      id: "cmp9sps8f000fa4upyubvjt36",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "Test notify",
      createdAt: new Date('2026-05-17T13:13:16.335Z'),
      updatedAt: new Date('2026-05-17T13:13:16.335Z'),
    },
    {
      id: "cmp9suqxt0000pkup7iaz0t5x",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "Test notify 2",
      createdAt: new Date('2026-05-17T13:17:07.937Z'),
      updatedAt: new Date('2026-05-17T13:17:07.937Z'),
    },
    {
      id: "cmp9svljs0002pkupqe25zwp8",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "test noti",
      createdAt: new Date('2026-05-17T13:17:47.608Z'),
      updatedAt: new Date('2026-05-17T13:17:47.608Z'),
    },
    {
      id: "cmp9ub35f0004pkupwv7yayqa",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:classroom-cmp9j9y8q0000a4up4vemgh2q",
      createdAt: new Date('2026-05-17T13:57:49.875Z'),
      updatedAt: new Date('2026-05-17T13:57:49.875Z'),
    },
    {
      id: "cmpbe1hig000184upib61mtn8",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:classroom-85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      createdAt: new Date('2026-05-18T15:58:00.424Z'),
      updatedAt: new Date('2026-05-18T15:58:00.424Z'),
    },
    {
      id: "cmpbef7ur00012supqwrt6pqy",
      classroomId: "85a46e75-41b0-4b2b-9aa4-d0cf1483cb70",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpbef7k500002suphp5aj7ud",
      createdAt: new Date('2026-05-18T16:08:41.091Z'),
      updatedAt: new Date('2026-05-18T16:08:41.091Z'),
    },
    {
      id: "cmpbepjgw00032supewe0lb6e",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpbepj9i00022sup792izb71",
      createdAt: new Date('2026-05-18T16:16:42.704Z'),
      updatedAt: new Date('2026-05-18T16:16:42.704Z'),
    },
    {
      id: "cmpbz3psh00015wupgyos6awk",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpbz3pg500005wupbd9l4s2p",
      createdAt: new Date('2026-05-19T01:47:36.401Z'),
      updatedAt: new Date('2026-05-19T01:47:36.401Z'),
    },
    {
      id: "cmpc0jmmz00045wup7x1n4m76",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpc0jmdf00035wupvnfiahh0",
      createdAt: new Date('2026-05-19T02:27:58.427Z'),
      updatedAt: new Date('2026-05-19T02:27:58.427Z'),
    },
    {
      id: "cmpc14osx00075wup2beqc7jz",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpc14okb00065wup5b0om3uv",
      createdAt: new Date('2026-05-19T02:44:21.009Z'),
      updatedAt: new Date('2026-05-19T02:44:21.009Z'),
    },
    {
      id: "cmpc1rbhh000a5wupxvarenpu",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpc1rb9700095wupuov2wcog",
      createdAt: new Date('2026-05-19T03:01:56.837Z'),
      updatedAt: new Date('2026-05-19T03:01:56.837Z'),
    },
    {
      id: "cmpc2tvzd000d5wupuws4jr1e",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpc2tvkp000c5wup833pxznd",
      createdAt: new Date('2026-05-19T03:31:56.329Z'),
      updatedAt: new Date('2026-05-19T03:31:56.329Z'),
    },
    {
      id: "cmpc4j79s000g5wup6i5fnahx",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpc4j6t0000f5wup8wxc9vu2",
      createdAt: new Date('2026-05-19T04:19:36.976Z'),
      updatedAt: new Date('2026-05-19T04:19:36.976Z'),
    },
    {
      id: "cmpfpsyd60001m8upbz7aqcft",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpfpsy520000m8up4s09gto5",
      createdAt: new Date('2026-05-21T16:38:22.458Z'),
      updatedAt: new Date('2026-05-21T16:38:22.458Z'),
    },
    {
      id: "cmpfqvy8t0004m8upw8u71olz",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpfqvy140003m8upy60ui23e",
      createdAt: new Date('2026-05-21T17:08:41.886Z'),
      updatedAt: new Date('2026-05-21T17:08:41.886Z'),
    },
    {
      id: "cmpfriod10007m8up0f9rncw8",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpfrio590006m8upmwtomvdz",
      createdAt: new Date('2026-05-21T17:26:22.165Z'),
      updatedAt: new Date('2026-05-21T17:26:22.165Z'),
    },
    {
      id: "cmpfs8sgw000am8up6gzbwlnc",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "[SYSTEM_CALL]:cmpfs8s9l0009m8updcob8vgz",
      createdAt: new Date('2026-05-21T17:46:40.544Z'),
      updatedAt: new Date('2026-05-21T17:46:40.544Z'),
    },
    {
      id: "cmph6wl8o00003gup9hexk0uw",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "Thông báo về việc sử dụng MOOC\n\nNhư hôm nay đã thông báo trên lớp với các em:\nThầy đã enroll các em vào khóa học. Các em đã nhận được email, cần vào thử & tìm hiểu về course vs thông tin cơ bản\nCác em có thể tham gia làm thử bài Quiz-0 (Trial) nằm trong Section Chương 1: Mật mã cổ điển ... Khung giờ là từ 8:30PM cho đến hết ngày; bài này không tính điểm mà chỉ giúp các em làm quen với hệ thống trắc nghiệm\nCác bạn nào học lại môn này nếu có vấn đề gì đó (không đăng nhập vào được ..., hay không làm Quiz đc ...)  nhớ báo cho thầy, có thể nhắn trực tiếp trên Team\n\nTuần sau ta sẽ có bài Quiz-1 tính điểm đầu tiên, và yêu cầu phải có mặt trên lớp mới được tính điểm nhé.\n2025.2-168501",
      createdAt: new Date('2026-05-22T17:24:51.720Z'),
      updatedAt: new Date('2026-05-22T17:24:51.720Z'),
    },
    {
      id: "cmph7wl2000023gupu73x040a",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "**Hêloo**\n**Thông báo về việc sử dụng MOOC**\n\nNhư hôm nay đã thông báo trên lớp với các em:\n\n- Thầy đã enroll các em vào khóa học. Các em đã nhận được email, cần vào thử & tìm hiểu về course vs thông tin cơ bản\n\n- Các em có thể tham gia làm thử bài Quiz-0 (Trial) nằm trong Section Chương 1: Mật mã cổ điển ... Khung giờ là từ 8:30PM cho đến hết ngày; bài này không tính điểm mà chỉ giúp các em làm quen với hệ thống trắc nghiệm\n\n- Các bạn nào học lại môn này nếu có vấn đề gì đó (không đăng nhập vào được ..., hay không làm Quiz đc ...)  nhớ báo cho thầy, có thể nhắn trực tiếp trên Team ",
      createdAt: new Date('2026-05-22T17:52:51.096Z'),
      updatedAt: new Date('2026-05-22T17:52:51.096Z'),
    },
    {
      id: "cmph8fqlt00043gupcu2gze0f",
      classroomId: "cmp9j9y8q0000a4up4vemgh2q",
      authorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      content: "Hello\n\n- Nice to meet you\n- Hello you too\n- Welcome to classroom\n\n1. End\n\n`Coding experiment: console.log(\"heelo\");`",
      createdAt: new Date('2026-05-22T18:07:44.753Z'),
      updatedAt: new Date('2026-05-22T18:07:44.753Z'),
    },
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
      id: "cmp9k3cry0004a4upvszcwbgc",
      postId: "cmp9k2v510003a4upyuk844cn",
      authorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "Gud afternoon",
      createdAt: new Date('2026-05-17T09:11:52.942Z'),
      updatedAt: new Date('2026-05-17T09:11:52.942Z'),
    },
    {
      id: "cmp9k3py80005a4upzlh1aq4h",
      postId: "cmp9k2v510003a4upyuk844cn",
      authorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "a",
      createdAt: new Date('2026-05-17T09:12:10.016Z'),
      updatedAt: new Date('2026-05-17T09:12:10.016Z'),
    },
    {
      id: "cmp9k3quq0006a4up0k5p8rf7",
      postId: "cmp9k2v510003a4upyuk844cn",
      authorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "a",
      createdAt: new Date('2026-05-17T09:12:11.187Z'),
      updatedAt: new Date('2026-05-17T09:12:11.187Z'),
    },
    {
      id: "cmp9k3sai0007a4upyl4l06mw",
      postId: "cmp9k2v510003a4upyuk844cn",
      authorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "new",
      createdAt: new Date('2026-05-17T09:12:13.050Z'),
      updatedAt: new Date('2026-05-17T09:12:13.050Z'),
    },
    {
      id: "cmp9k41le0008a4upmdnu8f9v",
      postId: "cmp9k2v510003a4upyuk844cn",
      authorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "mỏe",
      createdAt: new Date('2026-05-17T09:12:25.106Z'),
      updatedAt: new Date('2026-05-17T09:12:25.106Z'),
    },
    {
      id: "cmp9k42we0009a4upeqfkhv4h",
      postId: "cmp9k2v510003a4upyuk844cn",
      authorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      content: "more",
      createdAt: new Date('2026-05-17T09:12:26.798Z'),
      updatedAt: new Date('2026-05-17T09:12:26.798Z'),
    },
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
      id: "cmp9sur8v0001pkuppa6lzqbz",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "post",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: true,
      createdAt: new Date('2026-05-17T13:17:08.335Z'),
    },
    {
      id: "cmp9svlvb0003pkupg9r05196",
      userId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      creatorId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      type: "post",
      content: "The Demo đã tạo trong classroom Test for new class có 1 thông báo",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-17T13:17:48.023Z'),
    },
    {
      id: "cmp9ub3gk0005pkupbuqrhnkv",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-17T13:57:50.276Z'),
    },
    {
      id: "cmpbepjpu00042supbu4t0zpu",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: true,
      createdAt: new Date('2026-05-18T16:16:43.026Z'),
    },
    {
      id: "cmpbz3q7w00025wupl2i8ydtv",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: true,
      createdAt: new Date('2026-05-19T01:47:36.956Z'),
    },
    {
      id: "cmpc0jmyz00055wupiuqybd3s",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-19T02:27:58.859Z'),
    },
    {
      id: "cmpc14p3b00085wupf3ql3yyj",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: true,
      createdAt: new Date('2026-05-19T02:44:21.383Z'),
    },
    {
      id: "cmpc1rbs7000b5wupku17pp9h",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: true,
      createdAt: new Date('2026-05-19T03:01:57.223Z'),
    },
    {
      id: "cmpc2twxy000e5wupthhmjvez",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: true,
      createdAt: new Date('2026-05-19T03:31:57.574Z'),
    },
    {
      id: "cmpc4j7k4000h5wuptfq3r9ga",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-19T04:19:37.348Z'),
    },
    {
      id: "cmpfpsymc0002m8upkik2s44b",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: true,
      createdAt: new Date('2026-05-21T16:38:22.788Z'),
    },
    {
      id: "cmpfqvyie0005m8upauzv8w57",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-21T17:08:42.230Z'),
    },
    {
      id: "cmpfriom40008m8up4b6tgx9n",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-21T17:26:22.492Z'),
    },
    {
      id: "cmpfs8sqf000bm8upaf3v0sjn",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "call",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo cuộc gọi",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-21T17:46:40.887Z'),
    },
    {
      id: "cmph6wlj900013gupkfefxtod",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "post",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-22T17:24:52.101Z'),
    },
    {
      id: "cmph7wler00033gupil4zx0jz",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "post",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-22T17:52:51.555Z'),
    },
    {
      id: "cmph8fqx000053gup2d6yocwt",
      userId: "e3a855a1-917b-4be7-8f7f-3bfdf4a14211",
      creatorId: "a4fdf6ed-796c-41b0-82e2-3eb064021801",
      type: "post",
      content: "Minh HT đã tạo trong classroom Test for new class có 1 thông báo",
      link: "/classrooms/cmp9j9y8q0000a4up4vemgh2q",
      isRead: false,
      createdAt: new Date('2026-05-22T18:07:45.156Z'),
    },
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
