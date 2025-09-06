import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@beacon.com' },
    update: {},
    create: {
      email: 'demo@beacon.com',
      name: 'Demo User',
    },
  });

  console.log('Database seeded successfully');
  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });