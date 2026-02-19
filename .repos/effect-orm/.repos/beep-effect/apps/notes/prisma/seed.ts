import { prisma } from "../src/server/db";

const seed = async () => {
  // console.info('Starting seeding...');
  await prisma.$disconnect();
};

void seed();
