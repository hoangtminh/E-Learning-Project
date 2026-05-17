import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

const adapter = new PrismaTiDBCloud({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.updateMany({
    data: { role: 'instructor' }
  });
  console.log(`Đã cấp quyền instructor cho ${users.count} tài khoản.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
