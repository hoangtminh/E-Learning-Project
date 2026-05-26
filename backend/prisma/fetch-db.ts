import { PrismaClient } from '@prisma/client';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const adapter = new PrismaTiDBCloud({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const enumMap: Record<string, string> = {
  'User.role': 'GlobalRole',
  'ClassroomMember.role': 'ClassroomRole',
  'Course.visibility': 'CourseVisibility',
  'Lesson.type': 'ContentType',
  'Conversation.type': 'ConversationType',
  'Call.status': 'CallStatus',
  'Call.type': 'CallType',
  'Question.type': 'QuestionType',
};

function serialize(obj: any, modelName: string): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    let serializedVal = '';
    if (val === null || val === undefined) {
      serializedVal = 'null';
    } else if (val instanceof Date) {
      serializedVal = `new Date('${val.toISOString()}')`;
    } else if (val && typeof val === 'object' && val.constructor && val.constructor.name === 'Decimal') {
      serializedVal = `new Prisma.Decimal(${val.toString()})`;
    } else if (enumMap[`${modelName}.${key}`]) {
      serializedVal = `${enumMap[`${modelName}.${key}`]}.${val}`;
    } else if (typeof val === 'string') {
      serializedVal = JSON.stringify(val);
    } else {
      serializedVal = JSON.stringify(val);
    }
    parts.push(`      ${key}: ${serializedVal},`);
  }
  return `{\n${parts.join('\n')}\n    }`;
}

async function main() {
  console.log('--- Đang bắt đầu kết nối database và tải dữ liệu ---');

  // List of models in dependency order
  const models = [
    { name: 'User', clientName: 'user', varName: 'users' },
    { name: 'Classroom', clientName: 'classroom', varName: 'classrooms' },
    { name: 'ClassroomMember', clientName: 'classroomMember', varName: 'classroomMembers' },
    { name: 'ClassroomJoinRequest', clientName: 'classroomJoinRequest', varName: 'classroomJoinRequests' },
    { name: 'Course', clientName: 'course', varName: 'courses' },
    { name: 'CourseMember', clientName: 'courseMember', varName: 'courseMembers' },
    { name: 'CourseInvitation', clientName: 'courseInvitation', varName: 'courseInvitations' },
    { name: 'Section', clientName: 'section', varName: 'sections' },
    { name: 'Lesson', clientName: 'lesson', varName: 'lessons' },
    { name: 'UserProgress', clientName: 'userProgress', varName: 'userProgresses' },
    { name: 'Conversation', clientName: 'conversation', varName: 'conversations' },
    { name: 'ConversationMember', clientName: 'conversationMember', varName: 'conversationMembers' },
    { name: 'Message', clientName: 'message', varName: 'messages' },
    { name: 'ClassroomTask', clientName: 'classroomTask', varName: 'classroomTasks' },
    { name: 'TaskSubmission', clientName: 'taskSubmission', varName: 'taskSubmissions' },
    { name: 'ClassroomFile', clientName: 'classroomFile', varName: 'classroomFiles' },
    { name: 'ClassroomLinkedCourse', clientName: 'classroomLinkedCourse', varName: 'classroomLinkedCourses' },
    { name: 'Note', clientName: 'note', varName: 'notes' },
    { name: 'Call', clientName: 'call', varName: 'calls' },
    { name: 'Quiz', clientName: 'quiz', varName: 'quizzes' },
    { name: 'QuizMembership', clientName: 'quizMembership', varName: 'quizMemberships' },
    { name: 'Question', clientName: 'question', varName: 'questions' },
    { name: 'QuestionOption', clientName: 'questionOption', varName: 'questionOptions' },
    { name: 'QuizSubmission', clientName: 'quizSubmission', varName: 'quizSubmissions' },
    { name: 'UserAnswer', clientName: 'userAnswer', varName: 'userAnswers' },
    { name: 'UserAnswerOption', clientName: 'userAnswerOption', varName: 'userAnswerOptions' },
    { name: 'ClassroomPost', clientName: 'classroomPost', varName: 'classroomPosts' },
    { name: 'ClassroomPostComment', clientName: 'classroomPostComment', varName: 'classroomPostComments' },
    { name: 'Notification', clientName: 'notification', varName: 'notifications' },
  ];

  let output = `import {
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
`;

  for (const m of models) {
    console.log(`Đang tải dữ liệu cho model: ${m.name}...`);
    const records = await (prisma as any)[m.clientName].findMany();
    console.log(`=> Tìm thấy ${records.length} bản ghi.`);

    output += `\n  // SEED ${m.name.toUpperCase()}\n`;
    if (records.length === 0) {
      output += `  const ${m.varName}: any[] = [];\n`;
    } else {
      output += `  const ${m.varName} = [\n`;
      for (const rec of records) {
        output += `    ${serialize(rec, m.name)},\n`;
      }
      output += `  ];\n`;
    }

    output += `\n  for (const record of ${m.varName}) {\n`;
    if (m.name === 'ClassroomLinkedCourse') {
      output += `    const { classroomId, courseId, ...updateData } = record;\n`;
      output += `    await prisma.classroomLinkedCourse.upsert({\n`;
      output += `      where: {\n`;
      output += `        classroomId_courseId: {\n`;
      output += `          classroomId: record.classroomId,\n`;
      output += `          courseId: record.courseId,\n`;
      output += `        },\n`;
      output += `      },\n`;
      output += `      update: updateData,\n`;
      output += `      create: record,\n`;
      output += `    });\n`;
    } else {
      output += `    const { id, ...updateData } = record;\n`;
      output += `    await prisma.${m.clientName}.upsert({\n`;
      output += `      where: { id: record.id },\n`;
      output += `      update: updateData,\n`;
      output += `      create: record,\n`;
      output += `    });\n`;
    }
    output += `  }\n`;
    output += `  console.log('✅ Đã xong: ${m.name}');\n`;
  }

  output += `
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
`;

  const seedPath = path.join(__dirname, 'seed.ts');
  fs.writeFileSync(seedPath, output, 'utf-8');
  console.log(`\n🎉 Đã lưu thành công dữ liệu mới vào seed.ts tại: ${seedPath}`);
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
