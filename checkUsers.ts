import { PrismaClient, User } from './prisma/generated/client'

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();    
    console.log('All users:', users, users.length);
    }


main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
