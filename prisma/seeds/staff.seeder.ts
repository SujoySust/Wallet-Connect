import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

export async function seedStaffs(prisma: PrismaClient) {
  await prisma.staff.createMany({
    data: [
      {
        name: 'Mr Admin',
        username: 'admin',
        email: 'admin@email.com',
        password: await hash('12345678', 10),
        isEmailVerified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    skipDuplicates: true,
  });
}
