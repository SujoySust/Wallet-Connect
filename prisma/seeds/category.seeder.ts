import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  await prisma.category.createMany({
    data: [
      {
        title: 'Art',
        image: 'images/tests/art.jpeg',
      },
      {
        title: 'Collectibles',
        image: 'images/tests/collectibles.png',
      },
    ],
    skipDuplicates: true,
  });
}
