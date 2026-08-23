import { prisma } from '../src/db.js';

async function main() {
  const count = await prisma.slotHold.deleteMany();
  console.log(`Deleted ${count.count} temporary slot holds`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
