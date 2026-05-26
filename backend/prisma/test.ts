import { PrismaClient } from '@prisma/client';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';
import 'dotenv/config';

const adapter = new PrismaTiDBCloud({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ take: 1 });
  console.dir(users, { depth: null });
}

main().catch(console.error);






