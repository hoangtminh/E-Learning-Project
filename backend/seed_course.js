const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found to assign as instructor.");
    return;
  }
  const course = await prisma.course.create({
    data: {
      id: "course_test_123",
      instructorId: user.id,
      title: "Khóa học test VNPay",
      slug: "khoa-hoc-test-vnpay",
      description: "Đang test API VNPAY",
      price: 150000,
      visibility: "public"
    }
  });
  console.log("Created test course: ", course.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
