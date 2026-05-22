import {
  PrismaClient,
  GlobalRole,
  ClassroomRole,
  ConversationType,
} from '@prisma/client';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';
import 'dotenv/config';

const adapter = new PrismaTiDBCloud({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
// Run command
// npx ts-node ./prisma/seed.ts

async function main() {
  console.log('--- Đang bắt đầu quá trình Seed dữ liệu ---');

  // 1. SEED USERS
  const users = [
    {
      id: '944ad8af-c80a-4239-a34c-4ec8f9a5c852',
      email: 'test@gmail.com',
      passwordHash:
        '$2b$10$MZcAM12XzcRgG7SKo01NkeYuoyUM  acFXSJgvu/ETgCRPxOdRLqNXC',
      fullName: 'Test User',
      avatarUrl: null,
      createdAt: new Date('2026-04-26T01:19:19.271Z'),
      role: GlobalRole.instructor,
    },
    {
      id: 'a1faf183-9e79-4669-8b70-a4032f214e3c',
      email: 'nampham.name@gmail.com',
      passwordHash:
        '$2b$10$U43lXCrbpGzBonSut/ebH.CGC.vsBUOkSMSlqv/cPqrQWywV6YPZ6',
      fullName: 'Phạm Sơn Nam',
      avatarUrl: null,
      createdAt: new Date('2026-04-20T07:56:49.503Z'),
      role: GlobalRole.instructor,
    },
    {
      id: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      email: 'hoangtuanminh25@gmail.com',
      passwordHash:
        '$2b$10$qefijrjBflnh14TzU7UcruWhm.VEwNR62XVpDyy6a4I6WoAA0vYg6',
      fullName: 'Minh HT',
      avatarUrl: null,
      createdAt: new Date('2026-04-23T08:25:03.739Z'),
      role: GlobalRole.instructor,
    },
    {
      id: 'cmp76z9j90000wsvt1p9girqj',
      email: 'test2@gmail.com',
      passwordHash:
        '$2b$10$M6OMtvZ6MKe4trICQ6Q9ReWZbicAbqQOBM/hGihuk4cIDM9qBUYJW',
      fullName: 'Test 2',
      avatarUrl: null,
      createdAt: new Date('2026-05-15T17:29:14.757Z'),
      role: GlobalRole.instructor,
    },
    {
      id: 'e3a855a1-917b-4be7-8f7f-3bfdf4a14211',
      email: 'friendcraftdemo@gmail.com',
      passwordHash:
        '$2b$10$wbSvQMtlMXje/6KGc5S/LeUtDDo0hqrDRlDmBu9TOmvLbkPwx45QS',
      fullName: 'The Demo',
      avatarUrl: null,
      createdAt: new Date('2026-04-25T02:56:47.975Z'),
      role: GlobalRole.instructor,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log('✅ Đã xong: Users');

  // 2. SEED CLASSROOMS
  const classrooms = [
    {
      id: '85a46e75-41b0-4b2b-9aa4-d0cf1483cb70',
      title: 'Testing',
      description: 'JGH73N',
      inviteCode: null,
      isPublic: false,
      createdAt: new Date('2026-04-24T21:48:25.896Z'),
      ownerId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
    },
    {
      id: '8bc3e7c5-3e37-4eaf-94c3-1b3e5312968c',
      title: 'New classroom',
      description: 'F39CBV',
      inviteCode: null,
      isPublic: false,
      createdAt: new Date('2026-04-24T21:48:49.111Z'),
      ownerId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
    },
  ];

  for (const classroom of classrooms) {
    await prisma.classroom.upsert({
      where: { id: classroom.id },
      update: classroom,
      create: classroom,
    });
  }
  console.log('✅ Đã xong: Classrooms');

  // 3. SEED CLASSROOM MEMBERS
  const classroomMembers = [
    {
      id: '0c38b4d9-70db-4441-9235-3d4a2cd34c6c',
      classroomId: '8bc3e7c5-3e37-4eaf-94c3-1b3e5312968c',
      userId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      role: ClassroomRole.owner,
      joinedAt: new Date('2026-04-24T21:48:49.111Z'),
    },
    {
      id: '8936f489-0076-43a4-9e09-c30c79c29fac',
      classroomId: '85a46e75-41b0-4b2b-9aa4-d0cf1483cb70',
      userId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      role: ClassroomRole.owner,
      joinedAt: new Date('2026-04-24T21:48:25.896Z'),
    },
  ];

  for (const member of classroomMembers) {
    await prisma.classroomMember.upsert({
      where: { id: member.id },
      update: member,
      create: member,
    });
  }
  console.log('✅ Đã xong: Classroom Members');

  // 4. SEED CONVERSATIONS
  const conversations = [
    {
      id: '2c015873-afdc-476e-8c59-253fed84979e',
      classroomId: null,
      type: ConversationType.group,
      title: '3 chat',
      createdAt: new Date('2026-04-26T03:10:07.603Z'),
    },
    {
      id: '668d058a-552f-4671-9f75-99c4257ce050',
      classroomId: null,
      type: ConversationType.group,
      title: 'New Chat',
      createdAt: new Date('2026-04-25T07:38:43.997Z'),
    },
    {
      id: '90d4e7be-d00c-463c-891e-ccddee0e6b49',
      classroomId: null,
      type: ConversationType.group,
      title: 'Group chat',
      createdAt: new Date('2026-04-26T01:20:41.593Z'),
    },
  ];

  for (const conv of conversations) {
    await prisma.conversation.upsert({
      where: { id: conv.id },
      update: conv,
      create: conv,
    });
  }
  console.log('✅ Đã xong: Conversations');

  // 5. SEED CONVERSATION MEMBERS
  const conversationMembers = [
    {
      id: '45205b92-20c7-4acb-8eec-4ff3b3ec877b',
      conversationId: '2c015873-afdc-476e-8c59-253fed84979e',
      userId: '944ad8af-c80a-4239-a34c-4ec8f9a5c852',
      joinedAt: new Date('2026-04-26T03:10:07.603Z'),
    },
    {
      id: '58d4c2e7-4c37-4d44-9fc0-7bbb1273c89f',
      conversationId: '90d4e7be-d00c-463c-891e-ccddee0e6b49',
      userId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      joinedAt: new Date('2026-04-26T01:20:41.593Z'),
    },
    {
      id: '58d9e616-4ac7-4eb9-ba82-f25c21bb3f5a',
      conversationId: '2c015873-afdc-476e-8c59-253fed84979e',
      userId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      joinedAt: new Date('2026-04-26T03:10:07.603Z'),
    },
    {
      id: '8dbcae5a-e471-4775-ab96-c714add84f44',
      conversationId: '668d058a-552f-4671-9f75-99c4257ce050',
      userId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      joinedAt: new Date('2026-04-25T07:38:43.997Z'),
    },
    {
      id: 'bf3410a9-76b2-451e-965e-3757601196a6',
      conversationId: '90d4e7be-d00c-463c-891e-ccddee0e6b49',
      userId: '944ad8af-c80a-4239-a34c-4ec8f9a5c852',
      joinedAt: new Date('2026-04-26T01:20:41.593Z'),
    },
    {
      id: 'ca37198a-63d0-4a7d-ab2e-44716f6a540a',
      conversationId: '2c015873-afdc-476e-8c59-253fed84979e',
      userId: 'e3a855a1-917b-4be7-8f7f-3bfdf4a14211',
      joinedAt: new Date('2026-04-26T03:10:07.603Z'),
    },
    {
      id: 'd776528e-9084-48cb-9109-76fb90ad5243',
      conversationId: '668d058a-552f-4671-9f75-99c4257ce050',
      userId: 'e3a855a1-917b-4be7-8f7f-3bfdf4a14211',
      joinedAt: new Date('2026-04-25T07:38:43.997Z'),
    },
  ];

  for (const member of conversationMembers) {
    await prisma.conversationMember.upsert({
      where: { id: member.id },
      update: member,
      create: member,
    });
  }
  console.log('✅ Đã xong: Conversation Members');

  // 6. SEED MESSAGES
  const messages = [
    {
      id: '02b2fc85-3422-4f1e-a26f-eaa3abb119f9',
      conversationId: '668d058a-552f-4671-9f75-99c4257ce050',
      senderId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      content: 'see you tomorrow',
      fileUrl: null,
      createdAt: new Date('2026-04-25T11:55:19.888Z'),
    },
    {
      id: '0c97f955-211b-4b17-8daf-ebc502d3f315',
      conversationId: '668d058a-552f-4671-9f75-99c4257ce050',
      senderId: 'e3a855a1-917b-4be7-8f7f-3bfdf4a14211',
      content: 'tks',
      fileUrl: null,
      createdAt: new Date('2026-04-25T11:55:29.523Z'),
    },
    {
      id: '1ec5f5c7-6361-4ae2-b2e9-99b92bf3088e',
      conversationId: '668d058a-552f-4671-9f75-99c4257ce050',
      senderId: 'e3a855a1-917b-4be7-8f7f-3bfdf4a14211',
      content: 'Hello hello',
      fileUrl: null,
      createdAt: new Date('2026-04-25T11:30:02.622Z'),
    },
    {
      id: '3d8c69e5-410a-461a-b17e-f0547fd41666',
      conversationId: '668d058a-552f-4671-9f75-99c4257ce050',
      senderId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      content: 'Hi',
      fileUrl: null,
      createdAt: new Date('2026-04-25T10:42:29.719Z'),
    },
    {
      id: '725e48db-8d4b-45f2-8d36-fa430ce6e1a1',
      conversationId: '90d4e7be-d00c-463c-891e-ccddee0e6b49',
      senderId: '944ad8af-c80a-4239-a34c-4ec8f9a5c852',
      content: 'hello everyone',
      fileUrl: null,
      createdAt: new Date('2026-04-26T01:24:08.186Z'),
    },
  ];

  for (const msg of messages) {
    await prisma.message.upsert({
      where: { id: msg.id },
      update: msg,
      create: msg,
    });
  }
  console.log('✅ Đã xong: Messages');

  // 7. SEED CLASSROOM POSTS
  const classroomPosts = [
    {
      id: 'cmp76ywq00001h8up1028rhzy',
      classroomId: '8bc3e7c5-3e37-4eaf-94c3-1b3e5312968c',
      authorId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      content: 'Test posting',
      createdAt: new Date('2026-05-15T17:28:58.152Z'),
      updatedAt: new Date('2026-05-15T17:29:48.864Z'),
    },
    {
      id: 'cmp76zzj30002h8upfq9vizvs',
      classroomId: '8bc3e7c5-3e37-4eaf-94c3-1b3e5312968c',
      authorId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      content: 'Test post',
      createdAt: new Date('2026-05-15T17:28:58.152Z'),
      updatedAt: new Date('2026-05-15T17:29:48.447Z'),
    },
    {
      id: 'cmp770e930003h8upunqmo5xw',
      classroomId: '8bc3e7c5-3e37-4eaf-94c3-1b3e5312968c',
      authorId: 'a4fdf6ed-796c-41b0-82e2-3eb064021801',
      content: 'Another post',
      createdAt: new Date('2026-05-15T17:30:07.527Z'),
      updatedAt: new Date('2026-05-15T17:30:07.527Z'),
    },
  ];

  for (const post of classroomPosts) {
    await prisma.classroomPost.upsert({
      where: { id: post.id },
      update: post,
      create: post,
    });
  }
  console.log('✅ Đã xong: Classroom Posts');

  // 8. SEED CLASSROOM POST COMMENTS
  const classroomPostComments = [];

  for (const comment of classroomPostComments) {
    await prisma.classroomPostComment.upsert({
      where: { id: (comment as any).id },
      update: comment,
      create: comment,
    });
  }
  console.log('✅ Đã xong: Classroom Post Comments');

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
