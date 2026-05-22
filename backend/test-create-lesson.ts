import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

const adapter = new PrismaTiDBCloud({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const sectionId = "some-section-id"; // We don't have a real one, but wait, we can just get any section from the db
  const section = await prisma.section.findFirst();
  if (!section) {
    console.log("No section found to test with.");
    return;
  }
  
  try {
    const lesson = await prisma.lesson.create({
      data: {
        title: "Test Lesson",
        type: "video",
        contentUrl: "https://youtube.com/watch?v=123",
        order: 0,
        sectionId: section.id,
      }
    });
    console.log("Successfully created lesson!", lesson);
    
    // Cleanup
    await prisma.lesson.delete({ where: { id: lesson.id } });
  } catch (err) {
    console.error("Error creating lesson:", err);
  }
}

main().finally(() => prisma.$disconnect());
