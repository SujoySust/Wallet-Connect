import { PrismaClient } from '@prisma/client';
import { seedStaffs } from './seeds/staff.seeder';
import { seedCategories } from '../prisma/seeds/category.seeder';
import { seedBlockchain } from './seeds/blockchain.seeder';
import { seedPaymentToken } from './seeds/payment_tokens.seeder';
import { settingsSeeder } from './seeds/settings.seeder';
const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  await seedStaffs(prisma);
  await settingsSeeder(prisma);
  if (process.env.APP_ENV != 'production') {
    await seedCategories(prisma);
    await seedBlockchain(prisma);
    await seedPaymentToken(prisma);
  }
}

main()
  .catch((e) => {
    console.error(e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
