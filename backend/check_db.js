const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));

  const courses = await prisma.course.findMany();
  console.log('Courses:', courses.map(c => ({ id: c.id, slug: c.slug, price: c.price })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
